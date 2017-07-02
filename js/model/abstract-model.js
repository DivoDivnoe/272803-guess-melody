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

export default class AbstractModel {
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
