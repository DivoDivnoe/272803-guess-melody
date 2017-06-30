import Model from './model';
import assert from 'assert';

describe(`Model#changeState()`, () => {
  it(`next state object is not equal to the initial state object`, () => {
    const model = new Model();
    model.state.questions = [{}, {}, {}, {}, {}];
    model.changeState(true, 10);
    assert.notEqual(model.state, model.initialState);
  });
  describe(`leftMistakes`, () => {
    it(`should always be decremented, if the answer is wrong`, () => {
      const model = new Model();
      model.state.questions = [{}, {}, {}, {}, {}];
      model.changeState(false, 10);
      assert.equal(model.state.leftMistakes, 2);
    });
    it(`should always stay static, if the answer is correct`, () => {
      const model = new Model();
      model.state.questions = [{}, {}, {}, {}, {}];
      model.changeState(true, 10);
      assert.equal(model.state.leftMistakes, 3);
    });
    it(`if becomes 0, the game always finishes`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 0,
        statistics: {
          time: 0,
          answers: 0,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(false, 10);
      assert.notStrictEqual(model.state.statistics.result, null);
    });
  });
  describe(`questionNumber`, () => {
    it(`should always be incremented, whether the answer is wrong or correct`, () => {
      const model = new Model();
      model.state.questions = [{}, {}, {}, {}, {}];
      model.changeState(true, 10);
      assert.equal(model.state.questionNumber, 1);

      model.changeState(false, 10);
      assert.equal(model.state.questionNumber, 2);
    });
    it(`if becomes equal to data length, the game always finishes`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 2,
        questionNumber: 4,
        statistics: {
          time: 0,
          answers: 0,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(false, 10);
      assert.notStrictEqual(model.state.statistics.result, null);
    });
  });
  describe(`rightAnswers`, () => {
    it(`should always be incremented, if the answer is correct`, () => {
      const model = new Model();
      model.state.questions = [{}, {}, {}, {}, {}];
      model.changeState(true, 10);
      assert.equal(model.state.statistics.rightAnswers, 1);
    });
    it(`should always stay static, if the answer is wrong`, () => {
      const model = new Model();
      model.state.questions = [{}, {}, {}, {}, {}];
      model.changeState(false, 10);
      assert.equal(model.state.statistics.rightAnswers, 0);
    });
  });
  describe(`statistics:result`, () => {
    it(`should always be 'win', if there are no questions left and more then 0 mistakes left`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 4,
        statistics: {
          time: 0,
          answers: 0,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(true, 10);
      assert.equal(model.state.statistics.result, `win`);
    });
    it(`should always be 'loss', if there are no mistakes left`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 4,
        statistics: {
          time: 0,
          answers: 0,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(false, 10);
      assert.equal(model.state.statistics.result, `loss`);
    });
  });
  describe(`statistics:answers`, () => {
    it(`should be increased with 2, if time the player answers correctly in less then 10`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 4,
        statistics: {
          time: 40,
          answers: 2,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(true, 5);
      assert.equal(model.state.statistics.answers, 4);
    });
    it(`should be increased with 1, if time the player answers correctly in more or equal 10`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 4,
        statistics: {
          time: 40,
          answers: 10,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(true, 10);
      assert.equal(model.state.statistics.answers, 11);
    });
    it(`should not be increased, if the player answer is wrong`, () => {
      const model = new Model();
      model.state = Object.assign({}, model.initialState, {
        duration: 120,
        leftMistakes: 1,
        questionNumber: 4,
        statistics: {
          time: 40,
          answers: 10,
          rightAnswers: 0,
          result: null
        },
        questions: [{}, {}, {}, {}, {}]
      });
      model.changeState(false, 10);
      assert.equal(model.state.statistics.answers, 10);
    });
  });
});
