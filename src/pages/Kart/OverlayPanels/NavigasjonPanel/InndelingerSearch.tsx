import { useForm } from "react-hook-form";
import { InndelingOption, InndelingSearchField } from "./InndelingSearchField";
import { centerOnCoordinate, SearchProps } from "./NavigasjonPanel";

export const InndelingerSearch = ({ onSearchSuccess }: SearchProps) => {
  const { control } = useForm();

  const handleOnChange = (inndeling: InndelingOption | null) => {
    const north = inndeling?.representasjonspunkt.y;
    const east = inndeling?.representasjonspunkt.x;
    if (north != null && east != null) {
      centerOnCoordinate(north, east);
      onSearchSuccess();
    }
  };

  return (
    <InndelingSearchField
      control={control}
      fieldName={"inndeling"}
      inndelingstypeFilter={["FYLKE", "KOMMUNE", "GRUNNKRETS", "STEMMEKRETS"]}
      onSelectInndeling={handleOnChange}
    />
  );
};
