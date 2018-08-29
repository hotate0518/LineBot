// 設定を.envからロード
//require("dotenv").config();
const line = require("@line/bot-sdk");
const crypt = require("crypto");
const dialogflow = require("dialogflow");

const lineConfig = {
  channelSecret: process.env.LINE_CHANNELSECRET,
  channelAccessToken: process.env.LINE_ACCESSTOKEN
};

const dialogflowConfig = {
  projectId: process.env.DIALOGFLOW_PROJECT_ID,
  serviceAccount: process.env.DIALOGFLOW_SERVICEACCOUNT,
  privateKey: process.env.DIALOGFLOW_PRIVATEKEY
};

const dialogflowClient = new dialogflow.SessionsClient({
  project_id: dialogflowConfig.projectId,
  credentials: {
    client_email: dialogflowConfig.serviceAccount,
    private_key: dialogflowConfig.privateKey
  }
});

const verifySignature = event => {
  // CHANNELSECRETを秘密鍵として、event.body部をもとにHmacのハッシュ値を取得する。
  let signature = crypt
    .createHmac("sha256", lineConfig.channelSecret)
    .update(event.body)
    .digest("base64");
  // LINEサーバから送られたHeaderの値を取得する。
  let header = (event.headers || {})["X-Line-Signature"];
  return signature === header;
};

const postDialogFlow = event => {
  console.log("postDialogFlow");
  const request = {
    session: dialogflowClient.sessionPath(
      dialogflowConfig.projectId,
      event.source.userId
    ),
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: "ja"
      }
    }
  };

  dialogflowClient
    .detectIntent(request)
    .then(responses => {
      console.log("detectIntent");
      if (
        responses[0].queryResult &&
        responses[0].queryResult.action == "handle-delivery-order"
      ) {
        let message_text;
        if (responses[0].queryResult.parameters.fields.menu.stringValue) {
          message_text = `毎度！${
            responses[0].queryResult.parameters.fields.menu.stringValue
          }ね。どちらにお届けしましょ？`;
        } else {
          message_text = `毎度！ご注文は？`;
        }
        console.log("LINE START");
        const message = {
          type: "text",
          text: message_text
        };
        client
          .replyMessage(body.events[0].replyToken, message)
          .then(response => {
            let lambdaResponse = {
              statusCode: 200,
              headers: { "X-Line-Status": "OK" },
              body: '{"result":"completed"}'
            };
            context.succeed(lambdaResponse);
          });
      }
    })
    .catch(err => {
      console.error("ERROR", err);
    });
};

exports.handler = function(event, context) {
  "use strict";
  console.log("start lambda");
  if (!verifySignature(event)) {
    console.log("no signature");
    return;
  }

  const client = new line.Client({
    channelAccessToken: lineConfig.channelAccessToken
  });

  const body = JSON.parse(event.body);
  //ハッシュと、ヘッダの値を比較し、一致した場合のみ処理を行う。（一致した場合→LINEサーバかどうかの認証成功）

  if (body.events[0].replyToken === "00000000000000000000000000000000") {
    //接続確認エラー回避
    console.log("error kaihi");
    const lambdaResponse = {
      statusCode: 200,
      headers: { "X-Line-Status": "OK" },
      body: '{"result":"connect check"}'
    };
    context.succeed(lambdaResponse);
    return;
  }
  let events_processed = [];

  body.events.forEach(event => {
    if (event.type !== "message" || event.message.type !== "text") {
      console.log("no message");
      return;
    }
    events_processed.push(postDialogFlow(event));
  });

  Promise.all(events_processed).then(response => {
    console.log(`${response.length} event(s) processed.`);
  });
};
