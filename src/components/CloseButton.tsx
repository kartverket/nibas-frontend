import styled from "styled-components";
import Icon from "components/Icon";
import { IconButton } from "@kvib/react";

const CloseButton = styled(IconButton).attrs({
  variant: "ghost",
  icon: <Icon icon="close" />,
})`
  border-radius: 50%;

  > span {
    font-size: 28px;
    color: var(--blue_dark);
    padding: 6px;
    border-radius: 50%;

    &:hover {
      background-color: var(--blue_light);
    }
  }
  &:focus-visible {
    outline: 2px solid var(--blue_dark);
  }
`;

export default CloseButton;
