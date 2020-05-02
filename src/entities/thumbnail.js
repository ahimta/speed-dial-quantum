const utils = require('../utils')

exports.list = (storedThumbnailsOrNone) => {
  if (!Array.isArray(storedThumbnailsOrNone)) {
    return []
  }

  return storedThumbnailsOrNone.map(mapOne)
}

exports.resizeByGroupId = (oldThumbnails, groupId, rows, cols) => {
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

  return newThumbnails
}

exports.update = (
  oldThumbnails,
  id,
  {
    url = null,
    groupId = null,
    title = null,
    deleteDeprecatedImgUrl = false,
    reset = false
  } = {}
) => {
  const thumbnail = oldThumbnails.find((t) => t.id === id)

  if (!thumbnail) {
    throw new Error(`thumbnailRepo.update: thumbnail with id "${id}" not found`)
  }

  const index = oldThumbnails.indexOf(thumbnail)
  const newThumbnail = !reset
    ? mapOne({
      id: thumbnail.id,
      groupId: groupId || thumbnail.groupId,

      title: title || thumbnail.title,
      url: url || thumbnail.url,
      imgUrl: deleteDeprecatedImgUrl ? null : thumbnail.imgUrl
    })
    : mapOne({
      id: thumbnail.id,
      groupId: thumbnail.groupId,

      title: null,
      url: null,
      imgUrl: null
    })

  const newThumbnails = oldThumbnails
    .slice(0, index)
    .concat(newThumbnail, ...oldThumbnails.slice(index + 1))

  return { newThumbnail, newThumbnails }
}

function mapOne (storedThumbnail) {
  const { groupId, id, url, title, imgUrl } = storedThumbnail

  return {
    groupId,
    id,

    url: url || null,
    title: title || null,
    imgUrl: imgUrl || null
  }
}
