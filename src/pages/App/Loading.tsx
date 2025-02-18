import { styled } from "styled-components";
import { Spinner } from "@kvib/react";

const Loading = () => {
  return (
    <Container>
      <Spinner colorPalette="blue" color="blue.500" size="lg" />
    </Container>
  );
};

const Container = styled.div`
  margin: 0 auto;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Loading;
