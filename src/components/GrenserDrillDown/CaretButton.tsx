import styled from "styled-components";
import Button from "components/form/Button";
import { Outline } from "style/mixins";

type Props = {
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler;
};

const CaretButton = ({ icon, onClick }: Props) => {

  return (
      <StyledButton onClick={onClick}>
        {icon}
      </StyledButton>
  );
};

const StyledButton = styled(Button).attrs(() => ({
  variant: "unstyled"}))
  `&:focus-visible {
    ${Outline}
  }`

export default CaretButton;
