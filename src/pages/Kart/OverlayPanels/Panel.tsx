import { CloseButton, Heading } from "@kvib/react";
import { styled, keyframes } from "styled-components";

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
  margin: 16px;
  padding: 0 16px;
  background: white;
  border: 2px solid var(--kvib-colors-gray-50);
  border-radius: 12px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 1250px;
  overflow: auto;
  ${(props) => !props.$isOpen && "display: none"};
  animation: ${fadeIn} 0.25s ease-in-out;
  z-index: 1;
`;

export const SidePanel = styled(Panel)`
  grid-area: sidepanel;
  width: 450px;
  border-radius: unset;
  margin: 0;
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
  animation: ${slideIn} 0.25s ease-in-out;
`;

type PanelHeaderSizes = "sm" | "md";
type PanelHeaderContainerProps = {
  $size?: PanelHeaderSizes;
};

const getPaddingForSize = (size: PanelHeaderSizes): string => {
  switch (size) {
    case "md":
      return "24px 8px 16px";
    case "sm":
      return "12px 8px 8px";
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
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: ${({ $size = "md" }) => getPaddingForSize($size)};
  background: var(--kvib-colors-chakra-body-bg);
  border-bottom: 2px solid var(--kvib-colors-gray-50);
  margin-bottom: ${({ $size = "md" }) => getMarginForSize($size)};
`;

type PanelHeaderProps = {
  onClose: () => void;
  children: React.ReactNode;
  size?: PanelHeaderSizes;
};

export const PanelHeader = ({
  children,
  onClose,
  size = "md",
}: PanelHeaderProps) => (
  <PanelHeaderContainer $size={size}>
    <Heading as="h3" size={size}>
      {children}
    </Heading>
    <CloseButton
      size={getCloseButtonSize(size)}
      onClick={onClose}
      aria-label="Lukk"
    />
  </PanelHeaderContainer>
);
