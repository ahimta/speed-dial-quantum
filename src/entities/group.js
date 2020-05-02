const utils = require('../utils')

exports.add = (oldGroups, { name, rows, cols, thumbnailImgSize = null }) => {
  const newGroup = mapOne({
    id: utils.uuid(),
    name,

    rows,
    cols,
    thumbnailImgSize
  })

  const newGroups = oldGroups.concat(newGroup).map(mapOne)

  return { newGroup, newGroups }
}

exports.list = async (storedGroupsOrNone, getTopSites) => {
  if (!Array.isArray(storedGroupsOrNone) || storedGroupsOrNone.length === 0) {
    const group = {
      id: 'd7bc0008-67ec-478f-b792-ae9591574939',
      name: 'Your Default Group',
      rows: 3,
      cols: 3,

      thumbnailImgSize: null
    }

    const sites = await getTopSites()
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

    return { groups: [mapOne(group)], newThumbnails: defaultThumbnails }
  }

  return { groups: storedGroupsOrNone.map(mapOne), newThumbnails: null }
}

exports.remove = (oldGroups, id) => {
  return oldGroups.filter((t) => t.id !== id)
}

exports.update = (
  oldGroups,
  id,
  { name = null, rows = 0, cols = 0, thumbnailImgSize = null } = {}
) => {
  const group = oldGroups.find((t) => t.id === id)

  if (!group) {
    throw new Error(`groupRepo.update: group with id "${id}" not found`)
  }

  const index = oldGroups.indexOf(group)
  const newGroup = mapOne({
    id: group.id,
    name: name || group.name,

    rows: rows || group.rows,
    cols: cols || group.cols,
    thumbnailImgSize: thumbnailImgSize || group.thumbnailImgSize
  })

  const newGroups = oldGroups
    .slice(0, index)
    .concat(newGroup, ...oldGroups.slice(index + 1))

  return { newGroup, newGroups }
}

function mapOne (storedGroup) {
  const { id, name, rows, cols, thumbnailImgSize } = storedGroup

  return {
    id,
    name,

    rows: rows || null,
    cols: cols || null,
    thumbnailImgSize: thumbnailImgSize || null
  }
}
