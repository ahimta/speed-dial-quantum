const platform = require('./_platform')
const utils = require('./_utils')

const groupEntity = require('./entities/group')

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

exports.thumnail = {
  add: async ({ groupId, url = '', title = null, imgUrl = null }) => {
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.concat({
      id: utils.uuid(),
      groupId,

      title: title || url || null,
      url: url || null,
      imgUrl: imgUrl || null
    })

    const groups = await exports.group.list()
    await exports.sync(groups, newThumbnails)
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
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.filter(t => t.id !== id)
    await updateThumbnails(newThumbnails)
  },
  replace: updateThumbnails,
  resizeByGroupId: async (groupId, rows, cols) => {
    const oldThumbnails = await getOldThumbnails()
    const groupThumbnails = oldThumbnails.filter(
      ({ groupId: gId }) => gId === groupId
    )

    if (groupThumbnails.length === rows * cols) {
      return
    }

    const firstThumbnail = groupThumbnails[0]
    const lastThumbnail = groupThumbnails[groupThumbnails.length - 1]
    const firstThumbnailIndex = oldThumbnails.indexOf(firstThumbnail)
    const lastThumbnailIndex = oldThumbnails.lastIndexOf(lastThumbnail)

    let newThumbnails = null
    if (groupThumbnails.length > rows * cols) {
      newThumbnails = oldThumbnails
        .slice(0, firstThumbnailIndex + rows * cols)
        .concat(oldThumbnails.slice(lastThumbnailIndex + 1))
    }

    if (groupThumbnails.length < rows * cols) {
      const fillingLength = rows * cols - groupThumbnails.length
      const emptyThumbnails = new Array(fillingLength)
      for (let i = 0; i < fillingLength; i++) {
        emptyThumbnails[i] = {
          groupId,
          id: utils.uuid(),
          imgUrl: null,
          title: null,
          url: null
        }
      }
      newThumbnails = oldThumbnails
        .slice(0, lastThumbnailIndex + 1)
        .concat(emptyThumbnails)
        .concat(oldThumbnails.slice(lastThumbnailIndex + 1))
    }

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
    const oldThumbnails = await getOldThumbnails()
    const thumbnail = oldThumbnails.filter(t => t.id === id)[0]

    if (!thumbnail) {
      throw new Error(
        `thumbnailRepo.update: thumbnail with id "${id}" not found`
      )
    }

    const index = oldThumbnails.indexOf(thumbnail)
    const newThumbnail = !reset
      ? {
        id: thumbnail.id,
        groupId: groupId || thumbnail.groupId,

        title: title || thumbnail.title || null,
        url: url || thumbnail.url || null,
        imgUrl: deleteDeprecatedImgUrl ? null : thumbnail.imgUrl || null
      }
      : {
        id: thumbnail.id,
        groupId: thumbnail.groupId,
        title: null,
        url: null,
        imgUrl: null
      }

    const newThumbnails = oldThumbnails
      .slice(0, index)
      .concat(newThumbnail, ...oldThumbnails.slice(index + 1))

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

exports.sync = async (groups, thumbnails) => {
  const thumnailsByGroupId = thumbnails.reduce((byId, thumbnail) => {
    const groupId = thumbnail.groupId
    byId[groupId] = byId[groupId] || []
    byId[groupId].push(thumbnail)
    return byId
  }, {})

  const sortedThumbnails = Array.prototype.concat(
    ...groups.map(({ id }) => thumnailsByGroupId[id] || [])
  )

  await Promise.all([
    exports.group.replace(groups),
    exports.thumnail.replace(sortedThumbnails)
  ])
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
  return platform.set('groups', groupEntity.map(newGroups))
}

async function getOldThumbnails () {
  const storedThumbnails = await platform.get('thumbnails')

  if (!Array.isArray(storedThumbnails)) {
    return []
  }

  return storedThumbnails.map(({ groupId, id, title, url, imgUrl }) => ({
    groupId,
    id,

    title: title || null,
    url: url || null,
    imgUrl: imgUrl || null
  }))
}

function updateThumbnails (newThumbnails) {
  return platform.set('thumbnails', newThumbnails)
}
