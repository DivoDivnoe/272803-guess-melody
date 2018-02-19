(function (exports) {
'use strict';

class AbstractView {
  get template() {
    throw new Error(`You have to define template for view`);
  }

  _render() {
    const helpElement = document.createElement(`div`);

    helpElement.innerHTML = this.template;

    return helpElement.firstElementChild;
  }

  _bind() {

  }

  get element() {
    if (!this._element) {
      this._element = this._render();
      this._bind();
    }
    return this._element;
  }
}

class WelcomeView extends AbstractView {
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

const app = document.querySelector(`.app`);
const showScreen = (screen) => {
  app.replaceChild(screen, app.querySelector(`.main`));
};

class WelcomeController {
  constructor(application) {
    this.screen = new WelcomeView();
    this.application = application;
  }

  init() {
    showScreen(this.screen.element);
    this.screen.startGame = () => this.application.showGame();
  }
}

const animationObj = {
  getAnimation: (step, stepDuration, steps) => ({
    step, stepDuration, steps
  }),

  animate: (animation, callback, callbackEnd) => {
    const interval = setInterval(() => {
      const nextStep = animation.step + 1;
      if (nextStep <= animation.steps) {
        animation = animationObj.getAnimation(nextStep, animation.stepDuration, animation.steps);
        callback(animation);
      } else {
        stopFn();
        if (typeof callbackEnd === `function`) {
          callbackEnd();
        }
      }
    }, animation.stepDuration);

    const stopFn = () => clearInterval(interval);

    return stopFn;
  }
};

class TimerView extends AbstractView {
  constructor(duration) {
    super();
    this.duration = duration;
  }

  get template() {
    return `
    <section class="main main--level">
      <svg xmlns="http://www.w3.org/2000/svg" class="timer" viewBox="0 0 780 780">
        <circle
          cx="390" cy="390" r="370"
          class="timer-line"
          style="filter: url(.#blur); transform: rotate(-90deg) scaleY(-1); transform-origin: center">
        </circle>
      </svg>

        <div class="timer-value" xmlns="http://www.w3.org/1999/xhtml">
          <span class="timer-value-mins">0${Math.floor(this.duration / 60)}</span>
          <span class="timer-value-dots">:</span>
          <span class="timer-value-secs">0${this.duration % 60}</span>
        </div>
        <div class="main-wrap"></div>
    </section>
    `;
  }

  get element() {
    if (!this._element) {
      this._element = this._render();
      this._initializeCountdown();
    }
    return this._element;
  }

  _initializeCountdown() {
    const element = this.element.querySelector(`.timer-line`);
    const radius = parseInt(element.getAttributeNS(null, `r`), 10);
    const timer = this.element.querySelector(`.timer-value`);

    this.stopTimer = animationObj.animate(animationObj.getAnimation(0, 1000, this.duration), (animation) => {
      this._redrawCircle(element, radius, animation);
      this._redrawTimer(timer, animation);
      this.changeState(this._getTime());
    }, () => {
      timer.classList.add(`timer-value--finished`);
      this.finishGameHandler();
    });

    return this.stopTimer;
  }

  _redrawCircle(circle, radius, animation) {
    const length = 2 * Math.PI * radius;
    const stepLength = length / animation.steps;
    const lengthToClear = stepLength * animation.step;

    circle.setAttributeNS(null, `r`, radius);
    circle.setAttributeNS(null, `stroke-dasharray`, length.toString());
    circle.setAttributeNS(null, `stroke-dashoffset`, lengthToClear.toString());

    return circle;
  }

  _redrawTimer(timer, animation) {
    const total = animation.stepDuration * animation.steps;
    const passed = animation.stepDuration * animation.step;
    const timeLeft = this._formatTime(total, passed);

    timer.querySelector(`.timer-value-mins`).textContent = this._addLeadingZero(timeLeft.minutes);
    timer.querySelector(`.timer-value-secs`).textContent = this._addLeadingZero(timeLeft.seconds);

    return timer;
  }

  _formatTime(total, passed) {
    const minutesLeft = Math.floor((total - passed) / 60 / 1000);
    const secondsLeft = (total - passed - minutesLeft * 60 * 1000) / 1000;

    return {
      minutes: minutesLeft,
      seconds: secondsLeft
    };
  }

  _getTime() {
    const minutes = parseInt(this.element.querySelector(`.timer-value-mins`).textContent, 10);
    const seconds = parseInt(this.element.querySelector(`.timer-value-secs`).textContent, 10);

    return minutes * 60 + seconds;
  }

  _addLeadingZero(val) {
    return val < 10 ? `0${val}` : val;
  }

  finishGameHandler() {

  }

  changeState() {

  }
}

const ENTER_KEY_CODE = 13;
const API_URL = `https://intensive-ecmascript-server-btfgudlkpi.now.sh/guess-melody`;
const results = {
  WIN: `win`,
  LOSS: `loss`
};

/*
 Иногда от бекенда приходят пустые урлы для музыки. Аудио с пустым
 src не проигрывается, поэтому иногда выглядит, будто что-то сломалось.
 Я не виноват, это всё бекенд.
 */
const updateState = (element, player) => {
  element.querySelector(`.player-status`).style.width =
      `${parseInt(player.currentTime * 100 / player.duration, 10)}%`;
};

const syncState = (element) => {
  element.classList.toggle(`player--is-playing`);
};

const switchState = (state, player, element) => {
  if (player.paused) {
    const nowPlaying = document.querySelector(`.player--is-playing`);
    if (nowPlaying) {
      nowPlaying.querySelector(`audio`).pause();
      syncState(nowPlaying);
    }
    player.play();
    state.stopAnimation = animationObj.animate(
        animationObj.getAnimation(player.currentTime, 1000, player.duration),
        (animation) => updateState(element, player));
  } else {
    player.pause();
    state.stopAnimation();
    state.stopAnimation = null;
  }

  syncState(element);
};


const destroyPlayer = (element, state) => {
  const player = element.querySelector(`audio`);
  const button = element.querySelector(`button`);

  if (state.stopAnimation) {
    state.stopAnimation();
  }

  player.src = null;
  button.onclick = null;
  element.innerHTML = ``;
  state = null;

  return true;
};

const initializePlayer = (element, file, autoplay = false, controllable = true) => {
  let state = {};

  const content = document.querySelector(`template`)
    .content
    .querySelector(`.player`)
    .cloneNode(true);
  const player = content.querySelector(`audio`);
  const button = content.querySelector(`button`);

  player.onloadeddata = () => {
    if (controllable) {
      button.onclick = () => switchState(state, player, content);
    }

    if (autoplay) {
      switchState(state, player, content);
    }
  };

  player.src = file;
  element.appendChild(content);
  element.classList.toggle(`player--no-controls`, !controllable);

  return () => destroyPlayer(element, state);
};

class SingerQuestionView extends AbstractView {
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

    const answerKeyDownHandler = (evt, isValidAnswer) => {
      if (evt.keyCode === ENTER_KEY_CODE) {
        this.answerHandler(isValidAnswer);
      }
    };

    for (let answer of answers) {
      const isValidAnswer = author === (answer.textContent).trim();

      answer.addEventListener(`click`, () => {
        this.answerHandler(isValidAnswer);
      });
      answer.addEventListener(`keydown`, (evt) => answerKeyDownHandler(evt, isValidAnswer));
    }
  }

  answerHandler() {

  }
}

class GenreQuestionView extends AbstractView {
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

    for (let input of answerInputs) {
      input.addEventListener(`change`, () => {
        const checkedAnswerInputs = answerInputs.some((checkbox) => checkbox.checked);

        this.element.querySelector(`.genre-answer-send`).disabled = !checkedAnswerInputs;
      });
    }
  }

  answerHandler() {

  }
}

class GameController {
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

class ResultsView extends AbstractView {
  constructor(stats) {
    super();
    this.stats = stats;
  }

  get template() {
    const resultContent = {
      win: {
        title: `Вы настоящий меломан!`,
        stat: `За&nbsp;${this.stats.time}&nbsp;секунд<br>вы&nbsp;отгадали ${this.stats.rightAnswers}&nbsp;мелодии`,
        comparison: `<span class="main-comparison">Это&nbsp;лучше чем у&nbsp;${this.stats.comparison}%&nbsp;игроков</span>`
      },
      loss: {
        title: `Вы проиграли`,
        stat: `Ничего, вам повезет в следующий раз`,
        comparison: ``
      }
    };
    const result = resultContent[this.stats.result];

    return `
    <section class="main main--result">
      <section class="logo" title="Угадай мелодию"><h1>Угадай мелодию</h1></section>
      <h2 class="title">${result.title}</h2>
      <div class="main-stat">${result.stat}</div>
      ${result.comparison}
      <span role="button" tabindex="0" class="main-replay">Сыграть ещё раз</span>
    </section>
    `;
  }

  _bind() {
    const replay = this.element.querySelector(`.main-replay`);

    const replayHandler = () => {
      this.replay();
      replay.removeEventListener(`click`, replayHandler);
    };
    const replayKeyDownHandler = (evt) => {
      if (evt.keyCode === ENTER_KEY_CODE) {
        this.replayHandler();
        replay.removeEventListener(`keydown`, replayKeyDownHandler);
      }
    };
    replay.addEventListener(`click`, replayHandler);
    replay.addEventListener(`keydown`, replayKeyDownHandler);
  }

  replay() {

  }
}

class ResultsController {
  constructor(application) {
    this.application = application;
    this.statistics = this.application.model.state.statistics;
    this.screen = new ResultsView(this.statistics);
  }

  init() {
    this._findComparison();
    showScreen(this.screen.element);
    this.screen.replay = () => {
      const preloadRemove = this.application.showPreloader();

      this.application.model.resetState()
        .then(() => this.application.loadGameAudios())
        .then(preloadRemove)
        .then(() => this.application.showWelcome());
    };
  }

  _findComparison() {
    if (this.statistics.result === results.WIN) {
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

class DefaultAdapter {
  toServer() {
    throw Error(`Abstract method. Define toServer method`);
  }
}

const defaultAdapter = new class extends DefaultAdapter {
  toServer(data) {
    return JSON.stringify(data);
  }
}();

class AbstractModel {
  get urlRead() {
    throw Error(`Abstract method. Define URL for model`);
  }

  get urlWright() {
    throw Error(`Abstract method. Define URL for model`);
  }

  get initialState() {
    throw Error(`Abstract method. Define initial state for model`);
  }

  load() {
    return fetch(this.urlRead)
      .then((resp) => resp.json());
  }

  save(params, adapter = defaultAdapter) {
    const settings = {
      body: adapter.toServer(params),
      headers: {
        'Content-type': `application/json`
      },
      method: `POST`
    };
    return fetch(this.urlWright, settings);
  }
}

class Model extends AbstractModel {
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

class PreloadView extends AbstractView {
  constructor() {
    super();
    this.settings = {
      width: 64,
      height: 64
    };
  }

  get template() {
    return `
    <div class="wrapper">
      <img src="../img/plate.gif" width="${this.settings.width}" height="${this
      .settings.height}">
    </div>
    `;
  }

  start() {
    document.body.appendChild(this.element);
  }

  hide() {
    document.body.removeChild(this.element);
  }
}

const loadAudio = (url) => {
  return new Promise((resolve) => {
    const audio = document.createElement(`audio`);
    audio.src = url;

    audio.onloadeddata = (evt) => resolve(evt.target.response);
    audio.onerror = (evt) => resolve(evt.target.response);

    window.setTimeout(resolve, 60000);
  });
};

const ControllerID = {
  WELCOME: ``,
  GAME: `game`,
  RESULT: `result`
};

class Application {
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
    return hash ? hash.substr(1) : ``;
  }
}

const application = new Application();

exports.application = application;

}((this.main = this.main || {})));

//# sourceMappingURL=main.js.map
