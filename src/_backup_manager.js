const repos = require('./_repos')

const backupEntity = require('./entities/backup')

exports.exportSpeedDialQuantum = async () => {
  const { fileName, groups, imgsUrls } = await repos.backup()
  const backup = { groups, imgsUrls }

  // @ts-ignore
  const file = new window.File([JSON.stringify(backup)], `${fileName}.json`, {
    type: 'plain/text'
  })

  console.log({ backup })

  return file
}

// imports thumbnails of Firefox's pre-quantum famous Speed Dial extension
exports.importFirfoxSpeedDial = async file => {
  const reader = new window.FileReader()

  reader.readAsText(file)
  const text = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()

  return backupEntity.restoreFirefoxSpeedDial(text)
}

exports.importSpeedDialQuantum = async file => {
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
  } = backupEntity.restoreSpeedDialQuantum(groups, imgsUrls)

  await Promise.all([
    repos.group.replace(storableGroups),
    repos.thumnail.replace(storableThumbnails)
  ])

  await Promise.all(
    storableImgsUrls.map(({ thumbnailId, imgUrl }) =>
      repos.thumnail.imgUrl(thumbnailId, imgUrl)
    )
  )
}
