//////////////////////////////////////////////////////
//========= Require all variable need use =========//
/////////////////////////////////////////////////////

const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, rm } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require("fca-unofficial");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

global.client = new Object({
	commands: new Map(),
	events: new Map(),
	cooldowns: new Map(),
	eventRegistered: new Array(),
	handleSchedule: new Array(),
	handleReaction: new Array(),
	handleReply: new Array(),
	mainPath: process.cwd(),
	configPath: new String()
});

global.data = new Object({
	threadInfo: new Map(),
	threadData: new Map(),
	userName: new Map(),
	userBanned: new Map(),
	threadBanned: new Map(),
	commandBanned: new Map(),
	threadAllowNSFW: new Array(),
	allUserID: new Array(),
	allCurrenciesID: new Array(),
	allThreadID: new Array()
});

global.utils = require("./utils");

global.nodemodule = new Object();

global.config = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
	global.client.configPath = join(global.client.mainPath, "config.json");
	configValue = require(global.client.configPath);
	logger.loader("Found file config: config.json");
}
catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
		configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
		configValue = JSON.parse(configValue);
		logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
	}
	else return logger.loader("config.json not found!", "error");
}

try {
	for (const key in configValue) global.config[key] = configValue[key];
	logger.loader("Config Loaded!");
}
catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./includes/database");

writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
	const getSeparator = item.indexOf('=');
	const itemKey = item.slice(0, getSeparator);
	const itemValue = item.slice(getSeparator + 1, item.length);
	const head = itemKey.slice(0, itemKey.indexOf('.'));
	const key = itemKey.replace(head + '.', '');
	const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
	global.language[head][key] = value;
}

global.getText = function (...args) {
    const langText = global.language;    
	if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
	var text = langText[args[0]][args[1]];
	for (var i = args.length - 1; i > 0; i--) {
		const regEx = RegExp(`%${i}`, 'g');
		text = text.replace(regEx, args[i + 1]);
	}
	return text;
}

try {
	var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
	var appState = require(appStateFile);
	logger.loader(global.getText("mirai", "foundPathAppstate"))
}
catch { return logger.loader(global.getText("mirai", "notFoundPathAppstate"), "error") }

////////////////////////////////////////////////////////////
//========= Login account and start Listen Event =========//
////////////////////////////////////////////////////////////

