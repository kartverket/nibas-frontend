import styled from "styled-components";

export const SidebarPanel = styled.div<{ isOpen: boolean }>`
  display: inline-block;
  background-color: white;
  pointer-events: auto;
  height: 100%;
  width: 440px;
  padding: 8px 16px;
  border-right: 3px solid var(--gray_light);
  overflow: auto;
  ${(props) => !props.isOpen && "display: none"};
`;
