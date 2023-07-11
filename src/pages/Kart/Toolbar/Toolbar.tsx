import styled from "styled-components";
import ButtonToolbar from "./ButtonToolbar";
import { toolbarSpacing } from "./components";

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

const Toolbar = () => {
  return (
    <Container>
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
