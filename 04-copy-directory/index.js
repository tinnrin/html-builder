const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const srcDirPath = path.resolve(__dirname, './files');
const dirCopyPath = path.resolve(__dirname, './files-copy');

async function copyFiles({ fileNames, dirPath, dirCopyPath }) {
  for (let i = 0; i < fileNames.length; i++) {
    const file = fileNames[i];

    const pathToFile = path.resolve(dirPath + '/' + file);
    const pathToFileCopy = path.resolve(dirCopyPath + '/' + file);
    try {
      await fsPromises.copyFile(
        pathToFile,
        pathToFileCopy,
        fs.constants.COPYFILE_FICLONE,
      );
    } catch (error) {
      console.error(error);
    }
  }
}

async function copyDir(dirPath, dirCopyPath) {
  try {
    await fsPromises.mkdir(dirCopyPath, {
      recursive: true,
    });

    const dirEntities = await fsPromises.readdir(dirPath, {
      withFileTypes: true,
    });

    const fileNames = dirEntities
      .filter((file) => file.isFile())
      .map((file) => file.name);

    const dirNames = dirEntities
      .filter((file) => file.isDirectory())
      .map((dir) => dir.name);

    await copyFiles({
      fileNames,
      dirPath,
      dirCopyPath,
    });

    const dirs = [];
    for (let i = 0; i < dirNames.length; i++) {
      const dirName = dirNames[i];
      const srcPath = path.resolve(dirPath, dirName);
      const copyPath = path.resolve(dirCopyPath, dirName);

      dirs.push(copyDir(srcPath, copyPath));
    }
    await Promise.allSettled(dirs);
  } catch (error) {
    console.error(error);
  }
}

async function removeAndCopy() {
  try {
    await fsPromises.rm(dirCopyPath, { recursive: true, force: true });

    await copyDir(srcDirPath, dirCopyPath);
  } catch (err) {
    console.error(err);
  }
}

removeAndCopy();
