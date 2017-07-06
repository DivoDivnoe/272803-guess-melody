import AbstractView from '../abstract-view';

export default class WelcomeView extends AbstractView {
  constructor() {
    super();
  }

  get template() {
    return `
    <section class="main main--welcome">
      <section class="logo" title="Угадай мелодию"><h1>Угадай мелодию</h1></section>
      <button class="main-play">Начать игру</button>
      <h2 class="title main-title">Правила игры</h2>
      <p class="text main-text">
        Правила просты&nbsp;— за&nbsp;2 минуты дать
        максимальное количество правильных ответов.<br>
        Удачи!
      </p>
    </section>
    `;
  }

  _bind() {
    const startButton = this.element.querySelector(`.main-play`);
    const startGameHandler = () => {
      this.startGame();
      startButton.removeEventListener(`click`, startGameHandler);
    };

    startButton.addEventListener(`click`, startGameHandler);
  }

  startGame() {

  }
}
