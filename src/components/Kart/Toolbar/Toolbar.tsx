import styled from "styled-components";
import ModeButton from "./ModeButton";
import { map } from "../constants";
import { useTranslation } from "react-i18next";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import { useToolbar, useToolbarActions } from "contexts/ToolbarContext";
import { useState } from "react";

import UtkastToast from "./UtkastToast";
import UtkastToolbar from "./UtkastToolbar";
import LagreToolbar from "./LagreToolbar";

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

const Divider = styled.hr`
  width: 100%;
  border: 1px solid var(--gray_light);
`;

const Toolbar = () => {
  const [createUtkastOpen, setCreateUtkastOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);
  const { t } = useTranslation();

  const { redigeringsmodusAktiv } = useRedigeringsmodus();
  const { undo, redo } = useToolbarActions();

  const { activePointMode, togglePointMode, snapActive, setSnapActive } =
    useToolbar();

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

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
          {utkastJustCreated && <UtkastToast />}
          <LagreToolbar
            createUtkastOpen={createUtkastOpen}
            setCreateUtkastOpen={setCreateUtkastOpen}
          />
        </>
      )}
      <Frame>
        <ModeButton
          icon="undo"
          ariaLabel="Angre handling"
          onClick={undo}
          disabled={!undo}
        >
          {t("action.Undo")}
        </ModeButton>
        <ModeButton
          icon="redo"
          ariaLabel="Gjør om handling"
          onClick={redo}
          disabled={!redo}
        >
          {t("action.Redo")}
        </ModeButton>
        <Divider />
        <ModeButton
          icon="add_location_alt"
          ariaLabel="Legg til punkter"
          isActive={activePointMode === "add"}
          onClick={() => togglePointMode("add")}
        >
          {t("action.Legg til")}
        </ModeButton>
        <ModeButton
          icon="wrong_location"
          ariaLabel="Fjern punkter"
          isActive={activePointMode === "remove"}
          onClick={() => togglePointMode("remove")}
        >
          {t("action.Fjern")}
        </ModeButton>
        <ModeButton
          icon="magnet"
          ariaLabel="Snap til bakgrunnskart"
          isActive={snapActive}
          onClick={() => setSnapActive(!snapActive)}
        >
          {t("action.Snap")}
        </ModeButton>
        <Divider />
        <ModeButton
          icon="zoom_in"
          onClick={() => zoom(1)}
          ariaLabel="Zoom inn på kartet"
        >
          {t("action.Zoom inn")}
        </ModeButton>
        <ModeButton
          icon="zoom_out"
          onClick={() => zoom(-1)}
          ariaLabel="Zoom ut på kartet"
        >
          {t("action.Zoom ut")}
        </ModeButton>
      </Frame>
    </Container>
  );
};

export default Toolbar;
