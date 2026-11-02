(() => {
  class CourseAccordion extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;

      const items = [...this.children].filter((child) => child.tagName === 'DETAILS');
      let firstOpen = false;

      items.forEach((item) => {
        if (item.open) {
          if (firstOpen) item.open = false;
          else firstOpen = true;
        }

        item.addEventListener('toggle', () => {
          if (!item.open) return;
          items.forEach((other) => {
            if (other !== item) other.open = false;
          });
        });
      });
    }
  }

  if (!customElements.get('course-accordion')) {
    customElements.define('course-accordion', CourseAccordion);
  }
})();
