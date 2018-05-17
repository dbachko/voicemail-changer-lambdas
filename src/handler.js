export const hello = (event, context, callback) => {
  const message = 'Go Serverless! Your function executed successfully!';
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
      message
    })
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message, event });
};

export default {
  hello
};
