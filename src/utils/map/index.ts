import { initialMapCenter, initialMapZoom, map } from "pages/Kart/constants";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorSource from "ol/source/Vector";
import { LineString } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { FeatureLike } from "ol/Feature";
import { pixelTolerance } from "pages/Kart/interactions/constants";

export const resetMapView = () => {
    const view = map.getView();

    view.animate({
        zoom: initialMapZoom,
        center: initialMapCenter,
        duration: 500,
    });
};

const calculateFeaturesExtent = (features: Feature<Geometry>[]) => {
    const extent = features.reduce<number[] | null>((acc, feature) => {
        const featureExtent = feature.getGeometry()?.getExtent();

        if (!featureExtent) return acc;

        if (!acc) {
            return [featureExtent[0], featureExtent[1], featureExtent[2], featureExtent[3]];
        }

        return [
            Math.min(acc[0], featureExtent[0]),
            Math.min(acc[1], featureExtent[1]),
            Math.max(acc[2], featureExtent[2]),
            Math.max(acc[3], featureExtent[3]),
        ];
    }, null);

    return extent;
};

export const zoomToFeatures = (features: Feature<Geometry>[]) => {
    if (features.length === 0) {
        resetMapView();
    }
    const extent = calculateFeaturesExtent(features);

    if (!extent) return;

    const view = map.getView();
    view.fit(extent, {
        padding: [200, 200, 200, 200],
        duration: 500,
    });
};

export const getAllVisibleFeatures = () => {
    const layers = map.getAllLayers();

    return layers.flatMap((layer) => {
        const source = layer.getSource();
        if (source instanceof VectorSource) {
            return source.getFeatures();
        }
        return [];
    });
};

export const getZoomMode = (isEditing: boolean, hasEditingInMap: boolean): "edit" | "view" | "none" => {
    if (isEditing) {
        return "edit";
    }

    if (hasEditingInMap) {
        return "none";
    }

    return "view";
};

export const isCoordinateEqual = (a: Coordinate, b: Coordinate) => {
    return a[0] === b[0] && a[1] === b[1];
};

/** Sjekker om en feature har et punkt på gitt koordinat */
const isFeatureConnectedToCoordinate = (feature: FeatureLike, coordinate: Coordinate): boolean => {
    // TODO: dersom featuren er arkivert skal den alltid returnere false?
    if (feature instanceof Feature) {
        const geometry = feature.getGeometry();
        if (geometry instanceof LineString) {
            const featureCoordinates = geometry?.getCoordinates();
            return featureCoordinates.some((featureCoordinate) => isCoordinateEqual(featureCoordinate, coordinate));
        }
    }
    return false;
};

/** Tar inn en grense og prøver å avgjøre om den er koblet til andre grenser i begge ender */
export const isFeatureDeadEnd = (feature: Feature<Geometry>) => {
    const geometry = feature.getGeometry() as LineString;
    const coordinates = geometry?.getCoordinates() as Coordinate[];

    const head = coordinates[0];
    const tail = coordinates[coordinates.length - 1];

    const headFeatures = map
        .getFeaturesAtPixel(map.getPixelFromCoordinate(head))
        .filter((headFeature) => headFeature.getId() !== feature.getId());
    const tailFeatures = map
        .getFeaturesAtPixel(map.getPixelFromCoordinate(tail))
        .filter((tailFeature) => tailFeature.getId() !== feature.getId());

    const headConnected = headFeatures.some((f) => isFeatureConnectedToCoordinate(f, head));
    const tailConnected = tailFeatures.some((f) => isFeatureConnectedToCoordinate(f, tail));

    return !(headConnected && tailConnected);
};

/** Euklidisk avstand mellom to koordinater i piksler */
export const pixelDistance = (coord1: Coordinate, coord2: Coordinate) => {
    const pixel1 = map.getPixelFromCoordinate(coord1);
    const pixel2 = map.getPixelFromCoordinate(coord2);
    const dx = pixel1[0] - pixel2[0];
    const dy = pixel1[1] - pixel2[1];
    const squaredPixelDistance = dx * dx + dy * dy;
    return Math.sqrt(squaredPixelDistance);
};

export const findNearbyVertexOnFeature = (feature: Feature<LineString>, coordinate: Coordinate): Coordinate | null => {
    const geometry = feature.getGeometry() as LineString;
    const coordinates = geometry.getCoordinates();

    const coordinatesWithDistanceToClick = coordinates
        .map((coord) => ({
            coordinates: coord,
            distance: pixelDistance(coord, coordinate),
        }))
        .filter((cwd) => cwd.distance < pixelTolerance);

    // Hvis punktet ikke er innenfor pikseltoleransen sier vi at brukeren ikke trukket på et punkt på grensen
    if (coordinatesWithDistanceToClick.length === 0) {
        return null;
    }

    const nearestVertexCoordinate = coordinatesWithDistanceToClick
        .sort((a, b) => a.distance - b.distance)
        .map((cwd) => cwd.coordinates)[0];
    return nearestVertexCoordinate;
};
