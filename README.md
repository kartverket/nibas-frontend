# NIBAS klient (Nasjonal Inndelingsbase)

En klient skrevet i React og Typescript, og som bruker Vite som utviklingsverktøy og bundler.

## Lokal utvikling

### Oppstart av applikasjonen

Last ned dependencies med

```
npm i
```

Start opp en dev-server med

```
npm start
```

Løsningen krever pålogging, som er skrudd på som default lokalt. Med helt standardoppsett er eneste autoriserte testbruker 
ved lokal utvikling `05865396092`.

For å hente ut grenser er du nødt til å klone og sette opp [nibas-backend](https://gitlab-staging.statkart.no/nibas/nibas-backend).
Følg readme i dette repoet for å få denne kjørende.

### Testing uten autentisering via ID-porten lokalt

Normalt når men kjører opp applikasjonen lokalt er pålogging aktivert. For å skru av dette på må både backend og frontend
startes opp med autentisering avskrudd.

1. Backend må startes opp med spring-profilen `security-off`.
2. Start opp frontenden med følgende miljøvariabel satt: `VITE_DISABLE_AUTH=true`

### Proxy

Når appen kjøres lokalt vil den benytte seg av `setupProxy.js` for å proxye requests til riktige endepunkter. Denne fila tar imot environment variables som ikke sjekkes inn i kildekontroll, så for å la requests til låste kart gå gjennom er du nødt til å lage en `.env.local` fil. Innholdet vil da være key-value par med verdiene du ønsker å sette inn i koden din.

For de låste WMS-kartene er du nødt til å bruke din BAAT-bruker du får via geonorge sine sider. Det kan brukes slik:

```
VITE_BAAT_USERNAME=Ditt_BAAT_brukernavn
VITE_BAAT_PASSWORD=Ditt_BAAT_passord
```

Credentials for matrikkel-wfs finnes i Vault, og settes med miljøvariabelen:

```
VITE_MATRIKKELWFS_AUTH
```

### Linting

eslint blir installert på npm install. Men husk å aktivere plugin. For IntelliJ: Languages & Frameworks -> Javascript ->
Code Quality Tools -> ESLint. Velg å huke av for Automatic ESLint configuration.

### Types

Types fra API blir generert ved `npm run update-api-types`. Videre blir disse typene renamet i `src/types/api` for å gjøre det lettere å skrive inn typene når de brukes. (Dette kan nok gjøres i et script for å gjøre det lettere å vedlikeholde på sikt)

Disse typene brukes i en hjelpehook `useApiSWR` for å få typen tilbake basert på URLen som hentes. (Per tid ikke mulig å bruke med parametere)

### Feature toggles

Noen funksjoner er låst bak feature toggles. Hvilke feature toggles som er aktive kan ses i `components/FeatureToggle/FeatureToggle.tsx`. Disse har hardkodede nøkler som brukes i komponenten og hooken i samme fil, som sjekker basert på hvilken URL du befinner deg på. Den lokale/dev variabelen er mulig å overstyre i en `.env.local`-fil, for å slippe å risikere å commite en ny verdi hvis du ikke skal det. Her følges convention `VITE_FEATURE_` som prefix før din key i all caps, for eksempel `VITE_FEATURE_FORKAST_UTKAST`.

## Docker

Bygge image

`docker build . -t nibas-klient`

Kjøre image

`docker run -p 3000:8080 -e BACKEND_HOST=nibas-backend.tz2-test-apps.k8s.local:80 -e PORT=8080 --name nibas-klient nibas-klient`

Her kan da BACKEND_HOST og PORT env variablenene byttes ut, så vil kall gå gjennom Caddy med de verdiene.

For å få låste kartlag til å fungere lokalt må du også få tak i brukernavn og passord for en BAAT-bruker. Du kan finne en bruker i Vault og de må sendes inn i `docker run`:

`docker run -p 3000:8080 -e BACKEND_HOST=nibas-backend.tz2-test-apps.k8s.local:80 -e PORT=8080 -e BAAT_USERNAME=some_username -e BAAT_PASSWORD=some_password --name nibas-klient nibas-klient`

## Autentisering i testmiljø

- Vær logget inn på enten kartverkets nett, VPN eller VDI.
- Gå til et av testmiljøene
  - Test: [nibas.test.skip.statkart.no](https://nibas.test.skip.statkart.no/)
  - Dev: [nibas.dev.skip.statkart.no](https://nibas.dev.skip.statkart.no/)
- Velg "Logg inn i Nasjonal inndelingsbase"
- Anbefalt metode: logg inn med TestID
  - Oppgi personidentifikator fra en av de syntetiske brukerne her: [Testbrukere](https://kartverket.atlassian.net/wiki/spaces/TNIBAS/pages/534282277/Testbrukere)
  - Dersom du får beskjed om å fylle inn mobil/epost er det bare å bruke et dummy-mobilnummer, eksempelvis 44556677
- Det er også i en overgangsperiode mulig å logge inn med BankID
  - Skriv inn personnummer
  - Velg BankID med kodebrikke
  - Skriv inn engangspassord
  - Skriv inn passord

### BankID

Det er kun 1 gyldig bruker på testmiljøene.

Personnummer: 08089405603
Engangskode: otp
Passord: qwer1234

[Les mer om IDportens testbrukere.](https://docs.digdir.no/docs/idporten/idporten/idporten_testbrukere)
