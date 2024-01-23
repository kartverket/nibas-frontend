import { createContext, useContext, useState } from "react";
import {
  FylkeRef,
  GrunnkretsResponse,
  KommuneResponse,
  StemmekretsResponse,
} from "types/api";

export const KRETSTYPER = [
  "fylker",
  "kommuner",
  "stemmekretser",
  "grunnkretser",
] as const;
type Kretstyper = typeof KRETSTYPER;
export type Kretstype = Kretstyper[number];

type Inndeling<T> = {
  data: T;
  isVisible: boolean;
  isEditing: boolean;
};

type Inndelinger = {
  fylker: {
    [fylkeId: string]: Inndeling<FylkeRef> & {
      kommuner: {
        [kommuneId: string]: Inndeling<KommuneResponse> & {
          stemmekretser: {
            [stemmekretsId: string]: Inndeling<StemmekretsResponse>;
          };
          grunnkretser: {
            [grunnkretsId: string]: Inndeling<GrunnkretsResponse>;
          };
        };
      };
    };
  };
};

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
};

export const InndelingerContext = createContext<
  InndelingerContextValue | undefined
>(undefined);

export const InndelingerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>({
    fylker: {},
  });

  const value = { inndelinger };

  return (
    <InndelingerContext.Provider value={value}>
      {children}
    </InndelingerContext.Provider>
  );
};

export const useInndelinger = () => {
  const context = useContext(InndelingerContext);
  if (!context) {
    throw new Error("useInndelinger must be used within a InndelingerContext");
  }

  return context;
};
