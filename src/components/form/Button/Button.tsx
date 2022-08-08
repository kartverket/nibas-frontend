import { ButtonHTMLAttributes, forwardRef } from "react";
import styled from "styled-components";

type Size = "xs" | "sm" | "l";

type Variant = "unstyled" | "primary" | "secondary" | "tertiary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
  icon?: React.ReactElement;
};

const getKvibClassName = (variant: Variant, size: Size) => {
  let className = "button button__blue--";

  switch (variant) {
    case "primary": {
      className += "primary";
      break;
    }
    case "secondary": {
      className += "secondary";
      break;
    }
    case "tertiary": {
      className += "tertiary";
      break;
    }
  }

  className += " button--";

  switch (size) {
    case "xs": {
      className += "xs";
      break;
    }
    case "sm": {
      className += "sm";
      break;
    }
    case "l": {
      className += "l";
      break;
    }
  }

  return className;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "xs", children, icon, ...props }, ref) => {
    const ButtonWrapper =
      variant === "unstyled" ? UnstyledButton : StyledButton;

    const kvibClassName = getKvibClassName(variant, size);

    const className =
      variant === "unstyled"
        ? props.className
        : `${kvibClassName} ${props.className ?? ""}`;

    return (
      <ButtonWrapper {...props} ref={ref} className={className}>
        {children && <span>{children}</span>}
        {icon}
      </ButtonWrapper>
    );
  }
);

Button.displayName = "Button";

const StyledButton = styled.button`
  // kvib sin disabled funker ikke, så vi legger den inn selv
  :disabled {
    background-color: var(--gray_light);
    color: var(--gray_dark);
    outline-style: solid;
    outline-color: var(--gray_dark);
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
  text-align: left;

  * {
    // gjør at children ikke gir ekstra plass til tekst
    vertical-align: middle;
  }

  :disabled {
    cursor: initial;
    background-color: var(--gray_light);
    color: var(--gray_dark);
    outline-style: solid;
    outline-color: var(--gray_dark);
  }

  svg {
    margin: 0;
  }
`;

export default Button;
