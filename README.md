# The OAT Repos BitBar Plugin

Puts your OAT repo stats in your Mac menu bar.

## Prerequisites

This will run on systems with Mac OSX, [BitBar](), [Node.js]() >= 7.6 & [npm]() installed.

## Install

(1) Clone the repo to your hard disk
(2) npm install it
(3) Symlink the entry point into your BitBar plugins folder.

```
cd /path/to/your/bitbar/plugins/folder
git clone https://github.com/mn113/oatrepos-bitbar.git
cd oatrepos-bitbar
npm install
ln -s oatrepos.2h.js ../oatrepos.2h.js
chmod +x ../oatrepos.2h.js
```

Please configure the access token before using.

## Configure

From your Github account, generate a new [Personal Access Token](https://github.com/settings/tokens) with 'repo' permissions.

Duplicate the file `token.json.dist` as `token.json` and paste your token into this new file.

Configure the list of orgs and repos you want to see in `config.json`. Please note, this plugin is specifically designed to look for a `manifest.php` in the root of each repo. If there isn't one, the repo will be skipped. If you add a repo which doesn't have `master`/`develop` branches, limited info may be shown.

## Usage

## Limitations

BitBar plugins are pretty good at fetching and showing information, but making them do something interactive is a real hassle. So don't expect to find many cool features in the future.

Some repos are private; the plugin will only have read access to parts of Github that the account which created the Personal Access Token has access to.

## Contribute

Contributions & suggestions welcome by [Issue](issues) or [PR](pulls)!
