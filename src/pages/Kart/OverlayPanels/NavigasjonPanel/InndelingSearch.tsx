import { SearchAsync } from "@kvib/react";
import { InndelingResponse } from "types/api";
import { NavigasjonProps } from "./NavigasjonPanel";
import { useInndelingerSearch } from "./useInndelingerSearch";
import { ReactNode } from "react";
import { styled } from "styled-components";

type InndelingOption = InndelingResponse & {
  label: string;
};

export const InndelingSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  const searchInndelinger = useInndelingerSearch();

  const mapInndelingResponseToOption = (inndelingResponse: InndelingResponse): InndelingOption => {
    return {
      id: inndelingResponse.id,
      navn: inndelingResponse.navn,
      nummer: inndelingResponse.nummer,
      type: inndelingResponse.type,
      representasjonspunkt: inndelingResponse.representasjonspunkt,
      label: `${inndelingResponse.nummer} ${inndelingResponse.navn}`,
    };
  };

  const handleOnChange = (inndeling: InndelingOption | null) => {
    const north = inndeling?.representasjonspunkt.y;
    const east = inndeling?.representasjonspunkt.x;
    if (north != null && east != null) {
      centerOnCoordinate(north, east);
    }
  };

  const loadResults = async (term: string, resultsCallback: (options: InndelingOption[]) => void) => {
    if (term.length > 0) {
      const inndelinger = await searchInndelinger(term, 15);
      resultsCallback(inndelinger.map(mapInndelingResponseToOption));
    }
  };

  const noOptionMessage = (obj: { inputValue: string }): ReactNode => {
    return obj.inputValue !== "" ? (
      <ErrorMessage>{`Fant ingen inndeling som matchet "${obj.inputValue}"`}</ErrorMessage>
    ) : null;
  };

  return (
    <SearchAsync
      size={"md"}
      placeholder="Skriv inn navnet eller nummeret til inndelingen"
      noOptionsMessage={noOptionMessage}
      onChange={handleOnChange}
      loadOptions={loadResults}
    />
  );
};

const ErrorMessage = styled.div`
  padding: 2px 16px;
`;
