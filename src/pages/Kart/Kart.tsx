import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { format, isPast } from "date-fns";
import Loading from "pages/App/Loading";
import { Suspense, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { styled } from "styled-components";
import { zindex } from "utils/constants";
import { map } from "./constants";
import useInteractions from "./interactions/useInteractions";
import Kartinformasjon from "./Kartinformasjon";
import OverlayPanels from "./OverlayPanels/OverlayPanels";
import OverlayPopup from "./OverlayPopup";
import PointOverlayPopup from "./PointOverlayPopup";
import Toolbar from "./Toolbar/Toolbar";

const Kart = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { utkast } = useUtkast();
  const { setGyldighetsdato } = useValgtGyldighetsdato();
  const { gyldigFra } = useParams();

  const { isLoadingInndeling } = useInndelinger();

  // Legger til interactions (modify, select, osv) på kartet
  useInteractions();

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) {
      return;
    }

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Reset valgt visningsdato når kartet åpnes. Bruk enten gyldig-fra på utkastet (om vi har) eller dagens dato
  // Om datoen på utkastet sin gyldigFra er i fortiden bruker vi dagens dato.
  useEffect(() => {
    const dateToUse =
      utkast?.gyldigFra != null && !isPast(utkast.gyldigFra)
        ? new Date(utkast.gyldigFra)
        : gyldigFra != null
          ? new Date(gyldigFra)
          : new Date();
    setGyldighetsdato(format(dateToUse, "yyyy-MM-dd"));
  }, [gyldigFra, setGyldighetsdato, utkast]);

  return (
    <KartWrapper>
      <KartTarget ref={mapRef}>
        <Suspense fallback="Laster inn...">
          <KartOverlay>
            {isLoadingInndeling && <Loading />}
            <OverlayPanels />
            <Toolbar />
            <Kartinformasjon />
          </KartOverlay>
          <OverlayPopup />
          <PointOverlayPopup />
        </Suspense>
      </KartTarget>
    </KartWrapper>
  );
};

const KartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-right-width: 0;
  border-bottom-width: 0;
`;

const KartTarget = styled.div`
  width: 100%;
  height: 100%;

  .ol-control {
    text-align: center;
  }

  /* dragzoom kan kun få style via vanlig css tydeligvis */
  .ol-dragzoom {
    background: var(--kvib-colors-whiteAlpha-500);
    border-radius: var(--kvib-radii-lg);
    border: solid 2px var(--kvib-colors-black);
    box-shadow: var(--kvib-shadows-md);
  }
`;

const KartOverlay = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  justify-items: center;
  grid-template-areas:
    "overlay sidepanel"
    "toolbar sidepanel"
    "mapinfo sidepanel";
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: ${zindex.mapOverlay};
  overflow: hidden;
  pointer-events: none;

  & > * {
    pointer-events: all;
  }
`;

export default Kart;
