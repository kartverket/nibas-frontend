import styled from "styled-components";
import Button from "components/form/Button";

const ControlButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  padding: 8px;
  border-radius: 8px;
  color: var(--blue);
  background: white;
  border: 1px solid var(--blue);
  transition: background 0.1s;

  &:hover {
    background: var(--blue_light);
  }

  &:focus {
    outline: 2px solid var(--blue_dark);
    outline-offset: 2px;
  }
`;

export default ControlButton;
