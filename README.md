# NIBAS klient (Nasjonal Inndelingsbase)

Foreløpig kun create-react-app med typescript

## Lokal utvikling

### Sette opp authZ og authN mot github package registry

Prosjektet trenger pakke(r) fra github package registry. For å kunne installere disse pakkene må man gjøre følgende:

- Opprette et personal access token på github (https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)
- Autorisere personal access token for bruk med SSO (https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on)
- Opprette en lokal .npmrc-fil i hjemmekatalogen som knytter github package registry med autorisert personal access token (https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

### Oppstart av applikasjonen

Last ned dependencies med

```
npm i
```

Start opp en dev-server med

```
npm start
```

For å hente ut grenser er du nødt til å klone og sette opp [nibas-db](https://gitlab-staging.statkart.no/nibas/nibas-db)
og [nibas-backend](https://gitlab-staging.statkart.no/nibas/nibas-backend). Følg deres guides på hvordan få disse
kjørende

More to come :)

### Proxy

Når appen kjøres lokalt vil den benytte seg av `setupProxy.js` for å proxye requests til riktige endepunkter. Denne fila tar imot environment variables som ikke sjekkes inn i kildekontroll, så for å la requests til låste kart gå gjennom er du nødt til å lage en `.env.local` fil. Innholdet vil da være key-value par med verdiene du ønsker å sette inn i koden din.

For de låste WMS-kartene er du nødt til å bruke din BAAT-bruker du får via geonorge sine sider. Det kan brukes slik:

```
REACT_APP_BAAT_USERNAME=Ditt_BAAT_brukernavn
REACT_APP_BAAT_PASSWORD=Ditt_BAAT_passord
```

### Linting

eslint blir installert på npm install. Men husk å aktivere plugin. For IntelliJ: Languages & Frameworks -> Javascript ->
Code Quality Tools -> ESLint. Velg å huke av for Automatic ESLint configuration.

### Types

Types fra API blir generert ved `npm run update-api-types`. Videre blir disse typene renamet i `src/types/api` for å gjøre det lettere å skrive inn typene når de brukes. (Dette kan nok gjøres i et script for å gjøre det lettere å vedlikeholde på sikt)

Disse typene brukes i en hjelpehook `useApiSWR` for å få typen tilbake basert på URLen som hentes. (Per tid ikke mulig å bruke med parametere)

### Oversetting av tekst

Vi bruker [react-i18next](https://react.i18next.com/) for å oversette tekster i klienten.

For å legge til ny tekst skriver du inn `t("Din nye tekst")`, som vil gi en feilmelding hvis den ikke finnes. Da må du kjøre `npm run scan-translations` for å få `i18next-scanner` til å plukke opp og legge til den nye nøklen i oversettelsesfilene. Dette vil fjerne erroren fra TypeScript, men du må likevel oppdatere strengen i de endrede oversettelsesfilene.

### Feature toggles

Noen funksjoner er låst bak feature toggles. Hvilke feature toggles som er aktive kan ses i `components/FeatureToggle/FeatureToggle.tsx`. Disse har hardkodede nøkler som brukes i komponenten og hooken i samme fil, som sjekker basert på hvilken URL du befinner deg på. Den lokale/dev variabelen er mulig å overstyre i en `.env.local`-fil, for å slippe å risikere å commite en ny verdi hvis du ikke skal det. Her følges convention `REACT_APP_FEATURE_` som prefix før din key i all caps, for eksempel `REACT_APP_FEATURE_FORKAST_UTKAST`.

## Docker

Bygge image

`docker build . -t nibas-klient`

Kjøre image

`docker run -p 3000:8080 -e BACKEND_HOST=nibas-backend.tz2-test-apps.k8s.local:80 -e PORT=8080 --name nibas-klient nibas-klient`

Her kan da BACKEND_HOST og PORT env variablenene byttes ut, så vil kall gå gjennom Caddy med de verdiene.

For å få låste bakgrunnskart til å fungere lokalt må du også få tak i brukernavn og passord for en BAAT-bruker. Du kan finne en bruker i Vault og de må sendes inn i `docker run`:

`docker run -p 3000:8080 -e BACKEND_HOST=nibas-backend.tz2-test-apps.k8s.local:80 -e PORT=8080 -e BAAT_USERNAME=some_username -e BAAT_PASSWORD=some_password --name nibas-klient nibas-klient`

## Autentisering

5 brukere har lov:

21079408678
21079408597
21079408406
21079408325
21079408244

### min-id

passord: password01
pin: 12345
