/* eslint-env: node, es6 */

const timeAgo = require('date-fns/distance_in_words_to_now');
const daysDiff = require('date-fns/difference_in_days');
const parseDate = require('date-fns/parse');
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
async function getFileContents(ghrepo, branch = 'master', filename = 'manifest.php') {
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

async function getVersion(ghrepo, branch = 'master') {
    var toTry = ['manifest.php', 'package.json'];
    var version = await getFileContents(gherpo, branch, toTry[0]).then(extractVersion);
    return version;
}

/**
 * Retrieve last commit & author info from a branch
 *
 * @param {Object} ghrepo
 * @param {String} branch
 * @returns {Object} - relevant info about the commit
 */
async function getLastCommitOnBranch(ghrepo, branch = 'master') {
    var branch = await ghrepo.branchAsync(branch);
    //console.log('<b>', branch[0].commit, '</b>');
    if (branch[0] && branch[0].commit) {
        //console.log('<c>', commit, '</c>');
        return {
            author: branch[0].commit.author.login,
            date: timeAgo(parseDate(branch[0].commit.commit.author.date)),
            sha: branch[0].commit.sha.slice(0,7)
        };
    }
    return null;
}

/**
 * Reports the number of open PRs in a repo that were updated recently
 *
 * @param {Object} ghrepo
 * @param {String} branch
 * @param {Number} days - how old a PR to consider
 * @returns {Promise<Number>} - resolves with the number of open PRs touched in last N days
 */
async function getRecentPRCount(ghrepo, branch = 'master', days = 70) {
    var prs = await ghrepo.prsAsync();
    return prs[0].filter(pr => {
        // restrict by state & date:
        var diff = Math.abs(daysDiff(Date.now(), parseDate(pr.updated_at)));
        // console.log(pr.state);
        // console.log(diff);
        return pr.state === 'open';// && diff < days;
    }).length;
}

/**
 * Reports whether branch1 is ahead, behind or equal with branch2
 *
 * @param {Object} ghrepo
 * @param {String} branch1
 * @param {String} branch2
 * @returns {Promise<String>} - resolves with status description
 */
async function getComparison(ghrepo, branch1 = 'master', branch2 = 'develop') {
    var comp = await ghrepo.compareAsync(branch1, branch2);
    comp = comp[0];
    var status = (comp.status === 'identical') ? `equal with`
    : (comp.ahead_by) ? `${comp.ahead_by} commits ahead of`
    : (comp.behind_by) ? `${comp.behind} commits behind`
    : `??? to`;
    // console.log(status);
    return `${branch1} is ${status} ${branch2}`
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

        // if master exists:
        var masterVersion = getFileContents(ghrepo, 'master').then(extractVersion);
        var masterLast = getLastCommitOnBranch(ghrepo, 'master');
        // if develop exists:
        var developVersion = getFileContents(ghrepo, 'develop').then(extractVersion);
        var developLast = getLastCommitOnBranch(ghrepo, 'develop');
        // extra:
        var recentPRs = getRecentPRCount(ghrepo);
        var status = getComparison(ghrepo);

        return Promise.all([masterVersion, developVersion, masterLast, developLast, recentPRs, status])
            .then(([masterVersion, developVersion, masterLast, developLast, recentPRs, status]) => {
                return {
                    name: repoNameFull,
                    master: {
                        version: masterVersion || '?',
                        lastAuthor: masterLast.author || 'unknown',
                        lastDate: masterLast.date || 'unknown',
                        lastSHA: masterLast.sha || 'unknown'
                    },
                    develop: {
                        version: developVersion || '?',
                        lastAuthor: developLast.author || 'unknown',
                        lastDate: developLast.date || 'unknown',
                        lastSHA: developLast.sha || 'unknown'
                    },
                    recentPRs: recentPRs || 0,
                    status: status
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

/**
 * Start fetching repos data!
 */
module.exports.fetchAll = function fetchAll() {
    return Promise.all(
        flatten(config.enabled)
        .map(fetch)
    );
};

module.exports.getApiLeft = async function getApiLeft() {
    var limit = await client.limitAsync();
    return limit[0];
}
