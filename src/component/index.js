class Component {
  constructor(options) {
    this.options = { ...options };
  }

  remove() {
    this.emptyElement(this.el);
  }

  emptyElement(el) {
    while (el.firstChild) {
      el.removeChild(el.lastChild);
    }
  }
}

module.exports = { Component };
