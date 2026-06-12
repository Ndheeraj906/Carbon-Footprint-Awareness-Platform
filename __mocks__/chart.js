// __mocks__/chart.js — Jest ESM-compatible mock for Chart.js
export default class Chart {
  constructor() {
    this.data = {};
    this.options = {};
  }
  destroy() {}
  update() {}
}
