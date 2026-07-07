import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = require('../data/entries.json').map((e: { slug: string }) => e.slug)

  const entryUrls = slugs.map((slug: string) => ({
    url: `https://guesstheapartment.com/play/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://guesstheapartment.com',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...entryUrls,
  ]
}
