import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext";
import useKretsgrenser from "hooks/inndelinger/useKretsgrenser";
import { LayerId } from "hooks/layers/types";
import { KommuneRef } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "./OverlayPanelContext";
import { getAllVisibleFeatures, zoomToFeatures } from "utils/map";
import { useToolbar } from "./ToolbarContext";

export type Kretstype = "grunnkrets" | "stemmekrets";

const layerIdByKretstype: Record<Kretstype, LayerId> = {
  grunnkrets: "grunnkrets",
  stemmekrets: "stemmekrets",
};

type InndelingerKretsContextValue = {
  currentKretstype: Kretstype;
};

/**
 * Bruk heller InndelingerKretsProvider i koden
 */
const InndelingerKretsContext = createContext<
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
      "useInndelingerKrets must be used within a InndelingerKretsContext",
    );
  }

  const { currentKretstype } = context;

  const { values, setObjectValue, setMultipleValues, setOtherEditingTypes } =
    useEditGrenser(currentKretstype);
  const { setFlatedata, closeOverlayPanel } = useOverlayPanel();
  const { addKretserToLayer, removeKretserFromLayer, lasterData } =
    useKretsgrenser(kommuneId, currentKretstype);
  const { enableModeTool, disableModeTool } = useToolbar();

  const kommuneValues = values[kommuneId] ?? {};

  // TODO Burde ikke cleare synlighet på kretser man har synlige hvis man skrur på redigering for en annen type krets
  // Det er veldig knotete nå da contextene er kretsavhengige
  const toggleEditKretser = () => {
    setOtherEditingTypes(currentKretstype, false);
    removeKretserFromLayer("edit");
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
      disableModeTool("move");
    } else {
      enableModeTool("move");
    }

    if (newEditing) {
      Object.keys(values).forEach((kommuneIdInList) => {
        if (kommuneId === kommuneIdInList) return;

        // fjern features til kretsene som var endret før klikk
        if (
          newValues[kommuneIdInList]?.visible &&
          newValues[kommuneIdInList]?.editing
        ) {
          removeKretserFromLayer("edit");
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
      addKretserToLayer("edit");
    } else {
      removeKretserFromLayer("edit");
      closeOverlayPanel();
      zoomToFeatures(getAllVisibleFeatures());
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
    }
  };

  return {
    toggleEditKretser,
    toggleKretser,
    kommuneValues,
    lasterData,
    currentKretstype,
  };
};
