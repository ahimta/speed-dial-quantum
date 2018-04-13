import * as platform from './_platform'
import uuid from './_uuid'

export const group = {
  add: async ({ name, rows = 0, cols = 0 }) => {
    const oldGroups = await getOldGroups()
    const newGroup = {
      id: uuid(),
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
  update: async (id, { name = null } = {}) => {
    const oldGroups = await getOldGroups()
    const group = oldGroups.filter(t => t.id === id)[0]

    if (!group) {
      throw new Error(`groupRepo.update: group with id "${id}" not found`)
    }

    const index = oldGroups.indexOf(group)
    const newGroup = { id: group.id, name: name || group.name }

    const newGroups = oldGroups
      .slice(0, index)
      .concat(newGroup, ...oldGroups.slice(index + 1))

    await updateGroups(newGroups)
  }
}

export const thumnail = {
  // @fixme: add thumbnail at correct position at the of its group:sweat_smile:
  add: async ({ groupId, url = '', title = null, imgUrl = null }) => {
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.concat({
      id: uuid(),
      groupId,
      title: title || url,
      url,
      imgUrl
    })

    const groups = await group.list()
    await sync(groups, newThumbnails)
  },
  list: getOldThumbnails,
  remove: async id => {
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.filter(t => t.id !== id)
    await updateThumbnails(newThumbnails)
  },
  replace: updateThumbnails,
  update: async (
    id,
    { url = null, groupId = null, title = null, imgUrl = null } = {}
  ) => {
    const oldThumbnails = await getOldThumbnails()
    const thumbnail = oldThumbnails.filter(t => t.id === id)[0]

    if (!thumbnail) {
      throw new Error(
        `thumbnailRepo.update: thumbnail with id "${id}" not found`
      )
    }

    const index = oldThumbnails.indexOf(thumbnail)
    const newThumbnail = {
      id: thumbnail.id,
      groupId: groupId || thumbnail.groupId,
      title: title || thumbnail.title,
      url: url || thumbnail.url,
      imgUrl: imgUrl || thumbnail.imgUrl
    }

    const newThumbnails = oldThumbnails
      .slice(0, index)
      .concat(newThumbnail, ...oldThumbnails.slice(index + 1))

    await updateThumbnails(newThumbnails)
  }
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

  if (!Array.isArray(storedGroups)) {
    await platform.set('groups', [
      { id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }
    ])
    return [{ id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }]
  }

  return storedGroups
}

function updateGroups (newGroups) {
  return platform.set('groups', newGroups)
}

async function getOldThumbnails () {
  const storedThumbnails = await platform.get('thumbnails')
  return Array.isArray(storedThumbnails) ? storedThumbnails : []
}

function updateThumbnails (newThumbnails) {
  return platform.set('thumbnails', newThumbnails)
}
