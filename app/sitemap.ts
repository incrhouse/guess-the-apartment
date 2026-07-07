import { MetadataRoute } from 'next'
import entries from '@/data/entries.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const entryUrls = entries.map((entry: { slug: string }) => ({
    url: `https://guesstheapartment.com/play/${entry.slug}`,
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
