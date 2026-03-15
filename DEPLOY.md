# Deploy – Mis Partidos

## Resumen

- **En local** usás SQLite (`prisma/dev.db`). No hace falta configurar nada.
- **En producción** (Vercel, etc.) el filesystem no es persistente, así que **sí tenés que usar una base de datos externa** (PostgreSQL recomendado).

---

## Opción recomendada: Vercel + PostgreSQL

### 1. Base de datos PostgreSQL

Creá una base gratis en:

- **[Neon](https://neon.tech)** (recomendado) o
- **[Supabase](https://supabase.com)** o
- **Vercel Postgres** (desde el dashboard de Vercel).

Copiá la **connection string** (algo como  
`postgresql://usuario:password@host/dbname?sslmode=require`).

### 2. Configurar Prisma para producción

En `prisma/schema.prisma` cambiá el **datasource** a PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Dejá el resto del schema igual. Guardá en UTF-8.

### 3. Variables de entorno

- Creá un archivo `.env` en la raíz (solo para probar en local con Postgres) o configuralas en el host.
- Agregá:

```env
DATABASE_URL="postgresql://..."
```

En **Vercel**: Proyecto → Settings → Environment Variables → añadí `DATABASE_URL` con esa URL (para Production, Preview y Development si querés).

### 4. Crear tablas en la base nueva

Una sola vez (con la `DATABASE_URL` apuntando a tu Postgres):

```bash
npx prisma db push
```

O, si usás migraciones:

```bash
npx prisma migrate deploy
```

Así la base en la nube queda con todas las tablas.

### 5. Deploy en Vercel

1. Subí el repo a GitHub (o conectá el repo que ya uses).
2. En [vercel.com](https://vercel.com): **Add New Project** → importá el repo.
3. En **Environment Variables** agregá `DATABASE_URL` (mismo valor que antes).
4. **Build Command** (opcional, Vercel suele detectar Next.js):
   - Podés dejarlo por defecto o usar: `prisma generate && next build`.
5. Deploy.

En el primer deploy, las tablas ya tienen que existir (por el paso 4). La app llama a `/api/init`, que crea el país por defecto si no existe.

---

## Qué hace la app con la base de datos

- **Países, ligas, equipos, partidos** se guardan en la base (Prisma).
- **Partidos guardados** y **preferencias de notificaciones** se guardan en el **navegador** (localStorage), no en el servidor.

No hace falta “migrar” nada de SQLite a Postgres a mano: en producción la base empieza vacía y los usuarios crean países, ligas, equipos y partidos en la nueva base.

---

## Otra opción: mantener SQLite (Railway, Render, etc.)

Si desplegás en **Railway**, **Render** o un VPS donde tengas disco persistente, podés seguir usando SQLite:

- Dejá el schema con `provider = "sqlite"`.
- Configurá la **url** para que apunte a una ruta persistente (por ejemplo un volumen que no se borre en cada deploy).
- En esos hosts suele hacerse con variables de entorno y una ruta tipo `/data/dev.db`.

En **Vercel** SQLite no es viable porque el filesystem es efímero.

---

## Checklist rápido

- [ ] Base PostgreSQL creada (Neon / Supabase / Vercel Postgres).
- [ ] `DATABASE_URL` en `.env` o en las variables del proyecto en Vercel.
- [ ] `prisma/schema.prisma` con `provider = "postgresql"` y `url = env("DATABASE_URL")`.
- [ ] Ejecutado `npx prisma db push` (o `migrate deploy`) una vez contra esa URL.
- [ ] Deploy en Vercel con `DATABASE_URL` configurada.
