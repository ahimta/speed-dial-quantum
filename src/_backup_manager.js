const repos = require('./_repos')

const backupEntity = require('./entities/backup')

exports.backup = async () => {
  const { fileName, groups, imgsUrls } = await repos.backup()
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

  await repos.tab.replace(storableGroups, storableThumbnails)

  await Promise.all(
    storableImgsUrls.map(({ thumbnailId, imgUrl }) =>
      repos.thumnail.imgUrl(thumbnailId, imgUrl)
    )
  )
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
