import { CloseButton, Heading, Text } from "@kvib/react";
import { styled, keyframes } from "styled-components";
import { zindex } from "utils/constants";

type PanelHeaderProps = {
  onClose: () => void;
  children: React.ReactNode;
  button?: React.ReactNode;
  subHeading?: string;
  isSmall?: boolean;
  noMargin?: boolean;
  className?: string;
};

export const PanelHeader = ({
  children,
  onClose,
  button,
  className,
  subHeading = "",
  isSmall = false,
  noMargin = false,
}: PanelHeaderProps) => (
  <PanelHeaderContainer $isSmall={isSmall} $noMargin={noMargin} className={className}>
    <PanelHeadingContainer>
      <Heading as={PanelHeadingText} size={isSmall ? "sm" : "md"}>
        {children}
      </Heading>
      {subHeading && <Text fontSize="sm">{subHeading}</Text>}
    </PanelHeadingContainer>
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

const fadeIn = keyframes`
  from {
    opacity: 1;
    transform: translateY(-10%);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(10%);
  }
  to {
    transform: none;
  }
`;

const Panel = styled.div`
  --panel-padding: 22px;
  width: 100%;
  padding: 0 var(--panel-padding);
  background: white;
  border-left: 1px solid var(--kvib-colors-chakra-border-color);
  overflow: auto;
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
  animation: ${fadeIn} 0.2s ease-out;
`;

export const SidePanelWidth = 520;
export const SidePanel = styled(Panel)`
  grid-area: sidepanel;
  width: ${SidePanelWidth}px;
  border-radius: unset;
  border-top: none;
  margin: unset;
  animation: ${slideIn} 0.2s ease-out;
`;

export const AbsolutePanel = styled(Panel)`
  position: absolute;
  top: 0;
  right: 0;
  width: unset;
  max-width: 450px;
  height: fit-content;
  box-shadow: var(--kvib-shadows-sm);
  border-radius: 8px;
  margin: 16px;
  animation: ${slideIn} 0.2s ease-out;
`;

const PanelHeaderContainer = styled.div<{ $isSmall: boolean; $noMargin: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${zindex.panel};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: ${({ $isSmall }) => ($isSmall ? "12px 0 8px" : "16px 0 12px")};
  margin-bottom: ${({ $isSmall, $noMargin }) => ($noMargin ? "" : $isSmall ? "10px" : "14px")};
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 1px solid var(--kvib-colors-gray-100);
`;

const PanelHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 100%;
`;

const PanelHeadingText = styled.h3`
  display: flex;
  font-size: var(--kvib-fontSizes-lg);
  font-weight: 600;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`;
