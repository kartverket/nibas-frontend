import { styled } from "styled-components";
import { Button, MaterialSymbol } from "@kvib/react";

export type InndelingButtonType = "checkbox" | "radio" | "button";

type Props = {
  onClick: () => void;
  rightIcon?: MaterialSymbol;
  children: React.ReactNode;
  isActive: boolean;
  type: InndelingButtonType;
};

const InndelingOption = ({ onClick, rightIcon, children, isActive }: Props) => (
  <InndelingButton isActive={isActive} variant="ghost" rightIcon={rightIcon} onClick={onClick}>
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
