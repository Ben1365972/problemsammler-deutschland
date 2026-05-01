# Probleme in Deutschland – Plattform

Eine offene Web-Plattform, auf der Menschen Probleme in Deutschland beschreiben,
Lösungen vorschlagen, mit Tags und Kategorien strukturieren und gemeinsam
diskutieren können.

---

## ⚠️ Wichtig: vor dem ersten `npm install`

Falls in deinem Projekt bereits ein Ordner namens `node_modules` existiert
(z.B. vom Build-Vorgang im Sandbox), **lösche ihn bitte einmal komplett**,
bevor du `npm install` ausführst:

- **Windows:** Rechtsklick auf `node_modules` → **Löschen**
- **macOS/Linux:** im Terminal `rm -rf node_modules`

Das stellt sicher, dass alle Pakete frisch und vollständig installiert werden.

---

Das Projekt ist als **Next.js 14**-App gebaut, läuft mit **SQLite** lokal
ohne weitere Konten und kann ohne großen Aufwand auf **Vercel** deployt werden.

## Was die Plattform kann

- Beiträge schreiben (anonym oder mit Account)
- In **vordefinierte Kategorien** einsortieren (Politik, Bildung, Verkehr, …) **oder eigene Kategorien anlegen**
- Beiträge mit beliebig vielen **Tags** versehen (z.B. „Problem“, „Lösung“, „Details“) und nach diesen filtern
- **Upvoten** (▲) und **Kommentieren**
- **Suche und Filter** auf der Startseite
- **Email + Passwort**-Login (kann später leicht durch GitHub-Login oder Magic-Link erweitert werden)

---

## Schnellstart auf deinem Computer

