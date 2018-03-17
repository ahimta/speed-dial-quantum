# Speed Dial Quantum

[![Build Status](https://travis-ci.org/Ahimta/speed-dial-quantum.svg?branch=master)](https://travis-ci.org/Ahimta/speed-dial-quantum)
[![Maintainability](https://api.codeclimate.com/v1/badges/15c3eccd9ed65250d0d1/maintainability)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/15c3eccd9ed65250d0d1/test_coverage)](https://codeclimate.com/github/Ahimta/speed-dial-quantum/test_coverage)

Minimal speed-dial extension with support for keyboard shortcuts & importing Speed Dial pages

## Development

1.  `yarn install --emoji`
2.  `yarn start`

## Test

1.  `yarn install --emoji`
2.  `yarn test`

## Build

1.  `yarn install --emoji`
2.  `yarn build`

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
