'use client'

import { useState, useEffect, useCallback } from 'react'
import { Match, SavedMatch } from '@/lib/types'

const STORAGE_KEY = 'mis-partidos-saved'

export function useSavedMatches() {
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSavedMatches(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing saved matches:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever savedMatches changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMatches))
    }
  }, [savedMatches, isLoaded])

  const saveMatch = useCallback((match: Match) => {
    setSavedMatches((prev) => {
      const exists = prev.some((m) => m.id === match.id)
      if (exists) return prev
      
      return [
        ...prev,
        {
          ...match,
          savedAt: new Date().toISOString(),
          reminder: true,
        },
      ]
    })
  }, [])

  const removeMatch = useCallback((matchId: string) => {
    setSavedMatches((prev) => prev.filter((m) => m.id !== matchId))
  }, [])

  const toggleMatch = useCallback((match: Match) => {
    setSavedMatches((prev) => {
      const exists = prev.some((m) => m.id === match.id)
      if (exists) {
        return prev.filter((m) => m.id !== match.id)
      }
      return [
        ...prev,
        {
          ...match,
          savedAt: new Date().toISOString(),
          reminder: true,
        },
      ]
    })
  }, [])

  const isSaved = useCallback(
    (matchId: string) => savedMatches.some((m) => m.id === matchId),
    [savedMatches]
  )

  const toggleReminder = useCallback((matchId: string) => {
    setSavedMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, reminder: !m.reminder } : m
      )
    )
  }, [])

  return {
    savedMatches,
    saveMatch,
    removeMatch,
    toggleMatch,
    isSaved,
    toggleReminder,
    isLoaded,
  }
}
