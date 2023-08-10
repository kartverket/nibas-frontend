import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext";
import useKretsgrenser from "hooks/inndelinger/useKretsgrenser";
import { editSource } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import { FeatureProperties, KommuneRef } from "types/api";
import { getFeatureId, removeFeaturesFromSourceByIds } from "utils/map/source";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "./OverlayPanelContext";
import { zoomToFeatures } from "utils/map";
import { map } from "pages/Kart/constants";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";

export type Kretstype = "grunnkrets" | "stemmekrets";

const layerIdByKretstype: Record<Kretstype, LayerId> = {
  grunnkrets: "grunnkrets",
  stemmekrets: "stemmekrets",
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
  children?: React.ReactNode;
};

export const InndelingerKretsProvider = ({ children, kretstype }: Props) => {
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

  const { values, setObjectValue, setMultipleValues } =
    useEditGrenser(currentKretstype);
  const { setFlatedata, closeOverlayPanel } = useOverlayPanel();
  const { addKretserToLayer, removeKretserFromLayer, lasterData } =
    useKretsgrenser(kommuneId, currentKretstype);

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

    const layerId: LayerId = kommuneValues.editing
      ? "edit"
      : layerIdByKretstype[currentKretstype];

    closeOverlayPanel();
    removeKretserFromLayer(layerId);

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

      setFlatedata(kommune);

      // hvis ikke endret fra før, endre nå
      if (kommuneValues.visible) {
        removeKretserFromLayer(layerIdByKretstype[currentKretstype]);
      }

      addKretserToLayer("edit");
    } else {
      removeKretserFromLayer("edit");
      closeOverlayPanel();
      zoomToFeatures(getAllFeatures());
    }

    setMultipleValues(newValues);
  };

  const getAllFeatures = (): Feature<Geometry>[] => {
    const layers = map.getAllLayers();

    return layers.flatMap((l) => {
      const source = l.getSource();
      if (source instanceof VectorSource) {
        return source.getFeatures();
      }
      return [];
    });
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
    }
  };

  return {
    toggleEditKretser,
    toggleKretser,
    kommuneValues,
    lasterData,
  };
};
