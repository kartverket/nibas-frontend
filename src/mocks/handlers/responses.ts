import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { createUtkastOperations } from "contexts/UtkastContext/utils";
import {
  AdministrativGrenseMetadata,
  FramtidigVersjonConflict,
  FylkeRef,
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
  KodelisteRespons,
  KommuneRef,
  KommuneResponse,
  StemmekretsRef,
  StemmekretsResponse,
  UtkastRef,
  UtkastResponse,
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
        } as AdministrativGrenseMetadata,
        kontekstEgenskaper: {
          retningMedKlokken: true,
          rekkefoelge: 0,
          flateIndeks: 0,
          hullIndeks: null,
        },
        inndelingerKontekst: {
          // vis til Vestfold og Telemark
          id: "1",
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
  mockGeoJsonFeatureResponse,
)[0];

export const mockFylker = [
  {
    id: {
      gyldighetsdato: "2022-01-01",
      lokalid: {
        value: "1",
      },
    },
    navn: [
      {
        navn: "Vestfold og Telemark",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/1",
    antallFramtidigeVersjoner: 0,
  },
  {
    id: {
      gyldighetsdato: "2022-01-01",
      lokalid: {
        value: "2",
      },
    },
    navn: [
      {
        navn: "Agder",
        spraak: "nor",
      },
    ],
    href: "http://localhost:8080/v1/fylker/2",
    antallFramtidigeVersjoner: 0,
  },
] as FylkeRef[];

export const mockDetailedKommune: KommuneResponse = {
  administrativenhetnavn: [
    {
      navn: "Malvik",
      spraak: "nor",
      version: 1,
    },
  ],
  features: mockGeoJsonFeatureResponse,
  id: {
    gyldighetsdato: "2022-01-01",
    lokalid: {
      value: "1",
    },
  },
  version: 1,
  kommunenummer: {
    id: "a379eb0a-7bae-4fc9-ab07-cf0c7a28bdb7",
    kodeverdi: "12345678",
  },
  oppdateringsdato: "2022-12-31",
  samiskforvaltningsomraade: false,
};

export const mockDetailedGrunnkrets1: GrunnkretsResponse = {
  features: mockGeoJsonFeatureResponse,
  grunnkretsnummer: "12345678",
  version: 1,
  id: {
    gyldighetsdato: "2022-01-01",
    lokalid: {
      value: "1",
    },
  },
  kommunenummer: {
    id: "12345",
    kodeverdi: "4321",
  },
  navn: "Mosekollen øst",
  gyldighet: {
    gyldigFra: "2022-01-01",
    gyldigTil: "2022-07-01",
  },
  oppdateringsdato: "2022-12-31",
  endringstype: "Retting",
};

export const mockDetailedGrunnkrets2: GrunnkretsResponse = {
  features: mockGeoJsonFeatureResponse,
  grunnkretsnummer: "12345679",
  kommunenummer: {
    id: "12345",
    kodeverdi: "4321",
  },
  version: 1,
  id: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "2",
    },
  },
  navn: "Dåsvatn",
  gyldighet: {
    gyldigFra: "2020-06-16",
    gyldigTil: "2020-06-17",
  },
  oppdateringsdato: "2022-12-31",
  endringstype: "Retting",
};

export const mockGrunnkrets1: GrunnkretsRef = {
  id: {
    gyldighetsdato: mockDetailedGrunnkrets1.gyldighet.gyldigFra,
    lokalid: {
      value: mockDetailedGrunnkrets1.id.lokalid.value,
    },
  },
  kommunenummer: {
    id: "12345",
    kodeverdi: "4321",
  },
  href: "",
  navn: "Mosekollen øst",
  grunnkretsnummer: "12345678",
  antallFramtidigeVersjoner: 1,
};

export const mockGrunnkrets2: GrunnkretsRef = {
  id: {
    gyldighetsdato: mockDetailedGrunnkrets2.gyldighet.gyldigFra,
    lokalid: {
      value: mockDetailedGrunnkrets2.id.lokalid.value,
    },
  },
  kommunenummer: {
    id: "12345",
    kodeverdi: "4321",
  },
  href: "",
  navn: "Dåsvatn",
  grunnkretsnummer: "12345679",
  antallFramtidigeVersjoner: 0,
};

export const mockGrunnkretsRequest: GrunnkretsRequest = {
  navn: "Mosekollen øst",
  grunnkretsnummer: "12345678",
  identifikasjon: {
    lokalid: "1",
  },
  version: 1,
};

export const mockKommuner = [
  {
    id: {
      gyldighetsdato: "2022-01-01",
      lokalid: {
        value: "1",
      },
    },
    navn: [{ navn: "Malvik", spraak: "nor" }],
    kommunenummer: {
      id: "12345",
      kodeverdi: "4321",
    },
    href: "http://localhost:8080/v1/kommuner/1",
    antallFramtidigeVersjoner: 0,
  },
  {
    id: {
      gyldighetsdato: "2022-01-01",
      lokalid: {
        value: "2",
      },
    },
    navn: [
      {
        navn: "Giske",
        spraak: "nor",
      },
    ],
    kommunenummer: {
      id: "12345",
      kodeverdi: "4321",
    },
    href: "http://localhost:8080/v1/kommuner/2",
    antallFramtidigeVersjoner: 0,
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

export const mockStemmekrets1: StemmekretsResponse = {
  id: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "1",
    },
  },
  version: 1,
  stemmekretsnavn: "Undredal",
  stemmekretsnummer: "05",
  kommunenummer: { id: "c416fb1d-2124-4f71-8dfc-859c55feb437", kodeverdi: "1" },
  oppdateringsdato: "2022-01-01",
  tellekretsnummer: "tellekretsnr1",
  tellekretsnavn: "tellekretsnavn1",
  valgdistriktsnummer: "14",
  features: mockGeoJsonFeatureResponse,
  gyldighet: {
    gyldigFra: "2022-01-01",
    gyldigTil: "2022-07-01",
  },
};

export const mockStemmekrets2: StemmekretsResponse = {
  id: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "2",
    },
  },
  version: 1,
  stemmekretsnavn: "Slemfjord",
  stemmekretsnummer: "12",
  kommunenummer: { id: "ec64ba19-fb37-44d4-b579-407897f871ee", kodeverdi: "2" },
  tellekretsnummer: "tellekretsnr2",
  tellekretsnavn: "tellekretsnavn2",
  oppdateringsdato: "2022-01-01",
  valgdistriktsnummer: "16",
  features: mockGeoJsonFeatureResponse,
  gyldighet: {
    gyldigFra: "2022-01-01",
    gyldigTil: "2022-07-01",
  },
};

export const mockStemmekretser: StemmekretsRef[] = [
  {
    id: {
      gyldighetsdato: mockStemmekrets1.id.gyldighetsdato,
      lokalid: {
        value: mockStemmekrets1.id.lokalid.value,
      },
    },

    kommunenummer: {
      id: "12345",
      kodeverdi: "4321",
    },
    navn: "Undredal",
    nummer: "05",
    href: "http://localhost:8080/v1/stemmekretser/1",
    antallFramtidigeVersjoner: 0,
    version: 0,
  },
  {
    id: {
      gyldighetsdato: mockStemmekrets2.id.gyldighetsdato,
      lokalid: {
        value: mockStemmekrets2.id.lokalid.value,
      },
    },
    kommunenummer: {
      id: "12345",
      kodeverdi: "4321",
    },
    navn: "Slemfjord",
    nummer: "12",
    href: "http://localhost:8080/v1/stemmekretser/2",
    antallFramtidigeVersjoner: 0,
    version: 0,
  },
];

export const mockUtkast: UtkastResponse = {
  navn: "Mock utkast",
  endringstype: "Retting",
  gyldigFra: "2022-06-01",
  id: "1",
  status: "Ikke publisert",
  opprettetDato: "2022-01-01",
  version: 1,
  auditInfoResponse: {
    oppdateringsdato: "2022-06-01",
  },
  operasjoner: createUtkastOperations({
    grunnkretsendringer: {
      "1": {
        ...mockDetailedGrunnkrets1,
        navn: "Utkast grunnkrets",
        version: 2,
        identifikasjon: {
          lokalid: mockDetailedGrunnkrets1.id.lokalid.value,
        },
      },
    },
    stemmekretsendringer: {
      "1": {
        ...mockStemmekrets1,
        stemmekretsnavn: "Utkast stemmekrets",
        version: 2,
        kommunenummer: mockStemmekrets1.kommunenummer.kodeverdi,
        identifikasjon: {
          lokalid: mockStemmekrets1.id.lokalid.value,
        },
      },
    },
    endredeFeatures: {
      "9b4ab6bb-878f-472a-9243-64e2bdc48b8b":
        mockGeoJsonFeatureResponse.features[0],
    },
  }),
};

export const mockUtkastRef1: UtkastRef = {
  href: "",
  id: "1",
  navn: "Mock utkast",
  opprettetDato: "2022-06-01",
};

export const mockUtkastRef2: UtkastRef = {
  href: "",
  id: "2",
  navn: "Et nytt utkast",
  opprettetDato: "2022-06-01",
};

export const mockFutureGrunnkrets1_1: GrunnkretsResponse = {
  ...mockDetailedGrunnkrets1,
  id: {
    lokalid: {
      value: mockDetailedGrunnkrets1.id.lokalid.value,
    },
    gyldighetsdato: "2022-04-01",
  },
  navn: "Mosekollen vest",
  grunnkretsnummer: "12345679",
  gyldighet: {
    gyldigFra: "2022-04-01",
    gyldigTil: "2022-07-01",
  },
};

export const mockFutureGrunnkrets1_2: GrunnkretsResponse = {
  ...mockDetailedGrunnkrets1,
  id: {
    lokalid: {
      value: mockDetailedGrunnkrets1.id.lokalid.value,
    },
    gyldighetsdato: "2022-07-01",
  },
  navn: "Mosekollen nord",
  grunnkretsnummer: "87654321",
  gyldighet: {
    gyldigFra: "2022-07-01",
  },
};

export const mockFremtidigEndringConflictResponse: FramtidigVersjonConflict = {
  id: {
    lokalid: {
      value: "1",
    },
    gyldighetsdato: mockDetailedGrunnkrets1.id.gyldighetsdato,
  },
  affectedIds: [
    {
      lokalid: {
        value: "1",
      },
      gyldighetsdato: mockFutureGrunnkrets1_1.id.gyldighetsdato,
    },
    {
      lokalid: {
        value: "1",
      },
      gyldighetsdato: mockFutureGrunnkrets1_2.id.gyldighetsdato,
    },
  ],
  type: "GRUNNKRETS",
  melding: "Konflikt",
};

export const mockGrunnkretserFramtidigeEndringer: GrunnkretsResponse[] = [
  mockDetailedGrunnkrets1,
  mockFutureGrunnkrets1_1,
  mockFutureGrunnkrets1_2,
];

export const mockStemmekretserFramtidigeEndringer: StemmekretsResponse[] = [
  mockStemmekrets1,
  {
    ...mockStemmekrets1,
    stemmekretsnavn: "Hundredal",
    stemmekretsnummer: "07",
  },
  {
    ...mockStemmekrets1,
    stemmekretsnavn: "To-hundredal",
    stemmekretsnummer: "70",
  },
];
