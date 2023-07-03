import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-25%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const SidebarPanel = styled.div<{ isOpen: boolean }>`
  display: inline-block;
  background-color: white;
  pointer-events: auto;
  height: 100%;
  width: 440px;
  padding: 8px 16px;
  border-right: 3px solid var(--kvib-colors-gray-50);
  overflow: auto;
  ${(props) => !props.isOpen && "display: none"};
  animation: ${slideIn} 0.25s ease-in-out;
`;
