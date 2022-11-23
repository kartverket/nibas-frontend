import Icon from "components/Icon";
import { getNavnInSpraak } from "utils/language/language";
import { ToggleableKretsButton } from "./kretserComponents";

type Props = {
  id: string;
  isOpen: boolean;
  toggleRow: (id: string) => void;
  name: string;
};

const FutureChangesButton = ({ isOpen, toggleRow, name, id }: Props) => {
  return (
    <ToggleableKretsButton
      isOpen={isOpen}
      onClick={(e) => {
        e.stopPropagation();
        toggleRow(id);
      }}
      aria-label={`${
        isOpen ? "Skjul" : "Vis"
      } fremtidige endringer for ${getNavnInSpraak(name, "nor")}`}
      icon={<Icon icon="timelapse" />}
    />
  );
};

export default FutureChangesButton;
