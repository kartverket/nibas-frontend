import { OppdaterUtkastRequest, UtkastResponse } from "types/api";

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer" | "kommuneendringer";

export type ResponseWithId = {
  id: {
    lokalid: {
      value: string;
    };
  };
};

export type UtkastContextValue = {
  utkast: UtkastResponse | undefined;
  utkastHarEndringer: () => boolean;
  updateUtkastWithHistory: () => Promise<number>;
  updateUtkast: (id: string, newUtkast: OppdaterUtkastRequest, shouldClearHistory?: boolean) => Promise<number | null>;
  getUpdateUtkastRequestFromHistory: () => OppdaterUtkastRequest | null;
  closeUtkast: () => void;
  isValidating: boolean;
};

export type UtkastRequestWithoutOperations = Omit<OppdaterUtkastRequest, "operasjoner">;

export type UtkastEntity = ResponseWithId | ResponseWithId[] | undefined;
