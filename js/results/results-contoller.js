import ResultsView from './results-view';
import showScreen from '../show-screen';

export default class ResultsController {
  constructor(application) {
    this.application = application;
    this.statistics = this.application.model.state.statistics;
    this.screen = new ResultsView(this.statistics);
  }

  init() {
    this._findComparison();
    showScreen(this.screen.element);
    this.screen.replayHandler = () => {
      const preloadRemove = this.application.showPreloader();

      this.application.model.resetState()
        .then(() => this.application.loadGameAudios())
        .then(preloadRemove)
        .then(() => this.application.showWelcome());
    };
  }

  _findComparison() {
    if (this.statistics.result === `win`) {
      const history = this.application.model.state.history.slice();
      const myTime = parseInt(this.statistics.time, 10);
      const myRightAnswers = parseInt(this.statistics.answers, 10);

      const worseResults = history.filter((result) => {
        const rightAnswers = parseInt(result.answers, 10);

        return rightAnswers === myRightAnswers ? parseInt(result.time, 10) > myTime : rightAnswers < myRightAnswers;
      });

      this.statistics.comparison = Math.floor(worseResults.length * 100 / history.length);
    }
  }
}
