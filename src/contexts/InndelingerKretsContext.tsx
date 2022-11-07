import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext";
import { useMetadataPanel } from "./MetadataPanelContext";
import useKretsgrenser from "hooks/inndelinger/useKretsgrenser";
import { editSource } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { FeatureProperties, KommuneRef } from "types/api";
import { getFeatureId, removeFeaturesFromSourceByIds } from "utils/map/source";

export type Kretstype = "grunnkrets" | "stemmekrets";

const layerIdByKretstype: Record<Kretstype, LayerId> = {
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
};

export type InndelingerKretsContextValue = {
  currentKretstype: Kretstype;
};

/**
 * Bruk heller InndelingerKretsProvider i koden
 */
export const InndelingerKretsContext = createContext<
  InndelingerKretsContextValue | undefined
>(undefined);

type Props = {
  kretstype: Kretstype;
};

export const InndelingerKretsProvider: React.FC<Props> = ({
  children,
  kretstype,
}) => {
  const [currentKretstype, setCurrentKretstype] =
    useState<Kretstype>(kretstype);

  useEffect(() => {
    setCurrentKretstype(kretstype);
  }, [kretstype]);

  const value = { currentKretstype };

  return (
    <InndelingerKretsContext.Provider value={value}>
      {children}
    </InndelingerKretsContext.Provider>
  );
};

export const useInndelingerKrets = (kommune: KommuneRef) => {
  const context = useContext(InndelingerKretsContext);

  if (!context) {
    throw new Error(
      "useInndelingerKrets must be used within a InndelingerKretsContext"
    );
  }

  const { currentKretstype } = context;

  const { values, setObjectValue, setMultipleValues } =
    useEditGrenser(currentKretstype);
  const { openPanel, closePanel } = useMetadataPanel();
  const { addKretserToLayer, removeKretserFromLayer } = useKretsgrenser(
    kommune.id,
    currentKretstype
  );

  const kommuneValues = values[kommune.id] ?? {};

  const toggleEditKretser = () => {
    const newEditing = !kommuneValues.editing;
    const newValues = {
      ...values,
      [kommune.id]: {
        visible: newEditing,
        editing: newEditing,
      },
    };

    if (newEditing) {
      Object.keys(values).forEach((kommuneId) => {
        if (kommuneId === kommune.id) return;

        // fjern features til kretsene som var endret før klikk
        if (newValues[kommuneId]?.visible && newValues[kommuneId]?.editing) {
          const featureIdsToRemove = editSource
            .getFeatures()
            .filter((feature) => {
              const { type, id } = (
                feature.getProperties() as FeatureProperties
              ).inndelingerKontekst;
              return type === currentKretstype && id === kommuneId;
            })
            .map(getFeatureId);

          removeFeaturesFromSourceByIds("edit", featureIdsToRemove);
        }

        newValues[kommuneId] = {
          visible: false,
          editing: false,
        };
      });

      openPanel({ type: currentKretstype, kommune });

      // hvis ikke endret fra før, endre nå
      if (kommuneValues.visible) {
        removeKretserFromLayer(layerIdByKretstype[currentKretstype]);
      }

      addKretserToLayer("edit");
    } else {
      removeKretserFromLayer("edit");
      closePanel(currentKretstype);
    }

    setMultipleValues(newValues);
  };

  const toggleKretser = () => {
    const newVisible = !kommuneValues.visible;
    setObjectValue(kommune.id, {
      visible: newVisible,
      editing: false,
    });

    const layerId: LayerId = kommuneValues.editing
      ? "edit"
      : layerIdByKretstype[currentKretstype];

    if (newVisible) {
      addKretserToLayer(layerIdByKretstype[currentKretstype]);
    } else {
      // hvis ikke lenger skal være synlig
      removeKretserFromLayer(layerId);
      closePanel(currentKretstype);
    }
  };

  return {
    toggleEditKretser,
    toggleKretser,
    kommuneValues,
  };
};
