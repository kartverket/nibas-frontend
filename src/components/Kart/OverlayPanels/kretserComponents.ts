import Button from "components/form/Button";
import { Outline } from "style/mixins";
import styled from "styled-components";

export const ToggleableKretsButton = styled(Button).attrs(() => ({
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
    background: ${({ isOpen }) => !isOpen && "var(--blue_light)"};
  }

  &:focus-visible {
    ${Outline};
  }
`;

export const FutureChangesTableData = styled.td`
  border-top: 2px solid var(--gray);
  background-color: var(--gray_light);
  width: 100%;
  padding: 32px 16px;
`;
