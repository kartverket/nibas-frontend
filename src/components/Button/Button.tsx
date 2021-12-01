import React from "react";
import styled from "styled-components";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  variant?: "unstyled";
};

const Button = ({ variant, ...props }: Props) => {
  if (variant === "unstyled") {
    return <UnstyledButton {...props}>{props.children}</UnstyledButton>;
  }

  return <StyledButton {...props}>{props.children}</StyledButton>;
};

const StyledButton = styled.button``;

const UnstyledButton = styled(StyledButton)`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`;

export default Button;
