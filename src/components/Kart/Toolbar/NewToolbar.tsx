import styled from "styled-components";
import ModeButton from "./ModeButton";
import { map } from "../constants";
import { useTranslation } from "react-i18next";

const Container = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;

  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 16px 12px;
  border: 2px solid var(--gray_light);
  background: white;
  border-radius: 10px;
  box-shadow: 4px 4px 12px 0 rgba(0, 0, 0, 0.15);
`;

const Divider = styled.hr`
  width: 100%;
`;

const NewToolbar = () => {
  const { t } = useTranslation();

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  return (
    <Container>
      <ModeButton icon="undo" ariaLabel="Angre handling">
        {t("action.Undo")}
      </ModeButton>
      <ModeButton icon="redo" ariaLabel="Gjør om handling">
        {t("action.Redo")}
      </ModeButton>
      <Divider />
      <ModeButton icon="map" ariaLabel="Flytt punkter">
        Flytt
      </ModeButton>
      <ModeButton icon="map" ariaLabel="Legg til punkter">
        Legg til
      </ModeButton>
      <ModeButton icon="map" ariaLabel="Fjern punkter" isActive>
        Fjern
      </ModeButton>
      <ModeButton icon="map" ariaLabel="Snap til bakgrunnskart">
        Snap
      </ModeButton>
      <Divider />
      <ModeButton
        icon="zoom_in"
        onClick={() => zoom(1)}
        ariaLabel="Zoom inn på kartet"
      >
        Zoom inn
      </ModeButton>
      <ModeButton
        icon="zoom_out"
        onClick={() => zoom(-1)}
        ariaLabel="Zoom ut på kartet"
      >
        Zoom ut
      </ModeButton>
    </Container>
  );
};

export default NewToolbar;
