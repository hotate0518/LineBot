// 設定を.envからロード
// require("dotenv").config();

// Node.jsではimport文は対応していない？
const services = require('./src/services');

// Promise用にメソッドを格納する
const eventsProcessed = [];
const checkService = (event) => {
  if ((event.headers || {})['X-Line-Signature']) {
    return services.LINE;
  }
  return null;
};
// event: 受信パラメータ
// context AWS lambdaで使用する様々なパラメータ。
exports.handler = (event, context) => {
  console.log(`event received: ${JSON.stringify(event, null, 4)}`);
  const assign = checkService(event);
  if (assign === null) {
    console.log('No match service');
  }
  console.log('Service Start');
  eventsProcessed.push(services.assignService[assign](event, context));
  Promise.all(eventsProcessed).then(() => {
    console.log('aiueo');
  });
};
