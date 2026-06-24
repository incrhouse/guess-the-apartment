import entries from '@/data/entries.json'
import type { ApartmentEntry } from './types'

const allEntries = entries as ApartmentEntry[]

export function getAllEntries(): ApartmentEntry[] {
  return allEntries
}

export function getEntryBySlug(slug: string): ApartmentEntry | undefined {
  return allEntries.find((e) => e.slug === slug)
}

export function getAllSlugs(): string[] {
  return allEntries.map((e) => e.slug)
}

export function getRandomEntry(excludeSlug?: string): ApartmentEntry {
  const pool = excludeSlug
    ? allEntries.filter((e) => e.slug !== excludeSlug)
    : allEntries
  return pool[Math.floor(Math.random() * pool.length)]
}