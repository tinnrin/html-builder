const fsPromise = require('fs/promises');
const path = require('path');
const process = require('process');
const os = require('os');

const folderName = './secret-folder';
const pathToFolder = path.resolve(__dirname, folderName);

async function getFileInfo(file) {
  try {
    const pathToFile = path.resolve(pathToFolder + '/' + file.name);
    const filePathParts = path.parse(pathToFile);

    const fileName = filePathParts.name;
    const fileExt = filePathParts.ext.slice(1);
    const fileSize = (await fsPromise.stat(pathToFile)).size;

    const result = `${fileName} - ${fileExt} - ${fileSize}b${os.EOL}`;
    return result;
  } catch (error) {
    console.error(error);
  }
}

async function getFilesInfo() {
  try {
    const files = await fsPromise.readdir(pathToFolder, {
      withFileTypes: true,
    });

    files
      .filter((file) => file.isFile())
      .forEach(async (file) => {
        const data = await getFileInfo(file);
        process.stdout.write(data);
      });
  } catch (error) {
    console.error(error);
  }
}

getFilesInfo();
