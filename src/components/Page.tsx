import { styled } from "styled-components";

export const BasePage = styled.main`
  background: var(--kvib-colors-gray-50);
  min-height: 100%;
`;

export const Page = styled(BasePage)`
  display: grid;
  justify-content: center;
  justify-items: center;
  align-content: start;
  grid-template-columns: 669px;
  gap: 18px 0;
  height: 100%;
  padding: 128px 20px;
`;
