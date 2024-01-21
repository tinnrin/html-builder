//Прим.: в некоторых версиях bash существует баг, если при нажатии `ctrl + c` сообщение о выходе не показывается - попробуйте проверить через другую командную строку (cmd/powershell)

const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');
const os = require('os');

const text = {
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

const fileName = 'output.txt';
const filePath = path.resolve(__dirname, fileName);

const writeStream = fs.createWriteStream(filePath);

const handleError = (error) => {
  if (error) throw error;
};

writeStream.on('error', handleError);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.stdout.write(`${text.bold}Enter your text:${text.reset}${os.EOL}`);

const writeData = (input) => {
  fs.appendFile(filePath, input + os.EOL, handleError);
};

const checkInput = (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    rl.close();
  } else {
    writeData(input);
  }
};

rl.on('line', (input) => checkInput(input));

const handleClose = () => {
  process.stdout.write(`${text.bold}Bye!${text.reset}`);
};

rl.on('close', handleClose);
