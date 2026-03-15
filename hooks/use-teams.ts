'use client'

import { useState, useEffect, useCallback } from 'react'
import { Team } from '@/lib/types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchTeams = useCallback(async (leagueId?: string) => {
    try {
      const url = leagueId ? `/api/teams?leagueId=${leagueId}` : '/api/teams'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
    setIsLoaded(true)
  }, [fetchTeams])

  const createTeam = useCallback(async (data: { name: string; leagueId: string; logo?: string }) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newTeam = await response.json()
        setTeams(prev => [...prev, newTeam].sort((a, b) => a.name.localeCompare(b.name)))
        return newTeam
      }
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }, [])

  const ensureTeam = useCallback(async (name: string, leagueId: string, countryId?: string) => {
    const existing = teams.find(t => t.name.toLowerCase() === name.toLowerCase() && t.leagueId === leagueId)
    if (existing) return existing
    const created = await createTeam({ name, leagueId })
    return created ?? null
  }, [teams, createTeam])

  const updateTeam = useCallback(async (id: string, updates: Partial<Pick<Team, 'name' | 'logo'>>) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (response.ok) {
        const updated = await response.json()
        setTeams((prev) => prev.map((t) => (t.id === id ? updated : t)))
      }
    } catch (error) {
      console.error('Error updating team:', error)
    }
  }, [])

  const removeTeam = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/teams?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (response.ok) setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }, [])

  return { teams, createTeam, ensureTeam, updateTeam, removeTeam, isLoaded, fetchTeams }
}
