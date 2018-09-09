// 設定を.envからロード
// require("dotenv").config();
const line = require('@line/bot-sdk');
const crypt = require('crypto');
const dialogflow = require('dialogflow');

const lineConfig = {
  channelSecret: process.env.LINE_CHANNELSECRET,
  channelAccessToken: process.env.LINE_ACCESSTOKEN,
};

const lineClient = new line.Client({
  channelAccessToken: lineConfig.channelAccessToken,
});

const dialogflowConfig = {
  projectId: process.env.DIALOGFLOW_PROJECT_ID,
  serviceAccount: process.env.DIALOGFLOW_SERVICEACCOUNT,
  privateKey: process.env.DIALOGFLOW_PRIVATEKEY,
};

const dialogflowClient = new dialogflow.SessionsClient({
  project_id: dialogflowConfig.projectId,
  credentials: {
    client_email: dialogflowConfig.serviceAccount,
    private_key: dialogflowConfig.privateKey.replace(/\\n/g, '\n'),
  },
});

// LINEへのレスポンス情報
const lambdaResponse = {
  statusCode: 200,
  headers: { 'X-Line-Status': 'OK' },
  body: '{"result":"connect check"}',
};

const verifySignature = (event) => {
  // CHANNELSECRETを秘密鍵として、event.body部をもとにHmacのハッシュ値を取得する。
  const signature = crypt
    .createHmac('sha256', lineConfig.channelSecret)
    .update(event.body)
    .digest('base64');
  // LINEサーバから送られたHeaderの値を取得する。
  const header = (event.headers || {})['X-Line-Signature'];
  return signature === header;
};

const postDialogFlow = (event) => {
  console.log(`postDialogFlow: ${JSON.stringify(event, null, 4)}`);
  const request = {
    session: dialogflowClient.sessionPath(dialogflowConfig.projectId, event.source.userId),
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: 'ja',
      },
    },
  };

  dialogflowClient
    .detectIntent(request)
    .then((responses) => {
      console.log(`Detect Intent: ${JSON.stringify(responses, null, 4)}`);
      const result = responses[0].queryResult;
      console.log(`QueryText: ${result.queryText}`);
      console.log(`ResponseText: ${result.fulfillmentText}`);
      if (!result.intent) {
        console.log('  No intent matched.');
        return;
      }
      const message = {
        type: 'text',
        text: result.fulfillmentText,
      };
      lineClient.replyMessage(event.replyToken, message);
    })
    .catch((err) => {
      console.error('ERROR', err);
    });
};

// event: 受信パラメータ
// context AWS lambdaで使用する様々なパラメータ。
exports.handler = (event, context) => {
  console.log(`LINE Message Received: ${JSON.stringify(event, null, 4)}`);
  if (!verifySignature(event)) {
    console.log('no signature');
    return;
  }
  const body = JSON.parse(event.body);
  // ハッシュと、ヘッダの値を比較し、一致した場合のみ処理を行う。（一致した場合→LINEサーバかどうかの認証成功）
  if (body.events[0].replyToken === '00000000000000000000000000000000') {
    // LINE Developer画面で行える「接続確認」を押下した場合に通る
    console.log('接続確認');
    context.succeed(lambdaResponse);
    return;
  }
  const eventsProcessed = [];
  body.events.forEach((params) => {
    if (params.type !== 'message' || params.message.type !== 'text') {
      console.log('no message');
      return;
    }
    eventsProcessed.push(postDialogFlow(params));
  });

  Promise.all(eventsProcessed).then((response) => {
    console.log(`${response.length} event(s) processed.`);
  });
};
