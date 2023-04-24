// TODO: wrapper og andre komponenter som de forskjellige panelene skal bruke
// lurer på om det er komponenter her som kan brukes for sånt som toolbar, dropdown-greia for inndelinger og mer
// tror vi bare må starte et sted

import CloseButton from "components/form/Button/CloseButton";
import Heading from "components/typography/Heading";
import styled from "styled-components";

export type PanelProps = {
  isOpen: boolean;
  className?: string;
  onClose: () => void;
};

export const Panel = styled.div<{ isOpen: boolean }>`
  margin: 16px 0;
  padding: 16px;
  background: white;
  border: 2px solid var(--gray_light);
  border-radius: 12px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15); // TODO, sjekk figma
  width: 100%;
  max-width: 1000px;
  ${(props) => !props.isOpen && "display: none"}
`;

const PanelHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 2px solid var(--gray_light);
`;

const PanelHeading = styled(Heading)`
  margin: 0;
`;

export const PanelHeader: React.FC<{ onClose: () => void }> = ({
  children,
  onClose,
}) => (
  <PanelHeaderContainer>
    <PanelHeading size="l" tag="h3">
      {children}
    </PanelHeading>
    <CloseButton onClick={onClose} />
  </PanelHeaderContainer>
);
