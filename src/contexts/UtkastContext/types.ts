import { Inndelingtype, OppdaterUtkastRequest, UtkastResponse } from "types/api";

export type EntityUtkastType =
  "stemmekretsendringer" | "grunnkretsendringer" | "kommuneendringer" | "bopliktomraadeendringer";

export type ResponseWithId = {
  id: {
    lokalid: {
      value: string;
    };
  };
};

export const getEntityUtkastTypeForInndelingtype = (inndelingtype: Inndelingtype): EntityUtkastType => {
  switch (inndelingtype) {
    case "STEMMEKRETS":
      return "stemmekretsendringer";
    case "GRUNNKRETS":
      return "grunnkretsendringer";
    case "KOMMUNE":
      return "kommuneendringer";
    case "FYLKE":
      return "kommuneendringer";
    case "BOPLIKTOMRAADE": {
      return "bopliktomraadeendringer";
    }
  }
};
export type UtkastContextValue = {
  utkast: UtkastResponse | undefined;
  utkastHarEndringer: () => boolean;
  utkastHarSammenslaainger: () => boolean;
  updateUtkastWithHistory: () => Promise<number>;
  updateUtkast: (id: string, newUtkast: OppdaterUtkastRequest, shouldClearHistory?: boolean) => Promise<number | null>;
  getUpdateUtkastRequestFromHistory: () => OppdaterUtkastRequest | null;
  closeUtkast: () => void;
  isValidating: boolean;
};

export type UtkastRequestWithoutOperations = Omit<OppdaterUtkastRequest, "operasjoner">;

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
