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
  grid-area: toolbar;
  align-self: end;
  margin: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${toolbarSpacing}px;
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
          {utkastJustCreated && <Toast text={t("utkast.utkast-opprettet")} />}
        </>
      )}
      <ButtonToolbar />
    </Container>
  );
};

export default Toolbar;
