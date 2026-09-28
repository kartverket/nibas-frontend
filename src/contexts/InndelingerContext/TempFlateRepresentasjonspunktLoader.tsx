import { Inndeling, InndelingOfType } from "contexts/InndelingerContext/InndelingerContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import { getRepresentasjonspunktForOmraade } from "pages/Kart/OverlayPanels/FlatedataPanel/flate-highlight-utils";
import { isValidTempFlateId } from "pages/Kart/OverlayPanels/FlatedataPanel/flatedata-utils";
import { useFlatedata } from "pages/Kart/OverlayPanels/FlatedataPanel/useFlatedata";
import {
  TILHORIGHET_INNDELINGTYPE_VALUES,
  TilhorighetInndelingtype,
} from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { useEffect } from "react";
import { getIdFromEntity } from "utils/api";
import { inndelingResponseNavnToString } from "utils/language/language";
import { getRepresentasjonspunktId } from "utils/map/source";

const isTilhorighetInndeling = (inndeling: Inndeling): inndeling is InndelingOfType<TilhorighetInndelingtype> =>
  TILHORIGHET_INNDELINGTYPE_VALUES.some((type) => type === inndeling.inndelingtype);

const TempFlateRepresentasjonspunkt = ({ inndeling }: { inndeling: InndelingOfType<TilhorighetInndelingtype> }) => {
  const flatedata = useFlatedata(inndeling) ?? [];
  const { history } = useHistory();

  useEffect(() => {
    const tempFlater = flatedata.filter((flate) => isValidTempFlateId(getIdFromEntity(flate)));
    const viewingSource = grenserLayers[inndeling.inndelingtype].getSource();

    const synchronizeRepresentasjonspunkter = () => {
      for (const flate of tempFlater) {
        const flateId = getIdFromEntity(flate);
        const representasjonspunktId = getRepresentasjonspunktId(flateId);
        const viewingId = `${representasjonspunktId}_isViewing`;
        const point = getRepresentasjonspunktForOmraade(inndeling.inndelingtype, inndeling.id, flate);
        if (point == null) {
          const editFeature = editSource.getFeatureById(representasjonspunktId);
          const viewingFeature = viewingSource?.getFeatureById(viewingId);
          if (editFeature != null) {
            editSource.removeFeature(editFeature);
          }
          if (viewingFeature != null) {
            viewingSource?.removeFeature(viewingFeature);
          }
          continue;
        }

        const properties = {
          type: "Posisjon",
          name: inndelingResponseNavnToString(flate.navn),
          number: flate.nummer,
          gyldigTil: flate.gyldighet.gyldigTil,
          inndelingtype: inndeling.inndelingtype,
        };
        if (inndeling.isEditing) {
          const existingFeature = editSource.getFeatureById(representasjonspunktId);
          if (existingFeature == null) {
            const feature = new Feature<Point>({ geometry: point, ...properties });
            feature.setId(representasjonspunktId);
            editSource.addFeature(feature);
          } else {
            existingFeature.setGeometry(point);
            existingFeature.setProperties(properties);
          }
        }

        if (inndeling.isViewing && viewingSource != null) {
          const existingFeature = viewingSource.getFeatureById(viewingId);
          if (existingFeature == null) {
            const feature = new Feature<Point>({ geometry: point.clone(), ...properties });
            feature.setId(viewingId);
            viewingSource.addFeature(feature);
          } else {
            existingFeature.setGeometry(point.clone());
            existingFeature.setProperties(properties);
          }
        }
      }
    };

    synchronizeRepresentasjonspunkter();

    return () => {
      tempFlater.forEach((flate) => {
        const representasjonspunktId = getRepresentasjonspunktId(getIdFromEntity(flate));
        const editFeature = editSource.getFeatureById(representasjonspunktId);
        const viewingFeature = viewingSource?.getFeatureById(`${representasjonspunktId}_isViewing`);
        if (editFeature != null) {
          editSource.removeFeature(editFeature);
        }
        if (viewingFeature != null) {
          viewingSource?.removeFeature(viewingFeature);
        }
      });
    };
  }, [flatedata, history, inndeling]);

  return null;
};

const TempFlateRepresentasjonspunktLoader = ({ inndelinger }: { inndelinger: Inndeling[] }) => (
  <>
    {inndelinger.filter(isTilhorighetInndeling).map((inndeling) => (
      <TempFlateRepresentasjonspunkt key={`${inndeling.inndelingtype}-${inndeling.id}`} inndeling={inndeling} />
    ))}
  </>
);

export default TempFlateRepresentasjonspunktLoader;
