// Node.jsではimport文は対応していない？
const services = require('./src/services');

// Promise用にメソッドを格納する
const eventsProcessed = [];

// event: 受信パラメータ
// context AWS lambdaで使用する様々なパラメータ。
exports.handler = (event, context) => {
  console.log(`event received: ${JSON.stringify(event, null, 4)}`);

  // 適合するサービスを選択する。
  console.log(services);
  const selectedService = services.defined.find(service => service.assign(event));
  if (!selectedService) {
    console.log('No match service');
    return;
  }
  console.log(`Service[${selectedService.name}] start`);
  eventsProcessed.push(selectedService.service(event, context));
  Promise.all(eventsProcessed).then(() => {
    console.log(`Service[${selectedService.name}] complete`);
  });
};
