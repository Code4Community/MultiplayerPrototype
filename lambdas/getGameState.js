const https = require('https')
// Object for the function library that can access other AWS Services
const AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: 'us-east-2'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    httpOptions: {
    agent: new https.Agent({
      rejectUnauthorized: true,
      secureProtocol: "TLSv1_method",
      ciphers: "ALL"
    })
  }
    
});

exports.handler = (event, context, callback) => {
    gameId = event['pathParameters']['gameid']
    console.log('Received event (', gameId, '): ', event);

    readState(gameId, context, callback);
};

function readState(gameId, context, callback) {
    
    console.log("readState() called");
    
    var params = {
      TableName: 'GameState',
      Key: {
        'GameId': {S: gameId}
      }
    };
    
    ddb.getItem(params, 
        function(err, data) {
            
            console.log("Handler called");
            
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                errorResponse(err.message, context.awsRequestId, callback)
            }
            else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                callback(null, 
                    {
                        statusCode: 201,
                        body: JSON.stringify(data),
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                );
            }
        }
    );
  
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
