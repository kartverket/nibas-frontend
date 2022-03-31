import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { AdministrativGrenseMetadata } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

export const mockGeoJsonFeatureResponse: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "9b4ab6bb-878f-472a-9243-64e2bdc48b8b",
      properties: {
        type: "Fylkesgrense",
        metadata: {
          discriminator: "AdministrativGrenseMetadata",
          common: {
            identifikasjon: {
              lokalid: "4a5d60ec-9385-4dec-ae76-14915d021010",
              navnerom: "https://data.geonorge.no/sosi/administrativeenheter",
              versjonid: undefined,
            },
            datafangstdato: "2020-06-15T00:00:00+02:00",
            gyldigFra: "2020-06-16T00:00:00+02:00",
            gyldigTil: "2020-06-17T00:00:00+02:00",
            informasjon: "Informasjon",
            oppdateringsdato: "2020-06-18T00:00:00+02:00",
            opphav: "Opphav",
            fastsettingstype: undefined,
            grensestatus: undefined,
          },
          commonGrense: {
            posisjonskvalitet: {
              maalemetode: "9b4ab6bb-878f-472a-9243-64e2bdc48b8c",
              noeyaktighet: 5,
            },
            dokumentasjonsreferanser: [],
          },
          foelgerTerrengdetalj: undefined,
          noeyaktighetsklasse: "NøyaktigeMålinger",
          omtvistet: false,
        } as AdministrativGrenseMetadata,
        kontekstEgenskaper: {
          id: "064fdcd8-6123-478f-9976-171d14481277",
          type: "FYLKE",
          retningMedKlokken: true,
          rekkefoelge: 0,
          flateIndeks: 0,
          hullIndeks: null,
        },
      },
      geometry: {
        type: "LineString",
        srid: "25833",
        coordinates: [
          [255736.58000000002, 6655335.41],
          [255778.36000000002, 6655315.25],
          [255831.85, 6655289.66],
        ],
      },
    },
  ],
};

export const mockBasicFeature = getFeaturesFromGeoJson(
  mockGeoJsonFeatureResponse
)[0];

export const mockFylker = [
  {
    id: 1,
    navn: [
      {
        navn: "Vestfold og Telemark",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/1",
  },
  {
    id: 2,
    navn: [
      {
        navn: "Agder",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/2",
  },
];

export const mockKommuner = [
  {
    id: 1,
    navn: [{ navn: "Malvik", spraak: "nor" }],
    href: "http://localhost:8080/v1/kommuner/1",
  },
  {
    id: 2,
    navn: [
      {
        navn: "Giske",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/kommuner/2",
  },
];

export const mockMaalemetodeKode = {
  type: "MAALEMETODE_KODE",
  item: {
    id: "https://register.geonorge.no/sosi-kodelister/malemetode-kode/terrengmalt-uspesifisert-maleinstrument/7f48625b-e46f-413e-ae4d-0381ac64264b",
    label: "Terrengmålt: Uspesifisert måleinstrument",
    lang: "no",
    uuid: "9b4ab6bb-878f-472a-9243-64e2bdc48b8c",
    status: "Gyldig",
    description: "Målt i terrenget , uspesifisert metode/måleinstrument",
    codevalue: "10",
  },
};
