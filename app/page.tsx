import { getAllEntries, getRandomEntry } from '@/lib/data'

export default function HomePage() {
  const featured = getAllEntries().slice(0, 6)
  const randomEntry = getRandomEntry()
  const cities = [...new Set(getAllEntries().map((e) => e.city))].sort()
  const categories = [...new Set(getAllEntries().map((e) => e.flaw_category))].sort()

  return (
    <div className="min-h-screen bg-paper font-body">
      <header className="border-b-2 border-ink px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display text-xl font-bold text-ink tracking-tight">
            Guess The Apartment
          </a>
          <span className="font-mono text-xs text-muted hidden md:block">
            {getAllEntries().length} floor plans
          </span>
        </div>
      </header>

      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="font-mono text-xs text-authority uppercase tracking-widest mb-4">
            Free apartment quiz game
          </p>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-ink leading-none mb-6 max-w-2xl">
            Can you spot what is wrong with this apartment?
          </h1>
          <p className="font-body text-lg text-muted max-w-xl mb-10 leading-relaxed">
            Every floor plan hides a flaw. Test your eye.
          </p>
          <a href={"/play/" + randomEntry.slug} className="inline-block bg-ink text-paper font-bold text-sm uppercase tracking-widest py-4 px-10 hover:bg-authority transition-colors">
            Start Playing
          </a>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-8">Recent floor plans</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((entry) => (
              <a key={entry.slug} href={"/play/" + entry.slug} className="block p-6 border-2 border-ink bg-paper hover:bg-blue-50 transition-colors group" style={{ textDecoration: 'none' }}>
                <div className="aspect-video bg-white border border-ink mb-4 overflow-hidden">
  {(entry as any).city_image ? (
    <img
      src={(entry as any).city_image}
      alt={entry.city}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full floor-plan-placeholder flex items-center justify-center">
      <span className="font-mono text-xs text-muted uppercase tracking-widest">
        {entry.city}
      </span>
    </div>
  )}
</div>
                <p className="font-mono text-xs text-authority uppercase tracking-wider mb-2">
                  {entry.apartment_type} · {entry.flaw_category.replace(/_/g, ' ')}
                </p>
                <p className="font-display text-sm font-semibold text-ink leading-snug group-hover:text-authority transition-colors">
                  {entry.question}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">Browse by city</p>
          <div className="flex flex-wrap gap-3">
            {cities.map((city) => (
              <a key={city} href={"/play/" + getAllEntries().find((e) => e.city === city)?.slug} className="font-mono text-xs border border-ink px-3 py-2 uppercase tracking-wider hover:bg-ink hover:text-paper transition-colors" style={{ textDecoration: 'none' }}>
                {city}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">Browse by flaw type</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <a key={cat} href={"/play/" + getAllEntries().find((e) => e.flaw_category === cat)?.slug} className="font-mono text-xs border border-muted px-3 py-2 uppercase tracking-wider text-muted hover:border-ink hover:text-ink transition-colors" style={{ textDecoration: 'none' }}>
                {cat.replace(/_/g, ' ')}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="font-mono text-xs text-muted">
            {new Date().getFullYear()} Guess The Apartment
          </p>
        </div>
      </footer>
    </div>
  )
}
