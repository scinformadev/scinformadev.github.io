(() => {
  class TimeManagementTrueFalse extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.statement = this.getAttribute('statement') || '';
      this.answer = (this.getAttribute('answer') || '').toLowerCase() === 'true';
      this.explanation = this.getAttribute('explanation') || '';
      this.groupName = `true-false-${TimeManagementTrueFalse.nextId++}`;
      this.render();
    }

    render() {
      this.innerHTML = `
        <div class="tm-true-false__card">
          <p class="tm-true-false__statement"></p>
          <div class="tm-true-false__options" role="radiogroup" aria-label="Choose true or false">
            <label class="tm-true-false__option"><input type="radio" value="true"> True</label>
            <label class="tm-true-false__option"><input type="radio" value="false"> False</label>
          </div>
          <p class="tm-true-false__feedback" aria-live="polite" hidden></p>
        </div>`;

      this.querySelector('.tm-true-false__statement').textContent = this.statement;
      this.feedback = this.querySelector('.tm-true-false__feedback');
      this.querySelectorAll('input[type="radio"]').forEach(input => {
        input.name = this.groupName;
        input.addEventListener('change', () => this.check(input));
      });
    }

    check(input) {
      const selected = input.value === 'true';
      const correct = selected === this.answer;
      this.classList.toggle('is-correct', correct);
      this.classList.toggle('is-incorrect', !correct);
      this.feedback.textContent = correct ? `Correct. ${this.explanation}` : `Not quite. ${this.explanation}`;
      this.feedback.hidden = false;
    }
  }

  TimeManagementTrueFalse.nextId = 0;

  if (!customElements.get('tm-true-false')) {
    customElements.define('tm-true-false', TimeManagementTrueFalse);
  }
})();
