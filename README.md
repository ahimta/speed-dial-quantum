# Speed Dial Quantum

[![Travis](https://img.shields.io/travis/Ahimta/speed-dial-quantum.svg?style=flat-square)](https://travis-ci.org/Ahimta/speed-dial-quantum)
[![Known Vulnerabilities](https://snyk.io/test/github/Ahimta/speed-dial-quantum/badge.svg?style=flat-square)](https://snyk.io/test/github/Ahimta/speed-dial-quantum)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/Ahimta/speed-dial-quantum.svg?style=flat-square)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/maintainability)
[![Code Climate](https://img.shields.io/codeclimate/Ahimta/speed-dial-quantum.svg?style=flat-square)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/test_coverage)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![license](https://img.shields.io/github/license/Ahimta/speed-dial-quantum.svg?style=flat-square)](https://github.com/Ahimta/speed-dial-quantum)
[![Inline docs](http://inch-ci.org/github/Ahimta/speed-dial-quantum.svg?branch=master&style=flat-square)](http://inch-ci.org/github/Ahimta/speed-dial-quantum)

[![Mozilla Add-on](https://img.shields.io/amo/v/speed-dial-quantum.svg?style=flat-square)](https://addons.mozilla.org/en-GB/firefox/addon/speed-dial-quantum)
[![Mozilla Add-on](https://img.shields.io/amo/d/speed-dial-quantum.svg?style=flat-square)](https://addons.mozilla.org/en-GB/firefox/addon/speed-dial-quantum/)
[![Mozilla Add-on](https://img.shields.io/amo/users/speed-dial-quantum.svg?style=flat-square)](https://addons.mozilla.org/en-GB/firefox/addon/speed-dial-quantum/)
[![Mozilla Add-on](https://img.shields.io/amo/stars/speed-dial-quantum.svg?style=flat-square)](https://addons.mozilla.org/en-GB/firefox/addon/speed-dial-quantum)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fadmmkodlffpamiglnmodpkmbpalbkmp.svg?style=flat-square)](https://chrome.google.com/webstore/detail/speed-dial-quantum/fadmmkodlffpamiglnmodpkmbpalbkmp)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/fadmmkodlffpamiglnmodpkmbpalbkmp.svg?style=flat-square)](https://chrome.google.com/webstore/detail/speed-dial-quantum/fadmmkodlffpamiglnmodpkmbpalbkmp)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/fadmmkodlffpamiglnmodpkmbpalbkmp.svg?style=flat-square)](https://chrome.google.com/webstore/detail/speed-dial-quantum/fadmmkodlffpamiglnmodpkmbpalbkmp)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/price/fadmmkodlffpamiglnmodpkmbpalbkmp.svg?style=flat-square)](https://chrome.google.com/webstore/detail/speed-dial-quantum/fadmmkodlffpamiglnmodpkmbpalbkmp)

Minimal speed-dial extension with support for keyboard shortcuts & importing Speed Dial pages

## Build

```bash
yarn install --emoji
yarn run build
```

## Develop

```bash
yarn install --emoji
yarn run build
yarn start

# in another terminal window/tab
yarn run watch
```

## Test

```bash
yarn install --emoji
yarn run build
yarn test
```

## Package

```bash
yarn install --emoji
NODE_ENV=production yarn run build
yarn run package
```

## Publish Packeged Extension

1. Make sure you've made a release commit that only updates the version and have a `Release <version>:smiley:` message
2. Clone the repo locally and zip it (to upload it later to Mozilla). Using something like `cd <path-to-use> && git clone <local-repo-path> && zip -r speed-dial-quantum.zip speed-dial-quantum`
3. Go to extension's Mozilla page and submit packaged extension (enabling only desktop platforms and not Android) and don't forget to upload the cloned local repo (required by Mozilla because the code is transformed using Rollup, etc...)
4. Go to extension's Chrome store page and submit packaged extension and don't forget to publish it

## Upgrade Packages

1.  Run `yarn outdated --emoji`
2.  Check changelogs from URLs
3.  Run `yarn upgrade --emoji`
4.  Run `yarn add <package>@^<version> --emoji` for breaking updates
5.  Run `yarn run nsp` to check for vulnerabilities
6.  Make sure `yarn run {build,package,test,watch}` still work correctly

## Download & Update Static Dependencies

1. `cd vendor`
2. Download using `wget -O <dep-name>-<dep-version>.<dep-extension> <dep-url>`
3. Run `cat <dep-file-name> | openssl dgst -sha384 -binary | openssl base64 -A`
4. Copy output and add it as an `integrity` HTML atribute
5. Update HTML's tag reference (`href` or `src`)
6. Remove older version files
7. Try the extension and make sure everything works

## Design (in Scala)

### Entities

```scala
Thumbnail(
  id: String,
  groupId: String,

  title: Option[String],
  url: Option[String],
  // @deprecated
  imgUrl: Option[String],

  faviconImgUrl: () => String
)

Group(
  id: String,
  name: String,

  rows: Option[Int],
  cols: Option[Int],
  thumbnailImgSize: Option["auto" | "small" | "medium" | "large"],

  thumbnails: () => Array[Thumbnail],
)

Tab(groups: Array[Group], thumbnails: Array[Thumbnail])
```

### Constraints

```scala
Tab#groups.map(g => g.thumbnails().length).sum() == Tab#thumbnails.length
```

## Architecture

| Layer (explanation)                                                      |
| ------------------------------------------------------------------------ |
| Content (JS injected into all web pages), Newtab (HTML/JS for newtab)    |
| Event Handlers (dial-view & shortcuts in Content & Newtab)               |
| Background (receive messages from Content & Newtab, using Repos)         |
| Repos (handles the data-management/persistence using the Platform)       |
| Platform (thin-layer on-top of browser web-ext. APIs), Speed Dial Import |
| ES2017 JS (native browser/DOM APIs without any libraries:smiley:)        |

## Known Issues & Limitations

- Keyboard shortcuts only work when the page is focused (because a content
  script is used)
- `Alt` shortcuts don't work properly on Firefox Windows:sweat_smile:
- Watching files seems to stop after a couple of minutes:sweat_smile:

## Todo

- Replace injected web scripts with global shortcut
- Add specs for `tab` and `thumbnail` entites
- Auomated tests, better architecture, etc...
