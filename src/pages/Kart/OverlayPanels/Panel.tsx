import { CloseButton, Heading, Text } from "@kvib/react";
import { styled, keyframes } from "styled-components";
import { zindex } from "utils/constants";

export type PanelProps = {
  isOpen: boolean;
  className?: string;
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

export const Panel = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  max-width: 1250px;
  padding: 0 22px;
  background: white;
  border: 2px solid var(--kvib-colors-gray-50);
  border-radius: 12px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
  overflow: auto;
  ${(props) => !props.$isOpen && "display: none"};
  animation: ${fadeIn} 0.25s ease-in-out;
  z-index: ${zindex.panel};
`;

export const SidePanel = styled(Panel)`
  grid-area: sidepanel;
  width: 520px;
  border-radius: unset;
  border-top: none;
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

type PanelHeaderSizes = "sm" | "md";
type PanelHeaderContainerProps = {
  $size?: PanelHeaderSizes;
};

const getPaddingForSize = (size: PanelHeaderSizes): string => {
  switch (size) {
    case "md":
      return "24px 0 16px";
    case "sm":
      return "12px 0 8px";
  }
};

const getMarginForSize = (size: PanelHeaderSizes): string => {
  switch (size) {
    case "md":
      return "16px";
    case "sm":
      return "12px";
  }
};

const getCloseButtonSize = (size: PanelHeaderSizes): string => {
  switch (size) {
    case "md":
      return "lg";
    case "sm":
      return "md";
  }
};

const PanelHeaderContainer = styled.div<PanelHeaderContainerProps>`
  position: sticky;
  top: 0;
  z-index: ${zindex.panel};

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $size = "md" }) => getPaddingForSize($size)};
  margin-bottom: ${({ $size = "md" }) => getMarginForSize($size)};
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
  subHeading?: string;
  size?: PanelHeaderSizes;
};

export const PanelHeader = ({ children, subHeading, onClose, size = "md" }: PanelHeaderProps) => (
  <PanelHeaderContainer $size={size}>
    <PanelHeaderText>
      <Heading as="h3" size={size}>
        {children}
      </Heading>
      {subHeading && <Text fontSize="sm">{subHeading}</Text>}
    </PanelHeaderText>
    <CloseButton size={getCloseButtonSize(size)} onClick={onClose} aria-label="Lukk" />
  </PanelHeaderContainer>
);
