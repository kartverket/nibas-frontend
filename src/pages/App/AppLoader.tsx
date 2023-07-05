import styled from "styled-components";
import { Spinner } from "@kvib/react";

export const FullPageLoader = () => (
  <LoaderWrapper>
    <Spinner size="xl" color="var(--kvib-colors-blue-500)" />
  </LoaderWrapper>
);

const LoaderWrapper = styled.div`
  display: flex;
  padding-top: 5rem;
  justify-content: center;
  align-items: center;
`;