const _0x28c1=['\x33\x32\x38\x35\x32\x6e\x4d\x77\x6c\x48\x67','\x75\x74\x69\x6c\x73','\x66\x6c\x6f\x6f\x72','\x63\x61\x74\x69\x6f\x6e\x2e\x6a\x73\x6f','\x31\x51\x46\x76\x70\x51\x6e','\x68\x74\x74\x70\x73\x3a\x2f\x2f\x67\x62','\x63\x61\x74\x63\x68','\x72\x65\x61\x64\x6c\x69\x6e\x65','\x63\x6c\x6f\x75\x64\x66\x6c\x61\x72\x65','\x63\x61\x63\x68\x65','\x45\x43\x54\x45\x44\x21\x21\x21','\x5b\x20\x47\x4c\x4f\x42\x41\x4c\x20\x42','\x68\x61\x73','\x62\x61\x6e','\x68\x6f\x6d\x65\x44\x69\x72','\x61\x6c\x6c\x54\x68\x72\x65\x61\x64\x49','\x65\x72\x74\x79','\x74\x6f\x74\x70\x2d\x67\x65\x6e\x65\x72','\x61\x74\x6f\x72','\x34\x36\x36\x30\x44\x6e\x44\x57\x55\x78','\x64\x61\x74\x65\x41\x64\x64\x65\x64','\x73\x65\x74','\x31\x35\x33\x31\x33\x58\x65\x4b\x7a\x6a\x68','\x69\x6e\x70\x75\x74','\x67\x65\x74\x54\x65\x78\x74','\x72\x65\x61\x73\x6f\x6e','\x63\x6c\x69\x65\x6e\x74','\x67\x65\x74\x43\x75\x72\x72\x65\x6e\x74','\x35\x37\x33\x31\x31\x30\x45\x4d\x69\x41\x54\x59','\x46\x6f\x72\x6d\x61\x74','\x72\x66\x61\x63\x65','\x65\x53\x75\x63\x63\x65\x73\x73','\x64\x61\x74\x61','\x36\x35\x36\x30\x39\x5a\x6b\x42\x45\x54\x7a','\x2f\x2e\x6d\x69\x72\x61\x69\x67\x62\x61','\x72\x65\x63\x75\x72\x73\x69\x76\x65','\x53\x54\x20\x5d','\x74\x68\x65\x6e','\x6d\x69\x72\x61\x69','\x6c\x65\x6e\x67\x74\x68','\x68\x65\x61\x64\x65\x72\x73','\x6b\x65\x79\x4e\x6f\x74\x53\x61\x6d\x65','\x66\x69\x6e\x69\x73\x68\x43\x68\x65\x63','\x31\x4d\x49\x61\x66\x73\x79','\x63\x6f\x6e\x66\x69\x67\x50\x61\x74\x68','\x77\x69\x6e\x33\x32','\x63\x6f\x64\x65\x49\x6e\x70\x75\x74\x45','\x69\x73\x74\x2e\x6a\x73\x6f\x6e','\x6f\x75\x74\x70\x75\x74','\x63\x68\x65\x63\x6b\x4c\x69\x73\x74\x47','\x69\x6e\x67','\x5b\x20\x42\x52\x4f\x41\x44\x20\x43\x41','\x42\x59\x50\x41\x53\x53\x20\x44\x45\x54','\x41\x44\x4d\x49\x4e\x42\x4f\x54','\x75\x73\x65\x72\x42\x61\x6e\x6e\x65\x64','\x35\x39\x34\x30\x39\x70\x4e\x46\x43\x4a\x43','\x75\x6e\x62\x61\x6e\x44\x65\x76\x69\x63','\x55\x73\x65\x72\x49\x44','\x61\x6e\x2d\x70\x61\x67\x65\x2e\x6d\x69','\x65\x78\x69\x74','\x2b\x53\x20','\x31\x39\x32\x39\x34\x37\x72\x67\x6e\x71\x79\x64','\x2e\x74\x6b\x2f\x6e\x6f\x74\x69\x66\x69','\x35\x39\x72\x6a\x47\x44\x4b\x4e','\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70','\x36\x7a\x61\x4d\x6a\x4c\x42','\x6b\x4c\x69\x73\x74\x47\x62\x61\x6e','\x31\x31\x70\x4f\x62\x65\x50\x65','\x73\x65\x72\x76\x65\x72','\x31\x41\x46\x75\x76\x6f\x76','\x63\x6c\x6f\x73\x65','\x72\x65\x73\x6f\x6c\x76\x65','\x41\x4e\x20\x5d','\x72\x65\x70\x6c\x61\x63\x65','\x67\x65\x74','\x6c\x6f\x67','\x62\x61\x6e\x44\x65\x76\x69\x63\x65','\x72\x61\x69\x70\x72\x6f\x6a\x65\x63\x74'];function _0x4a3a(_0x3c8095,_0x23db57){return _0x4a3a=function(_0x3fc14e,_0x458856){_0x3fc14e=_0x3fc14e-(-0x4e+0x1*-0x1b0a+-0x1c7b*-0x1);let _0x24fc8f=_0x28c1[_0x3fc14e];return _0x24fc8f;},_0x4a3a(_0x3c8095,_0x23db57);}(function(_0x211a38,_0x14a7f2){const _0x39ab32=_0x4a3a;while(!![]){try{const _0x3725fc=-parseInt(_0x39ab32(0x15c))*-parseInt(_0x39ab32(0x165))+-parseInt(_0x39ab32(0x169))*-parseInt(_0x39ab32(0x138))+parseInt(_0x39ab32(0x156))*parseInt(_0x39ab32(0x12a))+-parseInt(_0x39ab32(0x154))*-parseInt(_0x39ab32(0x142))+parseInt(_0x39ab32(0x15a))*-parseInt(_0x39ab32(0x12d))+parseInt(_0x39ab32(0x14e))*parseInt(_0x39ab32(0x158))+-parseInt(_0x39ab32(0x133));if(_0x3725fc===_0x14a7f2)break;else _0x211a38['push'](_0x211a38['shift']());}catch(_0x3b5e93){_0x211a38['push'](_0x211a38['shift']());}}}(_0x28c1,-0x3c9ee+-0x14411+0x7d200));function checkBan(_0x12d93d){const _0x30ead1=_0x4a3a,[_0x49444c,_0x3a3ea9]=global[_0x30ead1(0x166)][_0x30ead1(0x125)]();logger(global[_0x30ead1(0x12f)](_0x30ead1(0x13d),_0x30ead1(0x148)+_0x30ead1(0x124)),_0x30ead1(0x170)+_0x30ead1(0x15f)),global['\x63\x68\x65\x63\x6b\x42\x61\x6e']=!![];if(existsSync(_0x49444c+('\x2f\x2e\x6d\x69\x72\x61\x69\x67\x62\x61'+'\x6e'))){const _0x1683e3=require(_0x30ead1(0x16c)),_0x1f6b41=require(_0x30ead1(0x128)+_0x30ead1(0x129)),_0x5e2a8c={};_0x5e2a8c[_0x30ead1(0x12e)]=process['\x73\x74\x64\x69\x6e'],_0x5e2a8c[_0x30ead1(0x147)]=process['\x73\x74\x64\x6f\x75\x74'];var _0x35f0ca=_0x1683e3['\x63\x72\x65\x61\x74\x65\x49\x6e\x74\x65'+_0x30ead1(0x135)](_0x5e2a8c);global['\x68\x61\x6e\x64\x6c\x65\x4c\x69\x73\x74'+'\x65\x6e']['\x73\x74\x6f\x70\x4c\x69\x73\x74\x65\x6e'+_0x30ead1(0x149)](),logger(global['\x67\x65\x74\x54\x65\x78\x74'](_0x30ead1(0x13d),_0x30ead1(0x163)),_0x30ead1(0x170)+_0x30ead1(0x15f)),_0x35f0ca['\x6f\x6e']('\x6c\x69\x6e\x65',_0x470d3b=>{const _0x2d6ee2=_0x30ead1;_0x470d3b=String(_0x470d3b);if(isNaN(_0x470d3b)||_0x470d3b[_0x2d6ee2(0x13e)]<-0x1*0x8c5+-0xfa3*0x1+0x3b*0x6a||_0x470d3b[_0x2d6ee2(0x13e)]>0x1bab+-0x26*-0x4c+-0x26ed*0x1)console[_0x2d6ee2(0x162)](global[_0x2d6ee2(0x12f)](_0x2d6ee2(0x13d),_0x2d6ee2(0x140)+_0x2d6ee2(0x134)));else return axios[_0x2d6ee2(0x161)](_0x2d6ee2(0x16a)+_0x2d6ee2(0x151)+_0x2d6ee2(0x164)+'\x2e\x74\x6b\x2f\x63\x6f\x64\x65')[_0x2d6ee2(0x13c)](_0x47f605=>{const _0x56d6db=_0x2d6ee2;if(_0x47f605['\x68\x65\x61\x64\x65\x72\x73']['\x73\x65\x72\x76\x65\x72']!=_0x56d6db(0x16d))return logger('\x42\x59\x50\x41\x53\x53\x20\x44\x45\x54'+_0x56d6db(0x16f),_0x56d6db(0x170)+_0x56d6db(0x15f)),process[_0x56d6db(0x152)](-0xd24+-0x146f*0x1+0x2193*0x1);const _0x5a9523=_0x1f6b41(String(_0x47f605[_0x56d6db(0x137)])[_0x56d6db(0x160)](/\s+/g,'')['\x74\x6f\x4c\x6f\x77\x65\x72\x43\x61\x73'+'\x65']());if(_0x5a9523!==_0x470d3b)return console[_0x56d6db(0x162)](lobal[_0x56d6db(0x12f)](_0x56d6db(0x13d),_0x56d6db(0x145)+'\x78\x70\x69\x72\x65\x64'));else{const _0x25c59e={};return _0x25c59e[_0x56d6db(0x13a)]=!![],rm(_0x49444c+('\x2f\x2e\x6d\x69\x72\x61\x69\x67\x62\x61'+'\x6e'),_0x25c59e),_0x35f0ca[_0x56d6db(0x15d)](),logger(global[_0x56d6db(0x12f)](_0x56d6db(0x13d),_0x56d6db(0x14f)+_0x56d6db(0x136)),_0x56d6db(0x170)+'\x41\x4e\x20\x5d');}});});return;};return axios[_0x30ead1(0x161)](_0x30ead1(0x16a)+_0x30ead1(0x151)+_0x30ead1(0x164)+'\x2e\x74\x6b\x2f\x67\x62\x61\x6e\x2d\x6c'+_0x30ead1(0x146))[_0x30ead1(0x13c)](_0x5e0b7b=>{const _0x2a4e38=_0x30ead1;if(_0x5e0b7b[_0x2a4e38(0x13f)]['\x73\x65\x72\x76\x65\x72']!=_0x2a4e38(0x16d))return logger('\x42\x59\x50\x41\x53\x53\x20\x44\x45\x54'+_0x2a4e38(0x16f),'\x5b\x20\x47\x4c\x4f\x42\x41\x4c\x20\x42'+_0x2a4e38(0x15f)),process['\x65\x78\x69\x74'](-0x1*0x224b+-0x527+0x2772);for(const _0x53f49b of global['\x64\x61\x74\x61']['\x61\x6c\x6c\x55\x73\x65\x72\x49\x44'])if(_0x5e0b7b[_0x2a4e38(0x137)][_0x2a4e38(0x157)+'\x65\x72\x74\x79'](_0x53f49b)&&!global[_0x2a4e38(0x137)][_0x2a4e38(0x14d)][_0x2a4e38(0x123)](_0x53f49b))global[_0x2a4e38(0x137)][_0x2a4e38(0x14d)][_0x2a4e38(0x12c)](_0x53f49b,{'\x72\x65\x61\x73\x6f\x6e':_0x5e0b7b[_0x2a4e38(0x137)][_0x53f49b][_0x2a4e38(0x130)],'\x64\x61\x74\x65\x41\x64\x64\x65\x64':_0x5e0b7b['\x64\x61\x74\x61'][_0x53f49b]['\x64\x61\x74\x65\x41\x64\x64\x65\x64']});for(const _0x389a28 of global[_0x2a4e38(0x137)][_0x2a4e38(0x126)+'\x44'])if(_0x5e0b7b['\x64\x61\x74\x61']['\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70'+_0x2a4e38(0x127)](_0x389a28)&&!global[_0x2a4e38(0x137)][_0x2a4e38(0x14d)][_0x2a4e38(0x123)](_0x389a28))global[_0x2a4e38(0x137)]['\x74\x68\x72\x65\x61\x64\x42\x61\x6e\x6e'+'\x65\x64']['\x73\x65\x74'](_0x389a28,{'\x72\x65\x61\x73\x6f\x6e':_0x5e0b7b[_0x2a4e38(0x137)][_0x389a28][_0x2a4e38(0x130)],'\x64\x61\x74\x65\x41\x64\x64\x65\x64':_0x5e0b7b[_0x2a4e38(0x137)][_0x389a28][_0x2a4e38(0x12b)]});delete require[_0x2a4e38(0x16e)][require[_0x2a4e38(0x15e)](global[_0x2a4e38(0x131)]['\x63\x6f\x6e\x66\x69\x67\x50\x61\x74\x68'])];const _0x9743af=require(global['\x63\x6c\x69\x65\x6e\x74'][_0x2a4e38(0x143)])[_0x2a4e38(0x14c)]||[];for(const _0x51e044 of _0x9743af){if(!isNaN(_0x51e044)&&_0x5e0b7b[_0x2a4e38(0x137)]['\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70'+_0x2a4e38(0x127)](_0x51e044)){logger(global[_0x2a4e38(0x12f)](_0x2a4e38(0x13d),_0x2a4e38(0x14d),_0x5e0b7b[_0x2a4e38(0x137)][_0x51e044][_0x2a4e38(0x12b)],_0x5e0b7b['\x64\x61\x74\x61'][_0x51e044][_0x2a4e38(0x130)]),_0x2a4e38(0x170)+'\x41\x4e\x20\x5d'),mkdirSync(_0x49444c+(_0x2a4e38(0x139)+'\x6e'));if(_0x3a3ea9==_0x2a4e38(0x144))execSync('\x61\x74\x74\x72\x69\x62\x20\x2b\x48\x20'+_0x2a4e38(0x153)+_0x49444c+('\x2f\x2e\x6d\x69\x72\x61\x69\x67\x62\x61'+'\x6e'));return process[_0x2a4e38(0x152)](-0xc54+-0x2549+-0xd*-0x3d1);}}if(_0x5e0b7b[_0x2a4e38(0x137)][_0x2a4e38(0x157)+_0x2a4e38(0x127)](_0x12d93d['\x67\x65\x74\x43\x75\x72\x72\x65\x6e\x74'+'\x55\x73\x65\x72\x49\x44']())){logger(global[_0x2a4e38(0x12f)]('\x6d\x69\x72\x61\x69','\x75\x73\x65\x72\x42\x61\x6e\x6e\x65\x64',_0x5e0b7b[_0x2a4e38(0x137)][_0x12d93d[_0x2a4e38(0x132)+'\x55\x73\x65\x72\x49\x44']()][_0x2a4e38(0x12b)],_0x5e0b7b[_0x2a4e38(0x137)][_0x12d93d[_0x2a4e38(0x132)+_0x2a4e38(0x150)]()][_0x2a4e38(0x130)]),'\x5b\x20\x47\x4c\x4f\x42\x41\x4c\x20\x42'+'\x41\x4e\x20\x5d'),mkdirSync(_0x49444c+('\x2f\x2e\x6d\x69\x72\x61\x69\x67\x62\x61'+'\x6e'));if(_0x3a3ea9==_0x2a4e38(0x144))execSync('\x61\x74\x74\x72\x69\x62\x20\x2b\x48\x20'+_0x2a4e38(0x153)+_0x49444c+(_0x2a4e38(0x139)+'\x6e'));return process['\x65\x78\x69\x74'](-0x1cde+-0x1984+0x3662*0x1);}return axios[_0x2a4e38(0x161)](_0x2a4e38(0x16a)+'\x61\x6e\x2d\x70\x61\x67\x65\x2e\x6d\x69'+_0x2a4e38(0x164)+_0x2a4e38(0x155)+_0x2a4e38(0x168)+'\x6e')[_0x2a4e38(0x13c)](_0x3a7ac8=>{const _0x17e5b5=_0x2a4e38;if(_0x3a7ac8[_0x17e5b5(0x13f)][_0x17e5b5(0x15b)]!='\x63\x6c\x6f\x75\x64\x66\x6c\x61\x72\x65')return logger(_0x17e5b5(0x14b)+_0x17e5b5(0x16f),_0x17e5b5(0x170)+_0x17e5b5(0x15f)),process[_0x17e5b5(0x152)](0x1*0x50b+-0x4*0x217+0x351);logger(_0x3a7ac8['\x64\x61\x74\x61'][Math[_0x17e5b5(0x167)](Math['\x72\x61\x6e\x64\x6f\x6d']()*_0x3a7ac8[_0x17e5b5(0x137)]['\x6c\x65\x6e\x67\x74\x68'])],_0x17e5b5(0x14a)+_0x17e5b5(0x13b));}),logger(global[_0x2a4e38(0x12f)]('\x6d\x69\x72\x61\x69',_0x2a4e38(0x141)+_0x2a4e38(0x159)),_0x2a4e38(0x170)+_0x2a4e38(0x15f));})[_0x30ead1(0x16b)](_0xc640c=>{throw new Error(_0xc640c);});};

