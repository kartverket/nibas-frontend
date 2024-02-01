import React, { createContext, useContext, useState } from "react";
import { removeAllFeatures } from "utils/map/layers";
import { KretsStatusAlle, EditingType, KretsStatusPerKretstype, KretsStatus } from "./types";

export type EditGrenserContextValue = {
    alleKretserStatuser: KretsStatusAlle;
    setAlleKretserStatuser: React.Dispatch<React.SetStateAction<Partial<Record<EditingType, KretsStatusPerKretstype>>>>;
    setKretsStatus: (type: EditingType, grenseId: string, values?: KretsStatus) => void;
    resetAndClearAllLayers: () => void;
    getCurrentlyEditingType: () => EditingType | null;
    setOtherEditingTypes: (currentType: EditingType, shouldBeEditable?: boolean) => void;
};

/**
 * Bruk heller EditGrenserProvider i koden
 */
export const EditGrenserContext = createContext<EditGrenserContextValue | undefined>(undefined);

export const EditGrenserProvider = ({ children }: { children: React.ReactNode }) => {
    const [alleKretserStatuser, setAlleKretserStatuser] = useState<KretsStatusAlle>({});

    const setKretsStatus = (type: EditingType, kretsId: string, status: KretsStatus = {}) => {
        setAlleKretserStatuser((prevState) => ({
            ...prevState,
            [type]: {
                ...prevState[type],
                [kretsId]: status,
            },
        }));
    };

    /**
     * Går gjennom alle type kretser sine statuser for å finne ut hva, om noe, som redigeres
     * @returns Hvilken grensetype man er i redigeringsmodus for, eller null hvis det er ingenting
     */
    const getCurrentlyEditingType = () => {
        const currentlyEditingType = Object.entries(alleKretserStatuser).find(([, grensevalues]) =>
            Object.values(grensevalues).some((grense) => grense.editing),
        );

        if (currentlyEditingType) {
            return currentlyEditingType[0] as EditingType;
        }
        return null;
    };

    /**
     * Går gjennom alle type krester sine statuser og henter alle typer kretser utenom currentType, og setter redigeringsstatus til innsendt parameter.
     * Brukes kun som en workaround for å komme seg unna kretsavhengige contexter for redigering.
     */
    const setOtherEditingTypes = (currentType: EditingType, shouldBeEditable?: boolean) => {
        const otherEditingTypes = Object.entries(alleKretserStatuser).filter(
            ([editingType]) => editingType !== currentType,
        );

        otherEditingTypes.forEach(([type, kretsStatuses]) => {
            Object.entries(kretsStatuses).forEach(([grenseId, kretsStatus]) => {
                setKretsStatus(type as EditingType, grenseId, {
                    visible: kretsStatus.visible,
                    editing: shouldBeEditable ?? kretsStatus.editing,
                });
            });
        });
    };

    // Obs! Denne tømmer alle statuser for alle typer kretser, som vil si at alle synlige saker fjernes også.
    const resetAndClearAllLayers = () => {
        removeAllFeatures();
        setAlleKretserStatuser(() => ({}));
    };

    const value = {
        alleKretserStatuser,
        setAlleKretserStatuser,
        setKretsStatus,
        resetAndClearAllLayers,
        getCurrentlyEditingType,
        setOtherEditingTypes,
    };

    return <EditGrenserContext.Provider value={value}>{children}</EditGrenserContext.Provider>;
};

export const useEditAllGrenser = () => {
    const context = useContext(EditGrenserContext);

    if (!context) {
        throw new Error("useEditAllGrenser must be used within a EditGrenserProvider");
    }

    return context;
};

export const useEditGrenser = (kretsType: EditingType) => {
    const context = useContext(EditGrenserContext);

    if (!context) {
        throw new Error("useEditGrenser must be used within a EditGrenserProvider");
    }

    const {
        alleKretserStatuser,
        setKretsStatus,
        setAlleKretserStatuser,
        resetAndClearAllLayers,
        setOtherEditingTypes,
    } = context;

    const kretsStatuser = alleKretserStatuser[kretsType] ?? {};

    const setKretsStatusForKretstype = (grenseId: string, kretsStatus: KretsStatus) =>
        setKretsStatus(kretsType, grenseId, kretsStatus);

    const setMultipleValues = (kretsStatus: KretsStatusPerKretstype) => {
        setAlleKretserStatuser((gammelAlleKretserStatuser) => ({
            ...gammelAlleKretserStatuser,
            [kretsType]: kretsStatus,
        }));
    };

    return {
        kretsStatuser,
        setKretsStatusForKretstype,
        setMultipleValues,
        resetAndClearAllLayers,
        setOtherEditingTypes,
    };
};

export const useEditGrenseValue = (kretsType: EditingType, kretsId: string) => {
    const context = useContext(EditGrenserContext);

    if (!context) {
        throw new Error("useEditGrenseValue must be used within a EditGrenserProvider");
    }

    const { alleKretserStatuser } = context;
    const kretsStatuserForKretsType = alleKretserStatuser[kretsType] ?? {};
    const kretsStatus = kretsStatuserForKretsType[kretsId] ?? {};

    return kretsStatus;
};
