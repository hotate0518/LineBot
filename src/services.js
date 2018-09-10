const line = require('./client/line');

exports.defined = [
  {
    name: 'LINE',
    assign: line.assignService,
    service: line.main,
  },
];
