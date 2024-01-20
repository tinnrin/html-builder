const path = require('path');
const { createReadStream } = require('fs');

const filePath = path.join(__dirname + '/text.txt');

const readStream = createReadStream(filePath, 'utf-8');

readStream.on('data', (chunk) => {
  console.log(chunk);
});

readStream.on('error', (error) => {
  console.error(error);
});