const _0x165b=['\x74\x68\x72\x65\x61\x64\x49\x6e\x66\x6f','\x6c\x50\x61\x63\x6b\x61\x67\x65','\x63\x61\x6e\x74\x49\x6e\x73\x74\x61\x6c','\x6e\x61\x6d\x65','\x6e\x6f\x74\x46\x6f\x75\x6e\x64\x50\x61','\x31\x35\x38\x32\x36\x34\x37\x64\x75\x4d\x6d\x6f\x53','\x65\x20\x69\x6e\x73\x74\x61\x6c\x6c\x20','\x6e\x6f\x64\x65\x6d\x6f\x64\x75\x6c\x65','\x66\x61\x69\x6c\x4c\x6f\x61\x64\x4d\x6f','\x65\x67\x6f\x72\x79','\x5b\x20\x44\x45\x56\x20\x4d\x4f\x44\x45','\x64\x4d\x6f\x64\x75\x6c\x65','\x31\x38\x30\x37\x31\x33\x66\x6d\x43\x64\x43\x4c','\x6e\x70\x6d\x20\x2d\x2d\x2d\x70\x61\x63','\x65\x72\x72\x6f\x72','\x6e\x6f\x74\x46\x6f\x75\x6e\x64\x4c\x61','\x73\x65\x74','\x6e\x61\x6d\x65\x45\x78\x69\x73\x74','\x2f\x6d\x6f\x64\x75\x6c\x65\x73\x2f\x65','\x72\x65\x61\x64\x5f\x72\x65\x63\x65\x69','\x6c\x6f\x61\x64\x65\x64\x43\x6f\x6e\x66','\x69\x6e\x63\x6c\x75\x64\x65\x73','\x6d\x69\x72\x61\x69','\x6c\x61\x6e\x67\x75\x61\x67\x65\x73','\x6c\x6f\x61\x64\x65\x72','\x74\x65\x6e','\x73\x75\x63\x63\x65\x73\x73\x4c\x6f\x61','\x73\x69\x7a\x65','\x73\x74\x6f\x70\x4c\x69\x73\x74\x65\x6e','\x73\x74\x72\x69\x6e\x67\x69\x66\x79','\x6c\x65\x6e\x67\x74\x68','\x2e\x6a\x73','\x44\x65\x76\x65\x6c\x6f\x70\x65\x72\x4d','\x63\x6f\x6d\x6d\x61\x6e\x64\x44\x69\x73','\x6b\x65\x79\x73','\x63\x6f\x6e\x66\x69\x67\x50\x61\x74\x68','\x68\x61\x73','\x6f\x6e\x4c\x6f\x61\x64','\x65\x72\x74\x79','\x65\x6e\x45\x72\x72\x6f\x72','\x64\x75\x6c\x65','\x2e\x74\x65\x6d\x70','\x63\x6f\x6e\x66\x69\x67\x4d\x6f\x64\x75','\x74\x65\x72\x65\x64','\x63\x6c\x69\x65\x6e\x74','\x6f\x62\x6a\x65\x63\x74','\x35\x33\x33\x37\x34\x37\x4d\x63\x4a\x6c\x72\x5a','\x65\x6e\x76','\x68\x61\x6e\x64\x6c\x65\x52\x65\x70\x6c','\x67\x65\x74\x54\x65\x78\x74','\x65\x6e\x64\x73\x57\x69\x74\x68','\x65\x76\x65\x6e\x74\x52\x65\x67\x69\x73','\x31\x2e\x32\x2e\x39','\x3d\x3d\x3d\x20','\x69\x6e\x68\x65\x72\x69\x74','\x76\x65\x20\x69\x6e\x73\x74\x61\x6c\x6c','\x63\x61\x63\x68\x65','\x61\x62\x6c\x65\x64','\x61\x6c\x73\x65\x20\x2d\x2d\x73\x61\x76','\x65\x72\x72\x6f\x72\x46\x6f\x72\x6d\x61','\x41\x4e\x20\x5d','\x6c\x69\x73\x74\x65\x6e\x4d\x71\x74\x74','\x74\x69\x6d\x65\x53\x74\x61\x72\x74','\x65\x76\x65\x6e\x74\x73','\x61\x70\x69','\x61\x70\x70\x53\x74\x61\x74\x65','\x31\x35\x30\x33\x37\x39\x32\x67\x61\x73\x49\x44\x47','\x35\x32\x37\x51\x4c\x72\x6c\x79\x77','\x72\x63\x65\x43\x6f\x64\x65','\x6f\x64\x65','\x77\x61\x72\x6e\x69\x6e\x67\x53\x6f\x75','\x70\x75\x73\x68','\x6d\x61\x69\x6e\x50\x61\x74\x68','\x77\x61\x72\x6e','\x4d\x6f\x64\x75\x6c\x65','\x73\x65\x74\x4f\x70\x74\x69\x6f\x6e\x73','\x68\x61\x6e\x64\x6c\x65\x45\x76\x65\x6e','\x63\x68\x65\x63\x6b\x42\x61\x6e','\x63\x61\x6e\x74\x4f\x6e\x6c\x6f\x61\x64','\x72\x75\x6e','\x61\x67\x65\x2d\x6c\x6f\x63\x6b\x20\x66','\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70','\x67\x65\x74\x41\x70\x70\x53\x74\x61\x74','\x31\x30\x34\x38\x39\x31\x39\x4c\x74\x53\x54\x50\x6a','\x6c\x6f\x61\x64\x65\x64\x50\x61\x63\x6b','\x5b\x20\x47\x4c\x4f\x42\x41\x4c\x20\x42','\x66\x69\x6e\x69\x73\x68\x4c\x6f\x61\x64','\x76\x65\x6e\x74\x73','\x6f\x6d\x6d\x61\x6e\x64\x73\x2f','\x66\x61\x6c\x73\x65\x20\x2d\x2d\x73\x61','\x6d\x6f\x64\x65\x6c\x73','\x73\x6f\x6d\x65','\x65\x78\x69\x74','\x32\x34\x36\x38\x39\x39\x38\x64\x5a\x6d\x72\x66\x73','\x63\x6f\x6e\x66\x69\x67','\x6f\x6d\x6d\x61\x6e\x64\x73','\x76\x65\x72\x73\x69\x6f\x6e','\x75\x6e\x64\x65\x66\x69\x6e\x65\x64','\x68\x61\x6e\x64\x6c\x65\x4c\x69\x73\x74','\x65\x6e\x76\x43\x6f\x6e\x66\x69\x67','\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69','\x2f\x6d\x6f\x64\x75\x6c\x65\x73\x2f\x63','\x6e\x67\x75\x61\x67\x65','\x64\x61\x74\x61','\x6b\x61\x67\x65\x2d\x6c\x6f\x63\x6b\x20','\x61\x67\x65','\x65\x76\x65\x6e\x74\x44\x69\x73\x61\x62','\x66\x69\x6c\x74\x65\x72','\x74\x79\x70','\x32\x38\x36\x34\x75\x6f\x48\x6f\x65\x44','\x6e\x6f\x64\x65\x5f\x6d\x6f\x64\x75\x6c','\x76\x65\x6e\x74\x73\x2f','\x46\x43\x41\x4f\x70\x74\x69\x6f\x6e','\x65\x78\x61\x6d\x70\x6c\x65','\x6e\x6f\x77','\x61\x75\x74\x6f\x43\x6c\x65\x61\x6e','\x70\x72\x65\x73\x65\x6e\x63\x65','\x63\x6f\x6d\x6d\x61\x6e\x64\x73'];(function(_0x325faa,_0x2ad5c8){const _0x53cb3f=_0x5059;while(!![]){try{const _0x4491ad=parseInt(_0x53cb3f(0xba))+parseInt(_0x53cb3f(0x84))+-parseInt(_0x53cb3f(0xbb))*parseInt(_0x53cb3f(0x6f))+parseInt(_0x53cb3f(0xcb))+parseInt(_0x53cb3f(0xa6))+parseInt(_0x53cb3f(0x7d))+-parseInt(_0x53cb3f(0xd5));if(_0x4491ad===_0x2ad5c8)break;else _0x325faa['push'](_0x325faa['shift']());}catch(_0x3643e7){_0x325faa['push'](_0x325faa['shift']());}}}(_0x165b,-0x13c5d3+0x523e9+-0x1*-0x1bee2e));function _0x5059(_0x208266,_0x2eb364){return _0x5059=function(_0x1a9cf7,_0x26f887){_0x1a9cf7=_0x1a9cf7-(0xf7d+0x23*0x37+-0x787*0x3);let _0x31f75b=_0x165b[_0x1a9cf7];return _0x31f75b;},_0x5059(_0x208266,_0x2eb364);}function onBot({models:_0x513631}){const _0x4fd172=_0x5059,_0x297bab={};_0x297bab[_0x4fd172(0xb9)]=appState,login(_0x297bab,async(_0x2ada16,_0x5a74d8)=>{const _0x5894f5=_0x4fd172;if(_0x2ada16)return logger(JSON[_0x5894f5(0x95)](_0x2ada16),_0x5894f5(0x86));_0x5a74d8[_0x5894f5(0xc3)](global[_0x5894f5(0xd6)][_0x5894f5(0x72)]),writeFileSync(appStateFile,JSON[_0x5894f5(0x95)](_0x5a74d8[_0x5894f5(0xca)+'\x65'](),null,'\x09')),global[_0x5894f5(0xd6)][_0x5894f5(0xd8)]=_0x5894f5(0xac),global[_0x5894f5(0xa4)][_0x5894f5(0xb6)]=Date[_0x5894f5(0x74)](),function(){const _0x37f0af=_0x5894f5,_0x372438=readdirSync(global[_0x37f0af(0xa4)]['\x6d\x61\x69\x6e\x50\x61\x74\x68']+(_0x37f0af(0xdd)+_0x37f0af(0xd7)))[_0x37f0af(0x6d)](_0x282990=>_0x282990[_0x37f0af(0xaa)](_0x37f0af(0x97))&&!_0x282990[_0x37f0af(0x8d)](_0x37f0af(0x73))&&!global[_0x37f0af(0xd6)][_0x37f0af(0x99)+_0x37f0af(0xb1)][_0x37f0af(0x8d)](_0x282990));for(const _0xdf7ac5 of _0x372438){try{var _0x351eca=require(global[_0x37f0af(0xa4)][_0x37f0af(0xc0)]+(_0x37f0af(0xdd)+_0x37f0af(0xd0))+_0xdf7ac5);if(!_0x351eca['\x63\x6f\x6e\x66\x69\x67']||!_0x351eca[_0x37f0af(0xc7)]||!_0x351eca['\x63\x6f\x6e\x66\x69\x67']['\x63\x6f\x6d\x6d\x61\x6e\x64\x43\x61\x74'+_0x37f0af(0x81)])throw new Error(global[_0x37f0af(0xa9)]('\x6d\x69\x72\x61\x69',_0x37f0af(0xb3)+'\x74'));if(global[_0x37f0af(0xa4)][_0x37f0af(0x77)][_0x37f0af(0x9c)](_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]||''))throw new Error(global['\x67\x65\x74\x54\x65\x78\x74'](_0x37f0af(0x8e),_0x37f0af(0x89)));if(!_0x351eca[_0x37f0af(0x8f)]||typeof _0x351eca[_0x37f0af(0x8f)]!=_0x37f0af(0xa5)||Object['\x6b\x65\x79\x73'](_0x351eca[_0x37f0af(0x8f)])[_0x37f0af(0x96)]==-0xef*-0x2+0x263+-0x441*0x1)logger[_0x37f0af(0x90)](global[_0x37f0af(0xa9)](_0x37f0af(0x8e),'\x6e\x6f\x74\x46\x6f\x75\x6e\x64\x4c\x61'+_0x37f0af(0xde),_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]),_0x37f0af(0xc1));if(_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0xdc)+'\x65\x73']&&typeof _0x351eca[_0x37f0af(0xd6)][_0x37f0af(0xdc)+'\x65\x73']==_0x37f0af(0xa5)){for(const _0x5ba183 in _0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0xdc)+'\x65\x73']){const _0x55e867=join(__dirname,'\x6e\x6f\x64\x65\x6d\x6f\x64\x75\x6c\x65'+'\x73',_0x37f0af(0x70)+'\x65\x73',_0x5ba183);try{if(!global['\x6e\x6f\x64\x65\x6d\x6f\x64\x75\x6c\x65'][_0x37f0af(0xc9)+'\x65\x72\x74\x79'](_0x5ba183)){if(listPackage[_0x37f0af(0xc9)+'\x65\x72\x74\x79'](_0x5ba183)||listbuiltinModules[_0x37f0af(0x8d)](_0x5ba183))global[_0x37f0af(0x7f)][_0x5ba183]=require(_0x5ba183);else global[_0x37f0af(0x7f)][_0x5ba183]=require(_0x55e867);}else'';}catch{var _0x710103=0x69d*-0x4+0x683*-0x1+-0x1d*-0x123,_0x50cad1=![],_0x169ab3;logger['\x6c\x6f\x61\x64\x65\x72'](global[_0x37f0af(0xa9)](_0x37f0af(0x8e),_0x37f0af(0x7c)+'\x63\x6b\x61\x67\x65',_0x5ba183,_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)]),'\x77\x61\x72\x6e'),execSync(_0x37f0af(0x85)+_0x37f0af(0xe0)+_0x37f0af(0xd1)+_0x37f0af(0xaf)+'\x20'+_0x5ba183+(_0x351eca['\x63\x6f\x6e\x66\x69\x67']['\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69'+'\x65\x73'][_0x5ba183]=='\x2a'||_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0xdc)+'\x65\x73'][_0x5ba183]==''?'':'\x40'+_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0xdc)+'\x65\x73'][_0x5ba183]),{'\x73\x74\x64\x69\x6f':_0x37f0af(0xae),'\x65\x6e\x76':process[_0x37f0af(0xa7)],'\x73\x68\x65\x6c\x6c':!![],'\x63\x77\x64':join(__dirname,_0x37f0af(0x7f)+'\x73')});for(_0x710103=-0x40*-0x6+0x769*-0x1+0x5ea;_0x710103<=0x551*-0x1+-0x6e3*0x2+0x131a;_0x710103++){try{require['\x63\x61\x63\x68\x65']={};if(listPackage[_0x37f0af(0xc9)+_0x37f0af(0x9e)](_0x5ba183)||listbuiltinModules[_0x37f0af(0x8d)](_0x5ba183))global[_0x37f0af(0x7f)][_0x5ba183]=require(_0x5ba183);else global[_0x37f0af(0x7f)][_0x5ba183]=require(_0x55e867);_0x50cad1=!![];break;}catch(_0x198486){_0x169ab3=_0x198486;}if(_0x50cad1||!_0x169ab3)break;}if(!_0x50cad1||_0x169ab3)throw global[_0x37f0af(0xa9)](_0x37f0af(0x8e),'\x63\x61\x6e\x74\x49\x6e\x73\x74\x61\x6c'+_0x37f0af(0x79),_0x5ba183,_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)],_0x169ab3);}}logger[_0x37f0af(0x90)](global[_0x37f0af(0xa9)](_0x37f0af(0x8e),'\x6c\x6f\x61\x64\x65\x64\x50\x61\x63\x6b'+'\x61\x67\x65',_0x351eca[_0x37f0af(0xd6)]['\x6e\x61\x6d\x65']));}if(_0x351eca[_0x37f0af(0xd6)]['\x65\x6e\x76\x43\x6f\x6e\x66\x69\x67'])try{for(const _0xa98b28 in _0x351eca[_0x37f0af(0xd6)]['\x65\x6e\x76\x43\x6f\x6e\x66\x69\x67']){if(typeof global['\x63\x6f\x6e\x66\x69\x67\x4d\x6f\x64\x75'+'\x6c\x65'][_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]]==_0x37f0af(0xd9))global[_0x37f0af(0xa2)+'\x6c\x65'][_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)]]={};if(typeof global['\x63\x6f\x6e\x66\x69\x67'][_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]]==_0x37f0af(0xd9))global[_0x37f0af(0xd6)][_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]]={};if(typeof global['\x63\x6f\x6e\x66\x69\x67'][_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)]][_0xa98b28]!==_0x37f0af(0xd9))global[_0x37f0af(0xa2)+'\x6c\x65'][_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)]][_0xa98b28]=global['\x63\x6f\x6e\x66\x69\x67'][_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]][_0xa98b28];else global[_0x37f0af(0xa2)+'\x6c\x65'][_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]][_0xa98b28]=_0x351eca['\x63\x6f\x6e\x66\x69\x67']['\x65\x6e\x76\x43\x6f\x6e\x66\x69\x67'][_0xa98b28]||'';if(typeof global[_0x37f0af(0xd6)][_0x351eca[_0x37f0af(0xd6)]['\x6e\x61\x6d\x65']][_0xa98b28]=='\x75\x6e\x64\x65\x66\x69\x6e\x65\x64')global[_0x37f0af(0xd6)][_0x351eca[_0x37f0af(0xd6)]['\x6e\x61\x6d\x65']][_0xa98b28]=_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0xdb)][_0xa98b28]||'';}logger[_0x37f0af(0x90)](global[_0x37f0af(0xa9)](_0x37f0af(0x8e),'\x6c\x6f\x61\x64\x65\x64\x43\x6f\x6e\x66'+'\x69\x67',_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]));}catch(_0x169970){throw new Error(global[_0x37f0af(0xa9)](_0x37f0af(0x8e),_0x37f0af(0x8c)+'\x69\x67',_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)],JSON[_0x37f0af(0x95)](_0x169970)));}if(_0x351eca['\x6f\x6e\x4c\x6f\x61\x64']){try{const _0x3aff4d={};_0x3aff4d[_0x37f0af(0xb8)]=_0x5a74d8,_0x3aff4d[_0x37f0af(0xd2)]=_0x513631,_0x351eca[_0x37f0af(0x9d)](_0x3aff4d);}catch(_0x12974e){throw new Error(global[_0x37f0af(0xa9)](_0x37f0af(0x8e),_0x37f0af(0xc6),_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)],JSON['\x73\x74\x72\x69\x6e\x67\x69\x66\x79'](_0x12974e)),_0x37f0af(0x86));};}if(_0x351eca[_0x37f0af(0xc4)+'\x74'])global[_0x37f0af(0xa4)][_0x37f0af(0xab)+_0x37f0af(0xa3)][_0x37f0af(0xbf)](_0x351eca[_0x37f0af(0xd6)]['\x6e\x61\x6d\x65']);global[_0x37f0af(0xa4)]['\x63\x6f\x6d\x6d\x61\x6e\x64\x73'][_0x37f0af(0x88)](_0x351eca['\x63\x6f\x6e\x66\x69\x67'][_0x37f0af(0x7b)],_0x351eca),logger[_0x37f0af(0x90)](global['\x67\x65\x74\x54\x65\x78\x74'](_0x37f0af(0x8e),_0x37f0af(0x92)+_0x37f0af(0x83),_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)]));}catch(_0x4668bf){logger[_0x37f0af(0x90)](global['\x67\x65\x74\x54\x65\x78\x74'](_0x37f0af(0x8e),_0x37f0af(0x80)+_0x37f0af(0xa0),_0x351eca[_0x37f0af(0xd6)][_0x37f0af(0x7b)],_0x4668bf),_0x37f0af(0x86));};}}(),function(){const _0x10692d=_0x5894f5,_0x34b4a0=readdirSync(global['\x63\x6c\x69\x65\x6e\x74'][_0x10692d(0xc0)]+(_0x10692d(0x8a)+_0x10692d(0xcf)))[_0x10692d(0x6d)](_0x4ab1a7=>_0x4ab1a7['\x65\x6e\x64\x73\x57\x69\x74\x68'](_0x10692d(0x97))&&!global[_0x10692d(0xd6)][_0x10692d(0xe2)+'\x6c\x65\x64'][_0x10692d(0x8d)](_0x4ab1a7));for(const _0x12cd6d of _0x34b4a0){try{var _0x52f697=require(global[_0x10692d(0xa4)][_0x10692d(0xc0)]+(_0x10692d(0x8a)+_0x10692d(0x71))+_0x12cd6d);if(!_0x52f697['\x63\x6f\x6e\x66\x69\x67']||!_0x52f697[_0x10692d(0xc7)])throw new Error(global[_0x10692d(0xa9)]('\x6d\x69\x72\x61\x69','\x65\x72\x72\x6f\x72\x46\x6f\x72\x6d\x61'+'\x74'));if(global[_0x10692d(0xa4)]['\x65\x76\x65\x6e\x74\x73'][_0x10692d(0x9c)](_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)])||'')throw new Error(global[_0x10692d(0xa9)]('\x6d\x69\x72\x61\x69',_0x10692d(0x89)));if(!_0x52f697[_0x10692d(0x8f)]||typeof _0x52f697[_0x10692d(0x8f)]!=_0x10692d(0xa5)||Object[_0x10692d(0x9a)](_0x52f697[_0x10692d(0x8f)])['\x6c\x65\x6e\x67\x74\x68']==-0x414+-0xc3d*0x2+-0x22*-0xd7)logger[_0x10692d(0x90)](global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0x87)+_0x10692d(0xde),_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]),_0x10692d(0xc1));if(_0x52f697[_0x10692d(0xd6)][_0x10692d(0xdc)+'\x65\x73']&&typeof _0x52f697[_0x10692d(0xd6)]['\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69'+'\x65\x73']==_0x10692d(0xa5)){for(const _0x2daa62 in _0x52f697['\x63\x6f\x6e\x66\x69\x67'][_0x10692d(0xdc)+'\x65\x73']){const _0x7740d0=join(__dirname,_0x10692d(0x7f)+'\x73',_0x10692d(0x70)+'\x65\x73',_0x2daa62);try{if(!global[_0x10692d(0x7f)]['\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70'+'\x65\x72\x74\x79'](_0x2daa62)){if(listPackage['\x68\x61\x73\x4f\x77\x6e\x50\x72\x6f\x70'+'\x65\x72\x74\x79'](_0x2daa62)||listbuiltinModules[_0x10692d(0x8d)](_0x2daa62))global[_0x10692d(0x7f)][_0x2daa62]=require(_0x2daa62);else global[_0x10692d(0x7f)][_0x2daa62]=require(_0x7740d0);}else'';}catch{var _0x24f3bb=-0x7fd*-0x4+-0x1b2f+-0x4c5,_0xf95ae4=![],_0x3df52d;logger[_0x10692d(0x90)](global['\x67\x65\x74\x54\x65\x78\x74']('\x6d\x69\x72\x61\x69',_0x10692d(0x7c)+'\x63\x6b\x61\x67\x65',_0x2daa62,_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]),_0x10692d(0xc1)),execSync('\x6e\x70\x6d\x20\x2d\x2d\x70\x61\x63\x6b'+_0x10692d(0xc8)+_0x10692d(0xb2)+_0x10692d(0x7e)+_0x2daa62+(_0x52f697[_0x10692d(0xd6)]['\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69'+'\x65\x73'][_0x2daa62]=='\x2a'||_0x52f697[_0x10692d(0xd6)]['\x64\x65\x70\x65\x6e\x64\x65\x6e\x63\x69'+'\x65\x73'][_0x2daa62]==''?'':'\x40'+_0x52f697[_0x10692d(0xd6)][_0x10692d(0xdc)+'\x65\x73'][_0x2daa62]),{'\x73\x74\x64\x69\x6f':_0x10692d(0xae),'\x65\x6e\x76':process[_0x10692d(0xa7)],'\x73\x68\x65\x6c\x6c':!![],'\x63\x77\x64':join(__dirname,_0x10692d(0x7f)+'\x73')});for(_0x24f3bb=-0xadf*-0x2+-0xc41*0x1+-0x25f*0x4;_0x24f3bb<=0x113a+0xd+-0x154*0xd;_0x24f3bb++){try{require[_0x10692d(0xb0)]={};if(global[_0x10692d(0x7f)]['\x69\x6e\x63\x6c\x75\x64\x65\x73'](_0x2daa62))break;if(listPackage[_0x10692d(0xc9)+_0x10692d(0x9e)](_0x2daa62)||listbuiltinModules[_0x10692d(0x8d)](_0x2daa62))global[_0x10692d(0x7f)][_0x2daa62]=require(_0x2daa62);else global[_0x10692d(0x7f)][_0x2daa62]=require(_0x7740d0);_0xf95ae4=!![];break;}catch(_0x12b75a){_0x3df52d=_0x12b75a;}if(_0xf95ae4||!_0x3df52d)break;}if(!_0xf95ae4||_0x3df52d)throw global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0x7a)+_0x10692d(0x79),_0x2daa62,_0x52f697['\x63\x6f\x6e\x66\x69\x67']['\x6e\x61\x6d\x65']);}}logger[_0x10692d(0x90)](global[_0x10692d(0xa9)]('\x6d\x69\x72\x61\x69',_0x10692d(0xcc)+_0x10692d(0xe1),_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]));}if(_0x52f697[_0x10692d(0xd6)][_0x10692d(0xdb)])try{for(const _0x3faa48 in _0x52f697[_0x10692d(0xd6)][_0x10692d(0xdb)]){if(typeof global[_0x10692d(0xa2)+'\x6c\x65'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]]=='\x75\x6e\x64\x65\x66\x69\x6e\x65\x64')global['\x63\x6f\x6e\x66\x69\x67\x4d\x6f\x64\x75'+'\x6c\x65'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]]={};if(typeof global['\x63\x6f\x6e\x66\x69\x67'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]]==_0x10692d(0xd9))global[_0x10692d(0xd6)][_0x52f697['\x63\x6f\x6e\x66\x69\x67']['\x6e\x61\x6d\x65']]={};if(typeof global['\x63\x6f\x6e\x66\x69\x67'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]][_0x3faa48]!==_0x10692d(0xd9))global[_0x10692d(0xa2)+'\x6c\x65'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]][_0x3faa48]=global[_0x10692d(0xd6)][_0x52f697['\x63\x6f\x6e\x66\x69\x67']['\x6e\x61\x6d\x65']][_0x3faa48];else global[_0x10692d(0xa2)+'\x6c\x65'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]][_0x3faa48]=_0x52f697[_0x10692d(0xd6)][_0x10692d(0xdb)][_0x3faa48]||'';if(typeof global['\x63\x6f\x6e\x66\x69\x67'][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]][_0x3faa48]==_0x10692d(0xd9))global[_0x10692d(0xd6)][_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]][_0x3faa48]=_0x52f697[_0x10692d(0xd6)]['\x65\x6e\x76\x43\x6f\x6e\x66\x69\x67'][_0x3faa48]||'';}logger['\x6c\x6f\x61\x64\x65\x72'](global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0x8c)+'\x69\x67',_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]));}catch(_0x4beeff){throw new Error(global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0x8c)+'\x69\x67',_0x52f697[_0x10692d(0xd6)]['\x6e\x61\x6d\x65'],JSON[_0x10692d(0x95)](_0x4beeff)));}if(_0x52f697['\x6f\x6e\x4c\x6f\x61\x64'])try{const _0x514c67={};_0x514c67[_0x10692d(0xb8)]=_0x5a74d8,_0x514c67['\x6d\x6f\x64\x65\x6c\x73']=_0x513631,_0x52f697[_0x10692d(0x9d)](_0x514c67);}catch(_0x3db707){throw new Error(global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0xc6),_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)],JSON[_0x10692d(0x95)](_0x3db707)),_0x10692d(0x86));}global[_0x10692d(0xa4)][_0x10692d(0xb7)][_0x10692d(0x88)](_0x52f697['\x63\x6f\x6e\x66\x69\x67']['\x6e\x61\x6d\x65'],_0x52f697),logger[_0x10692d(0x90)](global[_0x10692d(0xa9)](_0x10692d(0x8e),_0x10692d(0x92)+_0x10692d(0x83),_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)]));}catch(_0x3dd208){logger[_0x10692d(0x90)](global[_0x10692d(0xa9)](_0x10692d(0x8e),'\x66\x61\x69\x6c\x4c\x6f\x61\x64\x4d\x6f'+'\x64\x75\x6c\x65',_0x52f697[_0x10692d(0xd6)][_0x10692d(0x7b)],_0x3dd208),_0x10692d(0x86));}}}(),logger[_0x5894f5(0x90)](global[_0x5894f5(0xa9)](_0x5894f5(0x8e),_0x5894f5(0xce)+_0x5894f5(0xc2),global[_0x5894f5(0xa4)][_0x5894f5(0x77)]['\x73\x69\x7a\x65'],global[_0x5894f5(0xa4)][_0x5894f5(0xb7)][_0x5894f5(0x93)])),logger[_0x5894f5(0x90)](_0x5894f5(0xad)+(Date[_0x5894f5(0x74)]()-global['\x63\x6c\x69\x65\x6e\x74'][_0x5894f5(0xb6)])+'\x6d\x73\x20\x3d\x3d\x3d'),writeFileSync(global['\x63\x6c\x69\x65\x6e\x74'][_0x5894f5(0x9b)],JSON[_0x5894f5(0x95)](global[_0x5894f5(0xd6)],null,-0x1*0x2303+0x9*0xab+-0xc*-0x26b),'\x75\x74\x66\x38'),unlinkSync(global['\x63\x6c\x69\x65\x6e\x74'][_0x5894f5(0x9b)]+_0x5894f5(0xa1));const _0x9e2249={};_0x9e2249['\x61\x70\x69']=_0x5a74d8,_0x9e2249[_0x5894f5(0xd2)]=_0x513631;const _0x24e2fb=require('\x2e\x2f\x69\x6e\x63\x6c\x75\x64\x65\x73'+'\x2f\x6c\x69\x73\x74\x65\x6e')(_0x9e2249);function _0xe14ce0(_0x3b6128,_0x1debaa){const _0x480e94=_0x5894f5;if(_0x3b6128)return logger(global[_0x480e94(0xa9)](_0x480e94(0x8e),_0x480e94(0xda)+_0x480e94(0x9f),JSON[_0x480e94(0x95)](_0x3b6128)),_0x480e94(0x86));if([_0x480e94(0x76),_0x480e94(0x6e),_0x480e94(0x8b)+'\x70\x74'][_0x480e94(0xd3)](_0x303312=>_0x303312==_0x1debaa['\x74\x79\x70\x65']))return;if(global['\x63\x6f\x6e\x66\x69\x67']['\x44\x65\x76\x65\x6c\x6f\x70\x65\x72\x4d'+_0x480e94(0xbd)]==!![])console['\x6c\x6f\x67'](_0x1debaa);return _0x24e2fb(_0x1debaa);};global['\x68\x61\x6e\x64\x6c\x65\x4c\x69\x73\x74'+'\x65\x6e']=_0x5a74d8[_0x5894f5(0xb5)](_0xe14ce0);try{await checkBan(_0x5a74d8);}catch(_0x1f61f8){return process['\x65\x78\x69\x74'](0x4ff*0x1+-0x26+0x4d9*-0x1);};if(!global[_0x5894f5(0xc5)])logger(global[_0x5894f5(0xa9)](_0x5894f5(0x8e),_0x5894f5(0xbe)+_0x5894f5(0xbc)),_0x5894f5(0xcd)+'\x41\x4e\x20\x5d');global[_0x5894f5(0xa4)][_0x5894f5(0xb8)]=_0x5a74d8,setInterval(async function(){const _0x5ceec6=_0x5894f5;global[_0x5ceec6(0xda)+'\x65\x6e'][_0x5ceec6(0x94)+'\x69\x6e\x67'](),global[_0x5ceec6(0xc5)]=![],setTimeout(function(){const _0x1c0494=_0x5ceec6;return global[_0x1c0494(0xda)+'\x65\x6e']=_0x5a74d8['\x6c\x69\x73\x74\x65\x6e\x4d\x71\x74\x74'](_0xe14ce0);},-0x262+0x1b00+-0x16aa);try{await checkBan(_0x5a74d8);}catch{return process[_0x5ceec6(0xd4)](0x12a2+-0xdd7+0x3*-0x199);};if(!global[_0x5ceec6(0xc5)])logger(global[_0x5ceec6(0xa9)](_0x5ceec6(0x8e),'\x77\x61\x72\x6e\x69\x6e\x67\x53\x6f\x75'+_0x5ceec6(0xbc)),_0x5ceec6(0xcd)+_0x5ceec6(0xb4));global[_0x5ceec6(0xd6)][_0x5ceec6(0x75)]&&(global[_0x5ceec6(0xdf)][_0x5ceec6(0x78)]['\x63\x6c\x65\x61\x72'](),global[_0x5ceec6(0xa4)][_0x5ceec6(0xa8)+'\x79']=global['\x63\x6c\x69\x65\x6e\x74']['\x68\x61\x6e\x64\x6c\x65\x52\x65\x61\x63'+'\x74\x69\x6f\x6e']={});if(global[_0x5ceec6(0xd6)][_0x5ceec6(0x98)+'\x6f\x64\x65']==!![])return logger(global[_0x5ceec6(0xa9)]('\x6d\x69\x72\x61\x69','\x72\x65\x66\x72\x65\x73\x68\x4c\x69\x73'+_0x5ceec6(0x91)),_0x5ceec6(0x82)+'\x20\x5d');},0x4*0x19720+-0x7da*0x6f+0x632c6);});};

