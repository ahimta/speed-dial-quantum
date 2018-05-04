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

## Development

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
yarn run build
yarn run package
```

## Design (in Scala)

### Entities

```scala
Thumbnail(
  id: String,
  groupId: String,
  title: Option[String],
  url: Option[String],
  imgUrl: Option[String]
)

Group(
  id: String,
  name: String,
  rows: Option[Int],
  cols: Option[Int],
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

## Know Issues & Limitations

* Keyboard shortcuts only work when the page is focused (because a content
  script is used)

## Todo

* Fix loading large images can slow down loading thumbnails:sweat_smile:
* Fix adding thumbnails is rather hard:sweat_smile:
* Fix default thumbnails use HTTP URLs:sweat_smile:
