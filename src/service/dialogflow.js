const dialogflow = require('dialogflow');
const naturalDialogue = require('./natural-dialogue');

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

exports.postDialogFlow = async (query, sessionId) => {
  let message;
  const request = {
    session: dialogflowClient.sessionPath(dialogflowConfig.projectId, sessionId),
    queryInput: {
      text: {
        text: query,
        languageCode: 'ja',
      },
    },
  };

  await dialogflowClient
    .detectIntent(request)
    .then(async (responses) => {
      console.log(`Detect Intent: ${JSON.stringify(responses, null, 4)}`);
      const result = responses[0].queryResult;
      console.log(`QueryText: ${result.queryText}`);
      console.log(`ResponseText: ${result.fulfillmentText}`);
      if (!result.intent) {
        console.log('  No intent matched.');
        return;
      }
      console.log(result.action);
      // DialogFlowで判別できない場合、responses.queryResult.actionがinput.unknownになる。
      if (result.action === 'input.unknown') {
        message = await naturalDialogue.main(query);
      } else {
        message = result.fulfillmentText;
      }
    })
    .catch((err) => {
      console.error('ERROR', err);
    });
  console.log(message);
  return message;
};
