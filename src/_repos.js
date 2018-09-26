const platform = require('./_platform')

const groupEntity = require('./entities/group')
const tabEntity = require('./entities/tab')
const thumbnailEntity = require('./entities/thumbnail')

exports.group = {
  list: getOldGroups
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

    await updateGroupsAndThumbnails(newGroups, newThumbnails)

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

    await updateGroupsAndThumbnails(newGroups, newThumbnails)
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

    await updateGroupsAndThumbnails(newGroups, newThumbnails)
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

    await updateGroupsAndThumbnails(newGroups, newThumbnails)
  },
  updateGroup: async (
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

    const newThumbnails = thumbnailEntity.resizeByGroupId(
      await getOldThumbnails(),
      id,
      rows,
      cols
    )

    await updateGroupsAndThumbnails(newGroups, newThumbnails)

    return newGroup
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
  const [groups, thumbnails] = await Promise.all([
    exports.group.list(),
    exports.thumnail.list()
  ])

  return { groups, thumbnails }
}

exports.restore = async (groups, thumbnails, imgsUrls) => {
  await updateGroupsAndThumbnails(groups, thumbnails)

  await Promise.all(
    imgsUrls.map(({ thumbnailId, imgUrl }) =>
      exports.thumnail.imgUrl(thumbnailId, imgUrl)
    )
  )
}

async function getOldGroups () {
  const storedGroups = await platform.get('groups')
  const { groups, newThumbnails } = await groupEntity.list(
    storedGroups,
    platform.topSites
  )

  if (newThumbnails) {
    await updateGroupsAndThumbnails(groups, newThumbnails)
  }

  return groups
}

function removeImgUrl (id) {
  const key = `imgUrl-${id}`
  return platform.set(key, null)
}

function updateGroupsAndThumbnails (groups, thumbnails) {
  return platform.setMany({ groups, thumbnails })
}

async function getOldThumbnails () {
  const storedThumbnails = await platform.get('thumbnails')

  return thumbnailEntity.list(storedThumbnails)
}

function updateThumbnails (newThumbnails) {
  return platform.set('thumbnails', newThumbnails)
}
