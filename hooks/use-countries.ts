'use client'

import { useState, useEffect, useCallback } from 'react'
import { Country } from '@/lib/types'

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch('/api/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error('Error fetching countries:', error)
    }
  }, [])

  useEffect(() => {
    fetchCountries()
    setIsLoaded(true)
  }, [fetchCountries])

  const createCountry = useCallback(async (data: { name: string; code?: string; flag?: string }) => {
    try {
      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const country = await response.json()
        setCountries((prev) => [...prev, country].sort((a, b) => a.name.localeCompare(b.name)))
        return country
      }
    } catch (error) {
      console.error('Error creating country:', error)
    }
  }, [])

  const updateCountry = useCallback(async (id: string, updates: Partial<Pick<Country, 'name' | 'code' | 'flag'>>) => {
    try {
      const response = await fetch('/api/countries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (response.ok) {
        const updated = await response.json()
        setCountries((prev) => prev.map((c) => (c.id === id ? updated : c)))
      }
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }, [])

  return { countries, createCountry, updateCountry, fetchCountries, isLoaded }
}
