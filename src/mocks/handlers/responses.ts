import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import {
  AdministrativGrenseMetadata,
  FylkeRef,
  GrunnkretsRef,
  GrunnkretsResponse,
  KodelisteRespons,
  KommuneRef,
  KommuneResponse,
} from "types/api";
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
            opphav: "Opphav",
            fastsettingstype: undefined,
            grensestatus: undefined,
            sporingsinformasjon: {
              oppdateringsdato: "2020-06-18",
            },
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
          },
          dokumentasjonsreferanser: [
            {
              id: "123",
              dokumentlenker: [
                {
                  id: "doklenke",
                  beskrivelse: "Doklenke",
                },
              ],
              fastsettingsdato: "2022-12-31",
              fastsettingsmyndighet: "Fastsettingsmyndighet",
              hjemmel: "Hjemmel",
              internReferanserKartverket: [
                {
                  id: "internref",
                  beskrivelse: "Internrefeferanse",
                },
              ],
              rettskildeId: "RID",
              rettskildeTittel: "Rettskildetittel",
            },
          ],
          foelgerTerrengdetalj: { id: "IKA", href: "" },
          noeyaktighetsklasse: { id: "IngenNøyaktighet", href: "" },
          omtvistet: false,
        } as AdministrativGrenseMetadata,
        kontekstEgenskaper: {
          retningMedKlokken: true,
          rekkefoelge: 0,
          flateIndeks: 0,
          hullIndeks: null,
        },
        inndelingerKontekst: {
          id: "9b4ab6bb-878f-472a-9243-64e2bdc48b8b",
          type: "fylke",
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
    id: "1",
    navn: [
      {
        navn: "Vestfold og Telemark",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/1",
  },
  {
    id: "2",
    navn: [
      {
        navn: "Agder",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/2",
  },
] as FylkeRef[];

export const mockDetailedKommune: KommuneResponse = {
  administrativenhetnavn: [
    {
      navn: "Malvik",
      spraak: "nor",
    },
  ],
  features: mockGeoJsonFeatureResponse,
  id: "1",
  kommunenummer: {
    id: "a379eb0a-7bae-4fc9-ab07-cf0c7a28bdb7",
    kodeverdi: 12345678,
  },
  lokalid: "12345678",
  navnerom: "Navnerom",
  oppdateringsdato: "2022-12-31",
  samiskforvaltningsomraade: false,
};

export const mockGrunnkrets1: GrunnkretsRef = {
  id: "1",
  href: "",
  navn: "Mosekollen øst",
};

export const mockGrunnkrets2: GrunnkretsRef = {
  id: "2",
  href: "",
  navn: "Dåsvatn",
};

export const mockDetailedGrunnkrets1: GrunnkretsResponse = {
  features: mockGeoJsonFeatureResponse,
  grunnkretsnummer: "12345678",
  id: "1",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  kommunenummer: "a379eb0a-7bae-4fc9-ab07-cf0c7a28bdb7",
  navn: "Mosekollen øst",
};

export const mockDetailedGrunnkrets2: GrunnkretsResponse = {
  features: mockGeoJsonFeatureResponse,
  grunnkretsnummer: "12345679",
  id: "2",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  kommunenummer: "a379eb0a-7bae-4fc9-ab07-cf0c7a28bdb7",
  navn: "Dåsvatn",
};

export const mockKommuner = [
  {
    id: "1",
    navn: [{ navn: "Malvik", spraak: "nor" }],
    href: "http://localhost:8080/v1/kommuner/1",
  },
  {
    id: "2",
    navn: [
      {
        navn: "Giske",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/kommuner/2",
  },
] as KommuneRef[];

export const mockMaalemetodeResponse: KodelisteRespons = {
  type: "MAALEMETODE_KODE",
  items: [
    {
      label: "Terrengmålt: Uspesifisert måleinstrument",
      id: "9b4ab6bb-878f-472a-9243-64e2bdc48b8c",
    },
  ],
};

export const mockTerrengdetaljResponse: KodelisteRespons = {
  type: "TERRENGDETALJ",
  items: [
    {
      id: "IKA",
      label: "InnsjøKant",
    },
  ],
};

export const mockNoeyaktighetsklasseResponse: KodelisteRespons = {
  type: "NOEYAKTIGHETSKLASSE",
  items: [
    {
      id: "IngenNøyaktighet",
      label: "IngenNøyaktighet",
    },
  ],
};

export const mockActuatorResponse = {
  application: {
    version: "1.2.3",
  },
};
