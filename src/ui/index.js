const repos = require('../repos')
const utils = require('./_utils')

const editGroupsUi = require('./_edit_groups')
const tabUi = require('./_tab')
const thumbnailsUi = require('./_thumbnails')

const newGroupThumbnailImgSizeElement = document.getElementById(
  'newGroupThumbnailImgSize'
)
const editGroupThumbnailImgSizeElement = document.getElementById(
  'editGroupThumbnailImgSize'
)

document
  .getElementById('newGroupName')
  .addEventListener('keypress', onEnterFactory(addGroup))
document
  .getElementById('newGroupRows')
  .addEventListener('keypress', onEnterFactory(addGroup))
document
  .getElementById('newGroupCols')
  .addEventListener('keypress', onEnterFactory(addGroup))

document
  .getElementById('editThumbnailTitle')
  .addEventListener('keypress', onEnterFactory(editThumbnail))
document
  .getElementById('editThumbnailUrl')
  .addEventListener('keypress', onEnterFactory(editThumbnail))

document
  .getElementById('editGroupName')
  .addEventListener('keypress', onEnterFactory(editGroup))
document
  .getElementById('editGroupRows')
  .addEventListener('keypress', onEnterFactory(editGroup))
document
  .getElementById('editGroupCols')
  .addEventListener('keypress', onEnterFactory(editGroup))

document.getElementById('newGroupBtn').addEventListener('click', addGroup)
document.getElementById('editGroupBtn').addEventListener('click', editGroup)
document
  .getElementById('editThumbnailBtn')
  .addEventListener('click', editThumbnail)

module.exports = async function render (selectedGroupId) {
  const [groups, shiftRequired, thumbnails] = await Promise.all([
    repos.group.list(),
    repos.settings.shiftRequired(),
    repos.thumnail.list()
  ])

  const group = groups.filter(({ id }) => id === selectedGroupId)[0]
  renderTab(groups, thumbnails, selectedGroupId, shiftRequired, group)
  renderGroupModal(groups, selectedGroupId)
}

async function addGroup () {
  // @ts-ignore
  const name = document.getElementById('newGroupName').value

  // @ts-ignore
  const rows = parseInt(document.getElementById('newGroupRows').value, 10)
  // @ts-ignore
  const cols = parseInt(document.getElementById('newGroupCols').value, 10)
  // @ts-ignore
  const thumbnailImgSize = newGroupThumbnailImgSizeElement.value

  if (!(name && rows && rows > 0 && rows < 100 && cols > 0 && cols < 100)) {
    return
  }

  const newGroup = await repos.tab.addGroup({
    name,
    rows,
    cols,
    thumbnailImgSize
  })

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#newGroupModal').modal('hide')

  module.exports(newGroup.id)
}

async function editGroup () {
  // @ts-ignore
  const id = document.getElementById('editGroupId').value
  // @ts-ignore
  const name = document.getElementById('editGroupName').value
  // @ts-ignore
  const rows = parseInt(document.getElementById('editGroupRows').value, 10)
  // @ts-ignore
  const cols = parseInt(document.getElementById('editGroupCols').value, 10)
  // @ts-ignore
  const thumbnailImgSize = editGroupThumbnailImgSizeElement.value

  if (!(name && rows && rows > 0 && rows < 100 && cols > 0 && cols < 100)) {
    return
  }

  const group = await repos.tab.updateGroup(id, {
    name,
    rows,
    cols,
    thumbnailImgSize
  })

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#editGroupModal').modal('hide')
  module.exports(group.id)
}

async function editThumbnail () {
  // @ts-ignore
  const id = document.getElementById('editThumbnailId').value
  // @ts-ignore
  const title = document.getElementById('editThumbnailTitle').value
  // @ts-ignore
  const url = document.getElementById('editThumbnailUrl').value
  // @ts-ignore
  const img = document.getElementById('editThumbnailImg').files[0]

  if (!(title || url || img)) {
    return
  }

  const imgUrl = !img ? null : await utils.imageUrl(img)

  const thumbnail = await repos.thumnail.update(id, { title, url })

  if (imgUrl) {
    await repos.thumnail.imgUrl(thumbnail.id, imgUrl)
  }

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#editThumbnailModal').modal('hide')
  module.exports(thumbnail.groupId)
}

function onEnterFactory (fn) {
  return (event) => {
    if (!(event.code === 'Enter')) {
      return
    }

    return fn()
  }
}

function renderTab (groups, thumbnails, selectedGroupId, shiftRequired, group) {
  const _thumbnails = thumbnailsUi(thumbnails, selectedGroupId, group, {
    editThumbnailIdInput: document.getElementById('editThumbnailId'),
    editThumbnailTitleInput: document.getElementById('editThumbnailTitle'),
    editThumbnailUrlInput: document.getElementById('editThumbnailUrl'),
    editThumbnailImg: document.getElementById('editThumbnailImg'),
    // @ts-ignore
    editThumbnailModal: $('#editThumbnailModal'),

    render: module.exports
  })
  const tab = tabUi(groups, _thumbnails, selectedGroupId, shiftRequired, {
    newGroupNameInput: document.getElementById('newGroupName'),
    newGroupRowsInput: document.getElementById('newGroupRows'),
    newGroupColsInput: document.getElementById('newGroupCols'),
    newGroupThumbnailImgSizeSelect: document.getElementById(
      'newGroupThumbnailImgSize'
    ),
    importDownloadAnchor: document.querySelector('#importDownload'),

    render: module.exports
  })

  const root = document.getElementById('root')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }

  root.appendChild(tab)
}

function renderGroupModal (groups, selectedGroupId) {
  const groupsList = document.getElementById('groupsList')

  const _groupsElements = editGroupsUi(groups, selectedGroupId, {
    editGroupIdInput: document.getElementById('editGroupId'),
    editGroupNameInput: document.getElementById('editGroupName'),
    editGroupRowsInput: document.getElementById('editGroupRows'),
    editGroupColsInput: document.getElementById('editGroupCols'),
    editGroupThumbnailImgSizeSelect: document.getElementById(
      'editGroupThumbnailImgSize'
    ),
    // @ts-ignore
    editGroupModal: $('#editGroupModal'),

    render: module.exports
  })

  while (groupsList.firstChild) {
    groupsList.removeChild(groupsList.firstChild)
  }

  _groupsElements.forEach((group) => groupsList.appendChild(group))
}
