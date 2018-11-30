const backupManager = require('../backup_manager')
const platform = require('../platform')
const repos = require('../repos')

const utils = require('./_utils')

module.exports = (
  groups,
  thumbnailsElements,
  selectedGroupId,
  shiftRequired,
  {
    newGroupNameInput,
    newGroupRowsInput,
    newGroupColsInput,
    newGroupThumbnailImgSizeSelect,
    importDownloadAnchor,

    render
  }
) => {
  const tab = utils.createElement('section', { className: 'card text-center' })
  const header = utils.createElement('header', {
    className: 'card-header',
    children: [
      utils.createElement('ul', {
        className: 'nav nav-tabs card-header-tabs',
        children: [
          utils.createElement('li', {
            className: 'nav-item',
            children: [
              utils.createElement('input', {
                checked: shiftRequired,
                title: 'Only activate when "Shift" is clicked',
                type: 'checkbox',
                style: { marginRight: '1em' },
                onChange: async event => {
                  await repos.settings.shiftRequired(event.target.checked)
                }
              })
            ]
          })
        ]
          .concat(groupsUi(groups, selectedGroupId, { render }))
          .concat(
            utils.createElement('li', {
              className: 'nav-item',
              map: bindToModalFactory('newGroupModal'),
              onClick: () => {
                newGroupNameInput.value = ''
                newGroupRowsInput.value = ''
                newGroupColsInput.value = ''
                newGroupThumbnailImgSizeSelect.value = 'auto'
              },
              children: [
                utils.createElement('button', {
                  className: 'btn-primary btn-sm',
                  type: 'button',
                  style: { cursor: 'pointer', marginLeft: '1em' },
                  innerText: 'Add Group...'
                })
              ]
            }),
            utils.createElement('li', {
              className: 'nav-item',
              map: bindToModalFactory('exampleModal'),
              children: [
                utils.createElement('button', {
                  className: 'btn-primary btn-sm',
                  type: 'button',
                  style: { cursor: 'pointer', marginLeft: '0.5em' },
                  innerText: 'Edit Groups...'
                })
              ]
            }),
            utils.createElement('li', {
              className: 'nav-item',
              map: bindToModalFactory('faqModal'),
              children: [
                utils.createElement('button', {
                  className: 'btn-success btn-sm',
                  type: 'button',
                  style: { cursor: 'pointer', marginLeft: '0.5em' },
                  innerText: 'FAQ...'
                })
              ]
            })
          )
      })
    ]
  })

  const cardBody = utils.createElement('div', {
    className: 'card-body',
    children: thumbnailsElements
  })

  const speedDialFile = utils.createElement('input', {
    type: 'file',
    style: { display: 'none' },
    onChange: async event => {
      const file = event.target.files[0]

      await backupManager.restore(file)

      const groups = await repos.group.list()
      render(groups[0].id)
    }
  })

  const cardFooter = utils.createElement('footer', {
    className: 'card-footer',
    style: { marginTop: '-1em', padding: '0.5em', textAlign: 'center' },
    children: [
      utils.createElement('div', {
        className: 'btn-group',
        children: [
          utils.createElement('button', {
            className: 'btn btn-danger',
            innerText: 'Import...',
            title: 'Supports old Firfox Speed Dial too',
            type: 'button',
            onClick: () => {
              speedDialFile.click()
            }
          }),
          utils.createElement('button', {
            className: 'btn btn-primary',
            disabled: false,
            innerText: 'Export',
            onClick: async () => {
              const file = await backupManager.backup()
              const href = URL.createObjectURL(file)

              importDownloadAnchor.href = href
              importDownloadAnchor.click()
            }
          })
        ]
      })
    ]
  })

  tab.appendChild(header)
  tab.appendChild(cardBody)
  tab.appendChild(cardFooter)

  return tab
}

function bindToModalFactory (modalId) {
  return element => {
    element.setAttribute('data-toggle', 'modal')
    element.setAttribute('data-target', `#${modalId}`)
  }
}

function groupsUi (groups, selectedGroupId, { render }) {
  const groupsElements = []
  let offset = 1

  for (const { id, name, rows, cols } of groups) {
    groupsElements.push(
      utils.createElement('li', {
        className: 'nav-item',
        onMousedown: event => {
          event.preventDefault()

          if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
            platform.sendMessage({
              type: 'open-all-tabs',
              groupId: id
            })

            return
          }

          render(id)
        },
        children: [
          utils.createElement('a', {
            className: id === selectedGroupId ? 'nav-link active' : 'nav-link',
            href: '#',
            innerText: !(rows && cols)
              ? name
              : `${name} (${offset}-${offset + rows * cols - 1})`
          })
        ]
      })
    )

    if (rows && cols) {
      offset += rows * cols
    }
  }

  return groupsElements
}
