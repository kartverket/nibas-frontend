import { useState } from "react";
import styled from "styled-components";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import UtkastToolbar from "./UtkastToolbar";
import LagreToolbar from "./LagreToolbar";
import ButtonToolbar from "./ButtonToolbar";
import { toolbarSpacing } from "./components";
import Toast from "./Toast";
import { t } from "i18next";

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
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  return (
    <Container>
      {redigeringsmodusAktiv && (
        <Stack>
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
          {true && <Toast title="Erlend!" status="success" text="God helg!" />}
        </Stack>
      )}
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
