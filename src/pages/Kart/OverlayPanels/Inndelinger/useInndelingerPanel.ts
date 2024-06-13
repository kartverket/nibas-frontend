import { useHistory } from "contexts/HistoryContext/HistoryContext";
import {
  Inndelingtype,
  useInndelinger,
  Inndeling,
  BaseInndeling,
} from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useEffect, useState } from "react";

const useInndelingerPanel = () => {
  const { selectInndelinger, getAllInndelinger, setSelectedFylkeId } = useInndelinger();

  const [selectedInndelingtype, setSelectedInndelingtype] = useState<Inndelingtype | null>(null);
  const [activePanelFylkeId, setActivePanelFylkeId] = useState<string>("");
  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>(getAllInndelinger());

  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();
  const isEditingPanel = activeOverlayModal === "inndelinger";

  const { history, clearHistory } = useHistory();
  const hasUnsavedChangesInHistory = history.entries.length > 0;

  useEffect(() => {
    isEditingPanel
      ? setSelectedInndelinger([])
      : setSelectedInndelinger(getAllInndelinger().filter((inndeling) => inndeling.isViewing));
  }, [getAllInndelinger, isEditingPanel]);

  const resetSelection = () => {
    setSelectedInndelinger([]);
  };

  const isSelectionAvailable = selectedInndelinger.some((inndeling) =>
    isEditingPanel ? inndeling.isEditing : inndeling.isViewing,
  );

  const selectNewInndelinger = () => {
    if (hasUnsavedChangesInHistory && isEditingPanel) {
      clearHistory();
    }

    selectInndelinger(selectedInndelinger);
    resetInndelingerPanel();
  };

  const isInndelingSelected = (inndelingtype: Inndelingtype | null, inndelingId: string) => {
    if (inndelingtype == null) {
      return false;
    }

    const inndelingIfSelected = selectedInndelinger.find((inndeling) => {
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
    setActivePanelFylkeId("");
    resetSelection();
  };

  const selectInndelingtype = (inndelingtype: Inndelingtype) => {
    if (isEditingPanel) {
      resetSelection();
    }

    if (selectedInndelingtype !== inndelingtype) {
      setSelectedInndelingtype(inndelingtype);
      setActivePanelFylkeId("");
    }
  };

  const toggleFylke = (fylke: BaseInndeling) => {
    if (isEditingPanel) {
      resetSelection();
    }

    if (selectedInndelingtype === "fylke") {
      const isAlreadySelected = selectedInndelinger.findIndex(
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
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index));
    } else {
      setActivePanelFylkeId(fylke.id);
      setSelectedFylkeId(fylke.id);
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
          const selectedInndelingerWithoutSelectedInndeling = selectedInndelinger.filter(
            (inndeling) => inndeling.inndelingtype !== selectedInndelingtype,
          );
          setSelectedInndelinger([...selectedInndelingerWithoutSelectedInndeling, newInndeling]);
          return;
        }
      }

      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === kommune.id && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected === -1) {
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index));
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
  };
};

export default useInndelingerPanel;
