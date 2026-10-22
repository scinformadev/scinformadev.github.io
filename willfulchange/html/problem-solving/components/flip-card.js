(() => {
  class CourseFlipCard extends HTMLElement {
    connectedCallback() {
      this.render();
      this.button = this.querySelector('.course-flip-card__button');
      this.button.addEventListener('click', () => this.toggle());
    }

    render() {
      const title = this.getAttribute('title') || '';
      const summary = this.getAttribute('summary') || '';
      const guidance = this.getAttribute('guidance') || '';
      const frontItems = this.getListAttribute('front-list');
      const backItems = this.getListAttribute('back-list');
      const backHeading = this.getAttribute('back-heading') || '';
      const backPrefix = this.getAttribute('back-prefix') || '';
      const label = this.getAttribute('label') || `Show guidance for ${title}`;

      this.innerHTML = `
        <button class="course-flip-card__button" type="button" aria-expanded="false" aria-label="${this.escapeAttribute(label)}">
          <span class="course-flip-card__face course-flip-card__front" aria-hidden="false">
            <strong class="course-flip-card__title"></strong>
            <${frontItems.length ? 'ul' : 'span'} class="course-flip-card__text"></${frontItems.length ? 'ul' : 'span'}>
            ${this.flipIcon()}
          </span>
          <span class="course-flip-card__face course-flip-card__back" aria-hidden="true">
            ${backHeading ? '<strong class="course-flip-card__back-heading"></strong>' : ''}
            ${backPrefix ? '<strong class="course-flip-card__back-prefix"></strong>' : ''}
            <${backItems.length ? 'ul' : 'span'} class="course-flip-card__text"></${backItems.length ? 'ul' : 'span'}>
            ${this.flipIcon()}
          </span>
        </button>`;

      const frontTitle = this.querySelector('.course-flip-card__front .course-flip-card__title');
      const backHeadingElement = this.querySelector('.course-flip-card__back-heading');
      const backPrefixElement = this.querySelector('.course-flip-card__back-prefix');
      const backText = this.querySelector('.course-flip-card__back .course-flip-card__text');
      const frontText = this.querySelector('.course-flip-card__front .course-flip-card__text');
      frontTitle.textContent = title;
      if (backHeadingElement) backHeadingElement.textContent = backHeading;
      if (backPrefixElement) backPrefixElement.textContent = backPrefix;
      if (frontItems.length) this.populateList(frontText, frontItems);
      else frontText.textContent = summary;
      if (backItems.length) this.populateList(backText, backItems);
      else backText.textContent = guidance;
    }

    getListAttribute(name) {
      const value = this.getAttribute(name);
      return value ? value.split('|').map((item) => item.trim()).filter(Boolean) : [];
    }

    populateList(element, items) {
      items.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        element.appendChild(listItem);
      });
    }

    flipIcon() {
      return `
        <span class="course-flip-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path d="M7 7h9.2l-2.1-2.1 1.4-1.4L20 8l-4.5 4.5-1.4-1.4L16.2 9H7a3 3 0 0 0 0 6h2v2H7A5 5 0 0 1 7 7Zm10 10H7.8l2.1 2.1-1.4 1.4L4 16l4.5-4.5 1.4 1.4L7.8 15H17a3 3 0 0 0 0-6h-2V7h2a5 5 0 0 1 0 10Z" />
          </svg>
        </span>`;
    }

    toggle() {
      const flipped = !this.classList.contains('is-flipped');
      this.classList.toggle('is-flipped', flipped);
      this.button.setAttribute('aria-expanded', String(flipped));
      this.querySelector('.course-flip-card__front').setAttribute('aria-hidden', String(flipped));
      this.querySelector('.course-flip-card__back').setAttribute('aria-hidden', String(!flipped));
    }

    escapeAttribute(value) {
      return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  if (!customElements.get('course-flip-card')) {
    customElements.define('course-flip-card', CourseFlipCard);
  }
})();
