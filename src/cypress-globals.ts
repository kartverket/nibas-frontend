import { map } from "pages/Kart/constants";

// Denne filen er for å eksponere openlayers data til cypress testene.

window.testingGlobals = {
  map: map,
};
