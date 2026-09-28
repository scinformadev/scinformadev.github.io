(() => {
  class TimeManagementFlipCard extends HTMLElement {
    connectedCallback() {
      this.render();
      this.button = this.querySelector('.tm-flip-card__button');
      this.button.addEventListener('click', () => this.toggle());
    }

    render() {
      const title = this.getAttribute('title') || '';
      const summary = this.getAttribute('summary') || '';
      const guidance = this.getAttribute('guidance') || '';
      const label = this.getAttribute('label') || `Show guidance for ${title}`;

      this.innerHTML = `
        <button class="tm-flip-card__button" type="button" aria-expanded="false" aria-label="${this.escapeAttribute(label)}">
          <span class="tm-flip-card__face tm-flip-card__front" aria-hidden="false">
            <strong class="tm-flip-card__title"></strong>
            <span class="tm-flip-card__text"></span>
            ${this.flipIcon()}
          </span>
          <span class="tm-flip-card__face tm-flip-card__back" aria-hidden="true">
            <span class="tm-flip-card__text"></span>
            ${this.flipIcon()}
          </span>
        </button>`;

      const frontTitle = this.querySelector('.tm-flip-card__front .tm-flip-card__title');
      const backText = this.querySelector('.tm-flip-card__back .tm-flip-card__text');
      const frontText = this.querySelector('.tm-flip-card__front .tm-flip-card__text');
      frontTitle.textContent = title;
      frontText.textContent = summary;
      backText.textContent = guidance;
    }

    flipIcon() {
      return `
        <span class="tm-flip-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path d="M7 7h9.2l-2.1-2.1 1.4-1.4L20 8l-4.5 4.5-1.4-1.4L16.2 9H7a3 3 0 0 0 0 6h2v2H7A5 5 0 0 1 7 7Zm10 10H7.8l2.1 2.1-1.4 1.4L4 16l4.5-4.5 1.4 1.4L7.8 15H17a3 3 0 0 0 0-6h-2V7h2a5 5 0 0 1 0 10Z" />
          </svg>
        </span>`;
    }

    toggle() {
      const flipped = !this.classList.contains('is-flipped');
      this.classList.toggle('is-flipped', flipped);
      this.button.setAttribute('aria-expanded', String(flipped));
      this.querySelector('.tm-flip-card__front').setAttribute('aria-hidden', String(flipped));
      this.querySelector('.tm-flip-card__back').setAttribute('aria-hidden', String(!flipped));
    }

    escapeAttribute(value) {
      return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  if (!customElements.get('tm-flip-card')) {
    customElements.define('tm-flip-card', TimeManagementFlipCard);
  }
})();
