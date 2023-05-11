import CloseButton from "components/form/Button/CloseButton";
import Heading from "components/typography/Heading";
import styled from "styled-components";

export type PanelProps = {
  isOpen: boolean;
  className?: string;
};

export const Panel = styled.div<{ isOpen: boolean }>`
  margin: 16px;
  padding: 0 16px;
  background: white;
  border: 2px solid var(--gray_light);
  border-radius: 12px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 1250px;
  overflow: auto;
  ${(props) => !props.isOpen && "display: none"}
`;

export const SidePanel = styled(Panel)`
  grid-area: sidepanel;
  max-width: 450px;
  border-radius: unset;
  margin: 0;
  border-top: none;
`;

const PanelHeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 8px 16px;
  background: var(--white);
  border-bottom: 2px solid var(--gray_light);
  margin-bottom: 16px;
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
