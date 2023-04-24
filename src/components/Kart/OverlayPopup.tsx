import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { map, overlayPopup } from "./constants";
import { useDataPanel } from "contexts/DataPanelContext";

const OverlayPopup = () => {
  const { selectedFeature } = useDataPanel();
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    overlayPopup.setElement(overlayRef.current);

    map.addOverlay(overlayPopup);

    return () => {
      map.removeOverlay(overlayPopup);
    };
  }, []);

  const properties = selectedFeature?.getProperties();

  return (
    <Popup ref={overlayRef}>
      {selectedFeature && (
        <div>
          <Value>
            {t("metadata.Målemetode")}: {properties?.MALEMETODE ?? "---"}
          </Value>
          <Value>
            {t("metadata.Nøyaktighet")}: {properties?.NOYAKTIGHET ?? "---"}
          </Value>
          <Value>
            {t("metadata.Nøyaktighetsklasse")}:{" "}
            {properties?.NOYAKTIGHETSKLASSE ?? "---"}
          </Value>
          <Value>
            {t("metadata.Omtvistet")}:{" "}
            {properties?.OMTVISTET === 1 ? t("Ja") : t("Nei")}
          </Value>
        </div>
      )}
    </Popup>
  );
};

const Popup = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid var(--gray_light);
  padding: 8px;
  border-radius: 3px;
`;

const Value = styled.p`
  margin: 0;
  margin-bottom: 4px;
  font-size: 14px;
  white-space: nowrap;

  &:last-child {
    margin-bottom: 0;
  }
`;

export default OverlayPopup;
