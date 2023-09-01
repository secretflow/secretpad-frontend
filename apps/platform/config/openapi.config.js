const { generateService } = require('@umijs/openapi');
const fs = require('fs');
const path = require('path');

const SWAGGER_JSON_PATH = 'https://petstore.swagger.io/v2/swagger.json';

const SUB_DIR_NAME = 'secretpad';

const DIR_PATH = path.resolve(__dirname, '../', 'src', 'services');
generateService({
  schemaPath: SWAGGER_JSON_PATH,
  serversPath: DIR_PATH,
  projectName: SUB_DIR_NAME,

  requestLibPath: "import request from 'umi-request';",
}).then(() => {
  const not_rename_files = ['index.ts', 'typings.d.ts'];

  const files_dirs = path.resolve(DIR_PATH, SUB_DIR_NAME);

  const generatedFiles = fs.readdirSync(files_dirs);

  generatedFiles.forEach((fileName) => {
    if (not_rename_files.indexOf(fileName) < 0) {
      fs.renameSync(
        path.resolve(files_dirs, fileName),
        path.resolve(files_dirs, fileName.charAt(0).toUpperCase() + fileName.slice(1)),
      );
    }
  });
});
