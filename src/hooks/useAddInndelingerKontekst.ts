import { EditingType } from "contexts/EditGrenserContext";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useEffect } from "react";

const useAddInndelingerKontekst = (features: Feature<Geometry>[] | null, type: EditingType, id: string) => {
    useEffect(() => {
        features?.forEach((feature) => {
            feature.setProperties({
                ...feature.getProperties(),
                inndelingerKontekst: {
                    id,
                    type,
                },
            });
        });
    }, [features, id, type]);
};

export default useAddInndelingerKontekst;
