// @ts-check
const groupRepo = (() => {
  async function getOldGroups () {
    // @ts-ignore
    const storedGroups = (await browser.storage.local.get()).groups

    if (!Array.isArray(storedGroups)) {
      // @ts-ignore
      await browser.storage.local.set({
        groups: [{ id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }]
      })
      return [{ id: 'd7bc0008-67ec-478f-b792-ae9591574939', name: ':)' }]
    }

    return storedGroups
  }

  function updateGroups (newGroups) {
    // @ts-ignore
    return browser.storage.local.set({ groups: newGroups })
  }

  return {
    add: async ({ name }) => {
      const oldGroups = await getOldGroups()
      const newGroups = oldGroups.concat({ id: uuid(), name })
      await updateGroups(newGroups)
    },
    list: getOldGroups,
    remove: async id => {
      const oldGroups = await getOldGroups()
      const newGroups = oldGroups.filter(t => t.id !== id)
      await updateGroups(newGroups)
    },
    replace: updateGroups,
    update: async (id, { name = null } = {}) => {
      const oldGroups = await getOldGroups()
      const group = oldGroups.filter(t => t.id === id)[0]

      if (!group) {
        throw new Error(`groupRepo.update: group with id "${id}" not found`)
      }

      const index = oldGroups.indexOf(group)
      const newGroup = { id: group.id, name: name || group.name }

      const newGroups = oldGroups
        .slice(0, index)
        .concat(newGroup, ...oldGroups.slice(index + 1))

      await updateGroups(newGroups)
    }
  }
})()

const thumbnailRepo = (() => {
  async function getOldThumbnails () {
    // @ts-ignore
    const storedThumbnails = (await browser.storage.local.get()).thumbnails
    return Array.isArray(storedThumbnails) ? storedThumbnails : []
  }

  function updateThumbnails (newThumbnails) {
    // @ts-ignore
    return browser.storage.local.set({ thumbnails: newThumbnails })
  }

  return {
    add: async ({ url, groupId, title = null, imgUrl = null }) => {
      const oldThumbnails = await getOldThumbnails()
      const newThumbnails = oldThumbnails.concat({
        id: uuid(),
        groupId,
        title: title || url,
        url,
        imgUrl
      })
      await updateThumbnails(newThumbnails)
    },
    list: getOldThumbnails,
    remove: async id => {
      const oldThumbnails = await getOldThumbnails()
      const newThumbnails = oldThumbnails.filter(t => t.id !== id)
      await updateThumbnails(newThumbnails)
    },
    replace: updateThumbnails,
    update: async (
      id,
      { url = null, groupId = null, title = null, imgUrl = null } = {}
    ) => {
      const oldThumbnails = await getOldThumbnails()
      const thumbnail = oldThumbnails.filter(t => t.id === id)[0]

      if (!thumbnail) {
        throw new Error(
          `thumbnailRepo.update: thumbnail with id "${id}" not found`
        )
      }

      const index = oldThumbnails.indexOf(thumbnail)
      const newThumbnail = {
        id: thumbnail.id,
        groupId: groupId || thumbnail.groupId,
        title: title || thumbnail.title,
        url: url || thumbnail.url,
        imgUrl: imgUrl || thumbnail.imgUrl
      }

      const newThumbnails = oldThumbnails
        .slice(0, index)
        .concat(newThumbnail, ...oldThumbnails.slice(index + 1))

      await updateThumbnails(newThumbnails)
    }
  }
})()

let altKeyDown = false
let ctrlKeyDown = false
let digits = [0, 0]
let digitIndex = 0

document.addEventListener('keydown', event => {
  if (
    !(
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.code === 'ControlLeft' ||
      event.code === 'ControlRight'
    )
  ) {
    return
  }

  altKeyDown = event.code === 'AltLeft' || event.code === 'AltRight'
  ctrlKeyDown = event.code === 'ControlLeft' || event.code === 'ControlRight'
})

document.addEventListener('keypress', event => {
  if (!(event.code && (altKeyDown || ctrlKeyDown))) {
    return
  }

  const match =
    event.code.match(/^Digit([0-9])$/) || event.code.match(/^Numpad([0-9])$/)

  if (!match) {
    return
  }

  event.preventDefault()

  const [, digitString] = match
  const digit = parseInt(digitString, 10)
  digits[digitIndex++ % 2] = digit
})

