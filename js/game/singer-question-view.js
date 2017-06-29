import AbstractView from '../abstract-view';
import {ENTER_KEY_CODE} from '../constants';
import initializePlayer from '../player';

export default class SingerQuestionView extends AbstractView {
  constructor(gameData) {
    super();
    this.game = gameData;
  }

  get template() {
    const mainAnswer = (answer, index) => `
      <div class="main-answer-wrapper">
        <input class="main-answer-r" type="radio" id="answer-${index}" name="answer" value="${answer.title}" tabindex="-1" />
        <label class="main-answer" for="answer-${index}" tabindex="0">
          <img class="main-answer-preview" src="${answer[`image`].url}" width="${answer.image.width}" height="${answer.image.width}">
          ${answer.title}
        </label>
      </div>
    `;
    return `
    <div class="main-wrap">
      <h2 class="title main-title">${this.game.question}</h2>
      <div class="player-wrapper"></div>
      <form class="main-list">${this.game.answers.map(mainAnswer).join(``)}</form>
    </div>
    `;
  }

  bind() {
    const firstGameScreen = this.element;
    const players = this.element.querySelectorAll(`.player-wrapper`);
    const author = this.game.answers.find((answer) => answer[`isCorrect`]).title;

    [...players].forEach((player, index) => initializePlayer(player, this.game.src, true));

    const answerKeyDownHandler = (evt, isValidAnswer) => {
      if (evt.keyCode === ENTER_KEY_CODE) {
        this.checkAnswer(isValidAnswer);
      }
    };

    firstGameScreen.querySelectorAll(`.main-answer`).forEach((answer) => {
      const isValidAnswer = author === (answer.textContent).trim();

      answer.addEventListener(`click`, () => {
        this.checkAnswer(isValidAnswer);
      });
      answer.addEventListener(`keydown`, (evt) => answerKeyDownHandler(evt, isValidAnswer));
    });
  }

  checkAnswer() {

  }
}
