const factories = require('../_factories')
const groupEntity = require('./group')

describe('groupEntity.add()', () => {
  test('With Existing Groups Empty', () => {
    const group = factories.group()
    const expectedGroup = {
      id: getUuidMatcher(),
      name: group.name,

      rows: group.rows,
      cols: group.cols,
      thumbnailImgSize: group.thumbnailImgSize
    }
    const expected = {
      newGroup: expectedGroup,
      newGroups: [expectedGroup]
    }

    const result = groupEntity.add([], group)

    expect(result).toEqual(expected)
  })

  test('With Existing Groups Non-Empty', () => {
    const oldGroups = [factories.group()]
    const group = factories.group()

    const { newGroup, newGroups } = groupEntity.add(oldGroups, group)
    const expectedGroup = {
      id: getUuidMatcher(),
      name: group.name,

      rows: group.rows,
      cols: group.cols,
      thumbnailImgSize: group.thumbnailImgSize
    }

    expect(newGroup).toEqual(expectedGroup)
    expect(newGroups).toEqual(oldGroups.concat([expectedGroup]))
  })
})

describe('groupEntity.list()', () => {
  test('With Groups Non-Existent', async () => {
    const groupId = 'd7bc0008-67ec-478f-b792-ae9591574939'
    const expected = {
      groups: [
        {
          id: 'd7bc0008-67ec-478f-b792-ae9591574939',
          name: 'Your Default Group',
          rows: 3,
          cols: 3,
          thumbnailImgSize: null
        }
      ],
      newThumbnails: [
        { groupId, id: getUuidMatcher(), url: 'u0', title: 't0', imgUrl: null },
        { groupId, id: getUuidMatcher(), url: 'u1', title: 't1', imgUrl: null },
        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },

        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },
        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },
        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },

        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },
        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null },
        { groupId, id: getUuidMatcher(), url: null, title: null, imgUrl: null }
      ]
    }

    const result = await groupEntity.list(null, getTopSites)
    expect(result).toEqual(expected)

    function getTopSites () {
      return Promise.resolve([
        { url: 'u0', title: 't0' },
        { url: 'u1', title: 't1' }
      ])
    }
  })

  test('With Some Groups Already Existent', async () => {
    const oldGroups = [factories.group()]
    const expected = { groups: oldGroups, newThumbnails: null }
    const result = await groupEntity.list(oldGroups, null)

    expect(result).toEqual(expected)
  })
})

describe('groupEntity.map()', () => {
  const group = {
    id: 'uuid:)',
    name: 'hi',
    rows: undefined,
    cols: undefined,
    thumbnailImgSize: undefined
  }
  const expectedGroup = {
    id: 'uuid:)',
    name: 'hi',

    rows: null,
    cols: null,
    thumbnailImgSize: null
  }

  test('With a Single Group', () => {
    expect(groupEntity.map(group)).toEqual(expectedGroup)
  })

  test('With Multiple Groups', () => {
    expect(groupEntity.map([group])).toEqual([expectedGroup])
  })
})

describe('groupEntity.remove()', () => {
  test('With Groups Non-Existent', () => {
    expect(groupEntity.remove([], 'uuid:)')).toEqual([])
  })

  test('With Some Groups', () => {
    const groups = [
      { id: 'uuid:)0' },
      { id: 'uuid:)1' },
      { id: 'uuid:)2' },
      { id: 'uuid:)3' }
    ]

    expect(groupEntity.remove(groups, 'uuid:)2')).toEqual([
      { id: 'uuid:)0' },
      { id: 'uuid:)1' },
      { id: 'uuid:)3' }
    ])
  })
})

describe('groupEntity.update()', () => {
  test('With Existing Group', () => {
    const groups = [factories.group(), factories.group(), factories.group()]
    const group = groups[1]
    const update = { name: 'n', rows: 1, cols: 2, thumbnailImgSize: 'small' }

    const expectedGroup = {
      id: group.id,
      name: update.name,

      rows: update.rows,
      cols: update.cols,
      thumbnailImgSize: update.thumbnailImgSize
    }

    const expected = {
      newGroup: expectedGroup,
      newGroups: [groups[0], expectedGroup, groups[2]]
    }
    const result = groupEntity.update(groups, group.id, update)

    expect(result).toEqual(expected)
  })

  test('With Non-Existing Group', () => {
    expect(() =>
      groupEntity.update([factories.group()], factories.uuid())
    ).toThrow()
  })
})

function getUuidMatcher () {
  const uuidRegexp = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  return expect.stringMatching(uuidRegexp)
}
