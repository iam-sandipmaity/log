'use client'

import { useState, useEffect } from 'react'
import Timeline from '@/components/Timeline'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Filters from '@/components/Filters'
import Footer from '@/components/Footer'
import type { EventType, Repo } from '@/types'

export default function Home() {
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [selectedType, setSelectedType] = useState<EventType | ''>('')
  const [repos, setRepos] = useState<Repo[]>([])

  useEffect(() => {
    // Fetch available repos for the filter dropdown
    fetch('/api/repos')
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setRepos(data)
        } else {
          console.error('Invalid repos data:', data)
          setRepos([])
        }
      })
      .catch((err) => {
        console.error('Failed to fetch repos:', err)
        setRepos([])
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Filters
            selectedRepo={selectedRepo}
            selectedType={selectedType}
            repos={repos}
            onRepoChange={setSelectedRepo}
            onTypeChange={setSelectedType}
          />
          <Timeline selectedRepo={selectedRepo} selectedType={selectedType} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
