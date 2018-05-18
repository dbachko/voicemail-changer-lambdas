import { DynamoDB, Polly, S3 } from 'aws-sdk';

/**
 * Writes file to S3 bucket.
 * @param  {String}      path        File path.
 * @param  {Buffer}      data        Data to save.
 * @param  {contentType} contentType Content type.
 * @return {Promise}                 Result of operation.
 */
const uploadToS3 = (path, data, contentType) =>
  new Promise((resolve, reject) => {
    const s3 = new S3();
    const params = {
      ACL: 'public-read', // Make it public.
      Bucket: 'voicemail-changer-bucket',
      Key: path,
      Body: data,
      ContentType: contentType,
      StorageClass: 'REDUCED_REDUNDANCY', // Save costs.
    };
    s3.upload(params, (err, result) => {
      if (err) {
        reject(err.stack);
      }
      resolve(result);
    });
  });

/**
 * Saves document into database.
 * @param  {Object} doc       Doc to insert.
 * @return {Promise}          [description]
 */
const dbPutItem = ({
  id, status, text, voice,
}) =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();
    const dbParams = {
      Item: {
        id: {
          S: id,
        },
        text: {
          S: text,
        },
        voice: {
          S: voice,
        },
        status: {
          S: status,
        },
      },
      TableName: 'VoicemailChangerTable',
    };

    db.putItem(dbParams, (err, body) => {
      if (err) {
        reject(err.stack);
      }
      resolve(body);
    });
  });

/**
 * Updates document in database.
 * @param  {Object} doc       Doc to update.
 * @return {Promise}          [description]
 */
const dbUpdateItem = ({ id, url, status }) =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();
    const dbParams = {
      Key: {
        id: {
          S: id,
        },
      },
      ExpressionAttributeNames: {
        '#S': 'status',
        '#U': 'url',
      },
      ExpressionAttributeValues: {
        ':s': {
          S: status,
        },
        ':u': {
          S: url,
        },
      },
      UpdateExpression: 'SET #S = :s, #U = :u',
      TableName: 'VoicemailChangerTable',
    };

    db.updateItem(dbParams, (err, body) => {
      if (err) {
        reject(err.stack);
      }
      resolve(body);
    });
  });

/**
 * Returns list of items from the db.
 * @param  {String} id       Record id.
 * @return {Promise}         [description]
 */
const dbListItems = id =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();

    const params = {
      ExpressionAttributeNames: {
        '#TT': 'text',
        '#IT': 'id',
        '#UT': 'url',
        '#VT': 'voice',
      },
      ProjectionExpression: '#TT, #IT, #UT, #VT',
      TableName: 'VoicemailChangerTable',
    };

    // Check if id is present do search by it's value, if not return all items.
    if (id) {
      const query = {
        ExpressionAttributeValues: {
          ':id': {
            S: id,
          },
        },
        KeyConditionExpression: 'id = :id',
      };
      // Search for a specific item.
      db.query({ ...params, ...query }, (err, body) => {
        if (err) {
          reject(err.stack);
        }
        resolve(body);
      });
    } else {
      // Return all items.
      db.scan(params, (err, body) => {
        if (err) {
          reject(err.stack);
        }
        resolve(body);
      });
    }
  });

/**
 * Generates audio from text.
 * @param  {String} text    Text message.
 * @param  {String} voiceId Voice id.
 * @return {Promise}        Result of operation.
 */
const generateAudio = (text, voiceId = 'Joanna') =>
  new Promise((resolve, reject) => {
    const polly = new Polly();
    const params = {
      OutputFormat: 'mp3',
      SampleRate: '8000',
      Text: text,
      TextType: 'text',
      VoiceId: voiceId,
    };
    polly.synthesizeSpeech(params, (err, result) => {
      if (err) {
        reject(err.stack);
      }
      resolve(result);
    });
  });

/**
 * Generates json response.
 * @param  {String} event Event name.
 * @param  {Object} data  Data.
 * @return {Object}       Response object.
 */
const generateResponse = (event, data) => ({
  statusCode: 200,
  body: JSON.stringify({
    input: event,
    message: JSON.stringify(data),
  }),
});

export { dbListItems, dbPutItem, dbUpdateItem, generateAudio, generateResponse, uploadToS3 };
