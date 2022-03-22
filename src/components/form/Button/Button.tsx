import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "unstyled" | "icon";
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant, children, ...props }, ref) => {
    if (variant === "unstyled") {
      return (
        <UnstyledButton {...props} ref={ref}>
          {children}
        </UnstyledButton>
      );
    } else if (variant === "icon") {
      return (
        <IconButton {...props} ref={ref}>
          {children}
        </IconButton>
      );
    }

    return (
      <StyledButton {...props} ref={ref}>
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = "Button";

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
