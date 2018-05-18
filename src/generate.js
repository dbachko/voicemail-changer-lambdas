// import fs from 'fs';
import { dbUpdateItem, generateAudio, generateResponse, uploadToS3 } from './utils';

export const index = async (event, context, callback) => {
  const { Records } = event;
  const { eventName, dynamodb } = Records[0];

  // Check only new records.
  if (['INSERT'].includes(eventName)) {
    const id = dynamodb.NewImage.id.S;
    const text = dynamodb.NewImage.text.S;
    const voice = dynamodb.NewImage.voice.S;

    // Generate audio from text.
    const { AudioStream, ContentType } = await generateAudio(text, voice);
    // Save audio to S3 bucket.
    const { Location } = await uploadToS3(`${id}.mp3`, AudioStream, ContentType);
    // Update db with audio location.
    await dbUpdateItem({ id, url: Location, status: 'UPDATED' });
  }

  console.log('Records: ', Records);

  callback(null, generateResponse(event, {}));
};

export default {
  index,
};
