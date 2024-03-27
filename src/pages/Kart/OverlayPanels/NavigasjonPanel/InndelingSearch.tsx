import { SearchAsync } from "@kvib/react";
import { NavigasjonProps } from "./NavigasjonPanel";
import { InndelingResponse } from "types/api";
import { useInndelingerSearch } from "./useInndelingerSearch";

type InndelingOption = InndelingResponse & {
  label: string;
};

export const InndelingSearch = ({ centerOnCoordinate }: NavigasjonProps) => {
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
      const inndelinger = await searchInndelinger(term);
      resultsCallback(inndelinger.map(mapInndelingResponseToOption));
    }
  };

  return (
    <SearchAsync
      size={"md"}
      placeholder="F.eks. «0301» eller «Eigersund»"
      onChange={handleOnChange}
      loadOptions={loadResults}
    />
  );
};
