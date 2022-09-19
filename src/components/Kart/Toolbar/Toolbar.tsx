import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import Button from "components/form/Button";
import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import CreateUtkastToolbar from "./CreateUtkastToolbar";
import { useState } from "react";
import DefaultToolbar from "./DefaultToolbar";

const Toolbar = () => {
  const { utkast, hasChanges } = useUtkast();
  console.log(utkast);
  console.log(hasChanges);

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
  margin-left: 30px;
  margin-top: 30px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  padding: 16px;
`;

export default Toolbar;
