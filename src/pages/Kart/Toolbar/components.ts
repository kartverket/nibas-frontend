import { styled } from "styled-components";

export const toolbarSpacing = 20;

export const Frame = styled.div`
  display: flex;
  gap: ${toolbarSpacing}px;

  width: fit-content;
  padding: 16px 12px;
  background: white;
  border-radius: 10px;
  box-shadow: var(--kvib-shadows-base);
`;
