import qs from 'querystring';
import uuidv4 from 'uuid/v4';
import { dbPutItem } from '../lib/utils';

export const index = async (event, context, callback) => {
  const requestBody = qs.parse(event.body);
  const { text, voice } = requestBody;

  try {
    // Generate new record id.
    const id = uuidv4();

    // Save text to database for processing.
    await dbPutItem({
      id,
      text,
      voice,
      status: 'PROCESSING',
    });

    // Return record id.
    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unable to generate audio for this text.',
      }),
    });
  }
};
