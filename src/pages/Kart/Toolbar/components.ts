import { styled } from "styled-components";

export const toolbarSpacing = 20;

export const Frame = styled.div`
  display: flex;
  gap: ${toolbarSpacing}px;

  width: fit-content;
  padding: 16px 12px;
  border: 2px solid var(--kvib-colors-gray-50);
  background: white;
  border-radius: 10px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
`;
