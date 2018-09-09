exports.moveGroupDown = (oldGroups, oldThumbnails, groupId) => {
  const group = oldGroups.filter(({ id }) => id === groupId)[0]
  const index = oldGroups.indexOf(group)

  if (index === oldGroups.length - 1) {
    return
  }

  const groupAfter = oldGroups[index + 1]
  const newGroups = oldGroups
    .slice(0, index)
    .concat([groupAfter, group])
    .concat(oldGroups.slice(index + 2))

  return sync(newGroups, oldThumbnails)
}

exports.moveGroupUp = (oldGroups, oldThumbnails, groupId) => {
  const group = oldGroups.find(({ id }) => id === groupId)
  const index = oldGroups.indexOf(group)

  if (index === 0) {
    return
  }

  const groupBefore = oldGroups[index - 1]
  const newGroups = oldGroups
    .slice(0, index - 1)
    .concat([group, groupBefore])
    .concat(oldGroups.slice(index + 1))

  return sync(newGroups, oldThumbnails)
}

exports.removeGroup = (oldGroups, oldThumbnails, groupId) => {
  const newGroups = oldGroups.filter(({ id }) => id !== groupId)

  return sync(newGroups, oldThumbnails)
}

function sync (oldGroups, oldThumbnails) {
  const thumnailsByGroupId = oldThumbnails.reduce((byId, thumbnail) => {
    const groupId = thumbnail.groupId
    byId[groupId] = byId[groupId] || []
    byId[groupId].push(thumbnail)

    return byId
  }, {})

  const sortedThumbnails = Array.prototype.concat(
    ...oldGroups.map(({ id }) => thumnailsByGroupId[id] || [])
  )

  return { newGroups: oldGroups, newThumbnails: sortedThumbnails }
}
