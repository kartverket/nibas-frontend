import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext";
import { useOverlayPanels } from "./OverlayPanelsContext";
import useKretsgrenser from "hooks/inndelinger/useKretsgrenser";
import { editSource } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { FeatureProperties, KommuneRef } from "types/api";
import { getFeatureId, removeFeaturesFromSourceByIds } from "utils/map/source";
import { getIdFromEntity } from "utils/api";

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
  const kommuneId = getIdFromEntity(kommune);
  const context = useContext(InndelingerKretsContext);

  if (!context) {
    throw new Error(
      "useInndelingerKrets must be used within a InndelingerKretsContext"
    );
  }

  const { currentKretstype } = context;

  const {
    values,
    setObjectValue,
    setMultipleValues,
    resetAndClearEditingLayer,
  } = useEditGrenser(currentKretstype);
  const { openPanel, closePanels, closePanel } = useOverlayPanels();
  const { addKretserToLayer, removeKretserFromLayer } = useKretsgrenser(
    kommuneId,
    currentKretstype
  );

  const kommuneValues = values[kommuneId] ?? {};

  const toggleEditKretser = () => {
    const newEditing = !kommuneValues.editing;
    const newValues = {
      ...values,
      [kommuneId]: {
        visible: newEditing,
        editing: newEditing,
      },
    };

    resetAndClearEditingLayer();

    if (newEditing) {
      Object.keys(values).forEach((kommuneIdInList) => {
        if (kommuneId === kommuneIdInList) return;

        // fjern features til kretsene som var endret før klikk
        if (
          newValues[kommuneIdInList]?.visible &&
          newValues[kommuneIdInList]?.editing
        ) {
          const featureIdsToRemove = editSource
            .getFeatures()
            .filter((feature) => {
              const { type, id } = (
                feature.getProperties() as FeatureProperties
              ).inndelingerKontekst;
              return type === currentKretstype && id === kommuneIdInList;
            })
            .map(getFeatureId);

          removeFeaturesFromSourceByIds("edit", featureIdsToRemove);
        }
        // hvis tidligere endret, fjern editing og visible
        if (newValues[kommuneIdInList]?.editing) {
          newValues[kommuneIdInList] = {
            visible: false,
            editing: false,
          };
        }
      });

      openPanel({ type: currentKretstype, kommune });

      // hvis ikke endret fra før, endre nå
      if (kommuneValues.visible) {
        removeKretserFromLayer(layerIdByKretstype[currentKretstype]);
      }

      addKretserToLayer("edit");
    } else {
      removeKretserFromLayer("edit");
      closePanels();
    }

    setMultipleValues(newValues);
  };

  const toggleKretser = () => {
    const newVisible = !kommuneValues.visible;
    setObjectValue(kommuneId, {
      visible: newVisible,
      editing: kommuneValues.editing,
    });

    const layerId: LayerId = kommuneValues.editing
      ? "edit"
      : layerIdByKretstype[currentKretstype];

    if (newVisible) {
      addKretserToLayer(layerId);
    } else {
      // hvis ikke lenger skal være synlig
      removeKretserFromLayer(layerId);

      if (!kommuneValues.editing) {
        closePanel("grensemetadata");
      }
    }
  };

  return {
    toggleEditKretser,
    toggleKretser,
    kommuneValues,
  };
};
