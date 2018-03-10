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

async function render (selectedGroupId) {
  const [groups, thumbnails] = await Promise.all([
    groupRepo.list(),
    thumbnailRepo.list()
  ])

  const x = thumbnailsElements(
    thumbnails.filter(t => t.groupId === selectedGroupId),
    selectedGroupId
  )
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

  const cardFooter = createElement('footer', {
    className: 'card-footer',
    children: [
      createElement('button', {
        className: 'btn btn-block btn-success',
        disabled: 'disabled',
        innerText: 'Import Speed Dial',
        type: 'button'
      })
    ]
  })

  tab.appendChild(header)
  tab.appendChild(cardBody)
  tab.appendChild(cardFooter)
  return tab
}

function thumbnailsElements (thumbnails, selectedGroupId) {
  const elements = thumbnails.map(({ id, url, title, imgUrl }, i) => {
    const card = createElement('article', {
      className: 'card',
      children: [
        createElement('a', {
          href: url,
          children: [
            createElement('img', {
              alt: 'Card image cap',
              className: 'card-img-top',
              src:
                imgUrl || `https://via.placeholder.com/350x150?text=${i + 1}`,
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
          innerText: title
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

document.addEventListener('keypress', event => {
  if (!event.ctrlKey || !event.code) {
    return
  }

  const match = event.code.match(/^Digit([0-9])$/)

  if (!match) {
    return
  }

  event.preventDefault()

  const [, digitString] = match
  const digit = parseInt(digitString, 10)

  // @ts-ignore
  browser.runtime.sendMessage({ digit })
})

render('d7bc0008-67ec-478f-b792-ae9591574939')

function createElement (
  name,
  {
    alt = null,
    className = null,
    disabled = null,
    href = null,
    innerText = null,
    role = null,
    src = null,
    type = null,
    children = [],
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

  if (children.length) {
    children.forEach(child => element.appendChild(child))
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