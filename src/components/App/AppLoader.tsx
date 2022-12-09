import styled from "styled-components";
import Loader from "../Loader";

export const FullPageLoader = () => (
  <LoaderWrapper>
    <Loader />
  </LoaderWrapper>
);

const LoaderWrapper = styled.div`
  display: flex;
  padding-top: 5rem;
  justify-content: center;
  align-items: center;

  .loader {
    height: 4rem;
    width: 4rem;
  }
`;
