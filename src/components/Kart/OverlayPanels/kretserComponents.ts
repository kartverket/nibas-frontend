import Button from "components/form/Button";
import styled from "styled-components";

export const ToggleableKretsButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ isOpen: boolean }>`
  border-radius: 50%;
  padding: 5px;

  background-color: ${({ isOpen, theme }) => isOpen && theme.colors.blueDark};
  color: ${({ isOpen, theme }) => isOpen && theme.colors.white};
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
`;
