import WelcomeController from './welcome/welcome-controller';
import GameController from './game/game-controller';
import ResultsController from './results/results-contoller';
import Model from './model/model';
import PreloadView from './preload/preload-view';
import loadAudio from './load-audio';

const ControllerID = {
  WELCOME: ``,
  GAME: `game`,
  RESULT: `result`
};

export default class Application {
  constructor() {
    const preloadRemove = this.showPreloader();
    this.model = new Model();

    this.model.load()
      .then(() => this.loadGameAudios())
      .catch((error) => window.console.warn(error))
      .then(() => this._setup())
      .then(preloadRemove)
      .then(() => this._changeController());
  }

  showWelcome() {
    location.hash = ControllerID.WELCOME;
  }

  showGame() {
    location.hash = ControllerID.GAME;
  }

  showResultsScreen() {
    location.hash = ControllerID.RESULT;
  }

  loadGameAudios() {
    let urls = [];
    this.model.state.questions
      .forEach(
        (question) => question.src ?
        urls.push(question.src) :
        question.answers.forEach((answer) => urls.push(answer.src))
      );
    urls = urls.filter((url) => url);

    return Promise.all(urls.map((url) => loadAudio(url)));
  }

  showPreloader() {
    const preloadView = new PreloadView();
    preloadView.start();

    return () => preloadView.hide();
  }

  _setup() {
    this._router = {
      [ControllerID.WELCOME]: WelcomeController,
      [ControllerID.GAME]: GameController,
      [ControllerID.RESULT]: ResultsController
    };

    window.addEventListener(`hashchange`, () => this._changeController());
  }

  _changeController() {
    const controller = this._getControllerFromHash(location.hash);
    const Controller = this._router[controller];

    if (Controller) {
      new Controller(this).init();
    } else {
      this.showWelcome();
    }
  }

  _getControllerFromHash(hash) {
    return hash.substr(1);
  }
}
