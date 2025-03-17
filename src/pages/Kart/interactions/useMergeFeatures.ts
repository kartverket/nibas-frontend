import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useInndelingFeatures from "contexts/InndelingerContext/useInndelingFeatures";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useMemo } from "react";
import { FeatureProperties } from "types/api";
import { removeNil } from "utils/list-utils";
import { getKretsIdFromKontekstegenskaper } from "../OverlayPanels/hooks/tilhorighet-utils";
import { FeatureLike } from "ol/Feature";

export const useMergeFeatures = () => {
  const { currentlyEditingInndelinger } = useInndelinger();
  const { utkast } = useUtkast();
  const { inndelingFeatures: inndelingerWithFeatures } = useInndelingFeatures(currentlyEditingInndelinger);

  const featuresInSammenslaaing = useMemo(() => {
    const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
    if (sammenslaaing != null) {
      const kretserInSammenslaaing = sammenslaaing.stemmekretserTilSammenslaaing
        .concat(sammenslaaing.viderefoertStemmekrets)
        .map((krets) => krets.lokalId);
      return inndelingerWithFeatures
        .flatMap((iwf) => iwf.features)
        .filter((f) => {
          const fp = f.getProperties() as FeatureProperties;
          return fp.kontekstEgenskaper.some((ke) => kretserInSammenslaaing.includes(ke.id?.lokalid.value ?? ""));
        });
    }
  }, [inndelingerWithFeatures, utkast?.operasjoner.stemmekretsSammenslaaingsendring]);

  const featureIsSharedInSammenslaaing = (feature: FeatureLike): boolean => {
    const featureId = feature.getId();
    const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
    const involverteKretserLokalids =
      sammenslaaing?.stemmekretserTilSammenslaaing
        .flatMap((sk) => sk.lokalId)
        .concat(sammenslaaing.viderefoertStemmekrets.lokalId) ?? [];
    const mergeFeatures = inndelingerWithFeatures
      .flatMap((i) => i.features)
      .filter((f) => {
        // Finner kontekstegenskapene til featuren (kretsene featuren er en del av)
        const kretserIdFromKontekst = removeNil(
          (f.getProperties() as FeatureProperties).kontekstEgenskaper.map((ke) => getKretsIdFromKontekstegenskaper(ke)),
        );
        // hvis featuren har to av de involverte kretsene som kontekster så betyr det at det er en feature som deler de to kretsene
        const overlap = new Set(involverteKretserLokalids.filter((id) => new Set(kretserIdFromKontekst).has(id)));
        return overlap.size >= 2;
      });

    return mergeFeatures.map((mf) => mf.getId()).includes(featureId);
  };

  return {
    featuresInSammenslaaing,
    featureIsSharedInSammenslaaing,
  };
};
