import * as platform from './_platform'
import * as repos from './_repos'

const groupsSelect = document.querySelector('select[name=groupId]')
const thumbnailsSelect = document.querySelector('select[name=thumbnailId]')
const submitButton = document.querySelector('button')

const titleInput = document.querySelector('input[name=thumbnailTitle]')
const urlInput = document.querySelector('input[name=thumbnailUrl]')

const oldTitleInput = document.querySelector('input[name=oldThumbnailTitle]')
const oldUrlInput = document.querySelector('input[name=oldThumbnailUrl]')

init()

async function init () {
  const [groups, thumbnails] = await Promise.all([
    repos.group.list(),
    repos.thumnail.list()
  ])

  const groupsElements = groups.map(({ id, name }) => {
    const element = document.createElement('option')
    element.value = id
    element.label = name
    element.innerText = name

    return element
  })

  submitButton.addEventListener('click', async () => {
    // @ts-ignore
    const thumbnailId = thumbnailsSelect.value
    // @ts-ignore
    const title = titleInput.value
    // @ts-ignore
    const url = urlInput.value

    await repos.thumnail.update(thumbnailId, { title, url })
    submitButton.disabled = true
    submitButton.innerText = 'Page Added :)'
  })

  groupsSelect.addEventListener('change', async event => {
    await initThumbnails(groups, thumbnails, {
      // @ts-ignore
      selectedGroupId: event.target.value
    })
  })

  thumbnailsSelect.addEventListener('change', event => {
    // @ts-ignore
    const thumbnailIndex =
      parseInt(event.target.selectedOptions[0].innerText, 10) - 1
    const thumbnail = thumbnails[thumbnailIndex]
    console.log({ thumbnailIndex, thumbnail, event })

    updateOldThumbnail(thumbnail)
  })

  groupsElements.forEach(element => groupsSelect.appendChild(element))

  const selectedGroupId = groups[0].id

  await initThumbnails(groups, thumbnails, { selectedGroupId })
}

async function initThumbnails (groups, thumbnails, { selectedGroupId }) {
  const groupThumbnails = thumbnails.filter(
    ({ groupId }) => groupId === selectedGroupId
  )

  const firstIndex = thumbnails.indexOf(groupThumbnails[0])
  const firstThumbnail = thumbnails[firstIndex]

  const thumbnailsElements = groupThumbnails.map((thumbnail, i) => {
    const element = document.createElement('option')
    element.value = thumbnail.id
    element.label = `${firstIndex + i + 1}`
    element.innerText = `${firstIndex + i + 1}`

    return element
  })

  while (thumbnailsSelect.firstChild) {
    thumbnailsSelect.removeChild(thumbnailsSelect.firstChild)
  }

  thumbnailsElements.forEach(element => thumbnailsSelect.appendChild(element))

  updateOldThumbnail(firstThumbnail)

  const tab = await platform.activeTab()
  const { title, url } = tab
  // @ts-ignore
  titleInput.value = title
  // @ts-ignore
  urlInput.value = url
}

function updateOldThumbnail (thumbnail) {
  // @ts-ignore
  oldTitleInput.value = thumbnail.title || '(No Title :)'
  // @ts-ignore
  oldUrlInput.value = thumbnail.url || '(No URL :)'
}