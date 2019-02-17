/* eslint-env: node, es6 */

const timeAgo = require('date-fns/distance_in_words_to_now');
const daysDiff = require('date-fns/difference_in_days');
const parseDate = require('date-fns/parse');
const github = require('octonode');
const config = require('./config.json');
const token = require('./token.json').gh_token;
var client = github.client(token);

const silently = (err) => null;

/**
 * Extract file contents from a given repo, branch & file
 *
 * @param {Object} ghrepo
 * @param {String} branch
 * @param {String} filename
 * @returns {String} file content
 */
async function getFileContents(ghrepo, branch = 'master', filename = 'manifest.php') {
    var results = await ghrepo.contentsAsync(filename, branch).catch(silently);
    if (results) return Buffer.from(results[0].content, 'base64').toString();
    else return null;
}

/**
 * Extract manifest version matching 'version' => '1.2.3'
 *
 * @param {String} contents file contents
 * @param {String} filename
 * @returns {String} version
 */
function extractVersion(filename, contents) {
    if (!contents) return null;
    var results = (filename === 'manifest.php') ? contents.match(/'version'\s*=>\s*'([\d\.]+)'/)
    : (filename === 'package.json') ? contents.match(/"version"\s*:\s*"([\d\.]+)"/)
    : [];
    return (results && results.length > 1) ? results[1] : 'unknown';
}

/**
 * Extract version from a given repo & branch.
 * Looks in a variety of standard package files until it finds a match
 *
 * @param {Object} ghrepo
 * @param {String} branch
 * @returns {String} version (if found)
 */
async function getVersion(ghrepo, branch = 'master') {
    var version = await getFileContents(ghrepo, branch, 'manifest.php')
        .then(extractVersion.bind(null, 'manifest.php'))
        .catch(silently);
    if (!version) version = await getFileContents(ghrepo, branch, 'package.json')
        .then(extractVersion.bind(null, 'package.json'))
        .catch(silently);
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
    if (branch[0] && branch[0].commit) {
        return {
            author: branch[0].commit.author.login,
            date: timeAgo(parseDate(branch[0].commit.commit.author.date)),
            sha: branch[0].commit.sha.slice(0,7)
        };
    }
    else return null;
}

/**
 * Reports the number of open PRs in a repo that were updated recently
 *
 * @param {Object} ghrepo
 * @param {Number} days - how old a PR to consider
 * @returns {Promise<Number>} - resolves with the number of open PRs touched in last N days
 */
async function getRecentPRCount(ghrepo, thresholdDays = 7) {
    var prs = await ghrepo.prsAsync();
    return prs[0].filter(pr => {
        // restrict by state & date:
        var diff = Math.abs(daysDiff(Date.now(), parseDate(pr.updated_at)));
        return pr.state === 'open' && diff < thresholdDays;
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
    var comparison = await ghrepo.compareAsync(branch1, branch2);
    comparison = comparison[0];
    var status = (comparison.status === 'identical') ? `equal with`
    : (comparison.ahead_by) ? `${comparison.ahead_by} commits ahead of`
    : (comparison.behind_by) ? `${comparison.behind} commits behind`
    : `??? to`;
    return `${branch2} is ${status} ${branch1}`
}


/**
 * Fetch details about a repo on Github
 *
 * @param {String} repoNameFull - e.g. mn113/oatrepos-bitbar
 * @returns {Promise} object containing repo details
 */
function fetch(repoNameFull) {
    return new Promise((resolve, reject) => {
        var ghrepo = client.repo(repoNameFull);
        if (!ghrepo) return {};

        // if master exists:
        var masterVersion = getVersion(ghrepo, 'master');
        var masterLast = getLastCommitOnBranch(ghrepo, 'master');
        // if develop exists:
        var developVersion = getVersion(ghrepo, 'develop');
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
                // console.log("Error fetching ", repoNameFull);
                resolve(new Error("Error fetching " + repoNameFull));
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

/**
 * Fetch how many API requests remain
 */
module.exports.getApiLeft = async function getApiLeft() {
    var limit = await client.limitAsync();
    return limit[0];
}
