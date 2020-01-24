const repos = require('../repos')
const utils = require('./_utils')

module.exports = (
  thumbnails,
  selectedGroupId,
  group,
  {
    editThumbnailIdInput,
    editThumbnailTitleInput,
    editThumbnailUrlInput,
    editThumbnailImg,
    editThumbnailModal,

    render
  }
) => {
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
        for (const item of items) {
          if (item.kind === 'string' && item.type === 'text/plain') {
            // @todo: use an async helper instead
            // @todo: add support for title too
            item.getAsString(async url => {
              await repos.thumnail.update(id, { url })
              render(selectedGroupId)
            })

            return
          }
        }

        const img = item.getAsFile()
        const newImgUrl = await utils.imageUrl(img)

        if (newImgUrl) {
          await repos.thumnail.imgUrl(id, newImgUrl)
        }

        render(selectedGroupId)
      }

      const { maxWidth, maxHeight } = getThumbnailDimensions(
        group.thumbnailImgSize
      )

      const card = utils.createElement('article', {
        className: 'card',
        onDrop,
        children: [
          utils.createElement('a', {
            href: url || '#',
            children: [
              utils.createElement('img', {
                alt: `${i + 1}`,
                className: 'card-img-top',
                height: 100,
                src: imgUrl || '../../icons/loading.svg',
                width: 100,
                style: { maxWidth, maxHeight },
                map: async element => {
                  setTimeout(async () => {
                    const storedImgUrl = await repos.thumnail.imgUrl(id)
                    const displayableImgUrl = storedImgUrl || imgUrl

                    if (!(displayableImgUrl || url)) {
                      const newElement = utils.createElement('span', {
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

      const cardBody = utils.createElement('div', {
        className: 'card-body',
        children: [
          utils.createElement('p', {
            className: 'card-text',
            children: [
              utils.createElement('img', {
                src: utils.faviconImageUrl(url),
                width: 16,
                height: 16,
                style: { marginRight: '0.25em' }
              }),
              utils.createElement('span', {
                innerText: `(${i + 1}) - ${title || '(No Title -_-)'}`
              })
            ]
          })
        ]
      })

      const cardFooter = utils.createElement('footer', {
        className: 'card-footer',
        style: { padding: '0.5em' },
        children: [
          utils.createElement('div', {
            className: 'btn-group',
            role: 'group',
            children: [
              utils.createElement('button', {
                className: 'btn btn-sm btn-primary',
                innerText: 'Edit...',
                type: 'button',
                onClick: () => {
                  editThumbnailIdInput.value = id
                  editThumbnailTitleInput.value = title
                  editThumbnailUrlInput.value = url
                  editThumbnailImg.value = ''
                  editThumbnailModal.modal('show')
                }
              }),
              utils.createElement('button', {
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
      render(selectedGroupId)
    })

    cardGroups.push(addThumbnailBtn)
  }

  return cardGroups
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
