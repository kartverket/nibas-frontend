import { styled } from "styled-components";
import { Spinner } from "@kvib/react";

const Loading = () => {
  return (
    <SpinnerBackground>
      <KartLoadingSpinner size="lg" />
    </SpinnerBackground>
  );
};

const SpinnerBackground = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  background: white;
  padding: 12px;
  border-radius: 50%;
  box-shadow: var(--kvib-shadows-base);
  margin: auto;
`;

const KartLoadingSpinner = styled(Spinner)`
  color: var(--kvib-colors-blue-500);
  border-width: 3px;
  margin: auto;
`;
export default Loading;
