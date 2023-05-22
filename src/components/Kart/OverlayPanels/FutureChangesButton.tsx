import styled from "styled-components";
import Icon from "components/Icon";
import Button from "components/form/Button";
import { Outline } from "style/mixins";
import { KretsRef } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";

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
        toggleRow(getIdFromEntity(krets));
      }}
      aria-label={`${
        isOpen ? "Skjul" : "Vis"
      } fremtidige endringer for ${getNavnInSpraak(krets.navn, "nor")}`}
      icon={<Icon icon="timelapse" />}
    >
      <Badge>{krets.antallFramtidigeVersjoner}</Badge>
    </ToggleableKretsButton>
  );
};

const ToggleableKretsButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ isOpen: boolean }>`
  position: relative;
  border-radius: 50%;
  padding: 5px;

  background-color: ${({ isOpen }) => isOpen && "var(--blue_dark)"};
  color: ${({ isOpen }) => isOpen && "var(--white)"};
  transition: background-color 0.2s, color 0.2s;

  &:hover,
  &:focus-visible {
    color: ${({ isOpen }) => !isOpen && "var(--blue_dark)"};
    background: ${({ isOpen }) => !isOpen && "var(--blue_light)"};
  }

  &:focus-visible {
    ${Outline};
  }
`;

const Badge = styled.span`
  position: absolute;
  display: inline-block;
  font-size: 12px;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  text-align: center;
  padding-top: 1px;
  background-color: var(--red_error_message);
  color: var(--white);
  right: 1px;
  top: 1px;
  pointer-events: none;
`;

export default FutureChangesButton;
