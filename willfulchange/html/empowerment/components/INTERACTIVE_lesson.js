(() => {
  const player = document.querySelector('interactive-scenario');
  const introPanel = document.getElementById('introPanel');
  const exercisePanel = document.getElementById('exercisePanel');
  const rail = document.getElementById('progressRail');
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const counter = document.getElementById('stepCounter');
  const stage = document.getElementById('stage');
  let data;
  let current = 0;
  let unlocked = 1;
  const answered = new Set();

  function updateNavigation() {
    const total = data.scenes.length + 1;
    counter.textContent = `STEP ${current + 1} OF ${total}`;
    backBtn.disabled = current === 0;
    nextBtn.disabled = current > 0 && !answered.has(data.scenes[current - 1].id);
    nextBtn.textContent = current === total - 1 ? 'Start again' : 'Next →';
    [...rail.children].forEach((step, index) => {
      step.classList.toggle('active', index === current);
      step.classList.toggle('complete', index < current);
      const dot = step.querySelector('.dot');
      dot.disabled = index > unlocked;
      if (index === current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
  }

  function showStep(index, focus = true) {
    if (!data || index < 0 || index > data.scenes.length || index > unlocked) return;
    if (index < current) {
      data.scenes.slice(Math.max(0, index - 1)).forEach(scene => answered.delete(scene.id));
      unlocked = Math.max(1, index);
    }
    current = index;
    introPanel.classList.toggle('active', index === 0);
    introPanel.setAttribute('aria-hidden', String(index !== 0));
    exercisePanel.classList.toggle('active', index !== 0);
    exercisePanel.setAttribute('aria-hidden', String(index === 0));
    if (index > 0) player.showScene(data.scenes[index - 1].id, false);
    updateNavigation();
    if (focus) stage.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  player.addEventListener('scenarioready', event => {
    data = event.detail.data;
    document.getElementById('lessonTitle').textContent = data.title;
    document.title = `${data.title} — interactive exercise`;
    document.getElementById('introTitle').textContent = data.intro.heading;
    document.getElementById('introPurpose').textContent = data.intro.purpose;
    document.getElementById('introInstructions').textContent = data.intro.instructions;
    document.getElementById('introOutcome').textContent = data.intro.outcome;
    const labels = [data.intro.label || 'Introduction', ...data.scenes.map(scene => scene.navLabel)];
    rail.replaceChildren();
    labels.forEach((label, index) => {
      const step = document.createElement('div');
      step.className = 'rail-step';
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.textContent = index + 1;
      dot.setAttribute('aria-label', `Go to step ${index + 1}: ${label}`);
      dot.addEventListener('click', () => showStep(index));
      const name = document.createElement('span');
      name.className = 'rail-label';
      name.textContent = label;
      step.append(dot, name);
      if (index < labels.length - 1) {
        const connector = document.createElement('span');
        connector.className = 'connector';
        step.append(connector);
      }
      rail.append(step);
    });
    showStep(0, false);
  });

  player.addEventListener('scenarioanswered', event => {
    answered.add(event.detail.sceneId);
    unlocked = Math.min(data.scenes.length, current + 1);
    updateNavigation();
  });

  backBtn.addEventListener('click', () => showStep(current - 1));
  nextBtn.addEventListener('click', () => {
    if (current === data.scenes.length) {
      answered.clear();
      unlocked = 1;
      showStep(0);
    } else showStep(current + 1);
  });
})();
