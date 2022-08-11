import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import Button from "components/form/Button";

const Toolbar = () => {
  return (
    <ToolbarArea>
      <ToolbarWrapper>
        <Button>Lagre</Button>
      </ToolbarWrapper>
    </ToolbarArea>
  );
};

const ToolbarArea = styled.div`
  margin-left: 30px;
  margin-top: 30px;
`;

const ToolbarWrapper = styled(KartInteractable)`
  grid-area: toolbar;
  border: 2px solid ${({ theme }) => theme.colors.blue};
`;

export default Toolbar;
