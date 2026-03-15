'use client'

import { useEffect, useRef } from 'react'

const SW_URL = '/sw.js'
const SAVED_KEY = 'mis-partidos-saved'
const NOTIFIED_KEY = 'mis-partidos-notified'
const REMINDER_PREFS_KEY = 'mis-partidos-reminder-minutes'

export const REMINDER_OPTIONS = [30, 60] as const

function getReminderMinutes(): number[] {
  if (typeof window === 'undefined') return [30, 60]
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as number[]
      return Array.isArray(arr) ? arr.filter((n) => REMINDER_OPTIONS.includes(n as 30 | 60)) : [30, 60]
    }
  } catch (_) {}
  return [30, 60]
}

function getNotifiedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as string[]
      return new Set(Array.isArray(arr) ? arr : [])
    }
  } catch (_) {}
  return new Set()
}

function addNotified(key: string) {
  const set = getNotifiedSet()
  set.add(key)
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]))
  } catch (_) {}
}

function getSavedMatches(): Array<{ id: string; date: string; time: string; homeTeam?: { name?: string }; awayTeam?: { name?: string }; reminder?: boolean }> {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown[]
    return (Array.isArray(arr) ? arr : []).filter(
      (m): m is { id: string; date: string; time: string; homeTeam?: { name?: string }; awayTeam?: { name?: string }; reminder?: boolean } =>
        m != null && typeof m === 'object' && 'id' in m && 'date' in m && 'time' in m
    )
  } catch (_) {
    return []
  }
}

function getMatchTime(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0, 0, 0).getTime()
}

function cleanupOldNotified() {
  const matches = getSavedMatches()
  const matchIds = new Set(matches.map((m) => m.id))
  const notified = getNotifiedSet()
  const toRemove: string[] = []
  notified.forEach((key) => {
    const matchId = key.replace(/-30$|-60$/, '')
    if (!matchIds.has(matchId)) toRemove.push(key)
  })
  if (toRemove.length === 0) return
  toRemove.forEach((k) => notified.delete(k))
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified]))
  } catch (_) {}
}

function checkAndNotify(registration: ServiceWorkerRegistration | null) {
  const minutes = getReminderMinutes()
  if (minutes.length === 0) return
  const matches = getSavedMatches().filter((m) => m.reminder !== false)
  const now = Date.now()
  const notified = getNotifiedSet()

  for (const match of matches) {
    const matchTime = getMatchTime(match.date, match.time)
    const home = match.homeTeam?.name ?? 'Local'
    const away = match.awayTeam?.name ?? 'Visitante'
    const title = `${home} vs ${away}`

    for (const min of minutes) {
      const key = `${match.id}-${min}`
      if (notified.has(key)) continue
      const target = matchTime - min * 60 * 1000
      if (now >= target - 60 * 1000 && now <= target + 60 * 1000) {
        const body = min === 60 ? 'El partido empieza en 1 hora.' : `El partido empieza en ${min} minutos.`
        if (registration?.showNotification) {
          registration.showNotification(title, { body, icon: '/icon.png', tag: key })
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/icon.png', tag: key })
        }
        addNotified(key)
      }
    }
  }
  cleanupOldNotified()
}

export function PWAProvider() {
  const regRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        regRef.current = registration
        registration.update()
        checkAndNotify(registration)
      })
      .catch(() => {})

    const interval = setInterval(() => {
      checkAndNotify(regRef.current ?? null)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}

export function setReminderMinutes(minutes: number[]) {
  try {
    localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify(minutes))
  } catch (_) {}
}

export function getReminderMinutesPref(): number[] {
  return getReminderMinutes()
}