Du brauchst:
- **Node.js 20** oder neuer ([Download](https://nodejs.org))
- Ein Terminal (auf Windows z.B. PowerShell)

Schritte:

```bash
# 1. In den Projektordner wechseln
cd probleme-platform

# 2. Pakete installieren
npm install

# 3. Datenbank anlegen und mit Standard-Kategorien füllen
npx prisma migrate dev --name init
npm run db:seed

# 4. Entwicklungs-Server starten
npm run dev
```

Danach öffnest du im Browser **http://localhost:3000** – die Plattform läuft lokal.

> **Hinweis:** Die SQLite-Datei landet automatisch in `prisma/dev.db`. Sie ist
> in `.gitignore` ausgeschlossen, damit sie nicht versehentlich auf GitHub
> hochgeladen wird.

---

## Auf Vercel veröffentlichen (kostenlos)

Vercel ist die einfachste Variante, um eine Next.js-App online zu stellen.
Der Free-Tier reicht für den Anfang locker.

### Schritt 1: Code auf GitHub legen

1. Ein neues, **leeres** Repository auf GitHub anlegen (z.B. `probleme-platform`).
2. Im Projektordner:
   ```bash
   git init
   git add .
   git commit -m "Erste Version"
   git branch -M main
   git remote add origin https://github.com/DEIN-NAME/probleme-platform.git
   git push -u origin main
   ```

### Schritt 2: Postgres-Datenbank anlegen

SQLite funktioniert auf Vercel **nicht**, weil das Dateisystem dort nicht
beschreibbar ist. Du brauchst eine Postgres-Datenbank. Beide unten genannten
Anbieter haben einen kostenlosen Tarif.

**Empfehlung: Neon** ([https://neon.tech](https://neon.tech))

1. Auf neon.tech mit GitHub registrieren.
2. Neues Projekt anlegen, Region **Frankfurt** wählen.
3. Auf der Übersichtsseite den **Connection-String** kopieren
   (sieht so aus: `postgres://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`).

**Alternative: Supabase** ([https://supabase.com](https://supabase.com))

1. Auf supabase.com registrieren.
2. Neues Projekt anlegen.
3. Unter **Project Settings → Database → Connection string → URI** kopieren.

### Schritt 3: Datenbank-Provider in Prisma umstellen

In der Datei `prisma/schema.prisma` änderst du:

```prisma
datasource db {
  provider = "sqlite"          // ← das hier
  url      = env("DATABASE_URL")
}
```

zu:

```prisma
datasource db {
  provider = "postgresql"      // ← das ist neu
  url      = env("DATABASE_URL")
}
```

Lokal einmal die Migration neu erzeugen (mit deinem Postgres-`DATABASE_URL`
in `.env`):

```bash
npx prisma migrate dev --name init_postgres
npm run db:seed
```

Anschließend committen und pushen:

```bash
git add .
git commit -m "Wechsel auf Postgres"
git push
```

### Schritt 4: Auf Vercel deployen

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden.
2. **„Add New… → Project“**.
3. Dein GitHub-Repo auswählen → **Import**.
4. Vercel erkennt Next.js automatisch.
5. Unter **Environment Variables** **drei** Werte eintragen:
   | Name              | Wert                                                                                 |
   |-------------------|---------------------------------------------------------------------------------------|
   | `DATABASE_URL`    | dein Postgres-Connection-String aus Schritt 2                                         |
   | `NEXTAUTH_URL`    | die URL, die Vercel dir gleich gibt, z.B. `https://probleme-platform.vercel.app`     |
   | `NEXTAUTH_SECRET` | 32+ zufällige Zeichen. Erzeuge mit `openssl rand -base64 32` oder einer Passwort-App |
6. **„Deploy“**.

Beim ersten Build läuft `prisma generate` automatisch (siehe `package.json`).
Die Datenbank-Tabellen werden NICHT automatisch erstellt – das hast du in
Schritt 3 mit `migrate dev` schon gemacht.

> **Tipp:** Wenn du später Schema-Änderungen machst, lokal
> `npx prisma migrate dev --name irgendein_name` ausführen, das committen,
> pushen, und Vercel führt die neue Migration beim Deploy automatisch über
> `prisma migrate deploy` aus (das wird über das `build`-Skript getriggert,
> wenn du es ergänzen möchtest – Doku unten).

#### Migrations auf Vercel automatisch ausführen

Die Standard-Konfiguration lässt das Schema durch deine **lokalen** Migrations
verwalten (du führst `prisma migrate dev` aus, committest, pushst). Wenn du
willst, dass Vercel die Migrations **selbst** anwendet, ändere in `package.json`:

```json
"build": "prisma generate && prisma migrate deploy && next build",
```

---

## Datenbank-Provider später wechseln

Die Datenbank-Logik ist in `lib/db/` gekapselt. Für einen Wechsel zu einem
anderen Postgres-Anbieter:

1. Neuen Connection-String beschaffen.
2. In Vercel die `DATABASE_URL` aktualisieren.
3. Kein Code-Wechsel nötig.

Für einen Wechsel zu **MySQL** oder **MongoDB**:

1. In `prisma/schema.prisma` den Wert `provider` ändern.
2. `npx prisma migrate dev --name umzug`.
3. Code in `lib/db/` muss in der Regel **nicht** angepasst werden, weil
   Prisma die Unterschiede abfängt.

---

## Login-Provider später hinzufügen

Aktuell nutzt das Projekt einen **Email + Passwort**-Provider. Das funktioniert
ohne externe Konten.

### Variante A: GitHub-Login

1. Auf https://github.com/settings/developers eine **OAuth App** anlegen.
   - Homepage URL: `https://deine-vercel-url.vercel.app`
   - Authorization callback URL: `https://deine-vercel-url.vercel.app/api/auth/callback/github`
2. **Client ID** und **Client Secret** notieren.
3. In Vercel zwei Environment-Variables hinzufügen:
   - `GITHUB_ID`
   - `GITHUB_SECRET`
4. In `lib/auth.ts` den GitHub-Provider importieren und aktivieren:
   ```ts
   import GitHubProvider from "next-auth/providers/github";
   // …
   providers: [
     CredentialsProvider({ /* … wie bisher … */ }),
     GitHubProvider({
       clientId: process.env.GITHUB_ID!,
       clientSecret: process.env.GITHUB_SECRET!,
     }),
   ],
   ```

### Variante B: Email-Magic-Link via Resend

1. Auf https://resend.com kostenlos registrieren.
2. **API Key** erzeugen.
3. Eine Domain hinzufügen oder den Resend-Test-Sender verwenden.
4. In Vercel:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (z.B. `noreply@deine-domain.de`)
5. In `lib/auth.ts` den Email-Provider von NextAuth aktivieren.
6. Adapter für die Datenbank einrichten (NextAuth `PrismaAdapter`).

> Schau bei Bedarf in die NextAuth-Doku: <https://next-auth.js.org/providers/email>

---

## Wo welche Werte in die `.env` reinkommen

Die Datei `.env.example` zeigt alle möglichen Werte. Kopiere sie zu `.env` und
trage deine Werte ein:

| Variable          | Wofür                                                                  |
|-------------------|------------------------------------------------------------------------|
| `DATABASE_URL`    | Connection-String zur Datenbank (SQLite oder Postgres)                  |
| `NEXTAUTH_URL`    | URL der Seite (lokal: `http://localhost:3000`)                          |
| `NEXTAUTH_SECRET` | Lange zufällige Zeichenkette zum Signieren der Login-Cookies            |
| `GITHUB_ID`       | nur wenn GitHub-Login aktiviert ist                                     |
| `GITHUB_SECRET`   | nur wenn GitHub-Login aktiviert ist                                     |
| `RESEND_API_KEY`  | nur wenn Email-Magic-Link genutzt wird                                  |
| `EMAIL_FROM`      | Absender-Adresse beim Magic-Link                                        |

---

## Projekt-Struktur

```
probleme-platform/
├── app/                       # Next.js App-Router-Seiten und API-Routes
│   ├── api/                   # REST-Endpunkte (/api/posts, /api/categories, …)
│   ├── auth/signin/           # Login/Register-Seite
│   ├── neuer-beitrag/         # Beitrag-erstellen-Formular
│   ├── post/[id]/             # Detail-Seite eines Beitrags
│   ├── layout.tsx             # gemeinsames Layout (Kopf + Footer)
│   ├── globals.css            # Tailwind-Stile
│   └── page.tsx               # Startseite mit Filter und Liste
├── components/                # React-Komponenten (Buttons, Karten, Formulare)
├── lib/
│   ├── db/                    # ⚠ ALLE Datenbank-Zugriffe hier — Provider-Wechsel = einfacher
│   │   ├── prisma.ts          # zentrale Prisma-Instanz
│   │   ├── posts.ts           # Beiträge: erstellen, listen, voten, kommentieren
│   │   └── meta.ts            # Kategorien & Tags
│   ├── anon.ts                # Anonyme Sessions per Cookie + Rate-Limit
│   └── auth.ts                # NextAuth-Konfiguration
├── prisma/
│   ├── schema.prisma          # Datenbank-Schema
│   ├── seed.ts                # Vordefinierte Kategorien & Tags
│   └── migrations/            # automatisch erzeugt von prisma migrate
├── package.json
├── tailwind.config.ts
└── README.md                  # diese Datei
```

---

## Häufige Probleme

**„Cannot find module @prisma/client“** — `npm install` vergessen? Oder das
`postinstall`-Skript wurde übersprungen. Manuell `npx prisma generate` ausführen.

**Auf Vercel: „Database error … unable to open database file“** — du bist noch
auf SQLite. Wechsel zu Postgres durchführen (siehe oben).

**Login schlägt fehl mit „NEXTAUTH_SECRET missing“** — `NEXTAUTH_SECRET` in der
`.env` (lokal) oder in Vercel (online) eintragen.

**Anonymes Posten gibt 429 zurück** — Anti-Spam-Limit (max. 5 anonyme Beiträge
pro Stunde pro Browser). Anmelden hilft, oder das Limit in `lib/anon.ts`
erhöhen (Funktion `checkAnonRateLimit`).

---

## Verifizierter Stand

Beim Bauen automatisch getestet (alle erfolgreich):

- Build ohne Fehler (`npm run build`)
- Seed legt 12 Kategorien und 6 Standard-Tags an
- POST `/api/posts` (anonym) erstellt Beitrag
- POST `/api/posts/:id/comments` legt Kommentar an
- POST `/api/posts/:id/vote` toggelt Stimme
- GET `/api/posts?category=…` filtert nach Kategorie
- GET `/api/posts?tags=…` filtert nach Tag
- GET `/api/posts?q=…` sucht im Titel/Inhalt
- Detail-Seite `/post/:id` rendert
- Startseite, Login, Beitrag-erstellen-Seite rendern

---

## Lizenz / Weiternutzung

Frei für deinen eigenen Gebrauch. Für eine produktive Plattform empfehlen sich
zusätzlich noch: Datenschutzerklärung, Impressum, Moderation, Captcha gegen
Spam, Email-Bestätigung beim Registrieren.
