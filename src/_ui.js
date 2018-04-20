import importSpeedDial from './_import_speed_dial'
import * as platform from './_platform'
import * as repos from './_repos'

document.getElementById('newGroupBtn').addEventListener('click', async () => {
  // @ts-ignore
  const name = document.getElementById('newGroupName').value

  // @ts-ignore
  const rows = parseInt(document.getElementById('newGroupRows').value, 10)
  // @ts-ignore
  const cols = parseInt(document.getElementById('newGroupCols').value, 10)

  if (!(name && rows && rows > 0 && rows < 100 && cols > 0 && cols < 100)) {
    return
  }

  const group = await repos.group.add({ name, rows, cols })

  for (let i = 0; i < rows * cols; i++) {
    await repos.thumnail.add({ groupId: group.id })
  }

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#newGroupModal').modal('hide')
  render(group.id)
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

  if (!(name && rows && rows > 0 && rows < 100 && cols > 0 && cols < 100)) {
    return
  }

  const group = await repos.group.update(id, { name, rows, cols })
  await repos.thumnail.resizeByGroupId(id, rows, cols)

  // @note: jQuery is used only for Bootstrap:sweat_smile:
  // @ts-ignore
  $('#editGroupModal').modal('hide')
  render(group.id)
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

    const imgUrl = !img ? null : await getImageUrl(img)

    const thumbnail = await repos.thumnail.update(id, { title, url, imgUrl })

    // @note: jQuery is used only for Bootstrap:sweat_smile:
    // @ts-ignore
    $('#editThumbnailModal').modal('hide')
    render(thumbnail.groupId)
  })

export default async function render (selectedGroupId) {
  const [groups, thumbnails] = await Promise.all([
    repos.group.list(),
    repos.thumnail.list()
  ])
  const group = groups.filter(({ id }) => id === selectedGroupId)[0]
  renderTab(groups, thumbnails, selectedGroupId, group)
  renderGroupModal(groups, selectedGroupId)
}

function renderTab (groups, thumbnails, selectedGroupId, group) {
  const _thumbnails = thumbnailsElements(thumbnails, selectedGroupId, group)
  const tab = tabElement(groups, _thumbnails, selectedGroupId)

  const root = document.getElementById('root')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }

  root.appendChild(tab)
}

function groupsElements (groups, selectedGroupId) {
  return groups.map(({ id, name, rows, cols }) =>
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
              innerText: 'EDIT',
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
                $('#editGroupModal').modal('show')
              }
            }),
            createElement('a', {
              className: 'btn btn-sm btn-danger',
              href: '#',
              innerText: 'DELETE',
              onClick: () => removeGroup(id, groups, selectedGroupId)
            })
          ]
        })
      ]
    })
  )
}

function tabElement (groups, thumbnailsElements, selectedGroupId) {
  const tab = createElement('section', { className: 'card text-center' })
  const header = createElement('header', {
    className: 'card-header',
    children: [
      createElement('ul', {
        className: 'nav nav-tabs card-header-tabs',
        children: groups
          .map(group =>
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

                render(group.id)
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
          .concat(
            createElement('li', {
              className: 'nav-item',
              map: element => {
                element.setAttribute('data-toggle', 'modal')
                element.setAttribute('data-target', '#newGroupModal')
              },
              children: [
                createElement('a', {
                  className: 'nav-link',
                  href: '#',
                  innerText: 'Add Group...'
                })
              ]
            }),
            createElement('li', {
              className: 'nav-item',
              children: [
                createElement('a', {
                  className: 'nav-link',
                  href: '#',
                  innerText: 'Edit Groups...',
                  map: element => {
                    element.setAttribute('data-toggle', 'modal')
                    element.setAttribute('data-target', '#exampleModal')
                  }
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
      const { groups, thumbnails } = await importSpeedDial(file)

      await repos.group.replace(groups)
      await repos.thumnail.replace(thumbnails)
      render(groups[0].id)
    }
  })

  const cardFooter = createElement('footer', {
    className: 'card-footer',
    children: [
      createElement('button', {
        className: 'btn btn-block btn-success',
        innerText: 'Import Speed Dial...',
        type: 'button',
        onClick: () => {
          speedDialFile.click()
        }
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

      const card = createElement('article', {
        className: 'card',
        children: [
          createElement('a', {
            href: url || '#',
            children: [
              createElement('img', {
                alt: `${i + 1}`,
                className: 'card-img-top',
                height: 150,
                src:
                  imgUrl || `https://via.placeholder.com/350x150?text=${i + 1}`,
                width: 350,
                onDrop: async event => {
                  event.preventDefault()

                  if (!event.dataTransfer.items) {
                    return
                  }

                  const img = event.dataTransfer.items[0].getAsFile()

                  const reader = new window.FileReader()
                  reader.readAsDataURL(img)
                  const newImgUrl = await (() =>
                    new Promise(resolve => {
                      reader.onload = () => resolve(reader.result)
                    }))()

                  await repos.thumnail.update(id, { imgUrl: newImgUrl })
                  render(selectedGroupId)
                }
              })
            ]
          })
        ]
      })

      const cardBody = createElement('div', {
        className: 'card-body',
        children: [
          createElement('h5', {
            className: 'card-title',
            innerText: `(${i + 1})`
          }),
          createElement('p', {
            className: 'card-text',
            innerText: title || '(No Title -_-)'
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
                className: 'btn btn-primary',
                innerText: 'Edit',
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
                className: 'btn btn-danger',
                innerText: 'Delete',
                type: 'button',
                disabled: group.rows && group.cols,
                onClick: async () => {
                  await repos.thumnail.remove(id)
                  render(selectedGroupId)
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
  for (let i = 0; i < elements.length; i = i + 3) {
    const cardGroup = document.createElement('div')
    cardGroup.className = 'card-group'
    cardGroup.style.marginBottom = '1em'

    for (let j = i; j < elements.length; j++) {
      cardGroup.appendChild(elements[j])
    }

    cardGroups.push(cardGroup)
  }

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
    render(selectedGroupId)
  })

  cardGroups.push(addThumbnailBtn)
  return cardGroups
}

function createElement (
  name,
  {
    alt = null,
    className = null,
    disabled = null,
    height = null,
    href = null,
    innerText = null,
    role = null,
    src = null,
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
      element[styleAttr] = style[styleAttr]
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

async function moveGroupDown (groupId, groups, selectedGroupId) {
  const group = groups.filter(({ id }) => id === groupId)[0]
  const index = groups.indexOf(group)

  if (index === groups.length - 1) {
    return
  }

  const groupAfter = groups[index + 1]
  const newGroups = groups
    .slice(0, index)
    .concat([groupAfter, group])
    .concat(groups.slice(index + 2))

  await repos.sync(newGroups, await repos.thumnail.list())
  render(selectedGroupId)
}

async function moveGroupUp (groupId, groups, selectedGroupId) {
  const group = groups.filter(({ id }) => id === groupId)[0]
  const index = groups.indexOf(group)

  if (index === 0) {
    return
  }

  const groupBefore = groups[index - 1]
  const newGroups = groups
    .slice(0, index - 1)
    .concat([group, groupBefore])
    .concat(groups.slice(index + 1))

  await repos.sync(newGroups, await repos.thumnail.list())
  render(selectedGroupId)
}

async function removeGroup (groupId, groups, selectedGroupId) {
  const newGroups = groups.filter(({ id }) => id !== groupId)
  await repos.sync(newGroups, await repos.thumnail.list())

  if (newGroups.length) {
    render(newGroups[0].id)
  } else {
    render(selectedGroupId)
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
