/* eslint-env: node, es6 */

const github = require('octonode');
const config = require('./config.json');
const token = require('./token.json').gh_token;
var client = github.client(token);

/**
 * Extract file contents from a given repo, branch & file
 *
 * @param {Object} ghrepo
 * @param {String} branch
 * @param {String} filename
 * @returns {String} file content
 */
async function getFileContents(ghrepo, branch, filename = 'manifest.php') {
    var results = await ghrepo.contentsAsync(filename, branch);
    return Buffer.from(results[0].content, 'base64').toString();
}

/**
 * Extract manifest version matching 'version' => '1.2.3'
 *
 * @param {String} manifest file contents
 * @returns {String} version
 */
function extractVersion(manifest) {
    var results = manifest.match(/'version'\s*=>\s*'([\d\.]+)'/);
    return (results && results.length > 1) ? results[1] : 'unknown';
}

/**
 * Fetch details about a repo on Github
 *
 * @param {String} repoName
 * @returns {Promise} object containing repo details
 */
function fetch(repoNameFull) {
    return new Promise((resolve, reject) => {
        var ghrepo = client.repo(repoNameFull);
        if (!ghrepo) return {};

        var masterVersion = getFileContents(ghrepo, 'master').then(extractVersion).catch(console.err);
        var developVersion = getFileContents(ghrepo, 'develop').then(extractVersion).catch(console.err);
    
        return Promise.all([masterVersion, developVersion])
            .then(versions => {
                return {
                    name: repoNameFull,
                    master: versions[0],
                    develop: versions[1]
                };
            })
            .then(resolve)
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

/** 
 * Flattens a JSON structure to allow multiple orgs & repos to be processed as a flat array
 * 
 * @param {Object} json - typically direct from config file
 * @returns {Array}
 */
function flatten(json) {
    return [].concat(...json.map(obj => {
        return obj.repos.map(repoName => `${obj.org}/${repoName}`);
    }));
}

//console.log(flatten(config.enabled));

/** 
 * Start fetching repos data!
 */
module.exports.fetchAll = function fetchAll() {
    return Promise.all(
        flatten(config.enabled)
        .map(fetch)
    );
};
