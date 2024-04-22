import { styled } from "styled-components";
import { map } from "./constants";
import { useEffect } from "react";
import { MousePosition, ScaleLine } from "ol/control";
import { zindex } from "utils/constants";
import { defaultProjection } from "utils/map/projections";
import { IconButton } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const Kartinformasjon = () => {
  const { closeOverlayModal, openOverlayModal, activeOverlayModal } = useOverlayPanel();

  useEffect(() => {
    if (map.getControls().getLength() === 0) {
      const mousePosition = new MousePosition({
        coordinateFormat: (coordinates) => {
          if (!coordinates) return "";
          return `${coordinates[1].toFixed(2)}N  ${coordinates[0].toFixed(2)}Ø`;
        },
        projection: defaultProjection,
        target: document.getElementById("mouse-position") ?? "",
      });

      const scaleBar = new ScaleLine({
        bar: true,
        text: true,
        target: document.getElementById("scale-bar") ?? "",
      });

      const scaleLine = new ScaleLine({
        target: document.getElementById("scale-line") ?? "",
      });

      map.addControl(mousePosition);
      map.addControl(scaleBar);
      map.addControl(scaleLine);
    }
    return () => {
      map.getControls().clear();
    };
  }, []);

  return (
    <>
      <ScaleIndicator id="scale-line" />
      <Container>
        <Wrapper>
          <Position id="mouse-position" />
          <Scale id="scale-bar" />
        </Wrapper>
        <IconButton
          aria-label={"koordinatsystem-innstillinger"}
          icon={"settings"}
          iconFill
          size={"sm"}
          variant="ghost"
          onClick={() =>
            activeOverlayModal === "koordinatsystem" ? closeOverlayModal() : openOverlayModal("koordinatsystem")
          }
        />
      </Container>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  gap: 12px;
`;

const Container = styled.div`
  position: absolute;
  top: 6px;
  left: 8px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
  width: 340px;

  background: white;
  box-shadow: var(--kvib-shadows-base);
  font-size: var(--kvib-fontSizes-sm);
  border-radius: 8px;
  z-index: ${zindex.farBack};
`;

const ScaleIndicator = styled.span`
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: ${zindex.farBack};

  border: 2px solid var(--kvib-colors-gray-700);
  border-top: none;
  text-align: center;
`;

const Scale = styled.section`
  display: flex;
  align-items: center;
  gap: 8px;

  /* Vi hindrer OpenLayers sin innebygde styling fra å sette bredde ved å bare ha inline-elementer */
  .ol-scale-bar-inner {
    display: inline;

    * {
      display: none;
    }

    .ol-scale-text {
      display: inline;
    }
  }
`;

const Position = styled.span`
  color: var(--kvib-colors-black);

  div {
    white-space: pre;
  }
`;

export default Kartinformasjon;
