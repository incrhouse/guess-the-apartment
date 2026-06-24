import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getEntryBySlug, getAllSlugs, getRandomEntry } from '@/lib/data'
import GameClient from './GameClient'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getEntryBySlug(params.slug)
  if (!entry) return {}

  return {
    title: entry.seo_meta.title,
    description: entry.seo_meta.description,
    keywords: [
      ...entry.flaw_tags,
      entry.city.toLowerCase(),
      'apartment flaw',
      'floor plan game',
      'rental apartment problems',
      `${entry.apartment_type.toLowerCase()} apartment`,
    ].join(', '),
    openGraph: {
      title: entry.seo_meta.title,
      description: entry.seo_meta.description,
      type: 'website',
    },
  }
}

export default function PlayPage({ params }: Props) {
  const entry = getEntryBySlug(params.slug)
  if (!entry) notFound()

  const nextEntry = getRandomEntry(params.slug)

  return <GameClient entry={entry} nextSlug={nextEntry.slug} />
}