document.addEventListener('keyup', event => {
  if (
    !(
      (altKeyDown && (event.code === 'AltLeft' || event.code === 'AltRight')) ||
      (ctrlKeyDown &&
        (event.code === 'ControlLeft' || event.code === 'ControlRight'))
    )
  ) {
    return
  }

  const index =
    digitIndex === 1 ? digits[0] - 1 : digits[0] * 10 + digits[1] - 1

  console.log({ digits, index })
  if (index >= 0) {
    // @ts-ignore
    browser.runtime.sendMessage({
      digit: index + 1,
      altKey: altKeyDown,
      ctrlKey: ctrlKeyDown
    })
  }

  altKeyDown = false
  ctrlKeyDown = false
  digits = [0, 0]
  digitIndex = 0
})
;(async () => {
  const groups = await groupRepo.list()
  render(groups[0].id)
})()

async function render (selectedGroupId) {
  const [groups, thumbnails] = await Promise.all([
    groupRepo.list(),
    thumbnailRepo.list()
  ])

  const x = thumbnailsElements(thumbnails, selectedGroupId)
  const y = tabElement(groups, x, selectedGroupId)

  const root = document.getElementById('root')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }
  root.appendChild(y)
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
              onClick: () => {
                render(group.id)
              },
              children: [
                createElement('a', {
                  className:
                    group.id === selectedGroupId
                      ? 'nav-link active'
                      : 'nav-link',
                  href: '#',
                  innerText: group.name
                })
              ]
            })
          )
          .concat(
            createElement('li', {
              className: 'nav-item',
              onClick: async () => {
                const name = window.prompt('New Group Name')

                if (!name) {
                  return
                }

                await groupRepo.add({ name })
                render(selectedGroupId)
              },
              children: [
                createElement('a', {
                  className: 'nav-link',
                  href: '#',
                  innerText: 'Add Group'
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
      // @ts-ignore
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
        id: uuid(),
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
        const thumbnail = thumbnails[index] || { id: uuid(), imgUrl: null }
        thumbnail[attr] = value
        thumbnails[index] = thumbnail
      }

      for (let i = 0; i < thumbnails.length; i++) {
        thumbnails[i] = thumbnails[i] || {
          id: uuid(),
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

      const groups = _groups.map(({ id, name }) => ({ id, name }))
      console.log({ groups, thumbnails })
      await groupRepo.replace(groups)
      await thumbnailRepo.replace(thumbnails)
      render(groups[0].id)
    }
  })

  const cardFooter = createElement('footer', {
    className: 'card-footer',
    children: [
      createElement('button', {
        className: 'btn btn-block btn-success',
        innerText: 'Import Speed Dial',
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

function thumbnailsElements (thumbnails, selectedGroupId) {
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
                alt: 'Card image cap',
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

                  // @ts-ignore
                  const reader = new window.FileReader()
                  reader.readAsDataURL(img)
                  const newImgUrl = await (() =>
                    new Promise(resolve => {
                      reader.onload = () => resolve(reader.result)
                    }))()

                  await thumbnailRepo.update(id, { imgUrl: newImgUrl })
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
                innerText: 'T',
                type: 'button',
                onClick: async () => {
                  const newTitle = window.prompt('New Title')

                  if (!newTitle) {
                    return
                  }

                  await thumbnailRepo.update(id, { title: newTitle })
                  render(selectedGroupId)
                }
              }),
              createElement('button', {
                className: 'btn btn-primary',
                innerText: 'U',
                type: 'button',
                onClick: async () => {
                  const newUrl = window.prompt('New URL')

                  if (!newUrl) {
                    return
                  }

                  await thumbnailRepo.update(id, { url: newUrl })
                  render(selectedGroupId)
                }
              }),
              createElement('button', {
                className: 'btn btn-danger',
                innerText: 'D',
                type: 'button',
                onClick: async () => {
                  await thumbnailRepo.remove(id)
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
  addThumbnailBtn.innerText = 'Add Thumbnail'
  addThumbnailBtn.addEventListener('click', async () => {
    const url = window.prompt('New URL')
    if (!url) {
      return
    }

    await thumbnailRepo.add({ url, groupId: selectedGroupId })
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
    onDrop = null
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

  return element
}

function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
