const repos = require('../repos')
const utils = require('./_utils')

module.exports = (
  groups,
  selectedGroupId,
  {
    editGroupIdInput,
    editGroupNameInput,
    editGroupRowsInput,
    editGroupColsInput,
    editGroupThumbnailImgSizeSelect,
    editGroupModal,

    render
  }
) => {
  return groups.map(({ id, name, rows, cols, thumbnailImgSize }) =>
    utils.createElement('li', {
      className: 'list-group-item',
      children: [
        utils.createElement('span', { innerText: name }),
        utils.createElement('div', {
          className: 'btn-group float-right',
          children: [
            utils.createElement('a', {
              className: 'btn btn-sm btn-primary',
              href: '#',
              innerText: 'UP',
              onClick: () => moveGroupUp(id, groups, selectedGroupId, render)
            }),
            utils.createElement('a', {
              className: 'btn btn-sm btn-primary',
              href: '#',
              innerText: 'DOWN',
              onClick: () => moveGroupDown(id, groups, selectedGroupId, render)
            }),
            utils.createElement('button', {
              className: 'btn btn-sm btn-primary',
              innerText: 'EDIT...',
              onClick: () => {
                editGroupIdInput.value = id
                editGroupNameInput.value = name
                editGroupRowsInput.value = rows
                editGroupColsInput.value = cols
                editGroupThumbnailImgSizeSelect.value =
                  thumbnailImgSize || 'auto'

                // @ts-ignore
                editGroupModal.modal('show')
              }
            }),
            utils.createElement('a', {
              className: 'btn btn-sm btn-danger',
              href: '#',
              innerText: 'DELETE',
              onClick: () => {
                if (!window.confirm('Are you sure you want to delete group?')) {
                  return
                }

                removeGroup(id, groups, selectedGroupId, render)
              }
            })
          ]
        })
      ]
    })
  )
}

async function moveGroupDown (groupId, groups, selectedGroupId, render) {
  await repos.tab.moveGroupDown(groupId)
  render(selectedGroupId)
}

async function moveGroupUp (groupId, groups, selectedGroupId, render) {
  await repos.tab.moveGroupUp(groupId)
  render(selectedGroupId)
}

async function removeGroup (groupId, groups, selectedGroupId, render) {
  await repos.tab.removeGroup(groupId)
  const newGroups = await repos.group.list()

  if (newGroups.length) {
    render(newGroups[0].id)
  } else {
    render(selectedGroupId)
  }
}
