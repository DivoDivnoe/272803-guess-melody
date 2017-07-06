import WelcomeView from './welcome-view';
import showScreen from '../show-screen';

export default class WelcomeController {
  constructor(application) {
    this.screen = new WelcomeView();
    this.application = application;
  }

  init() {
    showScreen(this.screen.element);
    this.screen.startGame = () => this.application.showGame();
  }
}
