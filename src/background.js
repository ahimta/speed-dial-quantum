// @ts-check
import * as platform from './_platform'
import * as repos from './_repos'

platform.onMessage(async request => {
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
