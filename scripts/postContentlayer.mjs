import { writeFileSync } from 'fs'
import GithubSlugger from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import siteMetadata from '../data/siteMetadata.js'

const isProduction = process.env.NODE_ENV === 'production'

export async function createTagCount() {
  const tagCount = {}
  const slugger = new GithubSlugger() // Create a new instance of GithubSlugger

  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || !file.draft)) {
      file.tags.forEach((tag) => {
        // Use the slug method on the instance of GithubSlugger
        const formattedTag = slugger.slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
        // Reset the slugger state for each tag to prevent duplicate slug increments
        slugger.reset()
      })
    }
  })

  writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
}

export async function createSearchIndex() {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

async function postContentlayer() {
  await createTagCount()
  await createSearchIndex()
}

postContentlayer()
