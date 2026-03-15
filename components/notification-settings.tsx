'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  REMINDER_OPTIONS,
  getReminderMinutesPref,
  setReminderMinutes,
} from '@/components/pwa-provider'

export function NotificationSettings() {
  const [minutes, setMinutes] = useState<number[]>(() => getReminderMinutesPref())
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof Notification !== 'undefined') setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setReminderMinutes(minutes)
  }, [minutes, mounted])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const toggle = (value: number) => {
    setMinutes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value].sort((a, b) => a - b)
    )
  }

  const sendTestNotification = async () => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const title = 'Mis Partidos – Prueba'
    const body = 'Recordatorio de prueba: Partido Local vs Visitante en 30 min.'
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        if (reg.showNotification) {
          reg.showNotification(title, {
            body,
            icon: '/icon.png',
            tag: 'test-notification',
            requireInteraction: true,
            silent: false,
            vibrate: [200, 100, 200],
          })
          return
        }
      } catch (_) {}
    }
    new Notification(title, {
      body,
      icon: '/icon.png',
      tag: 'test-notification',
      requireInteraction: true,
    })
  }

  if (!mounted) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-foreground">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Recordatorios antes del partido</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Recibí notificaciones 30 min y/o 1 hora antes de cada partido guardado.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={minutes.includes(30)}
              onCheckedChange={() => toggle(30)}
              disabled={permission !== 'granted'}
            />
            30 min antes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={minutes.includes(60)}
              onCheckedChange={() => toggle(60)}
              disabled={permission !== 'granted'}
            />
            1 hora antes
          </label>
        </div>

        {permission === 'default' && (
          <Button size="sm" onClick={requestPermission} className="gap-2">
            <Bell className="h-4 w-4" />
            Activar notificaciones
          </Button>
        )}
        {permission === 'denied' && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="h-4 w-4" />
            Notificaciones bloqueadas. Activálas en la configuración del navegador.
          </span>
        )}
        {permission === 'granted' && (
          <>
            <span className="text-sm text-green-600 dark:text-green-400">Notificaciones activas</span>
            <Button size="sm" variant="outline" onClick={sendTestNotification} className="gap-2">
              <Send className="h-4 w-4" />
              Probar notificación
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
