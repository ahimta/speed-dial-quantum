// @ts-check
import * as storage from './_storage'

export const group = {
  add: async ({ name }) => {
    const oldGroups = await getOldGroups()
    const newGroups = oldGroups.concat({ id: uuid(), name })
    await updateGroups(newGroups)
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
  add: async ({ url, groupId, title = null, imgUrl = null }) => {
    const oldThumbnails = await getOldThumbnails()
    const newThumbnails = oldThumbnails.concat({
      id: uuid(),
      groupId,
      title: title || url,
      url,
      imgUrl
    })
    await updateThumbnails(newThumbnails)
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

async function getOldGroups () {
  const storedGroups = await storage.get('groups')
  console.log({ storedGroups })
  if (!Array.isArray(storedGroups)) {
    await storage.set('groups', [
      { id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }
    ])
    return [{ id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }]
  }

  return storedGroups
}

function updateGroups (newGroups) {
  return storage.set('groups', newGroups)
}

async function getOldThumbnails () {
  const storedThumbnails = await storage.get('thumbnails')
  return Array.isArray(storedThumbnails) ? storedThumbnails : []
}

function updateThumbnails (newThumbnails) {
  return storage.set('thumbnails', newThumbnails)
}

function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
