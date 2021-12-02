import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "unstyled" | "icon";
};

const Button = ({ variant, children, ...props }: Props) => {
  if (variant === "unstyled") {
    return <UnstyledButton {...props}>{children}</UnstyledButton>;
  } else if (variant === "icon") {
    return <IconButton {...props}>{children}</IconButton>;
  }

  return <StyledButton {...props}>{children}</StyledButton>;
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

  :disabled {
    cursor: initial;
  }
`;

const IconButton = styled(UnstyledButton)`
  > * {
    // gjør at children ikke gir ekstra plass til tekst
    vertical-align: middle;
  }
`;

export default Button;
