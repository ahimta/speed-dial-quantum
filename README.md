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

Group(id: String, name: String, thumbnails: () => Array[Thumbnail])
Tab(groups: Array[Group], thumbnails: Array[Thumbnail])
```

### Constraints

```scala
Tab#groups.map(g => g.thumbnails().length).sum() == Tab#thumbnails.length
```

## Todo

* Extract some parts into their own modules (e.g: UI/DOM)
* Stop logging, especially in content script -\_-
* Add cursor to dial view to