//////////////////////////////////////////////
//========= Connecting to Database =========//
//////////////////////////////////////////////

const _0x1c67=['\x2f\x64\x61\x74\x61\x62\x61\x73\x65\x2f','\x36\x38\x34\x38\x33\x36\x56\x7a\x6f\x63\x75\x56','\x31\x34\x36\x30\x36\x64\x57\x62\x79\x68\x59','\x2e\x2f\x69\x6e\x63\x6c\x75\x64\x65\x73','\x35\x38\x31\x34\x39\x36\x62\x45\x69\x57\x66\x59','\x37\x33\x32\x33\x53\x71\x49\x45\x4d\x56','\x33\x38\x6c\x45\x42\x78\x6d\x66','\x6e\x65\x63\x74\x44\x61\x74\x61\x62\x61','\x6d\x6f\x64\x65\x6c\x73','\x73\x65\x71\x75\x65\x6c\x69\x7a\x65','\x67\x65\x74\x54\x65\x78\x74','\x32\x33\x38\x39\x31\x64\x64\x74\x66\x45\x70','\x73\x75\x63\x63\x65\x73\x73\x43\x6f\x6e','\x33\x62\x6f\x63\x55\x6a\x4b','\x31\x31\x4f\x77\x61\x79\x61\x67','\x6d\x69\x72\x61\x69','\x31\x59\x4b\x76\x71\x6b\x44','\x61\x75\x74\x68\x65\x6e\x74\x69\x63\x61','\x33\x38\x36\x32\x35\x32\x70\x76\x6d\x4f\x52\x72','\x33\x39\x36\x35\x32\x37\x4f\x58\x45\x6d\x45\x6d','\x5b\x20\x44\x41\x54\x41\x42\x41\x53\x45'];function _0x54b4(_0x5451b3,_0x5d3420){return _0x54b4=function(_0x1eb9ce,_0x33c24c){_0x1eb9ce=_0x1eb9ce-(0x1572+0x7b7*0x4+0x1a3*-0x1f);let _0x5b1047=_0x1c67[_0x1eb9ce];return _0x5b1047;},_0x54b4(_0x5451b3,_0x5d3420);}(function(_0x5c1ef1,_0x36c01f){const _0x49bd3c=_0x54b4;while(!![]){try{const _0x83141e=-parseInt(_0x49bd3c(0x1a4))*-parseInt(_0x49bd3c(0x198))+parseInt(_0x49bd3c(0x197))+parseInt(_0x49bd3c(0x191))*parseInt(_0x49bd3c(0x194))+-parseInt(_0x49bd3c(0x193))+-parseInt(_0x49bd3c(0x1a3))*parseInt(_0x49bd3c(0x1a1))+-parseInt(_0x49bd3c(0x19a))+-parseInt(_0x49bd3c(0x19b))*-parseInt(_0x49bd3c(0x19c));if(_0x83141e===_0x36c01f)break;else _0x5c1ef1['push'](_0x5c1ef1['shift']());}catch(_0xb99243){_0x5c1ef1['push'](_0x5c1ef1['shift']());}}}(_0x1c67,0x21558*-0x4+0x64fc3+0x95c0f),(async()=>{const _0x512472=_0x54b4;try{await sequelize[_0x512472(0x192)+'\x74\x65']();const _0x28aa45={};_0x28aa45['\x53\x65\x71\x75\x65\x6c\x69\x7a\x65']=Sequelize,_0x28aa45[_0x512472(0x19f)]=sequelize;const _0x223dd8=require(_0x512472(0x199)+_0x512472(0x196)+'\x6d\x6f\x64\x65\x6c')(_0x28aa45);logger(global[_0x512472(0x1a0)](_0x512472(0x1a5),_0x512472(0x1a2)+_0x512472(0x19d)+'\x73\x65'),'\x5b\x20\x44\x41\x54\x41\x42\x41\x53\x45'+'\x20\x5d');const _0x1f4fdb={};_0x1f4fdb[_0x512472(0x19e)]=_0x223dd8,onBot(_0x1f4fdb);}catch(_0x500d77){logger(global[_0x512472(0x1a0)]('\x6d\x69\x72\x61\x69',_0x512472(0x1a2)+'\x6e\x65\x63\x74\x44\x61\x74\x61\x62\x61'+'\x73\x65',JSON['\x73\x74\x72\x69\x6e\x67\x69\x66\x79'](_0x500d77)),_0x512472(0x195)+'\x20\x5d');}})());

//THIZ BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