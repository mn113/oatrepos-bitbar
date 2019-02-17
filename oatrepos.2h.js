#!/usr/bin/env /usr/local/bin/node

/*
 * <bitbar.title>OAT Repos</bitbar.title>
 * <bitbar.version>v0.2</bitbar.version>
 * <bitbar.author>M. Nicholson</bitbar.author>
 * <bitbar.author.github>mn113</bitbar.author.github>
 * <bitbar.image>https://github.com/mn113/oatrepos-bitbar/blob/master/oatrepos-bitbar1.png</bitbar.image>
 * <bitbar.desc>List OAT repos and branch versions</bitbar.desc>
 * <bitbar.dependencies>node,octonode,dotenv</bitbar.dependencies>
 */


const mn113gh = 'https://github.com/mn113/oatrepos-bitbar';
const path = require('path');
const fs = require('fs');

const GITICON = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwElEQVQ4T32TTUtbQRSG33PmqgUt2l2k+yC4MOIHQiK9iaG0oKUi3Qr+ii7Tpf/BH9C6VcFqrIqIwRRq0OrGlYuiFHVrk9w5p9xrEmMyOqvhzPs+54shPHHGfD9WCfg7i7UWXe+PDzb/uqTkCg76fo8X8E8CBsJ3a+0ZUVfaBWkDhJmr1kxAMQvofD3BU5BHgFrZOwQbJ/ACiCtQvLaii8zwXJAG4MF8XzZBVo/2dz+E96Fkep2I3rnaiQCt5jCmiishTg70v7o4v7xZArDgaodc5rpQgW8kUGXdUuERwxpT2GnAdNbboUQy8wuEYeeKSJdF2FO1H7u1/LJQKNwNpTKfCVis6X9TIpXeAch/DkCkc2ATL+3lzxOpTA7Al0hvcUgj2Wyv/VfdBMx4G0TwFQwPwCcRXDPLCaBvAMNQHFWlIxsN0Q2RP+JhoiPwOFA5JEKskaBmPi1s3DbWGEIq5SBvlMcioWCtdLA9E14Tk5kNKN5G8Sbz/bqbTjNEBAEbypGIsao5Zjat5jZAlM33+yQweYaOPp4JlarWmwrLbo47P1M7hEqdFWSLxR83rYN2AuqVUIAVS/BelM2Myxzq/gMuDfaGij7JUwAAAABJRU5ErkJggg==";

const OATICON = "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";

const pjson = require('./package.json');

// Begin plugin output:
// Set icon:
console.log(':o:');
//console.log("| dropdown=false templateImage='"+OATICON+"'");
console.log("---");

// Preflight:
// Check if config.json already present, if not, duplicate config.json.dist:
function preflight() {
	return new Promise((resolve,reject) => {
		try {
			var configJsonPath = path.join(__dirname, 'config.json');
			fs.access(configJsonPath, fs.constants.F_OK, (err1) => {
				if (err1) {
					fs.access(configJsonPath + '.dist', fs.constants.F_OK, (err2) => {
						if (!err2) {
							fs.copyFile(configJsonPath + '.dist', configJsonPath, () => {
								resolve("Copied config.json.dist -> config.json");
							});
						}
						else throw new Error("Please obtain config.json or config.json.dist from " + mn113gh);
					});
				}
				else resolve('ok');
			});
		} catch(err) {
			reject(err.message);
		}
	});
}

// Main:
preflight().then(() => {
	const repoScraper = require('./repoScraper');
	return Promise.all([
		repoScraper.fetchAll(),
		repoScraper.getApiLeft()
	])
	.then(output)
	.catch(err => {});
})
.catch(console.error);

// Principal output:
function output([displayRepos, apiLeft]) {
	console.log(`${displayRepos.length} repos defined:`);
	console.log("---");
	displayRepos
		.forEach(function(repo) {
			if (repo instanceof Error) {
				console.log(repo.message);
			}
			else {
				let baselink = `href=https://github.com/${repo.name}`;
				let areDiff = repo.master.version !== repo.develop.version;
				let lineColour = areDiff ? 'crimson' : 'green';
				let versions = `${repo.master.version} / ${repo.develop.version}`;
				console.log(`${repo.name} (${versions})|${baselink} color=${lineColour}`);
				console.log(`--${repo.status}|${baselink} color=${lineColour}`);
				console.log(`--master @ ${repo.master.version}:|${baselink}/tree/master`);
				console.log(`--↳ Last commit ${repo.master.lastDate} ago by ${repo.master.lastAuthor}`);
				console.log(`--develop @ ${repo.develop.version}:|${baselink}/tree/develop`);
				console.log(`--↳ Last commit ${repo.develop.lastDate} ago by ${repo.develop.lastAuthor}`);
				console.log(`--${repo.recentPRs} open PRs edited in past week|${baselink}/pulls`);
			}
			console.log("---");
		});
	// Menubar afters:
	console.log("Extra");
	console.log("--Reload plugin | refresh=true terminal=false");
	console.log("--Instructions");
	console.log("----1. Generate a Github Personal Access Token|href=https://github.com/settings/tokens");
	console.log("----2. Set your Github Personal Access Token in token.json");
	console.log("----3. Set your Github org & repo names in config.json");
	console.log(`--${apiLeft} API requests left this hour`);
	console.log("--Plugin v"+pjson.version);
	console.log("--Node "+process.version);
}
