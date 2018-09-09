const line = require('./client/line');

exports.LINE = 'LINE';
exports.Sota = 'Sota';

exports.assignService = {
  LINE: line.main,
};
