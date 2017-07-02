export default class AbstractView {
  get template() {
    throw new Error(`You have to define template for view`);
  }

  _render() {
    const helpElement = document.createElement(`div`);

    helpElement.innerHTML = this.template;

    return helpElement.firstElementChild;
  }

  _bind() {

  }

  get element() {
    if (!this._element) {
      this._element = this._render();
      this._bind();
    }
    return this._element;
  }
}
