'use client'

import { useState, useEffect } from 'react'

interface DiffViewerProps {
  filename: string
  patch?: string
  status: string
  additions: number
  deletions: number
}

export default function DiffViewer({ filename, patch, status, additions, deletions }: DiffViewerProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusColor = () => {
    switch (status) {
      case 'added':
        return 'text-green-600 dark:text-green-400'
      case 'removed':
        return 'text-red-600 dark:text-red-400'
      case 'modified':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'added':
        return '+'
      case 'removed':
        return '-'
      case 'modified':
        return '~'
      default:
        return '•'
    }
  }

  const parsePatch = (patch: string) => {
    const lines = patch.split('\n')
    return lines.map((line, idx) => {
      let type = 'context'
      let bgColor = 'bg-transparent'
      let textColor = 'text-gray-700 dark:text-gray-300'

      if (line.startsWith('+') && !line.startsWith('+++')) {
        type = 'addition'
        bgColor = 'bg-green-50 dark:bg-green-900/20'
        textColor = 'text-green-800 dark:text-green-200'
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        type = 'deletion'
        bgColor = 'bg-red-50 dark:bg-red-900/20'
        textColor = 'text-red-800 dark:text-red-200'
      } else if (line.startsWith('@@')) {
        type = 'hunk'
        bgColor = 'bg-blue-50 dark:bg-blue-900/20'
        textColor = 'text-blue-800 dark:text-blue-200'
      }

      return (
        <div key={idx} className={`${bgColor} ${textColor} px-4 py-0.5 font-mono text-sm`}>
          {line || ' '}
        </div>
      )
    })
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`font-bold ${getStatusColor()}`}>{getStatusIcon()}</span>
          <span className="font-mono text-sm">{filename}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {additions > 0 && (
            <span className="text-green-600 dark:text-green-400">+{additions}</span>
          )}
          {deletions > 0 && (
            <span className="text-red-600 dark:text-red-400">-{deletions}</span>
          )}
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && patch && (
        <div className="bg-white dark:bg-gray-900 overflow-x-auto">
          {parsePatch(patch)}
        </div>
      )}

      {expanded && !patch && (
        <div className="p-4 text-gray-500 dark:text-gray-400 text-sm italic">
          No diff available for this file
        </div>
      )}
    </div>
  )
}
