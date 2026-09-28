(() => {
  class TimeManagementCategorySorter extends HTMLElement {
    connectedCallback() {
      this.itemsRegion = this.querySelector('[data-category-sorter-items]');
      this.categories = [...this.querySelectorAll('[data-category-sorter-category]')];
      this.status = this.querySelector('[data-category-sorter-status]');
      this.items = [...this.itemsRegion.querySelectorAll('[data-category-sorter-item]')];
      this.selectedItem = null;
      this.sortedCount = 0;

      this.items.forEach((item, index) => {
        item.dataset.originalOrder = String(index);
        item.setAttribute('tabindex', '0');
        item.addEventListener('click', () => this.selectItem(item));
        item.addEventListener('keydown', event => this.handleItemKeydown(event, item));
        item.addEventListener('dragstart', event => this.startDrag(event, item));
        item.addEventListener('dragend', () => item.classList.remove('is-selected'));
      });

      this.categories.forEach(category => {
        category.addEventListener('click', () => this.placeSelectedItem(category));
        category.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.placeSelectedItem(category);
          }
        });
        category.addEventListener('dragover', event => {
          event.preventDefault();
          category.classList.add('is-over');
        });
        category.addEventListener('dragleave', () => category.classList.remove('is-over'));
        category.addEventListener('drop', event => {
          event.preventDefault();
          category.classList.remove('is-over');
          this.placeItem(this.selectedItem, category);
        });
      });
    }

    selectItem(item) {
      if (item.classList.contains('is-placed')) return;
      this.items.forEach(candidate => candidate.classList.remove('is-selected'));
      item.classList.add('is-selected');
      this.selectedItem = item;
      this.setStatus('Now choose the category that best describes this time waster.');
    }

    handleItemKeydown(event, item) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.selectItem(item);
      }
    }

    startDrag(event, item) {
      if (item.classList.contains('is-placed')) {
        event.preventDefault();
        return;
      }
      this.selectedItem = item;
      item.classList.add('is-selected');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.dataset.categorySorterItem);
    }

    placeSelectedItem(category) {
      if (this.selectedItem) this.placeItem(this.selectedItem, category);
    }

    placeItem(item, category) {
      if (!item || item.classList.contains('is-placed')) return;
      const categoryName = category.dataset.categorySorterCategory;
      const expectedCategories = item.dataset.category.split(/\s+/).filter(Boolean);

      if (!expectedCategories.includes(categoryName)) {
        this.returnItem(item);
        this.setStatus('Not quite. This example is returning to the items list. Revisit the category definitions and try again.');
        return;
      }

      const categoryItems = category.querySelector('[data-category-sorter-category-items]');
      categoryItems.appendChild(item);
      item.classList.remove('is-selected');
      item.classList.add('is-placed');
      item.setAttribute('aria-label', `${this.itemTitle(item)} placed in ${categoryName}`);
      item.removeAttribute('tabindex');
      this.selectedItem = null;
      this.sortedCount += 1;
      const remaining = this.items.length - this.sortedCount;
      this.setStatus(
        remaining === 0
          ? 'Great work. You sorted every time waster. Notice the pattern, then consider which response would protect your time.'
          : `Correct. ${remaining} example${remaining === 1 ? '' : 's'} left to sort.`,
        remaining === 0,
      );
    }

    returnItem(item) {
      item.classList.remove('is-selected');
      item.classList.add('is-returning');
      window.setTimeout(() => {
        this.insertInOriginalOrder(item);
        item.classList.remove('is-returning');
        this.selectedItem = null;
      }, 350);
    }

    insertInOriginalOrder(item) {
      const nextItem = this.items
        .filter(candidate => candidate !== item && !candidate.classList.contains('is-placed'))
        .sort((a, b) => Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder))
        .find(candidate => Number(candidate.dataset.originalOrder) > Number(item.dataset.originalOrder));
      if (nextItem) this.itemsRegion.insertBefore(item, nextItem);
      else this.itemsRegion.appendChild(item);
    }

    itemTitle(item) {
      return item.querySelector('h3')?.textContent.trim() || 'Item';
    }

    setStatus(message, success = false) {
      if (!this.status) return;
      this.status.classList.toggle('is-success', success);
      this.status.replaceChildren();

      if (success) {
        const icon = document.createElement('span');
        icon.className = 'category-sorter__status-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg viewBox="0 0 24 24" role="img" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.1 14.2-4-4 1.4-1.4 2.6 2.6 5.8-5.8 1.4 1.4-7.2 7.2Z" /></svg>';
        this.status.appendChild(icon);
      }

      const text = document.createElement('span');
      text.textContent = message;
      this.status.appendChild(text);
    }
  }

  if (!customElements.get('tm-category-sorter')) {
    customElements.define('tm-category-sorter', TimeManagementCategorySorter);
  }
})();
