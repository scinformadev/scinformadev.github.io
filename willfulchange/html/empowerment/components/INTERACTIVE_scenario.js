class InteractiveScenario extends HTMLElement {
  async connectedCallback() {
    this.classList.add('interactive-scenario');
    this.textContent = 'Loading scenario…';
    try {
      const embeddedId = this.getAttribute('config');
      if (embeddedId) {
        const embedded = document.getElementById(embeddedId);
        if (!embedded) throw new Error('Embedded scenario configuration is missing.');
        this.data = JSON.parse(embedded.textContent);
      } else {
        const source = this.getAttribute('src');
        if (!source) throw new Error('Scenario source is missing.');
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Could not load scenario (${response.status}).`);
        this.data = await response.json();
      }
      this.validate();
      this.scenes = new Map(this.data.scenes.map(scene => [scene.id, scene]));
      this.showScene(this.data.startScene);
      this.dispatchEvent(new CustomEvent('scenarioready', { detail: { data: this.data }, bubbles: true }));
    } catch (error) {
      this.replaceChildren();
      const message = this.element('p', '', `Scenario unavailable: ${error.message}`);
      message.setAttribute('role', 'alert');
      this.append(message);
      console.error(error);
    }
  }

  element(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    return node;
  }

  validate() {
    const data = this.data;
    if (data.version !== 2 || !data.intro?.heading || !data.intro?.purpose || !data.intro?.instructions || !data.intro?.outcome || !Array.isArray(data.strategies) || !Array.isArray(data.scenes) || !data.scenes.length) {
      throw new Error('Unsupported or incomplete scenario configuration.');
    }
    const strategyIds = new Set(data.strategies.map(strategy => strategy.id));
    if (strategyIds.size !== data.strategies.length || data.strategies.some(strategy => !strategy.id || !strategy.label)) {
      throw new Error('Strategies need unique IDs and labels.');
    }
    const sceneIds = new Set(data.scenes.map(scene => scene.id));
    if (sceneIds.size !== data.scenes.length || !sceneIds.has(data.startScene)) {
      throw new Error('Scene IDs must be unique and include the start scene.');
    }
    data.scenes.forEach((scene, index) => {
      if (!scene.id || !scene.navLabel || !scene.heading || !scene.image || !scene.imageAlt || !scene.dialogue || !scene.strategyPrompt || !scene.strategyReason || !scene.responsePrompt || !strategyIds.has(scene.recommendedStrategy) || !data.characters?.[scene.speaker] || !Array.isArray(scene.choices) || scene.choices.length < 2) {
        throw new Error(`Scene ${scene.id} is missing required content.`);
      }
      const expectedNext = data.scenes[index + 1]?.id || null;
      scene.choices.forEach(choice => {
        if (!choice.label || !choice.reply || !choice.feedback || !data.characters?.[choice.speaker] || !data.characters?.[choice.replySpeaker] || choice.next !== expectedNext) {
          throw new Error(`Choice in scene ${scene.id} is incomplete or breaks the scenario order.`);
        }
      });
    });
  }

  showScene(id, focus = false) {
    this.stopAudio();
    this.scene = this.scenes.get(id);
    if (!this.scene) throw new Error(`Unknown scene: ${id}`);
    this.index = this.data.scenes.findIndex(scene => scene.id === id) + 1;
    this.selectedStrategy = null;
    this.replaceChildren();

    this.card = this.element('section', 'interactive-card');
    const visual = this.element('div', 'interactive-visual');
    const backdrop = this.element('img', 'interactive-visual-backdrop');
    backdrop.src = this.scene.image;
    backdrop.alt = '';
    backdrop.setAttribute('aria-hidden', 'true');
    const photo = this.element('img');
    photo.src = this.scene.image;
    photo.alt = this.scene.imageAlt;
    this.bubble = this.element('div', 'interactive-bubble');
    this.bubble.setAttribute('aria-live', 'polite');
    visual.append(backdrop, photo, this.bubble);

    const content = this.element('div', 'interactive-content');
    const progress = this.element('p', 'interactive-progress', `Situation ${this.index} of ${this.data.scenes.length}`);
    const heading = this.element('h2', '', this.scene.heading);
    heading.tabIndex = -1;
    this.headerPrompt = this.element('p', 'interactive-header-prompt');
    const sceneHeading = this.element('div', 'interactive-scene-heading');
    sceneHeading.append(progress, heading, this.headerPrompt);
    this.phase = this.element('div', 'interactive-phase');
    this.audioButton = this.element('button', 'interactive-audio', 'Play dialogue');
    this.audioButton.type = 'button';
    this.audioButton.hidden = true;
    this.audioButton.addEventListener('click', () => {
      this.stopAudio();
      this.audio = new Audio(this.audioPath);
      this.audio.play().catch(() => { this.audioButton.textContent = 'Audio unavailable'; });
    });
    content.append(sceneHeading, this.phase, this.audioButton);
    this.card.append(visual, content);
    this.append(this.card);
    this.setDialogue(this.scene.speaker, this.scene.dialogue, this.scene.audio);
    this.renderStrategy();
    this.dispatchEvent(new CustomEvent('scenariochange', { detail: { index: this.index, total: this.data.scenes.length }, bubbles: true }));
    if (focus) heading.focus();
  }

  renderStrategy() {
    this.card.classList.remove('interactive-review-mode');
    this.phase.replaceChildren();
    this.headerPrompt.textContent = this.scene.strategyPrompt;
    const label = this.element('label', 'interactive-select-label', 'Choose a strategy');
    const select = this.element('select', 'interactive-select');
    select.required = true;
    const placeholder = this.element('option', '', 'Select a strategy…');
    placeholder.value = '';
    select.append(placeholder);
    this.data.strategies.forEach(strategy => {
      const option = this.element('option', '', strategy.label);
      option.value = strategy.id;
      select.append(option);
    });
    const selectId = `strategy-${this.index}`;
    select.id = selectId;
    label.htmlFor = selectId;
    const check = this.element('button', 'interactive-primary', 'Check strategy');
    check.type = 'button';
    check.disabled = true;
    select.addEventListener('change', () => { check.disabled = !select.value; });
    check.addEventListener('click', () => {
      this.selectedStrategy = select.value;
      this.card.classList.add('interactive-review-mode');
      this.headerPrompt.textContent = 'Review the strategy';
      const recommended = this.data.strategies.find(strategy => strategy.id === this.scene.recommendedStrategy).label;
      const message = this.selectedStrategy === this.scene.recommendedStrategy
        ? `Strong starting point: ${recommended}. ${this.scene.strategyReason}`
        : `${recommended} is the strongest starting point here. ${this.scene.strategyReason} Consider whether your choice would help after this immediate barrier is addressed.`;
      this.phase.replaceChildren(
        this.element('p', 'interactive-feedback', message),
        this.action('Practice a leader response', () => this.renderResponse())
      );
      this.phase.firstChild.setAttribute('role', 'status');
      this.phase.lastChild.focus();
    });
    this.phase.append(label, select, check);
  }

  renderResponse() {
    this.card.classList.remove('interactive-review-mode');
    this.phase.replaceChildren();
    this.headerPrompt.textContent = this.scene.responsePrompt;
    const choices = this.element('div', 'interactive-choices');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', 'Choose a leader response');
    this.scene.choices.forEach(choice => {
      const button = this.element('button', '', choice.label);
      button.type = 'button';
      button.addEventListener('click', () => this.showLeaderResponse(choice));
      choices.append(button);
    });
    this.phase.append(choices);
    choices.firstChild.focus();
  }

  showLeaderResponse(choice) {
    this.setDialogue(choice.speaker, choice.label, choice.audio);
    this.headerPrompt.textContent = 'Notice the leader’s response';
    this.phase.replaceChildren(
      this.action(`See ${this.data.characters[choice.replySpeaker].name}'s response`, () => this.showEmployeeResponse(choice))
    );
    this.phase.lastChild.focus();
  }

  showEmployeeResponse(choice) {
    this.setDialogue(choice.replySpeaker, choice.reply, choice.replyAudio);
    this.headerPrompt.textContent = 'Review the response';
    const feedback = this.element('p', 'interactive-feedback', choice.feedback);
    feedback.setAttribute('role', 'status');
    feedback.tabIndex = -1;
    this.card.classList.add('interactive-review-mode');
    this.phase.replaceChildren(feedback);
    this.dispatchEvent(new CustomEvent('scenarioanswered', { detail: { sceneId: this.scene.id, strategy: this.selectedStrategy }, bubbles: true }));
    feedback.focus();
  }

  action(text, handler) {
    const button = this.element('button', 'interactive-primary', text);
    button.type = 'button';
    button.addEventListener('click', handler);
    return button;
  }

  setDialogue(speakerId, text, audioPath) {
    this.stopAudio();
    const speaker = this.data.characters[speakerId];
    this.bubble.dataset.position = speaker.position === 'right' ? 'right' : 'left';
    this.bubble.replaceChildren(
      this.element('strong', '', `${speaker.name} · ${speaker.role}`),
      this.element('span', '', text)
    );
    this.audioPath = audioPath || null;
    this.audioButton.hidden = !this.audioPath;
    this.audioButton.textContent = 'Play dialogue';
  }

  stopAudio() {
    if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; this.audio = null; }
  }

  disconnectedCallback() { this.stopAudio(); }
}

customElements.define('interactive-scenario', InteractiveScenario);
