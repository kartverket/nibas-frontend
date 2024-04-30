import { styled } from "styled-components";
import { Button, Checkbox, MaterialSymbol, Radio } from "@kvib/react";

export type InndelingButtonType = "checkbox" | "radio" | "button";

type CheckOrRadioProps = {
  isActive: boolean;
  type: InndelingButtonType;
};

const CheckboxInput = styled(Checkbox)`
  margin-right: 8px;
`;

const RadioInput = styled(Radio)`
  margin-right: 8px;
`;

const CheckOrRadio = ({ isActive, type }: CheckOrRadioProps) => {
  return (
    <>
      {type === "checkbox" && <CheckboxInput isChecked={isActive} />}
      {type === "radio" && <RadioInput isChecked={isActive} />}
    </>
  );
};

type Props = {
  onClick: () => void;
  rightIcon?: MaterialSymbol;
  children: React.ReactNode;
  isActive: boolean;
  type: InndelingButtonType;
};

const InndelingOption = ({ onClick, rightIcon, children, isActive, type }: Props) => (
  <InndelingButton isActive={isActive} variant="ghost" rightIcon={rightIcon} onClick={onClick}>
    <CheckOrRadio type={type} isActive={isActive} />
    {children}
  </InndelingButton>
);

export default InndelingOption;

const InndelingButton = styled(Button)`
  width: 100%;
  padding: 32px 16px;
  color: inherit;
  font-weight: var(--kvib-fontWeights-normal);

  & > div {
    width: 100%;
    justify-content: space-between;
  }

  &[data-active] {
    background: var(--kvib-colors-blue-50);
  }
`;
