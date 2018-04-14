# Speed Dial Quantum

[![Build Status](https://travis-ci.org/Ahimta/speed-dial-quantum.svg?branch=master)](https://travis-ci.org/Ahimta/speed-dial-quantum)
[![Maintainability](https://api.codeclimate.com/v1/badges/15c3eccd9ed65250d0d1/maintainability)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/15c3eccd9ed65250d0d1/test_coverage)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/test_coverage)

Minimal speed-dial extension with support for keyboard shortcuts & importing Speed Dial pages

## Build

1.  `yarn install --emoji`
2.  `yarn run build`

## Development

1.  `yarn install --emoji`
2.  `yarn run build`
3.  `yarn start`
4.  `yarn run watch` (in another terminal tab)

## Test

1.  `yarn install --emoji`
2.  `yarn run build`
3.  `yarn test`

## Package

1.  `yarn install --emoji`
2.  `yarn run build`
3.  `yarn run package`

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
| ES2017 JS (native browser/DOM APIs without any libraries :))             |

## Know Issues & Limitations

* Keyboard shortcuts only work when the page is focused (because a content
  script is used)

## Todo

* Add support for opening all thunmbnails in a group at once (in new tabs)
* Add support for updating groups (name, rows, and columns)
* Add cursor to dial view
