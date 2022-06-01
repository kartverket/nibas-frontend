import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "unstyled";
  icon?: React.ReactElement;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant, children, icon, ...props }, ref) => {
    const ButtonWrapper =
      variant === "unstyled" ? UnstyledButton : StyledButton;

    return (
      <ButtonWrapper {...props} ref={ref}>
        <ButtonContentWrapper>
          {children && <span>{children}</span>}
          {icon}
        </ButtonContentWrapper>
      </ButtonWrapper>
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

  > span:first-child {
    flex: 1;
  }

  > svg {
    margin-left: 4px;
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

  svg {
    margin: 0;
  }
`;

export default Button;
