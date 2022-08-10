import { forwardRef, InputHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import Label from "components/form/Label";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
  type: "radio" | "checkbox";
};

const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { label, className, ...props },
  ref
) {
  return (
    <Wrapper disabled={!!props.disabled} className={className}>
      {label}
      <DefaultCheckbox {...props} ref={ref} />
      <CustomCheckbox type={props.type} />
    </Wrapper>
  );
});

const Checkmark = css`
  left: 4px;
  top: 1px;
  width: 7px;
  height: 11px;
  border: solid ${({ theme }) => theme.colors.white};
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
`;

const RadioFill = css`
  top: 2px;
  left: 2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.blueDark};
`;

// TODO: Random farge basert på label?

// https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
const CustomCheckbox = styled.span<{ type: "radio" | "checkbox" }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 17px;
  width: 17px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ type }) => (type === "radio" ? "50%" : "2px")};
  border: 1px solid ${({ theme }) => theme.colors.blueDark};
  transition: 0.1s background-color;
  margin-top: 1px;

  :after {
    content: "";
    position: absolute;
    display: none;
    transition: 1s display;

    ${(props) => {
      switch (props.type) {
        case "radio": {
          return RadioFill;
        }
        case "checkbox": {
          return Checkmark;
        }
      }
    }}
  }
`;

const DefaultCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const Wrapper = styled(Label)<{ disabled: boolean }>`
  display: inline-block;
  position: relative;
  padding-left: 24px;
  margin-right: 28px;
  margin-bottom: 14px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  user-select: none;

  :hover ${DefaultCheckbox} ~ ${CustomCheckbox} {
    background-color: ${({ theme }) => theme.colors.grayLight};
  }

  // når checked, vis checkmark/radio fill
  ${DefaultCheckbox}:checked ~ ${CustomCheckbox} {
    :after {
      display: block;
    }
  }

  // radio specific styles
  ${DefaultCheckbox}[type="radio"] {
    :disabled ~ ${CustomCheckbox} {
      background-color: ${({ theme }) => theme.colors.grayLight};
      border-color: ${({ theme }) => theme.colors.gray};

      :after {
        background-color: ${({ theme }) => theme.colors.gray};
      }
    }
  }

  // checkbox specific styles
  ${DefaultCheckbox}[type="checkbox"] {
    :checked ~ ${CustomCheckbox} {
      background-color: ${({ theme }) => theme.colors.blueDark};
    }

    :disabled ~ ${CustomCheckbox} {
      background-color: ${({ theme }) => theme.colors.grayLight};
    }

    :checked:disabled ~ ${CustomCheckbox} {
      background-color: ${({ theme }) => theme.colors.gray};

      :after {
        background-color: inherit;
        border-color: ${({ theme }) => theme.colors.grayLight};
      }
    }
  }
`;

export default Checkbox;
