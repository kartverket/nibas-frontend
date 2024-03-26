import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100%;
`;

export const Page = styled.main`
  display: grid;
  justify-items: center;
  place-content: start center;
  grid-template-columns: 669px;
  gap: 18px 0;
  height: 100%;
  padding: 128px 20px;
  background: var(--kvib-colors-gray-50);
`;
