(() => {
  class TimeManagementMatchingExercise extends HTMLElement {
    connectedCallback() {
      const source = this.querySelector('script[type="application/json"]');
      if (!source) return;

      try {
        this.pairs = JSON.parse(source.textContent);
      } catch {
        this.pairs = [];
      }

      if (!Array.isArray(this.pairs) || !this.pairs.length) return;
      this.render();
    }

    render() {
      const shuffled = [...this.pairs]
        .map((pair, index) => ({ ...pair, index }))
        .sort(() => Math.random() - 0.5);

      this.innerHTML = '';
      const layout = document.createElement('div');
      layout.className = 'tm-matching-exercise__layout';

      const strategyColumn = document.createElement('section');
      const strategyTitle = document.createElement('h3');
      strategyTitle.className = 'tm-matching-exercise__column-title';
      strategyTitle.textContent = 'Strategies';
      strategyColumn.appendChild(strategyTitle);

      const strategyList = document.createElement('div');
      strategyList.className = 'tm-matching-exercise__strategy-list';
      this.pairs.forEach((pair, index) => {
        const strategy = document.createElement('div');
        strategy.className = 'tm-matching-exercise__strategy';
        strategy.dataset.index = String(index);
        strategy.textContent = pair.strategy;
        strategyList.appendChild(strategy);
      });
      strategyColumn.appendChild(strategyList);

      const exampleColumn = document.createElement('section');
      const exampleTitle = document.createElement('h3');
      exampleTitle.className = 'tm-matching-exercise__column-title';
      exampleTitle.textContent = 'Examples — reorder to match';
      exampleColumn.appendChild(exampleTitle);

      const exampleList = document.createElement('div');
      exampleList.className = 'tm-matching-exercise__example-list';
      exampleList.setAttribute('aria-label', 'Shuffled examples. Drag items up or down to reorder them.');

      shuffled.forEach((pair) => {
        const example = document.createElement('div');
        example.className = 'tm-matching-exercise__example';
        example.draggable = true;
        example.tabIndex = 0;
        example.dataset.answerIndex = String(pair.index);
        example.textContent = pair.example;
        example.setAttribute('role', 'listitem');
        example.setAttribute('aria-label', 'Example: ' + pair.example);

        example.addEventListener('dragstart', (event) => {
          example.classList.add('is-dragging');
          event.dataTransfer.setData('text/plain', 'reorder');
          event.dataTransfer.effectAllowed = 'move';
        });
        example.addEventListener('dragend', () => {
          example.classList.remove('is-dragging');
          this.clearFeedback();
        });
        example.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
          event.preventDefault();
          const sibling = event.key === 'ArrowUp'
            ? example.previousElementSibling
            : example.nextElementSibling;
          if (!sibling) return;
          if (event.key === 'ArrowUp') exampleList.insertBefore(example, sibling);
          else exampleList.insertBefore(sibling, example);
          this.clearFeedback();
          example.focus();
        });
        exampleList.appendChild(example);
      });

      exampleList.addEventListener('dragover', (event) => {
        event.preventDefault();
        const dragging = exampleList.querySelector('.is-dragging');
        const target = event.target.closest('.tm-matching-exercise__example');
        if (!dragging || !target || dragging === target) return;
        const bounds = target.getBoundingClientRect();
        const placeAfter = event.clientY > bounds.top + bounds.height / 2;
        exampleList.insertBefore(dragging, placeAfter ? target.nextSibling : target);
      });

      exampleColumn.appendChild(exampleList);
      layout.append(strategyColumn, exampleColumn);

      const checkButton = document.createElement('button');
      checkButton.className = 'tm-matching-exercise__check';
      checkButton.type = 'button';
      checkButton.textContent = 'Check order';
      checkButton.addEventListener('click', () => this.checkOrder(strategyList, exampleList));

      this.status = document.createElement('p');
      this.status.className = 'tm-matching-exercise__status';
      this.status.setAttribute('aria-live', 'polite');
      this.status.textContent = 'Reorder the examples, then check your order.';

      this.append(layout, checkButton, this.status);
    }

    clearFeedback() {
      this.querySelectorAll('.is-correct, .is-incorrect').forEach((item) => {
        item.classList.remove('is-correct', 'is-incorrect');
      });
      if (this.status) this.status.textContent = 'Reorder the examples, then check your order.';
    }

    checkOrder(strategyList, exampleList) {
      const strategies = [...strategyList.children];
      const examples = [...exampleList.children];
      let correct = 0;

      examples.forEach((example, index) => {
        const isCorrect = example.dataset.answerIndex === String(index);
        example.classList.toggle('is-correct', isCorrect);
        example.classList.toggle('is-incorrect', !isCorrect);
        strategies[index].classList.toggle('is-correct', isCorrect);
        strategies[index].classList.toggle('is-incorrect', !isCorrect);
        if (isCorrect) correct += 1;
      });

      this.status.textContent = correct === this.pairs.length
        ? 'Complete — all ' + this.pairs.length + ' examples are in the correct order.'
        : correct + ' of ' + this.pairs.length + ' are in the correct position. Keep reordering and try again.';
    }
  }

  if (!customElements.get('tm-matching-exercise')) {
    customElements.define('tm-matching-exercise', TimeManagementMatchingExercise);
  }
})();
