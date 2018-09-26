const repos = require('./_repos')

const backupEntity = require('./entities/backup')

exports.backup = async () => {
  const {
    groups: storedGroups,
    thumbnails: storedThumbnails
  } = await repos.backup()

  const { fileName, groups, imgsUrls } = await backupEntity.backup(
    storedGroups,
    storedThumbnails,
    thumbnailId => repos.thumnail.imgUrl(thumbnailId)
  )

  const backup = { groups, imgsUrls }

  // @ts-ignore
  const file = new window.File([JSON.stringify(backup)], `${fileName}.json`, {
    type: 'plain/text'
  })

  console.log({ backup })

  return file
}

exports.restore = async file => {
  const reader = new window.FileReader()
  reader.readAsText(file)
  const text = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()

  const { groups, imgsUrls } = JSON.parse(text)
  console.log({ groups, imgsUrls })

  const {
    groups: storableGroups,
    thumbnails: storableThumbnails,
    imgsUrls: storableImgsUrls
  } = backupEntity.restore(groups, imgsUrls)

  await repos.restore(storableGroups, storableThumbnails, storableImgsUrls)
}

// imports thumbnails of Firefox's pre-quantum famous Speed Dial extension
exports.restoreFirfoxSpeedDial = async file => {
  const reader = new window.FileReader()

  reader.readAsText(file)
  const text = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()

  return backupEntity.restoreFirefoxSpeedDial(text)
}
