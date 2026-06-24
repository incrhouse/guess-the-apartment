export interface ApartmentEntry {
  id: string
  slug: string
  city: string
  apartment_type: string
  question: string
  options: string[]
  correct_answer_index: number
  correct_answer: string
  explanation: string
  flaw_category: string
  flaw_tags: string[]
  seo_meta: {
    title: string
    description: string
  }
  midjourney_prompt: string
  image?: string
}