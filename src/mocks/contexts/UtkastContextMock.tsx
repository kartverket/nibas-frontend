import { UtkastContext } from "contexts/UtkastContext/UtkastContext";
import { ReactNode } from "react";
import { UtkastResponse } from "types/api";

/* eslint-disable  @typescript-eslint/no-explicit-any */

const utkast: UtkastResponse = {
  id: "1",
  endringstype: "Fastsetting",
  auditInfoResponse: {
    oppdateringsdato: "123",
  },
  navn: "asd",
  operasjoner: {
    grenseendringer: {
      endredeFeatures: [],
    },
    kretsDelingEndringer: [],
    stemmekretsSammenslaaingsendring: null,
    grunnkretsSammenslaaingsendring: null,
    metadataendringer: {
      fylkesendringer: {},
      grunnkretsendringer: {},
      kommuneendringer: {},
      nasjonsendringer: {},
      stemmekretsendringer: {},
      bopliktomraadeendringer: {},
    },
  },
  opprettetDato: "123",
  status: "123",
  version: 1,
  gyldigFra: "2022-01-01",
  endredeInndelinger: {
    endredeBopliktomraader: [],
    endredeStemmekretser: [],
    endredeGrunnkretser: [],
    endredeKommuner: [],
    endredeFylker: [],
    endredeNasjoner: [],
  },
};

const mockUtkastContextValue = {
  utkast,
};

const MockUtkastProvider = ({ children }: { children: ReactNode }) => {
  return <UtkastContext.Provider value={mockUtkastContextValue as any}>{children}</UtkastContext.Provider>;
};

export { MockUtkastProvider };
