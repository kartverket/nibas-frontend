import { useHistory } from "contexts/HistoryContext/HistoryContext";
import {
  BaseInndeling,
  Inndeling,
  Inndelingtype,
  useInndelinger,
} from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useEffect, useState } from "react";

const useInndelingerPanel = () => {
  const {
    selectInndelinger,
    getAllInndelinger,
    setSelectedFylkeIds,
    clearViewingLayersAndInndelinger,
    clearEditLayerAndInndelinger,
  } = useInndelinger();

  const [selectedInndelingtype, setSelectedInndelingtype] = useState<Inndelingtype | null>(null);
  const [activePanelFylkeId, setActivePanelFylkeId] = useState<string | null>(null);
  const [tempInndelinger, setTempInndelinger] = useState<Inndeling[]>([]);
  const [tempFylkeIds, setTempFylkeIds] = useState<string[]>([]);

  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();
  const isEditingPanel = activeOverlayModal === "inndelinger";

  const { history, clearHistory } = useHistory();
  const hasUnsavedChangesInHistory = history.entries.length > 0;

  useEffect(() => {
    if (isEditingPanel) {
      setTempInndelinger([]);
      setTempFylkeIds([]);
    } else {
      const viewingInndelinger = getAllInndelinger().filter((i) => i.isViewing);
      setTempInndelinger(viewingInndelinger);
      const fylkeIds = viewingInndelinger.filter((i) => i.inndelingtype === "fylke").map((i) => i.id);
      setTempFylkeIds(fylkeIds);
    }
  }, [isEditingPanel, getAllInndelinger]);

  const resetSelection = () => {
    setTempInndelinger([]);
    setTempFylkeIds([]);
  };

  const clearInndelingerForPanel = () =>
    isEditingPanel ? clearEditLayerAndInndelinger() : clearViewingLayersAndInndelinger();

  const isSelectionAvailable = tempInndelinger.some((inndeling) =>
    isEditingPanel ? inndeling.isEditing : inndeling.isViewing,
  );

  const selectNewInndelinger = () => {
    if (hasUnsavedChangesInHistory && isEditingPanel) {
      clearHistory();
    }

    selectInndelinger(tempInndelinger);
    setSelectedFylkeIds(tempFylkeIds);
    resetInndelingerPanel();
  };

  const isInndelingSelected = (inndelingtype: Inndelingtype | null, inndelingId: string) => {
    if (inndelingtype == null) {
      return false;
    }

    const inndelingIfSelected = tempInndelinger.find((inndeling) => {
      return inndeling.inndelingtype === inndelingtype && inndeling.id === inndelingId;
    });

    if (inndelingIfSelected != null) {
      return isEditingPanel ? inndelingIfSelected.isEditing : inndelingIfSelected.isViewing;
    }

    return false;
  };

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedInndelingtype(null);
    setActivePanelFylkeId(null);
    resetSelection();
  };

  const selectInndelingtype = (inndelingtype: Inndelingtype) => {
    if (isEditingPanel) {
      resetSelection();
    }

    if (selectedInndelingtype !== inndelingtype) {
      setSelectedInndelingtype(inndelingtype);
      setActivePanelFylkeId(null);
    }
  };

  const toggleFylke = (fylke: BaseInndeling) => {
    if (selectedInndelingtype === "fylke") {
      const isAlreadySelected = tempInndelinger.findIndex(
        (inndeling) => inndeling.id === fylke.id && inndeling.inndelingtype === selectedInndelingtype,
      );
      if (isAlreadySelected < 0) {
        const newInndeling: Inndeling = {
          navn: fylke.navn,
          nummer: fylke.nummer,
          id: fylke.id,
          inndelingtype: selectedInndelingtype,
          isEditing: isEditingPanel,
          isViewing: !isEditingPanel,
        };
        setTempInndelinger(tempInndelinger.concat(newInndeling));
        setTempFylkeIds([...tempFylkeIds, fylke.id]);
        return;
      }

      setTempInndelinger(tempInndelinger.filter((_, index) => isAlreadySelected !== index));
      setTempFylkeIds(tempFylkeIds.filter((id) => id !== fylke.id));
    } else {
      setActivePanelFylkeId(fylke.id);
      const updatedFylkeIds = tempFylkeIds.includes(fylke.id)
        ? tempFylkeIds.filter((id) => id !== fylke.id)
        : [...tempFylkeIds, fylke.id];
      setTempFylkeIds(updatedFylkeIds);
    }
  };

  const toggleKommune = (kommune: BaseInndeling) => {
    if (selectedInndelingtype) {
      const newInndeling: Inndeling = {
        navn: kommune.navn,
        nummer: kommune.nummer,
        id: kommune.id,
        inndelingtype: selectedInndelingtype,
        isEditing: isEditingPanel,
        isViewing: !isEditingPanel,
      };

      if (isEditingPanel) {
        if (selectedInndelingtype === "grunnkrets" || selectedInndelingtype === "stemmekrets") {
          const selectedInndelingerWithoutSelectedInndeling = tempInndelinger.filter(
            (inndeling) => inndeling.inndelingtype !== selectedInndelingtype,
          );
          setTempInndelinger([...selectedInndelingerWithoutSelectedInndeling, newInndeling]);
          return;
        }
      }

      const isAlreadySelected = tempInndelinger.findIndex(
        (inndeling) => inndeling.id === kommune.id && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected === -1) {
        setTempInndelinger(tempInndelinger.concat(newInndeling));
        return;
      }

      setTempInndelinger(tempInndelinger.filter((_, index) => isAlreadySelected !== index));
    }
  };

  return {
    activePanelFylkeId,
    selectInndelingtype,
    selectedInndelingtype,
    toggleFylke,
    toggleKommune,
    resetInndelingerPanel,
    resetSelection,
    isEditingPanel,
    isInndelingSelected,
    isSelectionAvailable,
    selectNewInndelinger,
    clearInndelingerForPanel,
  };
};

export default useInndelingerPanel;
