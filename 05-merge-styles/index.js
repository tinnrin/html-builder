const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const pathToFolder = path.resolve(__dirname, 'styles');

function createBundleFile(array) {
  const pathToBundle = path.resolve(__dirname, 'project-dist', 'bundle.css');

  const writeStream = fs.createWriteStream(pathToBundle);
  writeStream.on('error', (error) => console.error(error));

  for (let element of array) {
    const readStream = fs.createReadStream(element, { encoding: 'utf-8' });

    readStream.on('error', (error) => console.error(error));

    readStream.pipe(writeStream, { end: false });
  }
}

async function getFiles() {
  try {
    const files = await fsPromises.readdir(pathToFolder, {
      withFileTypes: true,
    });

    const filesPath = files
      .filter((file) => file.isFile() && path.extname(file.name) === '.css')
      .map((file) => path.resolve(pathToFolder, file.name));

    createBundleFile(filesPath);
  } catch (err) {
    console.error(err);
  }
}

getFiles();
