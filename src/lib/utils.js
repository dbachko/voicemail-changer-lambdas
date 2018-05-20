import DynamoDB from 'aws-sdk/clients/dynamodb';
import Polly from 'aws-sdk/clients/polly';
import S3 from 'aws-sdk/clients/s3';

/**
 * Returns an IAM policy document for a given user and resource.
 *
 * @method buildIAMPolicy
 * @param {String} userId - user id
 * @param {String} effect  - Allow / Deny
 * @param {String} resource - resource ARN
 * @param {String} context - response context
 * @returns {Object} policyDocument
 */
const buildIAMPolicy = (userId, effect, resource, context) => {
  console.log(`buildIAMPolicy ${userId} ${effect} ${resource}`);
  const policy = {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  console.log(JSON.stringify(policy));
  return policy;
};

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
      TableName: 'VoicemailChangerDataTable',
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
      TableName: 'VoicemailChangerDataTable',
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
      TableName: 'VoicemailChangerDataTable',
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

/**
 * Filters object properties.
 * @param {Object} obj  Object to work on.
 * @param {Array} props Properties to filter out.
 * @return {Object}     Filtered object.
 */
const objectOmit = (obj, props) => {
  const filtered = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (!props.includes(key)) {
      filtered[key] = value;
    }
  });
  return filtered;
};

export {
  buildIAMPolicy,
  dbListItems,
  dbPutItem,
  dbUpdateItem,
  generateAudio,
  generateResponse,
  objectOmit,
  uploadToS3,
};
