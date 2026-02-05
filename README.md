# Klient for Nasjonal Inndelingsbase (NIBAS)

En klient som er bygget med React og TypeScript, og som bruker Vite som utviklingsverktøy og bundler.

## Lokal utvikling

### Miljøvariabeler

I prod brukes Caddy som proxy, og alle credentials hentes automatisk fra Google Secret Manager (GSM). For lokal utvikling brukes Vite dev server, og du må sette credentials manuelt i `.env.local`.

For de låste WMS-kartene er du nødt til å bruke din BAAT-bruker du får via geonorge sine sider:

```
VITE_BAAT_USERNAME=Ditt_BAAT_brukernavn
VITE_BAAT_PASSWORD=Ditt_BAAT_passord
```

For matrikkel WFS (finnes i GSM under `matrikkelen-wfs-credentials` og `matrikkelen-wfs-url`):

```
VITE_MATRIKKELWFS_AUTH
VITE_MATRIKKELWFS_URL
```


For å hente aktive feature-miljøer fra GitHub, sett følgende i `.env.local`:

```
VITE_REPO_PR_ACCESS
```

### Oppstart av applikasjonen

Last ned dependencies med

```
npm i
```

Start opp en dev-server med

```
npm start
```

For å hente ut grenser er du nødt til å klone og sette opp [nibas-backend](https://gitlab-staging.statkart.no/nibas/nibas-backend).
Følg readme i dette repoet for å få denne kjørende.

### Linting

eslint blir installert på npm install. Men husk å aktivere plugin. For IntelliJ: Languages & Frameworks -> Javascript ->
Code Quality Tools -> ESLint. Velg å huke av for Automatic ESLint configuration.

### Types

Types fra API blir generert ved `npm run update-api-types`. Videre blir disse typene renamet i `src/types/api` for å gjøre det lettere å skrive inn typene når de brukes. (Dette kan nok gjøres i et script for å gjøre det lettere å vedlikeholde på sikt)

### Feature toggles

Noen funksjoner er låst bak feature toggles. Hvilke feature toggles som er aktive kan ses i `components/FeatureToggle/FeatureToggle.tsx`. Disse har hardkodede nøkler som brukes i komponenten og hooken i samme fil, som sjekker basert på hvilken URL du befinner deg på. 
