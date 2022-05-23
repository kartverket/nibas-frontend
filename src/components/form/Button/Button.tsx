import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "unstyled";
  icon?: React.ReactElement;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant, children, icon, ...props }, ref) => {
    if (variant === "unstyled") {
      return (
        <UnstyledButton {...props} ref={ref}>
          {children}
        </UnstyledButton>
      );
    }

    return (
      <StyledButton {...props} ref={ref}>
        <ButtonContentWrapper>
          {children && <span>{children}</span>}
          {icon}
        </ButtonContentWrapper>
      </StyledButton>
    );
  }
);

Button.displayName = "Button";

const StyledButton = styled.button`
  * {
    // gjør at children ikke gir ekstra plass til tekst
    vertical-align: middle;
  }

  text-align: left;
`;

const ButtonContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  > *:first-child {
    flex: 1;
  }
`;

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

export default Button;
