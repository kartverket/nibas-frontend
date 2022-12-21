import { useState } from "react";
import styled from "styled-components";
import CreateUtkastToolbar from "./CreateUtkastToolbar";
import DefaultToolbar from "./DefaultToolbar";

const Toolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);

  const promptUtkast = () => {
    setUtkastJustCreated(true);

    const timeId = setTimeout(() => {
      setUtkastJustCreated(false);
    }, 5000);

    return () => {
      clearTimeout(timeId);
    };
  };

  return (
    <ToolbarArea>
      <DefaultToolbar
        openCreateUtkast={() => setCreateUtkastOpen(true)}
        utkastJustCreated={utkastJustCreated}
      />

      {createUtkastOpen && (
        <CreateUtkastToolbar
          closeCreateUtkast={() => setCreateUtkastOpen(false)}
          promptUtkast={promptUtkast}
        />
      )}
    </ToolbarArea>
  );
};

const ToolbarArea = styled.div`
  grid-area: toolbar;
`;

export default Toolbar;
