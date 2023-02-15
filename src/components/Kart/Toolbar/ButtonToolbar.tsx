import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { map } from "../constants";
import { Frame } from "./components";
import ModeButton from "./ModeButton";
import { useToolbar, useToolbarActions } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

const Divider = styled.hr`
  width: 100%;
  border: 1px solid var(--gray_light);
  margin: 0;
`;

const ButtonToolbar = () => {
  const { t } = useTranslation();
  const { undo, redo } = useToolbarActions();
  const { activePointMode, togglePointMode, activeEditModes, toggleEditMode } =
    useToolbar();

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  useKeyboardShortcut("undo", undo);
  useKeyboardShortcut("redo", redo);

  return (
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
        disabled={activeEditModes.includes("draw")}
      >
        {t("action.Legg til")}
      </ModeButton>
      <ModeButton
        icon="wrong_location"
        ariaLabel="Fjern punkter"
        isActive={activePointMode === "remove"}
        onClick={() => togglePointMode("remove")}
        disabled={activeEditModes.includes("draw")}
      >
        {t("action.Fjern")}
      </ModeButton>
      {false && (
        <>
          <ModeButton
            icon="edit_location_alt"
            ariaLabel="Løsriv punkter"
            isActive={activePointMode === "detach"}
            onClick={() => togglePointMode("detach")}
          >
            {t("action.Løsriv")}
          </ModeButton>
          <ModeButton
            icon="location_off"
            ariaLabel="Splitt punkter"
            isActive={activePointMode === "split"}
            onClick={() => togglePointMode("split")}
          >
            {t("action.Splitt")}
          </ModeButton>
        </>
      )}
      <Divider />
      <ModeButton
        icon="draw"
        ariaLabel="Tegn linjer"
        isActive={activeEditModes.includes("draw")}
        onClick={() => toggleEditMode("draw")}
      >
        {t("action.Tegn")}
      </ModeButton>
      <Divider />
      <ModeButton
        icon="magnet"
        ariaLabel="Snap til bakgrunnskart"
        isActive={activeEditModes.includes("snap")}
        onClick={() => toggleEditMode("snap")}
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
  );
};

export default ButtonToolbar;
