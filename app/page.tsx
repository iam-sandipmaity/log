import Timeline from '@/components/Timeline'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Filters from '@/components/Filters'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Filters />
          <Timeline />
        </div>
      </main>
      <Footer />
    </div>
  )
}
