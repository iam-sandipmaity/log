import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-semibold text-foreground hover:text-accent transition-colors">
              log.sandipmaity.me
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link 
              href="https://sandipmaity.me" 
              target="_blank"
              className="text-sm text-gray-600 hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link 
              href="https://github.com/iam-sandipmaity" 
              target="_blank"
              className="text-sm text-gray-600 hover:text-accent transition-colors"
            >
              GitHub
            </Link>
            <Link 
              href="mailto:contact@sandipmaity.me"
              className="text-sm text-gray-600 hover:text-accent transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
