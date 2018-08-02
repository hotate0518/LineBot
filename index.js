// 設定を.envからロード
require("dotenv").config();
import line from "line/bot-sdk";
import crypt from "crypto";
import dialogflow from "dialogflow";

const lineConfig = {
  channelSecret: process.env.LINE_CHANNELSECRET,
  channelAccessToken: process.env.LINE_ACCESSTOKEN
};

const dialogflowConfig = {
  projectId: process.env.DIALOGFLOW_PROJECT_ID,
  serviceAccount: process.env.DIALOGFLOW_SERVICEACCOUNT,
  privateKey: process.env.DIALOGFLOW_PRIVATEKEY
};

const dialogflowClient = new dialogflow.SessionClinet({
  project_id: dialogflowConfig.projectId,
  credentials: {
    client_email: dialogflowClient.serviceAccount,
    private_key: dialogflowClient.private_key
  }
});

const verifySignature = event => {
  // CHANNELSECRETを秘密鍵として、event.body部をもとにHmacのハッシュ値を取得する。
  let signature = crypto
    .createHmac("sha256", lineConfig.channelSecret)
    .update(event.body)
    .digest("base64");
  // LINEサーバから送られたHeaderの値を取得する。
  let header = (event.headers || {})["X-Line-Signature"];
  return signature === header;
};

const postDialogFlow = event => {
  session_client
    .detectIntent({
      session: session_client.sessionPath(
        dialogflowConfig.projectId,
        event.source.userId
      ),
      queryInput: {
        text: {
          text: event.message.text,
          languageCode: "ja"
        }
      }
    })
    .then(responses => {
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
        return message_text;
      }
    });
};

exports.handler = function(event, context) {
  "use strict";

  if (!verifySignature(event)) {
    return;
  }

  const client = new line.Client({
    channelAccessToken: lineConfig.channelAccessToken
  });

  const body = JSON.parse(event.body);
  //ハッシュと、ヘッダの値を比較し、一致した場合のみ処理を行う。（一致した場合→LINEサーバかどうかの認証成功）

  if (body.events[0].replyToken === "00000000000000000000000000000000") {
    //接続確認エラー回避
    const lambdaResponse = {
      statusCode: 200,
      headers: { "X-Line-Status": "OK" },
      body: '{"result":"connect check"}'
    };
    context.succeed(lambdaResponse);
    return;
  }

  if (event.type !== "message" || event.message.type !== "text") {
    console.log("no message");
    return;
  }

  const text = postDialogFlow(event);
  //const text = body.events.message.text;
  const message = {
    type: "text",
    text: text
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
    })
    .catch(err => console.log(err));
};
