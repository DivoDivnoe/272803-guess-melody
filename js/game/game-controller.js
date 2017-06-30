import TimerView from './timer-view';
import SingerQuestionView from './singer-question-view';
import GenreQuestionView from './genre-question-view';

export default class GameController {
  constructor(application) {
    this.application = application;
    this.model = this.application.model;
    this.timer = new TimerView(this.application.model.state.duration);
  }

  init() {
    this.showTimer();
    this.timer.finishGame = () => this.application.showResultsScreen(this.model.changeState());
    this.timer.changeState = (time) => this.model.changeTime(time);
    this.initQuestion();
  }

  initQuestion() {
    const question = this.model.state.questions[this.model.state.questionNumber];
    const map = {
      artist: SingerQuestionView,
      genre: GenreQuestionView
    };
    this.question = new map[question.type](question);

    this.showQuestion();
    const answerTimeCheckPoint = Date.now();

    this.question.checkAnswer = (isValidAnswer) => {
      const answerTime = (Date.now() - answerTimeCheckPoint) / 1000;
      this.model.changeState(isValidAnswer, answerTime);
      this.checkResult();
    };
  }

  showTimer() {
    const app = document.querySelector(`.app`);
    app.replaceChild(this.timer.element, app.querySelector(`.main`));
  }

  showQuestion() {
    const gameScreen = document.querySelector(`.main--level`);

    gameScreen.replaceChild(this.question.element, document.querySelector(`.main-wrap`));
  }

  checkResult() {
    const statistics = this.model.state.statistics;

    switch (statistics.result) {
      case `win`:
        const preloadRemove = this.application.showPreloader();

        this.resetTimer();
        this.model.save({
          time: statistics.time,
          answers: statistics.answers
        })
          .then(() => this.model.loadStatistics())
          .then(preloadRemove)
          .then(() => this.application.showResultsScreen());
        break;
      case `loss`:
        this.resetTimer();
        this.application.showResultsScreen();
        break;
      default:
        this.initQuestion();
    }
  }

  resetTimer() {
    this.timer.stopTimer();
  }
}
