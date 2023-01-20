import { useState } from "react";
import styled from "styled-components";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

import UtkastToast from "./UtkastToast";
import UtkastToolbar from "./UtkastToolbar";
import LagreToolbar from "./LagreToolbar";
import ButtonToolbar from "./ButtonToolbar";

export const toolbarSpacing = 20;
export const toolbarBorderWidth = 2;

const Container = styled.div`
  position: absolute;
  top: ${toolbarSpacing}px;
  right: ${toolbarSpacing}px;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${toolbarSpacing}px;

  pointer-events: none;
  & > * {
    pointer-events: all;
  }
`;

export const Frame = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${toolbarSpacing}px;

  width: fit-content;
  padding: 20px 12px;
  border: ${toolbarBorderWidth}px solid var(--gray_light);
  background: white;
  border-radius: 10px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
`;

const Toolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  return (
    <Container>
      {redigeringsmodusAktiv && (
        <>
          {createUtkastOpen && (
            <UtkastToolbar
              setCreateUtkastOpen={setCreateUtkastOpen}
              setUtkastJustCreated={setUtkastJustCreated}
            />
          )}
          <LagreToolbar
            createUtkastOpen={createUtkastOpen}
            setCreateUtkastOpen={setCreateUtkastOpen}
          />
          {utkastJustCreated && <UtkastToast />}
        </>
      )}
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
