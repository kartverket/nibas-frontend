import { InndelingOfType, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { grenserLayers } from "hooks/layers/constants";
import {
  TILHORIGHET_INNDELINGTYPE_VALUES,
  TilhorighetInndelingtype,
} from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { useEffect } from "react";
import { Inndelingtype } from "types/api";
import { removeNil } from "utils/list-utils";
import { addFeaturesToSource } from "utils/map/source";
import { getPolygonForOmraade } from "./flate-highlight-utils";
import { useFlatedata } from "./useFlatedata";

// Vi kan kun finne flater for inndelingstyper som inngår i tilhørighet.
const isTilhorighetInndeling = (inndeling: {
  inndelingtype: Inndelingtype;
}): inndeling is InndelingOfType<TilhorighetInndelingtype> =>
  TILHORIGHET_INNDELINGTYPE_VALUES.some((type) => type === inndeling.inndelingtype);

type Props = {
  isActive: boolean;
};

// Wrapper rundt InndelingHighlighter for å kalle useFlatedata dynamisk for et antall inndelinger
const InndelingerHighlightLoader = ({ isActive }: Props) => {
  const { getAllInndelinger } = useInndelinger();

  useEffect(() => {
    if (!isActive) {
      grenserLayers.flater.getSource()?.clear();
    }
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  const inndelingerToHighlight = getAllInndelinger()
    .filter((inndeling) => inndeling.isViewing || (inndeling.isEditing && isTilhorighetInndeling(inndeling)))
    .filter(isTilhorighetInndeling);

  return (
    <>
      {inndelingerToHighlight.map((inndeling) => (
        <InndelingHighlighter key={inndeling.inndelingtype + inndeling.id} inndeling={inndeling} />
      ))}
    </>
  );
};

type FlateKommuneOmraaderHighlighterProps = {
  inndeling: InndelingOfType<TilhorighetInndelingtype>;
};

/**
 * Henter ut områdene for en gitt inndeling og bygger flatepolygoner for hver av dem som legges inn i "flater"-laget.
 */
const InndelingHighlighter = ({ inndeling }: FlateKommuneOmraaderHighlighterProps) => {
  const omraader = useFlatedata(inndeling) ?? [];

  useEffect(() => {
    const flaterSource = grenserLayers.flater.getSource();
    if (!flaterSource) {
      return;
    }

    const features = removeNil(
      omraader.map((omraade) => getPolygonForOmraade(inndeling.inndelingtype, inndeling.id, omraade)),
    );

    addFeaturesToSource("flater", features);

    return () => {
      features.forEach((feature) => {
        const featureId = feature.getId();
        const existingFeature = featureId != null ? flaterSource.getFeatureById(featureId) : null;
        if (existingFeature) {
          flaterSource.removeFeature(existingFeature);
        }
      });
    };
  }, [omraader, inndeling.id, inndeling.inndelingtype]);

  return null;
};

export default InndelingerHighlightLoader;
