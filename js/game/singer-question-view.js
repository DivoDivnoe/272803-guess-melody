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

  _bind() {
    const firstGameScreen = this.element;
    const players = Array.from(this.element.querySelectorAll(`.player-wrapper`));
    const author = this.game.answers.find((answer) => answer[`isCorrect`]).title;
    const answers = firstGameScreen.querySelectorAll(`.main-answer`);

    players.forEach((player, index) => initializePlayer(player, this.game.src, true));

    for (let answer of answers) {
      const isValidAnswer = author === (answer.textContent).trim();
      const answerKeyDownHandler = (evt) => {
        if (evt.keyCode === ENTER_KEY_CODE) {
          this.checkAnswer(isValidAnswer);
          for (let it of answers) {
            it.removeEventListener(`keydown`, answerKeyDownHandler);
          }
        }
      };
      const answerHandler = () => {
        this.checkAnswer(isValidAnswer);
        for (let it of answers) {
          it.removeEventListener(`click`, answerHandler);
        }
      };

      answer.addEventListener(`click`, answerHandler);
      answer.addEventListener(`keydown`, answerKeyDownHandler);
    }
  }

  checkAnswer() {

  }
}
