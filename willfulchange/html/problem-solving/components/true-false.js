(() => {
  class CourseTrueFalse extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.statement = this.getAttribute('statement') || '';
      this.answer = (this.getAttribute('answer') || '').toLowerCase() === 'true';
      this.explanation = this.getAttribute('explanation') || '';
      this.groupName = `true-false-${CourseTrueFalse.nextId++}`;
      this.render();
    }

    render() {
      this.innerHTML = `
        <div class="course-true-false__card">
          <p class="course-true-false__statement"></p>
          <div class="course-true-false__options" role="radiogroup" aria-label="Choose true or false">
            <label class="course-true-false__option"><input type="radio" value="true"> True</label>
            <label class="course-true-false__option"><input type="radio" value="false"> False</label>
          </div>
          <p class="course-true-false__feedback" aria-live="polite" hidden></p>
        </div>`;

      this.querySelector('.course-true-false__statement').textContent = this.statement;
      this.feedback = this.querySelector('.course-true-false__feedback');
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
      const result = document.createElement('strong');
      result.className = 'course-true-false__result';
      result.textContent = correct ? 'Correct.' : 'Incorrect.';
      this.feedback.replaceChildren(result, document.createTextNode(this.explanation ? ` ${this.explanation}` : ''));
      this.feedback.hidden = false;
    }
  }

  CourseTrueFalse.nextId = 0;

  if (!customElements.get('course-true-false')) {
    customElements.define('course-true-false', CourseTrueFalse);
  }
})();
