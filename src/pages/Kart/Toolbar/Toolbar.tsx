import styled from "styled-components";
import LagreToolbar from "./LagreToolbar";
import ButtonToolbar from "./ButtonToolbar";
import { toolbarSpacing } from "./components";
import { useUtkast } from "contexts/UtkastContext";

const Container = styled.div`
  position: relative;
  grid-area: toolbar;
  align-self: end;
  margin: 16px;
  display: flex;
  gap: ${toolbarSpacing}px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${toolbarSpacing}px;
`;

const Toolbar = () => {
  const { utkast } = useUtkast();

  return (
    <Container>
      {utkast && (
        <Stack>
          <LagreToolbar />
        </Stack>
      )}
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
