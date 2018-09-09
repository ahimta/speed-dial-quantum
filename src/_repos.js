const platform = require('./_platform')

const groupEntity = require('./entities/group')
const tabEntity = require('./entities/tab')
const thumbnailEntity = require('./entities/thumbnail')

exports.group = {
  add: async ({ name, rows, cols, thumbnailImgSize = null }) => {
    const oldGroups = await getOldGroups()
    const { newGroup, newGroups } = groupEntity.add(oldGroups, {
      name,
      rows,
      cols,
      thumbnailImgSize
    })

    await updateGroups(newGroups)

    return newGroup
  },
  list: getOldGroups,
  remove: async id => {
    const oldGroups = await getOldGroups()
    const newGroups = groupEntity.remove(oldGroups, id)

    await updateGroups(newGroups)
  },
  replace: updateGroups,
  update: async (
    id,
    { name = null, rows = 0, cols = 0, thumbnailImgSize = null } = {}
  ) => {
    const oldGroups = await getOldGroups()
    const { newGroup, newGroups } = groupEntity.update(oldGroups, id, {
      name,
      rows,
      cols,
      thumbnailImgSize
    })

    await updateGroups(newGroups)

    return newGroup
  }
}

exports.settings = {
  shiftRequired: async (required = null) => {
    if (typeof required === 'boolean') {
      await platform.set('shiftRequired', required)
    } else {
      return platform.get('shiftRequired')
    }
  }
}

exports.tab = {
  addGroup: async ({ name, rows, cols, thumbnailImgSize = 'auto' }) => {
    const [oldGroups, oldThumbnails] = await Promise.all([
      getOldGroups(),
      getOldThumbnails()
    ])

    const { newGroups, newThumbnails, newGroup } = tabEntity.addGroup(
      oldGroups,
      oldThumbnails,
      { name, rows, cols, thumbnailImgSize }
    )

    await Promise.all([
      updateGroups(newGroups),
      updateThumbnails(newThumbnails)
    ])

    return newGroup
  },
  moveGroupDown: async groupId => {
    const [oldGroups, oldThumbnails] = await Promise.all([
      exports.group.list(),
      exports.thumnail.list()
    ])
    const { newGroups, newThumbnails } = tabEntity.moveGroupDown(
      oldGroups,
      oldThumbnails,
      groupId
    )

    await Promise.all([
      exports.group.replace(newGroups),
      exports.thumnail.replace(newThumbnails)
    ])
  },
  moveGroupUp: async groupId => {
    const [oldGroups, oldThumbnails] = await Promise.all([
      exports.group.list(),
      exports.thumnail.list()
    ])
    const { newGroups, newThumbnails } = tabEntity.moveGroupUp(
      oldGroups,
      oldThumbnails,
      groupId
    )

    await Promise.all([
      exports.group.replace(newGroups),
      exports.thumnail.replace(newThumbnails)
    ])
  },
  removeGroup: async groupId => {
    const [oldGroups, oldThumbnails] = await Promise.all([
      exports.group.list(),
      exports.thumnail.list()
    ])
    const { newGroups, newThumbnails } = tabEntity.removeGroup(
      oldGroups,
      oldThumbnails,
      groupId
    )

    await Promise.all([
      exports.group.replace(newGroups),
      exports.thumnail.replace(newThumbnails)
    ])
  }
}

exports.thumnail = {
  add: async ({ groupId, url = '', title = null, imgUrl = null }) => {
    window.alert(
      'Adding and removing thumbnails for groups with no rows and columns is' +
        ' no longer supported. Please update your groups to have rows columns :).'
    )
  },
  imgUrl: async (id, imgUrl = null) => {
    const key = `imgUrl-${id}`

    if (imgUrl) {
      await exports.thumnail.update(id, { deleteDeprecatedImgUrl: true })
      return platform.set(key, imgUrl)
    } else {
      return platform.get(key)
    }
  },
  list: getOldThumbnails,
  remove: async id => {
    window.alert(
      'Adding and removing thumbnails for groups with no rows and columns is' +
        ' no longer supported. Please update your groups to have rows columns :).'
    )
  },
  replace: updateThumbnails,
  resizeByGroupId: async (groupId, rows, cols) => {
    const newThumbnails = thumbnailEntity.resizeByGroupId(
      await getOldThumbnails(),
      groupId,
      rows,
      cols
    )

    await updateThumbnails(newThumbnails)
  },
  update: async (
    id,
    {
      url = null,
      groupId = null,
      title = null,
      deleteDeprecatedImgUrl = false,
      reset = false
    } = {}
  ) => {
    const { newThumbnail, newThumbnails } = thumbnailEntity.update(
      await getOldThumbnails(),
      id,
      {
        groupId,

        url,
        title,

        deleteDeprecatedImgUrl,
        reset
      }
    )

    await updateThumbnails(newThumbnails)

    if (reset) {
      await removeImgUrl(id)
    }

    return newThumbnail
  }
}

exports.backup = async () => {
  const [storedGroups, storedThumbnails] = await Promise.all([
    exports.group.list(),
    exports.thumnail.list()
  ])

  const thumbnails = storedThumbnails.map(({ id, groupId, title, url }) => ({
    id,
    groupId,

    title: title || null,
    url: url || null
  }))

  const groups = storedGroups.map(
    ({ id, name, rows, cols, thumbnailImgSize }) => ({
      id,
      name,

      rows: rows || null,
      cols: cols || null,
      thumbnailImgSize: thumbnailImgSize || null,

      thumbnails: thumbnails.filter(({ groupId }) => groupId === id)
    })
  )

  const imgsUrls = (await Promise.all(
    storedThumbnails.map(async ({ id: thumbnailId, imgUrl }) => ({
      thumbnailId,
      imgUrl: (await platform.get(`imgUrl-${thumbnailId}`)) || imgUrl || null
    }))
  )).filter(({ imgUrl }) => imgUrl)

  return { groups, imgsUrls }
}

async function getOldGroups () {
  const storedGroups = await platform.get('groups')
  const { groups, newThumbnails } = await groupEntity.list(
    storedGroups,
    platform.topSites
  )

  if (newThumbnails) {
    await platform.set('groups', groups)
    await platform.set('thumbnails', newThumbnails)
  }

  return groups
}

function removeImgUrl (id) {
  const key = `imgUrl-${id}`
  return platform.set(key, null)
}

function updateGroups (newGroups) {
  return platform.set('groups', newGroups)
}

async function getOldThumbnails () {
  const storedThumbnails = await platform.get('thumbnails')

  return thumbnailEntity.list(storedThumbnails)
}

function updateThumbnails (newThumbnails) {
  return platform.set('thumbnails', newThumbnails)
}
