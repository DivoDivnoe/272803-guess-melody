import AbstractView from '../abstract-view';

export default class PreloadView extends AbstractView {
  constructor() {
    super();
    this.settings = {
      width: 64,
      height: 64
    };
  }

  get template() {
    return `
    <div class="wrapper">
      <img src="../img/plate.gif" width="${this.settings.width}" height="${this
      .settings.height}">
    </div>
    `;
  }

  start() {
    document.body.appendChild(this.element);
  }

  hide() {
    document.body.removeChild(this.element);
  }
}
