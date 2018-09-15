const backupManager = require('./_backup_manager')
const platform = require('./_platform')
const repos = require('./_repos')
const utils = require('./_utils')

const newGroupThumbnailImgSizeElement = document.getElementById(
  'newGroupThumbnailImgSize'
)
const editGroupThumbnailImgSizeElement = document.getElementById(
  'editGroupThumbnailImgSize'
)

document.getElementById('newGroupBtn').addEventListener('click', async () => {
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
})

document.getElementById('editGroupBtn').addEventListener('click', async () => {
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

  const group = await repos.group.update(id, {
    name,
    rows,
    cols,
    thumbnailImgSize
  })
  await repos.thumnail.resizeByGroupId(id, rows, cols)

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#editGroupModal').modal('hide')
  module.exports(group.id)
})

document
  .getElementById('editThumbnailBtn')
  .addEventListener('click', async () => {
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

    const imgUrl = !img ? null : await getImageUrl(img)

    const thumbnail = await repos.thumnail.update(id, { title, url })

    if (imgUrl) {
      await repos.thumnail.imgUrl(thumbnail.id, imgUrl)
    }

    // @note: jQuery is used only for Bootstrap:sweat_smile:
    // @ts-ignore
    $('#editThumbnailModal').modal('hide')
    module.exports(thumbnail.groupId)
  })

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

function renderTab (groups, thumbnails, selectedGroupId, shiftRequired, group) {
  const _thumbnails = thumbnailsElements(thumbnails, selectedGroupId, group)
  const tab = tabElement(groups, _thumbnails, selectedGroupId, shiftRequired)

  const root = document.getElementById('root')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }

  root.appendChild(tab)
}

function groupsElements (groups, selectedGroupId) {
  return groups.map(({ id, name, rows, cols, thumbnailImgSize }) =>
    createElement('li', {
      className: 'list-group-item',
      children: [
        createElement('span', { innerText: name }),
        createElement('div', {
          className: 'btn-group float-right',
          children: [
            createElement('a', {
              className: 'btn btn-sm btn-primary',
              href: '#',
              innerText: 'UP',
              onClick: () => moveGroupUp(id, groups, selectedGroupId)
            }),
            createElement('a', {
              className: 'btn btn-sm btn-primary',
              href: '#',
              innerText: 'DOWN',
              onClick: () => moveGroupDown(id, groups, selectedGroupId)
            }),
            createElement('button', {
              className: 'btn btn-sm btn-primary',
              innerText: 'EDIT...',
              onClick: () => {
                // @ts-ignore
                document.getElementById('editGroupId').value = id
                // @ts-ignore
                document.getElementById('editGroupName').value = name
                // @ts-ignore
                document.getElementById('editGroupRows').value = rows
                // @ts-ignore
                document.getElementById('editGroupCols').value = cols
                // @ts-ignore
                document.getElementById('editGroupThumbnailImgSize').value =
                  thumbnailImgSize || 'auto'

                // @ts-ignore
                $('#editGroupModal').modal('show')
              }
            }),
            createElement('a', {
              className: 'btn btn-sm btn-danger',
              href: '#',
              innerText: 'DELETE',
              onClick: () => {
                if (!window.confirm('Are you sure you want to delete group?')) {
                  return
                }

                removeGroup(id, groups, selectedGroupId)
              }
            })
          ]
        })
      ]
    })
  )
}

function tabElement (
  groups,
  thumbnailsElements,
  selectedGroupId,
  shiftRequired
) {
  const tab = createElement('section', { className: 'card text-center' })
  const header = createElement('header', {
    className: 'card-header',
    children: [
      createElement('ul', {
        className: 'nav nav-tabs card-header-tabs',
        children: [
          createElement('li', {
            className: 'nav-item',
            children: [
              createElement('input', {
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
          .concat(
            groups.map(group =>
              createElement('li', {
                className: 'nav-item',
                onMousedown: event => {
                  event.preventDefault()

                  if (
                    event.button === 1 ||
                    (event.button === 0 && event.ctrlKey)
                  ) {
                    platform.sendMessage({
                      type: 'open-all-tabs',
                      groupId: group.id
                    })
                    return
                  }

                  module.exports(group.id)
                },
                children: [
                  createElement('a', {
                    className:
                      group.id === selectedGroupId
                        ? 'nav-link active'
                        : 'nav-link',
                    href: '#',
                    innerText: !(group.rows && group.cols)
                      ? group.name
                      : `${group.name} (${group.rows}x${group.cols})`
                  })
                ]
              })
            )
          )
          .concat(
            createElement('li', {
              className: 'nav-item',
              map: element => {
                element.setAttribute('data-toggle', 'modal')
                element.setAttribute('data-target', '#newGroupModal')
              },
              onClick: () => {
                // @ts-ignore
                document.getElementById('newGroupName').value = ''
                // @ts-ignore
                document.getElementById('newGroupRows').value = ''
                // @ts-ignore
                document.getElementById('newGroupCols').value = ''
                // @ts-ignore
                document.getElementById('newGroupThumbnailImgSize').value =
                  'auto'
              },
              children: [
                createElement('button', {
                  className: 'btn-primary btn-sm',
                  type: 'button',
                  style: { cursor: 'pointer', marginLeft: '1em' },
                  innerText: 'Add Group...'
                })
              ]
            }),
            createElement('li', {
              className: 'nav-item',
              map: element => {
                element.setAttribute('data-toggle', 'modal')
                element.setAttribute('data-target', '#exampleModal')
              },
              children: [
                createElement('button', {
                  className: 'btn-primary btn-sm',
                  type: 'button',
                  style: { cursor: 'pointer', marginLeft: '0.5em' },
                  innerText: 'Edit Groups...'
                })
              ]
            })
          )
      })
    ]
  })

  const cardBody = createElement('div', {
    className: 'card-body',
    children: thumbnailsElements
  })

  const speedDialFile = createElement('input', {
    type: 'file',
    style: { display: 'none' },
    onChange: async event => {
      const file = event.target.files[0]

      try {
        await backupManager.importSpeedDialQuantum(file)
        const groups = await repos.group.list()
        module.exports(groups[0].id)

        return
      } catch (err) {
        console.log({ err })
      }

      const { groups, thumbnails } = await backupManager.importFirfoxSpeedDial(
        file
      )

      await repos.group.replace(groups)
      await repos.thumnail.replace(thumbnails)
      module.exports(groups[0].id)
    }
  })

  const cardFooter = createElement('footer', {
    className: 'card-footer',
    style: { marginTop: '-1em', textAlign: 'center' },
    children: [
      createElement('div', {
        className: 'btn-group',
        children: [
          createElement('button', {
            className: 'btn btn-danger',
            innerText: 'Import...',
            title: 'Supports old Firfox Speed Dial too',
            type: 'button',
            onClick: () => {
              speedDialFile.click()
            }
          }),
          createElement('button', {
            className: 'btn btn-primary',
            disabled: false,
            innerText: 'Export...',
            onClick: async () => {
              const file = await backupManager.exportSpeedDialQuantum()
              const href = URL.createObjectURL(file)
              // @ts-ignore
              document.querySelector('#importDownload').href = href
              // @ts-ignore
              document.querySelector('#importDownload').click()
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

function thumbnailsElements (thumbnails, selectedGroupId, group) {
  const elements = thumbnails
    .map(({ groupId, id, url, title, imgUrl }, i) => {
      if (groupId !== selectedGroupId) {
        return null
      }

      async function onDrop (event) {
        event.preventDefault()

        if (!event.dataTransfer.items) {
          return
        }

        const items = event.dataTransfer.items
        const item = items[0]
        for (let item of items) {
          if (item.kind === 'string' && item.type === 'text/plain') {
            // @todo: use an async helper instead
            // @todo: add support for title too
            item.getAsString(async url => {
              await repos.thumnail.update(id, { url })
              module.exports(selectedGroupId)
            })

            return
          }
        }

        const img = item.getAsFile()

        const reader = new window.FileReader()
        reader.readAsDataURL(img)
        const newImgUrl = await (() =>
          new Promise(resolve => {
            reader.onload = () => resolve(reader.result)
          }))()

        if (newImgUrl) {
          await repos.thumnail.imgUrl(id, newImgUrl)
        }

        module.exports(selectedGroupId)
      }

      const { maxWidth, maxHeight } = getThumbnailDimensions(
        group.thumbnailImgSize
      )

      const card = createElement('article', {
        className: 'card',
        onDrop,
        children: [
          createElement('a', {
            href: url || '#',
            children: [
              createElement('img', {
                alt: `${i + 1}`,
                className: 'card-img-top',
                height: 100,
                src: imgUrl || '../icons/loading.svg',
                width: 100,
                style: { maxWidth, maxHeight },
                map: async element => {
                  setTimeout(async () => {
                    const storedImgUrl = await repos.thumnail.imgUrl(id)
                    const displayableImgUrl = storedImgUrl || imgUrl

                    if (!(displayableImgUrl || url)) {
                      const newElement = createElement('span', {
                        style: {
                          fontSize: getThumbnailNumberFontSize(
                            group.thumbnailImgSize
                          )
                        },
                        innerText: `${i + 1}`,
                        onDrop
                      })

                      element.parentNode.replaceChild(newElement, element)
                      return
                    }

                    element.src =
                      displayableImgUrl || `https://mini.s-shot.ru/?${url}`
                  }, 0)
                }
              })
            ]
          })
        ]
      })

      const cardBody = createElement('div', {
        className: 'card-body',
        children: [
          createElement('p', {
            className: 'card-text',
            children: [
              createElement('img', {
                src: utils.getFaviconImgUrl(url),
                width: 16,
                height: 16,
                style: { marginRight: '0.25em' }
              }),
              createElement('span', {
                innerText: `(${i + 1}) - ${title || '(No Title -_-)'}`
              })
            ]
          })
        ]
      })

      const cardFooter = createElement('footer', {
        className: 'card-footer',
        children: [
          createElement('div', {
            className: 'btn-group',
            role: 'group',
            children: [
              createElement('button', {
                className: 'btn btn-sm btn-primary',
                innerText: 'Edit...',
                type: 'button',
                onClick: () => {
                  // @ts-ignore
                  document.getElementById('editThumbnailId').value = id
                  // @ts-ignore
                  document.getElementById('editThumbnailTitle').value = title
                  // @ts-ignore
                  document.getElementById('editThumbnailUrl').value = url
                  // @ts-ignore
                  document.getElementById('editThumbnailImg').value = ''
                  // @ts-ignore
                  $('#editThumbnailModal').modal('show')
                }
              }),
              createElement('button', {
                className: 'btn btn-sm btn-danger',
                innerText: 'Delete',
                type: 'button',
                onClick: async () => {
                  if (
                    !window.confirm(
                      'Are you sure you want to remove thumbnail?'
                    )
                  ) {
                    return
                  }

                  if (group.rows && group.cols) {
                    await repos.thumnail.update(id, { reset: true })
                  } else {
                    await repos.thumnail.remove(id)
                  }

                  module.exports(selectedGroupId)
                }
              })
            ]
          })
        ]
      })

      card.appendChild(cardBody)
      card.appendChild(cardFooter)
      return card
    })
    .filter(x => x)

  const cardGroups = []
  for (let i = 0; i < elements.length; i = i + (group.cols || 3)) {
    const cardGroup = document.createElement('div')
    cardGroup.className = 'card-group'
    cardGroup.style.marginBottom = '1em'

    for (let j = i; j < elements.length; j++) {
      cardGroup.appendChild(elements[j])
    }

    cardGroups.push(cardGroup)
  }

  if (!(group.rows && group.cols)) {
    const addThumbnailBtn = document.createElement('button')
    addThumbnailBtn.type = 'button'
    addThumbnailBtn.className = 'btn btn-block btn-primary'
    addThumbnailBtn.innerText = 'Add Thumbnail...'
    addThumbnailBtn.disabled = group.rows && group.cols
    addThumbnailBtn.addEventListener('click', async () => {
      const url = window.prompt('New URL')
      if (!url) {
        return
      }

      await repos.thumnail.add({ url, groupId: selectedGroupId })
      module.exports(selectedGroupId)
    })

    cardGroups.push(addThumbnailBtn)
  }

  return cardGroups
}

function createElement (
  name,
  {
    alt = null,
    checked = null,
    className = null,
    disabled = null,
    height = null,
    href = null,
    innerText = null,
    role = null,
    src = null,
    title = null,
    type = null,
    width = null,
    style = null,
    children = [],
    onChange = null,
    onClick = null,
    onDrop = null,
    onMousedown = null,
    map = null
  } = {}
) {
  const element = document.createElement(name)

  if (alt) {
    element.alt = alt
  }
  if (typeof checked === 'boolean') {
    element.checked = checked
  }
  if (className) {
    element.className = className
  }
  if (disabled) {
    element.disabled = disabled
  }
  if (height) {
    element.height = height
  }
  if (href) {
    element.href = href
  }
  if (innerText) {
    element.innerText = innerText
  }
  if (role) {
    element.role = role
  }
  if (src) {
    element.src = src
  }
  if (title) {
    element.title = title
  }
  if (type) {
    element.type = type
  }
  if (width) {
    element.width = width
  }

  if (children.length) {
    children.forEach(child => element.appendChild(child))
  }

  if (style) {
    Object.keys(style).forEach(styleAttr => {
      element.style[styleAttr] = style[styleAttr]
    })
  }

  if (onChange) {
    element.addEventListener('change', onChange)
  }
  if (onClick) {
    element.addEventListener('click', onClick)
  }
  if (onDrop) {
    element.addEventListener('dragover', event => {
      event.preventDefault()
    })
    element.addEventListener('drop', onDrop)
  }
  if (onMousedown) {
    element.addEventListener('mousedown', onMousedown)
  }

  if (map) {
    map(element)
  }

  return element
}

async function getImageUrl (img) {
  const reader = new window.FileReader()
  reader.readAsDataURL(img)
  const url = await (() =>
    new Promise(resolve => {
      reader.onload = () => resolve(reader.result)
    }))()

  return url
}

function getThumbnailDimensions (thumbnailImgSize) {
  const defaultValue = { maxWidth: '40em', maxHeight: '40em' }
  const mapping = {
    auto: defaultValue,
    small: { maxWidth: '5em', maxHeight: '5em' },
    medium: { maxWidth: '50em', maxHeight: '50em' },
    large: { maxWidth: '500em', maxHeight: '500em' }
  }

  return mapping[thumbnailImgSize] || defaultValue
}

function getThumbnailNumberFontSize (thumbnailImgSize) {
  const defaultValue = '3em'
  const mapping = {
    auto: defaultValue,
    small: '2em',
    medium: '3em',
    large: '4em'
  }

  return mapping[thumbnailImgSize] || defaultValue
}

async function moveGroupDown (groupId, groups, selectedGroupId) {
  await repos.tab.moveGroupDown(groupId)
  module.exports(selectedGroupId)
}

async function moveGroupUp (groupId, groups, selectedGroupId) {
  await repos.tab.moveGroupUp(groupId)
  module.exports(selectedGroupId)
}

async function removeGroup (groupId, groups, selectedGroupId) {
  await repos.tab.removeGroup(groupId)
  const newGroups = await repos.group.list()

  if (newGroups.length) {
    module.exports(newGroups[0].id)
  } else {
    module.exports(selectedGroupId)
  }
}

function renderGroupModal (groups, selectedGroupId) {
  const groupsList = document.getElementById('groupsList')
  const _groupsElements = groupsElements(groups, selectedGroupId)
  while (groupsList.firstChild) {
    groupsList.removeChild(groupsList.firstChild)
  }
  _groupsElements.forEach(group => groupsList.appendChild(group))
}
