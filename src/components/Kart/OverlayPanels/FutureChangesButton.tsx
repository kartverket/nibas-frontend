import Icon from "components/Icon";
import styled from "styled-components";
import { GrunnkretsRef, KretsRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { ToggleableKretsButton } from "./kretserComponents";

const isGrunnkretsRef = (krets: KretsRef): krets is GrunnkretsRef => {
  return (krets as GrunnkretsRef).grunnkretsnummer !== undefined;
};

type Props = {
  krets: KretsRef;
  isOpen: boolean;
  toggleRow: (id: string) => void;
};

const FutureChangesButton = ({ isOpen, toggleRow, krets }: Props) => {
  return (
    <ToggleableKretsButton
      isOpen={isOpen}
      onClick={(e) => {
        e.stopPropagation();
        toggleRow(krets.id);
      }}
      aria-label={`${
        isOpen ? "Skjul" : "Vis"
      } fremtidige endringer for ${getNavnInSpraak(krets.navn, "nor")}`}
      icon={<Icon icon="timelapse" />}
    >
      {isGrunnkretsRef(krets) && (
        <Badge>{krets.antallFramtidigeVersjoner}</Badge>
      )}
    </ToggleableKretsButton>
  );
};

const Badge = styled.span`
  position: absolute;
  display: inline-block;
  font-size: 12px;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  text-align: center;
  padding-top: 1px;
  background-color: ${({ theme }) => theme.colors.redErrorText};
  color: ${({ theme }) => theme.colors.white};
  right: 1px;
  top: 1px;
  pointer-events: none;
`;

export default FutureChangesButton;
