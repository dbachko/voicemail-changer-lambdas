import qs from 'querystring';
import { dbListItems } from '../lib/utils';

export default async (event, context, callback) => {
  const requestBody = qs.parse(event.body);
  const { id } = requestBody;

  try {
    // Search db by item id.
    const { Items: items } = await dbListItems(id);

    callback(null, {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Unable to retrieve the list of your audio files.',
      }),
    });
  }
};
