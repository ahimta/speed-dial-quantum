# Speed Dial Quantum

[![Build Status](https://travis-ci.org/Ahimta/speed-dial-quantum.svg?branch=master)](https://travis-ci.org/Ahimta/speed-dial-quantum)

## Development

1.  `yarn install --emoji`
2.  `yarn start`

## Test

1.  `yarn install --emoji`
2.  `yarn test`

## Design (in Scala)

### Entities

* `Thumbnail(id: String, groupId: String, title: String, url: String, imgUrl: Option[String])`
* `Group(id: String, name: String, thumbnails: () => Array[Thumbnail])`
* `Tab(groups: Array[Group], thumbnails: Array[Thumbnail])`

### Constraints

* `Tab#groups.map(g => g.thumbnails().length).sum() == Tab#thumbnails.length`
