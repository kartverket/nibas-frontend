import { Suspense, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map } from "./constants";
import useInteractions from "./interactions/useInteractions";
import Toolbar from "./Toolbar/Toolbar";
import OverlayPanels from "./OverlayPanels/OverlayPanels";
import { TegnforklaringButton } from "./OverlayPanels/Tegnforklaring/TegnforklaringButton";
import Kartinformasjon from "./Kartinformasjon";
import { zindex } from "utils/constants";
import { Spinner } from "@kvib/react";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { format, isPast } from "date-fns";
import { useParams } from "react-router-dom";
import PointOverlayPopup from "./PointOverlayPopup";

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
        <Suspense fallback="More loading...">
          <KartOverlay>
            {isLoadingInndeling && (
              <SpinnerBackground>
                <KartLoadingSpinner size="lg" />
              </SpinnerBackground>
            )}
            <Kartinformasjon />
            <TegnforklaringButton />
            <OverlayPanels />
            <Toolbar />
          </KartOverlay>
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
    background: var(--kvib-colors-blue-200);
    opacity: 0.3;
    border-radius: 6px;
    border: solid 2px var(--kvib-colors-blue-500);
  }
`;

const SpinnerBackground = styled.div`
  display: grid;
  place-items: center;
  background: white;
  padding: 12px;
  border-radius: 50%;
  box-shadow: var(--kvib-shadows-base);
  margin: auto;
`;

const KartLoadingSpinner = styled(Spinner)`
  color: var(--kvib-colors-blue-500);
  border-width: 3px;
  margin: auto;
`;

const KartOverlay = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  justify-items: center;
  grid-template-areas:
    "overlay sidepanel"
    "toolbar sidepanel";
  gap: 16px;
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
