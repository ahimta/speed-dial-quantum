import * as platform from './_platform'
import * as utils from './_utils'

export const group = {
  add: async ({ name, rows, cols }) => {
    const oldGroups = await getOldGroups()
    const newGroup = {
      id: utils.uuid(),
      name,
      rows: rows || null,
      cols: cols || null
    }
    const newGroups = oldGroups.concat(newGroup)
    await updateGroups(newGroups)
    return newGroup
  },
  list: getOldGroups,
  remove: async id => {
    const oldGroups = await getOldGroups()
    const newGroups = oldGroups.filter(t => t.id !== id)
    await updateGroups(newGroups)
  },
  replace: updateGroups,
  update: async (id, { name = null, rows = 0, cols = 0 } = {}) => {
    const oldGroups = await getOldGroups()
    const group = oldGroups.filter(t => t.id === id)[0]

    if (!group) {
      throw new Error(`groupRepo.update: group with id "${id}" not found`)
    }

    const index = oldGroups.indexOf(group)
    const newGroup = {
      id: group.id,
      name: name || group.name,

      rows: rows || group.rows || null,
      cols: cols || group.cols || null
    }

    const newGroups = oldGroups
      .slice(0, index)
      .concat(newGroup, ...oldGroups.slice(index + 1))

    await updateGroups(newGroups)
    return newGroup
  }
}

export const settings = {
  shiftRequired: async (required = null) => {
    if (typeof required === 'boolean') {
      await platform.set('shiftRequired', required)
    } else {
      return platform.get('shiftRequired')
    }
  }
}

export const thumnail = {
  add: async ({ groupId, url = '', title = null, imgUrl = null }) => {
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.concat({
      id: utils.uuid(),
      groupId,

      title: title || url || null,
      url: url || null,
      imgUrl: imgUrl || null
    })

    const groups = await group.list()
    await sync(groups, newThumbnails)
  },
  imgUrl: async (id, imgUrl = null) => {
    const key = `imgUrl-${id}`

    if (imgUrl) {
      await thumnail.update(id, { deleteDeprecatedImgUrl: true })
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

export async function backup () {
  const [storedGroups, storedThumbnails] = await Promise.all([
    group.list(),
    thumnail.list()
  ])

  const thumbnails = storedThumbnails.map(({ id, groupId, title, url }) => ({
    id,
    groupId,

    title: title || null,
    url: url || null
  }))

  const groups = storedGroups.map(({ id, name, rows, cols }) => ({
    id,
    name,

    rows: rows || null,
    cols: cols || null,

    thumbnails: thumbnails.filter(({ groupId }) => groupId === id)
  }))

  const imgsUrls = (await Promise.all(
    storedThumbnails.map(async ({ id: thumbnailId, imgUrl }) => ({
      thumbnailId,
      imgUrl: (await platform.get(`imgUrl-${thumbnailId}`)) || imgUrl || null
    }))
  )).filter(({ imgUrl }) => imgUrl)

  return { groups, imgsUrls }
}

export async function sync (groups, thumbnails) {
  const thumnailsByGroupId = thumbnails.reduce((byId, thumbnail) => {
    const groupId = thumbnail.groupId
    byId[groupId] = byId[groupId] || []
    byId[groupId].push(thumbnail)
    return byId
  }, {})

  const sortedThumbnails = Array.prototype.concat(
    ...groups.map(({ id }) => thumnailsByGroupId[id] || [])
  )

  await Promise.all([group.replace(groups), thumnail.replace(sortedThumbnails)])
}

async function getOldGroups () {
  const storedGroups = await platform.get('groups')

  if (!Array.isArray(storedGroups) || storedGroups.length === 0) {
    const group = {
      id: 'd7bc0008-67ec-478f-b792-ae9591574939',
      name: 'Your Default Group',
      rows: 3,
      cols: 3
    }

    const sites = await platform.topSites()
    const defaultThumbnails = new Array(9)

    for (let i = 0; i < 9; i++) {
      const site = sites[i] || { url: null, title: null }

      defaultThumbnails[i] = {
        id: utils.uuid(),
        groupId: 'd7bc0008-67ec-478f-b792-ae9591574939',
        title: site.title || null,
        url: site.url || null,
        imgUrl: null
      }
    }

    await platform.set('groups', [group])
    await platform.set('thumbnails', defaultThumbnails)

    return [group]
  }

  return storedGroups.map(({ id, name, rows, cols }) => ({
    id,
    name,

    rows: rows || null,
    cols: cols || null
  }))
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
