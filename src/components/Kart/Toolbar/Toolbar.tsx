import { useState } from "react";
import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import CreateUtkastToolbar from "./CreateUtkastToolbar";
import DefaultToolbar from "./DefaultToolbar";

const Toolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);

  return (
    <ToolbarArea>
      <ToolbarWrapper>
        {createUtkastOpen && (
          <CreateUtkastToolbar
            closeCreateUtkast={() => setCreateUtkastOpen(false)}
          />
        )}
        {!createUtkastOpen && (
          <DefaultToolbar openCreateUtkast={() => setCreateUtkastOpen(true)} />
        )}
      </ToolbarWrapper>
    </ToolbarArea>
  );
};

const ToolbarArea = styled.div`
  grid-area: toolbar;
`;

const ToolbarWrapper = styled(KartInteractable)`
  display: flex;
  gap: 0.5rem;
  margin-left: 30px;
  margin-top: 30px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  padding: 16px;
`;

export default Toolbar;
