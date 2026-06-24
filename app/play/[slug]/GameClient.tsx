'use client'

import { useState } from 'react'
import type { ApartmentEntry } from '@/lib/types'

interface Props {
  entry: ApartmentEntry
  nextSlug: string
}

const LABELS = ['A', 'B', 'C', 'D']

export default function GameClient({ entry, nextSlug }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const isCorrect = selected === entry.correct_answer_index

  function handleAnswer(index: number) {
    if (answered) return
    setSelected(index)
  }

  function optionClass(index: number) {
    const base = 'answer-option w-full text-left p-4 text-sm'
    if (!answered) return base
    if (index === entry.correct_answer_index) return base + ' revealed-correct'
    if (index === selected) return base + ' wrong'
    return base + ' opacity-50'
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink px-6 py-3 flex items-center justify-between">
        <a href="/" className="font-mono text-xs text-ink tracking-widest uppercase">
          Guess The Apartment
        </a>
        <span className="font-mono text-xs text-muted uppercase">
          {entry.city}
        </span>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-1/2">
            <div className="relative border-2 border-ink bg-white aspect-square overflow-hidden">
              {entry.image ? (
                <img src={entry.image} alt={entry.city + " floor plan"} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full floor-plan-placeholder flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-mono text-xs text-muted mb-2 tracking-widest uppercase">Floor Plan</div>
                    <div className="font-mono text-xs text-muted">{entry.city}</div>
                  </div>
                </div>
              )}
              {answered && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={"stamp-animate border-4 px-6 py-3 " + (isCorrect ? "border-green-600 text-green-600" : "border-flaw text-flaw")}
                    style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", rotate: "-12deg" }}
                  >
                    {isCorrect ? "Flaw Identified" : "Missed It"}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3">
              <span className="font-mono text-xs text-muted border border-muted px-2 py-1 uppercase tracking-wider">
                {entry.flaw_category.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div>
              <p className="font-mono text-xs text-authority uppercase tracking-widest mb-3">Spot the flaw</p>
              <h1 className="font-display text-xl lg:text-2xl font-semibold text-ink leading-snug">{entry.question}</h1>
            </div>
            <div className="flex flex-col gap-3">
              {entry.options.map((option, index) => (
                <button key={index} onClick={() => handleAnswer(index)} disabled={answered} className={optionClass(index)}>
                  <span className="font-mono text-xs text-muted mr-3">{LABELS[index]}</span>
                  {option}
                </button>
              ))}
            </div>
            {answered && (
              <div className={"border-l-4 pl-4 py-1 " + (isCorrect ? "border-green-600" : "border-flaw")}>
                <p className={"font-mono text-xs uppercase tracking-wider mb-2 " + (isCorrect ? "text-green-600" : "text-flaw")}>
                  {isCorrect ? "Correct" : "Wrong"}
                </p>
                <p className="text-sm text-ink leading-relaxed">{entry.explanation}</p>
              </div>
            )}
            {answered && (
              <a href={"/play/" + nextSlug} className="w-full bg-ink text-paper font-bold text-sm uppercase tracking-widest py-4 px-6 text-center hover:bg-authority transition-colors" style={{ display: 'block', textDecoration: 'none' }}>
                Next Property
              </a>
            )}
            <div className="border border-dashed border-muted h-24 flex items-center justify-center">
              <span className="font-mono text-xs text-muted uppercase tracking-widest">Ad</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t-2 border-ink mt-16 px-6 py-8">
        <p className="font-mono text-xs text-muted">{new Date().getFullYear()} Guess The Apartment</p>
      </footer>
    </div>
  )
}
