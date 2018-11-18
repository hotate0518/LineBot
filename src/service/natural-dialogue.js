const axios = require('axios');

const naturalDialogueConfig = {
  apiKey: process.env.NATURAL_DIALOGUE_APIKEY,
};

/**
 * 自然対話APIを使うために使用するアプリIDを取得する。
 */
const getAppId = async () => {
  const response = await axios.post(`https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/registration?APIKEY=${naturalDialogueConfig.apiKey}`,
    {
      botId: 'Chatting',
      appKind: 'lineBot',
    });
  return response.data.appId;
};

/**
 * 自然対話サービスにクエリぶん投げる
 *
 * @param {String} query 入力テキスト
 */
exports.main = async (query) => {
  console.log(`natural dialogue query : ${query}`);
  const appId = await getAppId();
  console.log(`appId: ${appId}`);
  const response = await axios.post(`https://api.apigw.smt.docomo.ne.jp/naturalChatting/v1/dialogue?APIKEY=${naturalDialogueConfig.apiKey}`,
    {
      language: 'ja-JP',
      botId: 'Chatting',
      appId,
      voiceText: query,
      appRecvTime: '2015-05-05 13:30:00',
      appSendTime: '2015-05-05 13:31:00',
    });

  console.log(response);
  console.log(response.data.systemText.expression);
  return response.data.systemText.expression;
};
