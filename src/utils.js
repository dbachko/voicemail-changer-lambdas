import { DynamoDB, S3 } from 'aws-sdk';

/**
 * Writes file to S3 bucket.
 * @param  {String} path File path.
 * @param  {Object} data Data to save.
 * @return {Promise}     Result of operation.
 */
const writeToS3 = (path, data) =>
  new Promise((resolve, reject) => {
    const s3 = new S3();
    const params = {
      Bucket: 'voicemail-changer-bucket',
      Key: path,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    };
    s3.putObject(params, (err, result) => {
      if (err) {
        reject(err.stack);
      }
      resolve(result);
    });
  });

/**
 * Reads file from S3 bucket.
 * @param  {String} path File path.
 * @return {Object}      Json object.
 */
const readFromS3 = path =>
  new Promise((resolve) => {
    const s3 = new S3();
    const params = {
      Bucket: 'voicemail-changer-bucket',
      Key: path,
    };
    s3.getObject(params, (err, data) => {
      if (err) {
        resolve([]);
      }
      resolve(data ? JSON.parse(data.Body.toString()) : []);
    });
  });

/**
 * Saves document into database.
 * @param  {String} exchange  Exchange name.
 * @param  {Object} doc       Doc to insert.
 * @return {Promise}          [description]
 */
const dbPutItem = (exchange, {
  recordId, status, text, voice,
}) =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();
    const dbParams = {
      Item: {
        id: {
          S: recordId,
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

export { dbPutItem, generateResponse, readFromS3, writeToS3 };
