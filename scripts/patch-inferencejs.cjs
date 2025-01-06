// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

const inferencejsPath = path.resolve(__dirname, "../node_modules/inferencejs");
const packageJsonPath = path.resolve(inferencejsPath, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

packageJson.exports = {
  ".": {
    import: {
      types: "./dist/index.d.ts",
      default: "./dist/inference.es.js",
    },
    require: {
      types: "./dist/index.d.ts",
      default: "./dist/inference.js",
    },
  },
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
