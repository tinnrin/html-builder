const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

function createCSSBundle(array) {
  const pathToBundle = path.resolve(__dirname, 'project-dist', 'style.css');
  try {
    const writeStream = fs.createWriteStream(pathToBundle);
    writeStream.on('error', (error) => console.error(error));

    for (const element of array) {
      const readStream = fs.createReadStream(element, { encoding: 'utf-8' });

      readStream.on('error', (error) => console.error(error));

      readStream.pipe(writeStream, { end: false });
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleCSSFiles() {
  const pathToStyles = path.resolve(__dirname, 'styles');

  try {
    const files = await fsPromises.readdir(pathToStyles, {
      withFileTypes: true,
    });

    const filesPath = files
      .filter((file) => file.isFile() && path.extname(file.name) === '.css')
      .map((file) => path.resolve(pathToStyles, file.name));

    createCSSBundle(filesPath);
  } catch (err) {
    console.error(err);
  }
}

async function createHTML(files) {
  try {
    const templatePath = path.resolve(__dirname, 'template.html');

    let htmlTemplate = await fsPromises.readFile(templatePath, {
      encoding: 'utf-8',
    });

    for (const file of files) {
      await file.content.then((temp) => {
        htmlTemplate = htmlTemplate.replace(`{{${file.name}}}`, temp);
      });
    }

    const htmlPath = path.resolve(__dirname, 'project-dist/index.html');

    await fsPromises.writeFile(htmlPath, htmlTemplate);
  } catch (err) {
    console.error(err);
  }
}

async function handleTemplates() {
  const pathToFolder = path.resolve(__dirname, 'components');
  try {
    const files = await fsPromises.readdir(pathToFolder, {
      withFileTypes: true,
    });

    const templates = files
      .filter((file) => file.isFile())
      .map((file) => {
        const pathToFile = path.resolve(pathToFolder, file.name);
        return {
          name: path.parse(pathToFile).name,
          content: fsPromises.readFile(pathToFile, {
            encoding: 'utf-8',
          }),
        };
      });

    await Promise.allSettled(templates.map((obj) => obj.content));
    // console.log(templates);

    await createHTML(templates);
  } catch (err) {
    console.error(err);
  }
}

async function copyFiles({ fileNames, dirPath, dirCopyPath }) {
  for (let i = 0; i < fileNames.length; i++) {
    const file = fileNames[i];

    const pathToFile = path.resolve(dirPath, file);
    const pathToFileCopy = path.resolve(dirCopyPath, file);
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

async function copyDirAndFiles(dirPath, dirCopyPath) {
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

      dirs.push(copyDirAndFiles(srcPath, copyPath));
    }
    await Promise.allSettled(dirs);
  } catch (error) {
    console.error(error);
  }
}

async function createFolder(folderName) {
  try {
    const folderPath = path.resolve(__dirname, folderName);
    await fsPromises.mkdir(folderPath, {
      recursive: true,
    });
  } catch (error) {
    console.error(error);
  }
}

async function cleanDist() {
  try {
    const distPath = path.resolve(__dirname, 'project-dist');
    await fsPromises.rm(distPath, { recursive: true });
  } catch (error) {
    console.error(error);
  }
}

async function createProject() {
  try {
    await cleanDist();
    await createFolder('project-dist');
    // await getAssetsFolders();
    const pathToAssets = path.resolve(__dirname, 'assets');
    const pathToAssetsDist = path.resolve(__dirname, 'project-dist/assets');

    copyDirAndFiles(pathToAssets, pathToAssetsDist);

    await handleTemplates();
    await handleCSSFiles();
  } catch (error) {
    console.error(error);
  }
}

createProject();
