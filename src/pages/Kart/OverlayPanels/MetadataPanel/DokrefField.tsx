import { UseFormRegisterReturn } from "react-hook-form";
import { DokrefRow } from "./DokrefRow";
import { useDokumentreferanser } from "./useDokumentreferanser";
import { Feature } from "ol";

type Props = {
  renderItem: (register: UseFormRegisterReturn<"dokrefs">) => React.ReactNode;
  name: string;
  tooltipLabel: string;
  feature: Feature;
};

export const DokrefField = ({
  renderItem,
  name,
  tooltipLabel,
  feature,
}: Props) => {
  const { register } = useDokumentreferanser(feature);
  return (
    <DokrefRow tooltipLabel={tooltipLabel} name={name}>
      {renderItem(register("dokrefs"))}
    </DokrefRow>
  );
};
