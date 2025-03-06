import { styled } from "styled-components";
import { Spinner } from "@kvib/react";

const Loading = () => {
  return (
    <Container>
      <Spinner thickness="4px" emptyColor="gray.200" color="blue.500" size="2xl" />
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
