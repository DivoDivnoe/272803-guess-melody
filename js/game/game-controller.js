import TimerView from './timer-view';
import SingerQuestionView from './singer-question-view';
import GenreQuestionView from './genre-question-view';
import showScreen from '../show-screen';
import {results} from '../constants';

export default class GameController {
  constructor(application) {
    this.application = application;
    this.model = this.application.model;
    this.timer = new TimerView(this.application.model.state.duration);
  }

  init() {
    showScreen(this.timer.element);
    this.timer.finishGameHandler = () => this.application.showResultsScreen(this.model.changeState());
    this.timer.changeState = (time) => this.model.changeTime(time);
    this._initQuestion();
  }

  _initQuestion() {
    const question = this.model.state.questions[this.model.state.questionNumber];
    const map = {
      artist: SingerQuestionView,
      genre: GenreQuestionView
    };
    this._question = new map[question.type](question);

    this._showQuestion();
    const answerTimeCheckPoint = Date.now();

    this._question.answerHandler = (isValidAnswer) => {
      const answerTime = (Date.now() - answerTimeCheckPoint) / 1000;
      this.model.changeState(isValidAnswer, answerTime);
      this._checkResult();
    };
  }

  _showQuestion() {
    const gameScreen = document.querySelector(`.main--level`);

    gameScreen.replaceChild(this._question.element, document.querySelector(`.main-wrap`));
  }

  _checkResult() {
    const statistics = this.model.state.statistics;

    switch (statistics.result) {
      case results.LOSS:
        const preloadRemove = this.application.showPreloader();

        this._resetTimer();
        this.model.save({
          time: statistics.time,
          answers: statistics.answers
        })
          .then(() => this.model.loadStatistics())
          .then(preloadRemove)
          .then(() => this.application.showResultsScreen());
        break;
      case results.WIN:
        this._resetTimer();
        this.application.showResultsScreen();
        break;
      default:
        this._initQuestion();
    }
  }

  _resetTimer() {
    this.timer.stopTimer();
  }
}
