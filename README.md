# NIBAS klient

Foreløpig kun create-react-app med typescript

## Lokal utvikling

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

## Docker

Bygge image

`docker build . -t nibas-klient`

Kjøre image

`docker run -p 3000:8080 -e BACKEND_HOST=nibas-backend.tz2-test-apps.k8s.local:80 -e PORT=8080 --name nibas-klient nibas-klient`

Her kan da BACKEND_HOST og PORT env variablenene byttes ut, så vil kall gå gjennom Caddy med de verdiene.
