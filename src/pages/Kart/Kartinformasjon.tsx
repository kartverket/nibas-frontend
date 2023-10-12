import { Divider, IconButton } from "@kvib/react";
import { styled } from "styled-components";
import { map } from "./constants";
import { useEffect } from "react";
import { MousePosition, ScaleLine } from "ol/control";

const Kartinformasjon = () => {
  useEffect(() => {
    if (map.getControls().getLength() === 0) {
      const mousePosition = new MousePosition({
        coordinateFormat: (coordinates) => {
          if (!coordinates) return "";
          return `${coordinates[1].toFixed(2)}N  ${coordinates[0].toFixed(2)}Ø`;
        },
        projection: "EPSG:25833",
        target: document.getElementById("mouse-position") ?? "",
      });

      const scaleLine = new ScaleLine({
        bar: true,
        text: true,
        target: document.getElementById("scale-line") ?? "",
      });

      map.addControl(mousePosition);
      map.addControl(scaleLine);
    }
  }, []);

  return (
    <Container>
      <Section>
        <IconButton
          size="sm"
          aria-label="Koordinatsystem"
          variant="secondary"
          colorScheme="gray"
          icon="language"
          isDisabled
        />
        <CoordinateSystem>EUREF89 UTM33</CoordinateSystem>
        <Position id="mouse-position" />
      </Section>
      <Divider orientation="vertical" />
      <Scale id="scale-line" />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;

  display: flex;

  background: white;
  box-shadow: var(--kvib-shadows-base);
  border-radius: 8px;
  margin-bottom: auto;
  z-index: -1;
`;

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
`;

const Scale = styled(Section)`
  border-left: 1px solid var(--kvib-colors-chakra-border-color);

  .ol-scale-bar-inner {
    width: fit-content !important;

    * {
      display: none;
    }

    .ol-scale-text {
      display: unset;
      width: inherit !important;
    }
  }
`;

const CoordinateSystem = styled.span`
  color: var(--kvib-colors-gray-500);
`;

const Position = styled.span`
  color: var(--kvib-colors-black);

  div {
    white-space: pre;
  }
`;

export default Kartinformasjon;
