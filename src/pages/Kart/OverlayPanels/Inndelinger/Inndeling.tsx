import { styled } from "styled-components";
import { Button, MaterialSymbol } from "@kvib/react";
import { Kretstype } from "contexts/InndelingerContext/InndelingerContext";

type Props = {
  kretstype: Kretstype | null;
  isActive: boolean;
  onClick: () => void;
  rightIcon: MaterialSymbol;
  children: React.ReactNode;
};

type SelectableProps = Props & {
  inndelingId: string;
};

const Inndeling = (props: Props) => {
  return <Container {...props}>{props.children}</Container>;
};

const InndelingSelectable = (props: SelectableProps) => {
  return <Inndeling {...props}>{props.children}</Inndeling>;
};

export { Inndeling, InndelingSelectable };

const Container = styled(Button).attrs({
  variant: "ghost",
})`
  height: unset;
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
