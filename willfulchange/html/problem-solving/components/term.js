(() => {
  class CourseTerm extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;

      const header = this.getAttribute('header') || 'DEFINITION';
      const term = this.getAttribute('term') || '';
      const body = this.innerHTML.trim();

      this.innerHTML = `
        <div class="course-term__header">${this.escapeHtml(header)}</div>
        <div class="course-term__body">
          ${term ? `<strong class="course-term__term">${this.escapeHtml(term)}</strong>` : ''}
          ${body ? `<div class="course-term__definition">${body}</div>` : ''}
        </div>
      `;
      this.setAttribute('role', 'group');
      this.setAttribute('aria-label', `${header}${term ? `: ${term}` : ''}`);
    }

    escapeHtml(value) {
      return value.replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[character]);
    }
  }

  if (!customElements.get('course-term')) {
    customElements.define('course-term', CourseTerm);
  }
})();
