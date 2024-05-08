import { CloseButton, Heading, Text } from "@kvib/react";
import { styled, keyframes } from "styled-components";
import { zindex } from "utils/constants";

export type PanelProps = {
  isOpen: boolean;
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10%);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(25%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Panel = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  padding: 0 18px;
  background: white;
  border: 2px solid var(--kvib-colors-gray-50);
  border-radius: 12px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 15%);
  overflow: auto;
  ${(props) => !props.$isOpen && "display: none"};
  z-index: ${zindex.panel};
`;

const propsToNotForward = ["variants", "custom"];
export const ModalPanel = styled(Panel).withConfig({
  shouldForwardProp: (prop) => !propsToNotForward.includes(prop),
})`
  height: 100%;
  max-width: 1250px;
  margin-left: 16px;
  margin-right: 16px;
  animation: ${fadeIn} 0.25s ease-in-out;
`;

export const SidePanel = styled(Panel)`
  grid-area: sidepanel;
  width: 520px;
  border-radius: unset;
  border-top: none;
  margin: unset;
  animation: ${slideIn} 0.25s ease-in-out;
`;

export const AbsolutePanel = styled(Panel)`
  position: absolute;
  top: 0;
  right: 0;
  width: unset;
  max-width: 450px;
  height: fit-content;
  margin: 16px;
  animation: ${slideIn} 0.25s ease-in-out;
`;

const PanelHeaderContainer = styled.div<{ $isSmall: boolean; $noMargin: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${zindex.panel};

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $isSmall }) => ($isSmall ? "12px 0 8px" : "16px 0 12px")};
  margin-bottom: ${({ $isSmall, $noMargin }) => ($noMargin ? "" : $isSmall ? "16px" : "20px")};
  border-bottom: 2px solid var(--kvib-colors-gray-50);
  background: var(--kvib-colors-chakra-body-bg);
`;

const PanelHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
`;

type PanelHeaderProps = {
  onClose: () => void;
  children: React.ReactNode;
  button?: React.ReactNode;
  subHeading?: string;
  isSmall?: boolean;
  noMargin?: boolean;
};

export const PanelHeader = ({
  children,
  onClose,
  button,
  subHeading = "",
  isSmall = false,
  noMargin = false,
}: PanelHeaderProps) => (
  <PanelHeaderContainer $isSmall={isSmall} $noMargin={noMargin}>
    <PanelHeaderText>
      <Heading as="h3" size={isSmall ? "sm" : "md"}>
        {children}
      </Heading>
      {subHeading && <Text fontSize="sm">{subHeading}</Text>}
    </PanelHeaderText>
    {button != null ? (
      <ButtonGroup>
        {button}
        <CloseButton size={isSmall ? "md" : "lg"} onClick={onClose} aria-label="Lukk" />
      </ButtonGroup>
    ) : (
      <CloseButton size={isSmall ? "md" : "lg"} onClick={onClose} aria-label="Lukk" />
    )}
  </PanelHeaderContainer>
);

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;
