import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { AdministrativGrenseMetadata, KodelisteRespons } from "types/api";
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
            datafangstdato: "2020-06-15",
            gyldigFra: "2020-06-16",
            gyldigTil: "2020-06-17",
            informasjon: "Informasjon",
            oppdateringsdato: "2020-06-18",
            opphav: "Opphav",
            fastsettingstype: undefined,
            grensestatus: undefined,
          },
          commonGrense: {
            posisjonskvalitet: {
              maalemetode: {
                id: "9b4ab6bb-878f-472a-9243-64e2bdc48b8c",
                href: "",
              },
              noeyaktighet: 5,
            },
            fastsettingstype: { id: "", href: "" },
            grensestatus: { id: "", href: "" },
            dokumentasjonsreferanser: [],
          },
          foelgerTerrengdetalj: undefined,
          noeyaktighetsklasse: { id: "", href: "" },
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

export const mockMaalemetodeRespons: KodelisteRespons = {
  type: "MAALEMETODE_KODE",
  items: [
    {
      label: "Terrengmålt: Uspesifisert måleinstrument",
      id: "9b4ab6bb-878f-472a-9243-64e2bdc48b8c",
    },
  ],
};

export const mockActuatorResponse = {
  application: {
    version: "1.2.3",
  },
};
