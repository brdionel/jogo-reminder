import { Header } from '@/components/header'
import { SavedMatches } from '@/components/saved-matches'
import { NotificationSettings } from '@/components/notification-settings'

export default function GuardadosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Partidos Guardados
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tus partidos favoritos en un solo lugar
          </p>
        </div>
        <div className="mb-8">
          <NotificationSettings />
        </div>
        <SavedMatches />
      </main>
    </div>
  )
}
