# NIBAS klient (Nasjonal Inndelingsbase)

En klient som er bygget med React og TypeScript, og som bruker Vite som utviklingsverktøy og bundler.

## Lokal utvikling

### Miljøvariabeler

For å la requests til låste kart gå gjennom er du nødt til å lage en `.env.local` fil. Innholdet vil da være key-value par med verdiene du ønsker å sette inn i koden din.

For de låste WMS-kartene er du nødt til å bruke din BAAT-bruker du får via geonorge sine sider. Det kan brukes slik:

```
VITE_BAAT_USERNAME=Ditt_BAAT_brukernavn
VITE_BAAT_PASSWORD=Ditt_BAAT_passord
```

Credentials for matrikkel-wfs finnes i Vault, og settes med miljøvariabelen:

```
VITE_MATRIKKELWFS_AUTH
```

I tilegg trenger å sette følgende miljøvariabeler i `.env.local`:

```
VITE_ENVIRONMENT_LOCALHOST; // Sett denne til "localhost" i .env.local
VITE_REPO_PR_ACCESS; // Finnes i gcp-dev
```

ENVIRONMENT_LOCALHOST sier til vite at den skal kjøre med localhost config.
REPO_PR_ACCESS gir lesetilgang i github-apiet slik at klienten kan hente alle aktive feature-miljøer.

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