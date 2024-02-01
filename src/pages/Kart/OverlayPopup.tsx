import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { map, overlayPopup } from "./constants";
import { useFeatureStyle } from "contexts/FeatureStyleContext";

const OverlayPopup = () => {
    const { selectedFeatures } = useFeatureStyle();
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!overlayRef.current) return;

        overlayPopup.setElement(overlayRef.current);

        map.addOverlay(overlayPopup);

        return () => {
            map.removeOverlay(overlayPopup);
        };
    }, []);

    // OverlayPopup skal kun vises når man har valgt én linje
    const properties = selectedFeatures.length === 1 ? selectedFeatures[0].getProperties() : undefined;

    return (
        <Popup ref={overlayRef}>
            {properties && (
                <div>
                    <Value>{`Målemetode: ${properties?.MALEMETODE ?? "---"}`}</Value>
                    <Value>{`Nøyaktighet: ${properties?.NOYAKTIGHET ?? "---"}`}</Value>
                    <Value>{`Nøyaktighetsklasse: ${properties?.NOYAKTIGHETSKLASSE ?? "---"}`}</Value>
                    <Value>{`Omtvistet: ${properties?.OMTVISTET === 1 ? "Ja" : "Nei"}`}</Value>
                </div>
            )}
        </Popup>
    );
};

const Popup = styled.div`
    position: absolute;
    background-color: white;
    border: 1px solid var(--kvib-colors-gray-50);
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
