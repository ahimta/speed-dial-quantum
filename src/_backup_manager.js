import * as repos from './_repos'
import * as utils from './_utils'

export async function exportSpeedDialQuantum () {
  const backup = await repos.backup()
  const now = new Date()
  const fileName = `speed-dial-quantum-backup-${now.getFullYear()}-${zeroFill(
    now.getMonth() + 1
  )}-${zeroFill(
    now.getDate()
  )}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`
  // @ts-ignore
  const file = new window.File([JSON.stringify(backup)], fileName, {
    type: 'plain/text'
  })

  return file
}

// imports thumbnails of Firefox's pre-quantum famous Speed Dial extension
export async function importFirfoxSpeedDial (file) {
  const reader = new window.FileReader()
  reader.readAsText(file)
  const text = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()
  const lines = text.split(/[\r\n]+/)
  const groupsLines = lines.filter(line =>
    line.match(/^group-\d+-((columns)|(rows)|(title))=.+$/g)
  )
  const thumbnailsLines = lines.filter(line =>
    line.match(/^thumbnail-\d+-((label)|(url))=.+$/g)
  )
  const groupsLength = Math.ceil(groupsLines.length / 3)
  const __groups = new Array(groupsLength)

  for (let i = 0; i < groupsLines.length; i++) {
    const groupLine = groupsLines[i]
    const match = groupLine.match(/^group-(\d+)-(\w+)=(.+)$/)
    const [, no, _attr, _value] = match
    const index = parseInt(no, 10) - 1
    const attr = _attr !== 'title' ? _attr : 'name'
    const value =
      attr === 'name' ? decodeURIComponent(_value) : parseInt(_value, 10)
    const group = __groups[index] || {}
    group[attr] = value
    __groups[index] = group
  }

  const _groups = __groups.map(({ name, rows, columns }) => ({
    name,
    id: utils.uuid(),
    rows,
    cols: columns,
    length: rows * columns
  }))

  const thumbnailsLength = _groups
    .map(({ length }) => length)
    .reduce((acc, x) => acc + x, 0)
  const thumbnails = new Array(thumbnailsLength)

  for (let i = 0; i < thumbnailsLines.length; i++) {
    const thumbnailLine = thumbnailsLines[i]
    const match = thumbnailLine.match(/^thumbnail-(\d+)-(\w+)=(.+)$/)
    const [, no, _attr, _value] = match
    const index = parseInt(no, 10) - 1
    const attr = _attr !== 'label' ? _attr : 'title'
    const value = attr !== 'title' ? _value : decodeURIComponent(_value)
    const thumbnail = thumbnails[index] || { id: utils.uuid(), imgUrl: null }
    thumbnail[attr] = value
    thumbnails[index] = thumbnail
  }

  for (let i = 0; i < thumbnails.length; i++) {
    thumbnails[i] = thumbnails[i] || {
      id: utils.uuid(),
      title: null,
      url: null
    }
  }

  for (let i = 0, offset = 0; i < _groups.length; i++) {
    const group = _groups[i]

    for (let j = offset; j < offset + group.length; j++) {
      thumbnails[j].groupId = group.id
    }

    offset += group.length
  }

  const groups = _groups.map(({ id, name, rows, cols }) => ({
    id,
    name,
    rows,
    cols
  }))

  console.log({ groups, thumbnails })

  if (!(groups.length && thumbnails.length)) {
    throw Error('Invalid imported thumbnails')
  }

  return { groups, thumbnails }
}

function zeroFill (x) {
  return x < 10 ? `0${x}` : `${x}`
}
