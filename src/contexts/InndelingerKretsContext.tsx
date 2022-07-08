import React, { createContext, useContext, useEffect, useState } from "react";
import { useEditGrenser } from "./EditGrenserContext";
import { useMetadataPanel } from "./MetadataPanelContext";
import useGrunnkretsgrenser from "hooks/inndelinger/useGrunnkretsgrenser";
import { LayerId } from "hooks/layers/types";
import { KommuneRef } from "types/api";

type Kretstype = "grunnkrets" | "stemmekrets";

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

  const { values, setObjectValue } = useEditGrenser(currentKretstype);
  const { openPanel, closePanel } = useMetadataPanel();
  const { addGrunnkretserToLayer, removeGrunnkretserFromLayer } =
    useGrunnkretsgrenser(kommune.id);

  const kommuneValues = values[kommune.id] ?? {};

  const openKretserPanel = () => {
    setObjectValue(kommune.id, {
      visible: true,
      editing: true,
    });
    openPanel({ content: currentKretstype, kommune });

    // hvis ikke endret fra før, endre nå
    if (!kommuneValues.editing) {
      if (kommuneValues.visible) {
        removeGrunnkretserFromLayer(layerIdByKretstype[currentKretstype]);
      }

      addGrunnkretserToLayer("edit");
    }
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
      addGrunnkretserToLayer(layerIdByKretstype[currentKretstype]);
    } else {
      // hvis ikke lenger skal være synlig
      removeGrunnkretserFromLayer(layerId);
      closePanel();
    }
  };

  return {
    openKretserPanel,
    toggleKretser,
    kommuneValues,
  };
};
