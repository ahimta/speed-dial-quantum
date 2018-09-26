const platform = require('../platform')
const repos = require('../repos')

platform.onMessage(async request => {
  if (request.type === 'open-all-tabs') {
    const groupId = request.groupId
    const thumbnails = await repos.thumnail.list()

    const groupThumbnails = thumbnails.filter(
      ({ groupId: gId }) => gId === groupId
    )
    groupThumbnails.filter(({ url }) => url).forEach(async ({ url }) => {
      await platform.createTab({ url })
    })

    return
  }

  const index = parseInt(request.digit, 10) - 1

  const url = await storedUrl(index)
  if (!url) {
    return
  }

  if (request.altKey) {
    platform.createTab({ url })
  } else if (request.ctrlKey) {
    platform.updateTab({ url })
  }
})

async function storedUrl (index) {
  const results = await repos.thumnail.list()
  const thumbnail = results[index]
  return thumbnail && thumbnail.url
}
