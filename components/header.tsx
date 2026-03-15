'use client'

import { Tv, Calendar as CalendarIcon, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Partidos', icon: Tv },
    { href: '/calendario', label: 'Calendario', icon: CalendarIcon },
    { href: '/equipos', label: 'Equipos', icon: Shield },
  ]

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary-foreground" />
          <span className="text-lg font-bold uppercase tracking-tight text-primary-foreground">
            Mis Partidos
          </span>
        </Link>

        <nav className="flex items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
