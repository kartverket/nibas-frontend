import { useState } from "react";
import styled from "styled-components";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import UtkastToolbar from "./UtkastToolbar";
import LagreToolbar from "./LagreToolbar";
import ButtonToolbar from "./ButtonToolbar";
import { toolbarSpacing } from "./components";
import UtkastToast from "./UtkastToast";
import { t } from "i18next";

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
          {utkastJustCreated && (
            <UtkastToast text={t("Utkastet er opprettet")} />
          )}
        </>
      )}
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
