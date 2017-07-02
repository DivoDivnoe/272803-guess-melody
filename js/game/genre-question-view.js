import AbstractView from '../abstract-view';
import initializePlayer from '../player';

export default class GenreQuestionView extends AbstractView {
  constructor(gameData) {
    super();
    this.game = gameData;
  }

  get template() {
    const genreAnswer = (answer, index) => `
      <div class="genre-answer">
        <div class="player-wrapper"></div>
        <input type="checkbox" name="answer" value="${answer.genre}" id="a-${index}">
        <label class="genre-answer-check" for="a-${index}"></label>
      </div>
    `;

    return `
    <div class="main-wrap">
      <h2 class="title">${this.game.question}</h2>
      <form class="genre">
        ${this.game.answers.map(genreAnswer).join(``)}
        <button class="genre-answer-send" type="submit" disabled>Ответить</button>
      </form>
    </div>
    `;
  }

  _bind() {
    const screenForm = this.element.querySelector(`.genre`);
    const answerInputs = Array.from(this.element.querySelectorAll(`input[name="answer"]`));
    const players = Array.from(this.element.querySelectorAll(`.player-wrapper`));

    players.forEach((player, index) => initializePlayer(player, this.game.answers[index].src));

    screenForm.addEventListener(`submit`, (evt) => {
      evt.preventDefault();

      const isInputCheckCorrect = (input, genre) => input.checked ? input.value === genre : input.value !== genre;
      const isValidAnswer = answerInputs.every((answerInput) => isInputCheckCorrect(answerInput, this.game.genre));

      this.answerHandler(isValidAnswer);
    });

    answerInputs.forEach((input) => {
      input.addEventListener(`change`, () => {
        const checkedAnswerInputs = answerInputs.some((checkbox) => checkbox.checked);

        this.element.querySelector(`.genre-answer-send`).disabled = !checkedAnswerInputs;
      });
    });
  }

  answerHandler() {

  }
}
