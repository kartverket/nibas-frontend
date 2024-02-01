import LineString from "ol/geom/LineString";
import { HistoryDirection, GrenseEntry, GrenseTilhorighetEntry, HistoryChange, MetadataEntry } from "./types";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

const getFeatureFromChange = (change: HistoryChange<number[][]>, direction: HistoryDirection) => {
    const existingFeature = editSource.getFeatureById(change.id) as Feature<Geometry> | null;
    if (!existingFeature && direction === "to" && change[direction]) {
        const newFeature = new Feature({
            geometry: new LineString(change[direction]),
        });
        newFeature.setId(change.id);
        editSource.addFeature(newFeature);
        return newFeature;
    }

    return existingFeature;
};

export const setFeatureCoordinatesForEntry = (entry: GrenseEntry, direction: HistoryDirection) => {
    entry.changes.forEach((change) => {
        const feature = getFeatureFromChange(change, direction);
        if (!feature) return;

        const lineString = feature.getGeometry() as LineString;

        if (direction === "from" && !change[direction]) {
            editSource.removeFeature(feature);
        }

        const coordinates = change[direction];
        if (!coordinates) return;

        lineString.setCoordinates(coordinates);
    });

    return document.dispatchEvent(
        new CustomEvent(direction === "from" ? "grenseUndo" : "grenseRedo", {
            detail: { entry },
        }),
    );
};

export const setFeatureMetadataForEntry = (entry: MetadataEntry, direction: HistoryDirection) => {
    entry.changes.forEach((change) => {
        const feature = editSource.getFeatureById(change.id) as Feature<Geometry> | null;
        if (!feature) return;

        const metadata = change[direction];

        if (!metadata) return;

        feature.setProperties({ ...feature.getProperties(), metadata });
    });
};

export const setKontekstEgenskaperForEntry = (entry: GrenseTilhorighetEntry, direction: HistoryDirection) => {
    entry.changes.forEach((change) => {
        const feature = editSource.getFeatureById(change.id) as Feature<Geometry> | null;
        if (!feature) return;

        const kontekstEgenskaper = change[direction];

        if (!kontekstEgenskaper) return;

        feature.setProperties({ ...feature.getProperties(), kontekstEgenskaper });
    });
};
