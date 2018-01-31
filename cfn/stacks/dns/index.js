const CFNZ = require("cloudformation-z");
const config = require("config");
const template = require(`./template`);

const commander = new CFNZ.EasyCommander(config, template);
commander.exec(process.argv);
