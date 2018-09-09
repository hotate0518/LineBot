// 設定を.envからロード
// require('dotenv').config();
const dialogflow = require('dialogflow');

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

exports.postDialogFlow = async (event) => {
  let message;
  const request = {
    session: dialogflowClient.sessionPath(dialogflowConfig.projectId, event.source.userId),
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: 'ja',
      },
    },
  };

  await dialogflowClient
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
      message = result.fulfillmentText;
    })
    .catch((err) => {
      console.error('ERROR', err);
    });
  return message;
};
