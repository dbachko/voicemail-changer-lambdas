import { dbPutItem, generateResponse } from './utils';

export const index = (event, context, callback) => {
  dbPutItem.apply();

  callback(null, generateResponse(event, {}));
};

export default {
  index,
};
