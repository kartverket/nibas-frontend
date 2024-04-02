import { styled } from "styled-components";
import { Button, MaterialSymbol } from "@kvib/react";

type Props = {
  onClick: () => void;
  rightIcon?: MaterialSymbol;
  children: React.ReactNode;
  isActive: boolean;
};

const Inndeling = (props: Props) => {
  return (
    <InndelingButton isActive={props.isActive} variant="ghost" rightIcon={props.rightIcon} onClick={props.onClick}>
      {props.children}
    </InndelingButton>
  );
};

export default Inndeling;

const InndelingButton = styled(Button)`
  // TODO Fix height
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);
  & > div {
    width: 100%;
    justify-content: space-between;
  }
  &[data-active] {
    background: var(--kvib-colors-blue-50);
  }
`;
