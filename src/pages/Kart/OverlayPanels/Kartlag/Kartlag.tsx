import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { KartlagId } from "hooks/layers/types";
import KartlagInner from "./KartlagInner";
import KartlagOuter from "./KartlagOuter";

type Props = {
    layerId: KartlagId;
};

const Kartlag = ({ layerId }: Props) => {
    const { mappedLayers } = useKartlag();
    const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);
    if (!mappedLayer) {
        return null;
    }

    // Dersom dette laget har flere lag i seg ønsker vi å lage en mappe
    if (mappedLayer.layers.length > 0) {
        return <KartlagOuter mappedLayer={mappedLayer} />;
    }

    return <KartlagInner mappedLayer={mappedLayer} isMainLayer />;
};

export default Kartlag;
