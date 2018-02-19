import {API_URL} from '../constants';
import AbstractModel from './abstract-model';
import {results} from '../constants';

export default class Model extends AbstractModel {
  get urlRead() {
    return `${API_URL}/questions`;
  }
  get urlWright() {
    return `${API_URL}/stats/Andrey272803`;
  }

  get statsUrlRead() {
    return `${API_URL}/stats/Andrey272803`;
  }

  get initialState() {
    return {
      duration: 120,
      leftMistakes: 3,
      questionNumber: 0,
      questions: null,
      statistics: {
        rightAnswers: 0,
        result: null,
        time: 0,
        answers: 0
      },
      history: null
    };
  }

  get state() {
    if (!this._state) {
      this._state = this.initialState;
    }
    return this._state;
  }

  set state(state) {
    this._state = state;
  }

  loadStatistics() {
    return fetch(this.statsUrlRead)
      .then((data) => data.json())
      .then((data) => {
        this.state.history = data;
      });
  }

  resetState() {
    this.state = this.initialState;
    return this.load();
  }

  changeState(isValidAnswer, answerTime) {
    const statistics = this.state.statistics;
    const currentState = Object.assign({}, this.state, {
      leftMistakes: this.state.leftMistakes - (isValidAnswer ? 0 : 1),
      questionNumber: this.state.questionNumber + 1,
      statistics: Object.assign({}, statistics, {
        rightAnswers: statistics.rightAnswers + (isValidAnswer ? 1 : 0)
      })
    });
    if (isValidAnswer) {
      currentState.statistics.answers = statistics.answers + (answerTime < 10 ? 2 : 1);
    }

    if (currentState.statistics.time === currentState.duration || !currentState.leftMistakes) {
      currentState.statistics.result = results.LOSS;
    } else if (currentState.questionNumber === currentState.questions.length) {
      currentState.statistics.result = results.WIN;
    }

    this.state = currentState;

    return this.state;
  }

  changeTime(time) {
    const gameTime = this.state.duration - time;

    this.state.statistics = Object.assign({}, this.state.statistics, {
      time: gameTime
    });

    return this.state;
  }

  load() {
    return super.load()
      .then((data) => {
        this.state.questions = data;
      });
  }
}
