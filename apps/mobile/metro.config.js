const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.blockList = [
  ...config.resolver.blockList,
  new RegExp(`${path.resolve(workspaceRoot, "apps/web/.next").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/.*`),
];

module.exports = config;
