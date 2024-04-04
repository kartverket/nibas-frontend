import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext/EditGrenserContext";
import useKretsgrenser from "hooks/inndelinger/useKretsgrenser";
import { LayerId } from "hooks/layers/types";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "./OverlayPanelContext";
import { getAllVisibleFeatures, zoomToFeatures } from "utils/map/map-utils";
import { useToolbar } from "./ToolbarContext";
import { getEditSource } from "utils/map/layers";
import { KommuneResponse } from "types/api";

export type Kretstype = "grunnkrets" | "stemmekrets";

type InndelingerKretsContextValue = {
  currentKretstype: Kretstype;
};

const InndelingerKretsContext = createContext<InndelingerKretsContextValue | undefined>(undefined);

type Props = {
  kretstype: Kretstype;
  children?: React.ReactNode;
};

export const InndelingerKretsProvider = ({ children, kretstype }: Props) => {
  const [currentKretstype, setCurrentKretstype] = useState<Kretstype>(kretstype);

  useEffect(() => {
    setCurrentKretstype(kretstype);
  }, [kretstype]);

  const value = { currentKretstype };

  return <InndelingerKretsContext.Provider value={value}>{children}</InndelingerKretsContext.Provider>;
};

export const useInndelingerKrets = (kommune: KommuneResponse) => {
  const kommuneId = getIdFromEntity(kommune);
  const context = useContext(InndelingerKretsContext);

  if (!context) {
    throw new Error("useInndelingerKrets must be used within a InndelingerKretsContext");
  }

  const { currentKretstype } = context;

  const { kretsStatuser, setKretsStatusForKretstype, setMultipleValues, setOtherEditingTypes } =
    useEditGrenser(currentKretstype);
  const { setFlatedata, closeOverlayPanel } = useOverlayPanel();
  const { addKretserToLayer, removeKretserFromLayer, lasterData, setLasterData } = useKretsgrenser(
    kommuneId,
    currentKretstype,
  );
  const { enableModeTool, disableModeTool } = useToolbar();

  const kommuneValues = kretsStatuser[kommuneId] ?? {};

  // TODO Burde ikke cleare synlighet på kretser man har synlige hvis man skrur på redigering for en annen type krets
  // Det er veldig knotete nå da contextene er kretsavhengige
  const toggleEditKretser = () => {
    setOtherEditingTypes(currentKretstype, false);
    removeKretserFromLayer("edit");
    const newEditing = !kommuneValues.isEditing;
    const newKretsStatuser = {
      ...kretsStatuser,
      [kommuneId]: {
        isVisible: newEditing,
        isEditing: newEditing,
      },
    };

    const layerId: LayerId = kommuneValues.isEditing ? "edit" : currentKretstype;

    closeOverlayPanel();
    removeKretserFromLayer(layerId);

    if (newEditing) {
      disableModeTool("move");
    } else {
      enableModeTool("move");
    }

    if (newEditing) {
      Object.keys(kretsStatuser).forEach((kommuneIdInList) => {
        if (kommuneId === kommuneIdInList) return;

        // fjern features til kretsene som var endret før klikk
        if (newKretsStatuser[kommuneIdInList]?.isVisible && newKretsStatuser[kommuneIdInList]?.isEditing) {
          removeKretserFromLayer("edit");
        }
        // hvis tidligere endret, fjern editing og visible
        if (newKretsStatuser[kommuneIdInList]?.isEditing) {
          newKretsStatuser[kommuneIdInList] = {
            isVisible: false,
            isEditing: false,
          };
        }
      });

      setFlatedata(kommune);
      addKretserToLayer("edit");
    } else {
      removeKretserFromLayer("edit");
      closeOverlayPanel();
      zoomToFeatures(getAllVisibleFeatures());
      setLasterData(false);
    }

    setMultipleValues(newKretsStatuser);
  };

  const toggleKretser = () => {
    const newVisible = !kommuneValues.isVisible;
    setKretsStatusForKretstype(kommuneId, {
      isVisible: newVisible,
      isEditing: kommuneValues.isEditing,
    });

    const layerId: LayerId = kommuneValues.isEditing ? "edit" : currentKretstype;

    if (newVisible) {
      addKretserToLayer(layerId);
    } else {
      // hvis ikke lenger skal være synlig
      removeKretserFromLayer(layerId);
      setLasterData(false);
    }

    // .changed() forcer en rerender av layers
    // rerender av edit er nødvendig for å sikre at lag som påvirker redigerbarhet til edit-layer også viser dette visuelt
    getEditSource()?.changed();
  };

  return {
    toggleEditKretser,
    toggleKretser,
    kommuneValues,
    lasterData,
    currentKretstype,
    setLasterData,
  };
};
