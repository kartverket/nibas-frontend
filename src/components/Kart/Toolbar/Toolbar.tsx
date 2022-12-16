import { useState } from "react";
import styled from "styled-components";
import CreateUtkastToolbar from "./CreateUtkastToolbar";
import DefaultToolbar from "./DefaultToolbar";

const Toolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);

  return (
    <ToolbarArea>
      <DefaultToolbar openCreateUtkast={() => setCreateUtkastOpen(true)} />
      {createUtkastOpen && (
        <CreateUtkastToolbar
          closeCreateUtkast={() => setCreateUtkastOpen(false)}
        />
      )}
    </ToolbarArea>
  );
};

const ToolbarArea = styled.div`
  grid-area: toolbar;
`;

export default Toolbar;
