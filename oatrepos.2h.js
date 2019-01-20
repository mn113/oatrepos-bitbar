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

const repoScraper = require('./repoScraper');

const GITICON = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwElEQVQ4T32TTUtbQRSG33PmqgUt2l2k+yC4MOIHQiK9iaG0oKUi3Qr+ii7Tpf/BH9C6VcFqrIqIwRRq0OrGlYuiFHVrk9w5p9xrEmMyOqvhzPs+54shPHHGfD9WCfg7i7UWXe+PDzb/uqTkCg76fo8X8E8CBsJ3a+0ZUVfaBWkDhJmr1kxAMQvofD3BU5BHgFrZOwQbJ/ACiCtQvLaii8zwXJAG4MF8XzZBVo/2dz+E96Fkep2I3rnaiQCt5jCmiishTg70v7o4v7xZArDgaodc5rpQgW8kUGXdUuERwxpT2GnAdNbboUQy8wuEYeeKSJdF2FO1H7u1/LJQKNwNpTKfCVis6X9TIpXeAch/DkCkc2ATL+3lzxOpTA7Al0hvcUgj2Wyv/VfdBMx4G0TwFQwPwCcRXDPLCaBvAMNQHFWlIxsN0Q2RP+JhoiPwOFA5JEKskaBmPi1s3DbWGEIq5SBvlMcioWCtdLA9E14Tk5kNKN5G8Sbz/bqbTjNEBAEbypGIsao5Zjat5jZAlM33+yQweYaOPp4JlarWmwrLbo47P1M7hEqdFWSLxR83rYN2AuqVUIAVS/BelM2Myxzq/gMuDfaGij7JUwAAAABJRU5ErkJggg==";

// Set icon:
console.log("| dropdown=false templateImage='"+GITICON+"'");
console.log("---");

repoScraper.fetchAll().then(output).catch(err => {});

// Output:
function output(displayRepos) {
	console.log("OAT repos:");
	console.log("---");
	displayRepos
		.forEach(function(repo) {
            console.log(`${repo.name} (${repo.master} / ${repo.develop})|href=https://github.com/${repo.name}`);
			console.log("--master:", repo.master);
			console.log("--develop:", repo.develop);
			console.log("---");
		});
	// Menubar afters:
	console.log("Options");
	console.log("--Set your Github Personal Access Token in the .env file");
	console.log("--Set your Github org & repo names in config.json");
	console.log("--Reload plugin | refresh=true terminal=false");
	console.log("--Node "+process.version);
}
