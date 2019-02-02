# The OAT Repos BitBar Plugin

Puts OAT repo stats & links in your Mac menu bar.

Configure an unlimited number of Github orgs & repos to display. See at a glance which repos need releasing and what versions they are at. Designed for repos with a `manifest.php` versioning system.

## Prerequisites

This will run on systems with Mac OSX, [BitBar](), [Node.js]() >= 7.6 & [npm]() installed.

## Install

The basic idea is to
* (1) Clone the repo to your hard disk
* (2) `npm install` it
* (3) Symlink the entry point into your BitBar plugins folder.

```
cd /path/to/your/bitbar/plugins/folder
git clone https://github.com/mn113/oatrepos-bitbar.git
cd oatrepos-bitbar
npm install
ln -s oatrepos.2h.js ../oatrepos.2h.js
chmod +x ../oatrepos.2h.js
```

Please also configure the access token before using.

## Configure

### Access Token

From your Github account, generate a new [Personal Access Token](https://github.com/settings/tokens) with 'repo' permissions.

Duplicate the file `token.json.dist` as `token.json` and paste your token into this new file.

### Orgs & repos

Configure the list of orgs and repos you want to see in `config.json`. Please note, this plugin is specifically designed to look for a `manifest.php` in the root of each repo. If there isn't one, the repo will be skipped. If you add a repo which doesn't have `master`/`develop` branches, limited info may be shown.

### Refresh frequency

As with all BitBar plugins, the refresh time is encoded into the filename. The default `oatrepos.2h.js` will scrape Github every 2 hours. Change `2h` to something like `15m`, `30m`, `1h` if you want more frequent updates.

## Limitations

BitBar plugins are pretty good at fetching and showing information, but making them do something interactive is a real hassle. So don't expect to find many cool features in the future.

Some repos are private; the plugin will only have read access to parts of Github that the account which created the Personal Access Token has access to.

## Contribute

Contributions & suggestions welcome by [Issue](issues) or [PR](pulls)!
