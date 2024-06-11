import { MousePosition, ScaleLine } from "ol/control";
import { useEffect } from "react";
import { styled } from "styled-components";
import { zindex } from "utils/constants";
import { map } from "./constants";
import { EPSGCode, projectionDefinitions } from "utils/map/projections";

const getProjection = () => map.getView().getProjection();

const getProjectionName = (inShort: boolean) => {
  const projection = getProjection();
  return projectionDefinitions.find((def) => def.epsgCode === projection.getCode())?.[inShort ? "shortName" : "name"];
};

export const getLabelsFromProjection = (projectionEPSGCode: EPSGCode) => {
  return projectionDefinitions.find((def) => def.epsgCode === projectionEPSGCode)?.xyLabel ?? { x: null, y: null };
};

const Kartinformasjon = () => {
  useEffect(() => {
    if (map.getControls().getLength() === 0) {
      const mousePosition = new MousePosition({
        coordinateFormat: (coordinates) => {
          if (!coordinates) {
            return "";
          }
          return `${coordinates[0].toFixed(2)}Ø  ${coordinates[1].toFixed(2)}N`;
        },
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
      <Container>
        <ProjectionSpan>{getProjectionName(true)}</ProjectionSpan>
        <Position id="mouse-position" />
        <Scale id="scale-bar" />
      </Container>

      <ScaleIndicator id="scale-line" />
    </>
  );
};

const Container = styled.div`
  position: absolute;
  top: 6px;
  left: 8px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 2px 8px;
  width: fit-content;
  gap: 12px;
  background: white;
  box-shadow: var(--kvib-shadows-sm);
  font-size: var(--kvib-fontSizes-xs);
  border-radius: 4px;
  z-index: ${zindex.farBack};
`;

const ScaleIndicator = styled.span`
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: ${zindex.farBack};

  border: 2px solid var(--kvib-colors-gray-700);
  font-size: var(--kvib-fontSizes-xs);
  border-top: none;
  text-align: center;
`;

const Scale = styled.div`
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

const ProjectionSpan = styled.span`
  color: var(--kvib-colors-gray-700);
`;

export default Kartinformasjon;
