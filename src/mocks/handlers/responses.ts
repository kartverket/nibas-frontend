import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { createUtkastOperations } from "contexts/UtkastContext/utils";
import {
  AdministrativGrenseMetadata,
  FylkeRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
  KodelisteRespons,
  KommuneRef,
  KommuneResponse,
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
              shouldArchive: false,
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
              vedtakGyldigFra: "2020-06-16",
              vedtakGyldigTil: "2020-06-17",
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

export const mockBasicFeature = getFeaturesFromGeoJson(mockGeoJsonFeatureResponse)[0];

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
    fylkesnummer: {
      id: "id1",
      kodeverdi: "38",
    },
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
    fylkesnummer: {
      id: "id2",
      kodeverdi: "42",
    },
    antallFramtidigeVersjoner: 0,
  },
] as FylkeRef[];

export const mockDetailedKommune: KommuneResponse = {
  representasjonspunkt: mockGeoJsonFeatureResponse.features[0],
  administrativenhetnavn: [
    {
      navn: "Malvik",
      spraak: "nor",
      version: 1,
    },
  ],
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
  features: {
    type: "",
    features: []
  }
};

export const mockDetailedGrunnkrets1: GrunnkretsResponse = {
  grunnkretsnummer: "22345678",
  representasjonspunkt: mockGeoJsonFeatureResponse.features[0],
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
  kommuneIdentifikator: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "2",
    },
  },
  features: {
    type: "",
    features: []
  }
};

export const mockDetailedGrunnkrets2: GrunnkretsResponse = {
  grunnkretsnummer: "22345679",
  representasjonspunkt: mockGeoJsonFeatureResponse.features[0],
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
  kommuneIdentifikator: {
    lokalid: {
      value: "2",
    },
    gyldighetsdato: "2022-07-01",
  },
  features: {
    type: "",
    features: []
  }
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
      kodeverdi: "5031",
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
      kodeverdi: "1532",
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
  representasjonspunkt: mockGeoJsonFeatureResponse.features[0],
  gyldighet: {
    gyldigFra: "2022-01-01",
    gyldigTil: "2022-07-01",
  },
  kommuneIdentifikator: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "2",
    },
  },
  navn: "",
  nummer: "",
  features: {
    type: "",
    features: []
  }
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
  representasjonspunkt: mockDetailedGrunnkrets2.representasjonspunkt,
  kommunenummer: { id: "ec64ba19-fb37-44d4-b579-407897f871ee", kodeverdi: "2" },
  tellekretsnummer: "tellekretsnr2",
  tellekretsnavn: "tellekretsnavn2",
  oppdateringsdato: "2022-01-01",
  valgdistriktsnummer: "16",
  gyldighet: {
    gyldigFra: "2022-01-01",
    gyldigTil: "2022-07-01",
  },
  kommuneIdentifikator: {
    gyldighetsdato: "2022-06-16",
    lokalid: {
      value: "2",
    },
  },
  navn: "",
  nummer: "",
  features: {
    type: "",
    features: []
  }
};

export const mockStemmekretser: StemmekretsResponse[] = [mockStemmekrets1, mockStemmekrets2];

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
        grunnkretsnummer: mockDetailedGrunnkrets1.grunnkretsnummer,
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
    endredeFeatures: [mockGeoJsonFeatureResponse.features[0]],
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
  grunnkretsnummer: "22345679",
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
  grunnkretsnummer: "32345679",
  gyldighet: {
    gyldigFra: "2022-07-01",
  },
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
  },
  {
    ...mockStemmekrets1,
  },
];
