(() => {
  class TimeManagementCarousel extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.items = [...this.querySelectorAll(':scope > [data-carousel-item]')];
      this.current = 0;
      this.setupItems();
      this.renderControls();
      this.bindEvents();
      this.update();
    }

    setupItems() {
      this.items.forEach((item, index) => {
        item.classList.add('tm-carousel__item');
        item.setAttribute('role', 'group');
        item.setAttribute('aria-roledescription', 'slide');
        item.setAttribute('aria-label', `${this.itemTitle(item)} (${index + 1} of ${this.items.length})`);
      });
    }

    renderControls() {
      this.controls = document.createElement('div');
      this.controls.className = 'tm-carousel__controls';

      this.previousButton = this.createButton('tm-carousel__arrow', 'Previous item', '←');
      this.nextButton = this.createButton('tm-carousel__arrow', 'Next item', '→');
      this.dots = document.createElement('div');
      this.dots.className = 'tm-carousel__dots';
      this.dots.setAttribute('role', 'group');
      this.dots.setAttribute('aria-label', 'Carousel items');

      this.items.forEach((item, index) => {
        const dot = this.createButton('tm-carousel__dot', `Show ${this.itemTitle(item)}`, '');
        dot.dataset.index = String(index);
        this.dots.append(dot);
      });

      this.status = document.createElement('span');
      this.status.className = 'tm-carousel__status';
      this.status.setAttribute('role', 'status');
      this.status.setAttribute('aria-live', 'polite');

      this.controls.append(this.previousButton, this.dots, this.nextButton, this.status);
      this.append(this.controls);
    }

    createButton(className, label, text) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.setAttribute('aria-label', label);
      button.textContent = text;
      return button;
    }

    bindEvents() {
      this.previousButton.addEventListener('click', () => this.goTo(this.current - 1));
      this.nextButton.addEventListener('click', () => this.goTo(this.current + 1));
      this.dots.addEventListener('click', event => {
        const dot = event.target.closest('.tm-carousel__dot');
        if (dot) this.goTo(Number(dot.dataset.index));
      });
      this.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.goTo(this.current - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.goTo(this.current + 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          this.goTo(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          this.goTo(this.items.length - 1);
        }
      });

      let startX = null;
      this.addEventListener('touchstart', event => {
        startX = event.changedTouches[0].clientX;
      }, { passive: true });
      this.addEventListener('touchend', event => {
        if (startX === null) return;
        const distance = event.changedTouches[0].clientX - startX;
        if (Math.abs(distance) >= 40) this.goTo(this.current + (distance < 0 ? 1 : -1));
        startX = null;
      }, { passive: true });
    }

    goTo(index) {
      this.current = Math.max(0, Math.min(index, this.items.length - 1));
      this.update();
    }

    update() {
      this.items.forEach((item, index) => {
        const active = index === this.current;
        item.hidden = !active;
        item.setAttribute('aria-hidden', String(!active));
      });
      this.previousButton.disabled = this.current === 0;
      this.nextButton.disabled = this.current === this.items.length - 1;
      [...this.dots.children].forEach((dot, index) => {
        const active = index === this.current;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'step');
        else dot.removeAttribute('aria-current');
      });
      this.status.textContent = `${this.itemTitle(this.items[this.current])}, ${this.current + 1} of ${this.items.length}`;
    }

    itemTitle(item) {
      return item.querySelector('h3')?.textContent.trim() || 'Carousel item';
    }
  }

  if (!customElements.get('tm-carousel')) {
    customElements.define('tm-carousel', TimeManagementCarousel);
  }
})();
