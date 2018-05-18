import uuidv4 from 'uuid/v4';
import { dbPutItem, generateResponse } from './utils';

export const index = async (event, context, callback) => {
  try {
    const body = await dbPutItem({
      recordId: uuidv4(),
      status: 'PROCESSING',
      text: 'Hello from Serverless!',
      voice: 'Joanna',
    });

    callback(null, generateResponse(event, body));
  } catch (error) {
    console.error(error);
  }
};

export default {
  index,
};
