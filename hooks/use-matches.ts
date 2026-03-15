'use client'

import { useState, useEffect, useCallback } from 'react'
import { Match } from '@/lib/types'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchMatches = useCallback(async (date?: string) => {
    try {
      const url = date ? `/api/matches?date=${date}` : '/api/matches'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
    setIsLoaded(true)
  }, [fetchMatches])

  const addMatch = useCallback(async (data: {
    homeTeamId: string
    awayTeamId: string
    leagueId: string
    date: string
    time: string
    venue?: string
  }) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newMatch = await response.json()
        setMatches(prev => [...prev, newMatch])
        return newMatch
      }
    } catch (error) {
      console.error('Error adding match:', error)
    }
  }, [])

  const removeMatch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/matches?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMatches(prev => prev.filter(m => m.id !== id))
      }
    } catch (error) {
      console.error('Error removing match:', error)
    }
  }, [])

  return { matches, addMatch, removeMatch, isLoaded, fetchMatches }
}
