import { useToast } from "@kvib/react";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useToolbar } from "contexts/ToolbarContext";
import { getGrensetypeFromInndelingtype } from "hooks/layers/types";
import { useState } from "react";
import {
  anyFeatureIsEditable,
  createDuplicateOfFeature,
  createDuplicateOfTeigFeature,
  mergeFeaturesToNewFeature,
} from "utils/features";
import { removeNil } from "utils/list-utils";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { map } from "../constants";
import { isTempFeatureId } from "../interactions/feature-id-utils";
import { createMergeGrenserHistoryChange, createNyGrenseHistoryChange } from "../interactions/grense-history-utils";
import useSplit from "../interactions/useSplit";
import { addGrenseDeleteEntryFromFeatureList } from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import ToolbarPopup from "./ToolbarPopup";

import { HistoryChange } from "contexts/HistoryContext/types";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import HistoriskeGrenserDatoModal from "pages/Kart/OverlayPanels/HistoriskeGrenserDatoModal";
import { FeatureProperties } from "types/api";
import useHistoriskeGrenser from "../interactions/useHistoriskeGrenser";
import {
  isTeiggrenseMetadata,
  isTeiggrenseMetadataWFS,
  mapWFSToNewTeiggrenseMetadata,
  TeiggrenseMetadata,
} from "../OverlayPanels/GrenseinformasjonPanel/Matrikkelgrenseinformasjon";

const ToolbarPopups = () => {
  const [matrikkelIsLoading, setMatrikkelIsLoading] = useState(false);
  const { setError } = useErrorHandling();
  const toast = useToast();
  const { split } = useSplit();
  const { addHistoryEntry } = useHistory();
  const { activeModeTools, activeTool, resetModeTools, resetTool } = useToolbar();
  const { selectedFeatures, selectedPoint, addArchivedStyles, clearSelection } = useFeatureStyle();
  const { currentlyEditingInndelinger } = useInndelinger();
  const {
    historiskeGrenserIsLoading,
    getHistoriskeGrenser,
    gjenopprettHistoriskeGrenser,
    historiskeGrenserFetched,
    resetHistoriskeGrenser,
  } = useHistoriskeGrenser();

  const archiveSelectedFeatures = () => {
    archiveFeatures(selectedFeatures, true);
    clearSelection();
    toast({
      status: "success",
      title: `${selectedFeatures.length} grense${selectedFeatures.length > 1 ? "r" : ""} ble arkivert`,
      description: "Husk å eventuelt sette tilhørighet på berørte grenser",
    });
  };

  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { data: matrikkelkodeliste } = useNibasApi("/v1/matrikkelkodelister");

  const duplicateFeaturesToEditLayer = () => {
    const grenseType =
      currentlyEditingInndelinger.length > 0
        ? getGrensetypeFromInndelingtype(currentlyEditingInndelinger[0].inndelingtype)
        : null;
    if (grenseType != null) {
      const duplicateFeatures = selectedFeatures
        .map((sf) => {
          const properties = sf.getProperties();
          if (isTeiggrenseMetadataWFS(properties) === true || isTeiggrenseMetadata(properties) === true) {
            let teiggrense: TeiggrenseMetadata | null = null;
            if (isTeiggrenseMetadataWFS(properties) === true) {
              teiggrense = mapWFSToNewTeiggrenseMetadata(properties);
            } else if (isTeiggrenseMetadata(properties)) {
              teiggrense = properties;
            }
            if (teiggrense == null || matrikkelkodeliste == null || kodeliste == null) {
              return null;
            }

            const maalemetode = teiggrense.malemetodeId;
            const noeyaktighet = teiggrense.noyaktighet ?? undefined;

            let maalemetodeId: string | undefined = undefined;
            if (maalemetode != null) {
              const matrikkelMaalemetode = matrikkelkodeliste.maalemetodeKodeliste.find(
                (item) => item.id?.toString() === maalemetode?.toString(),
              );
              if (matrikkelMaalemetode) {
                const match = kodeliste.items.find((item) => item.kode === matrikkelMaalemetode.kodeverdi);
                if (match) {
                  maalemetodeId = match.id;
                }
              }
            }
            // Egen for teiggrenser for å kopiere målemetode og nøyaktighet
            return createDuplicateOfTeigFeature(sf, grenseType, maalemetodeId, noeyaktighet);
          }
          // Vanlig duplisering for andre grenser
          return createDuplicateOfFeature(sf, grenseType);
        })
        .filter((f): f is Feature<Geometry> => f != null);

      if (duplicateFeatures.length > 0) {
        addFeaturesToSource("edit", duplicateFeatures);
        addHistoryEntry({
          type: "nygrense",
          changes: removeNil(duplicateFeatures.map((df) => createNyGrenseHistoryChange(df, grenseType, []))),
        });
        clearSelection();
        toast({
          status: "success",
          title: `${selectedFeatures.length} grense${selectedFeatures.length > 1 ? "r" : ""} ble duplisert`,
          description: "Husk å oppdatere relevante egenskaper for de berørte grensene",
        });
      }
    }
  };

  const archiveFeatures = (features: Feature<LineString>[], shouldAddHistoryEntry?: boolean) => {
    const oldPropertiesMap = features.reduce(
      (acc, feature) => {
        const id = feature.getId()?.toString();
        if (id != null) {
          acc[id] = feature.getProperties() as FeatureProperties;
        }
        return acc;
      },
      {} as Record<string, FeatureProperties>,
    );
    const featuresId = Object.keys(oldPropertiesMap);
    // Setter shouldArchive på alle features som arkiveres
    for (const feature of features) {
      const featureId = feature.getId()?.toString();
      if (featureId != null) {
        const newProperties: FeatureProperties = {
          ...oldPropertiesMap[featureId],
          shouldArchive: true,
        };
        feature.setProperties(newProperties);
      }
    }
    addArchivedStyles(featuresId);
    removeFeaturesFromSourceByIds("edit", featuresId);
    addFeaturesToSource("archived", features);
    if (shouldAddHistoryEntry ?? false) {
      const changeEntries: HistoryChange<FeatureProperties>[] = removeNil(
        features.map((feature) => {
          const id = feature.getId()?.toString();
          if (id != null) {
            return {
              id: id,
              from: oldPropertiesMap[id],
              to: feature.getProperties() as FeatureProperties,
            };
          }
        }),
      );
      addHistoryEntry({
        type: "grensearkivering",
        changes: changeEntries,
      });
    }
  };

  const mergeSelectedFeatures = () => {
    const grenseType =
      currentlyEditingInndelinger.length > 0
        ? getGrensetypeFromInndelingtype(currentlyEditingInndelinger[0].inndelingtype)
        : null;
    if (grenseType == null) {
      return;
    }
    const mergeFeature = mergeFeaturesToNewFeature(selectedFeatures, grenseType);
    if (mergeFeature == null) {
      toast({
        status: "error",
        title: "Du kan ikke slå sammen disse grensene",
        description:
          "Husk at grensene må være sammenkoblet, være samme grensetype, og at de må ha samme nøyaktighet og målemetode",
      });
      return;
    }
    const selectedExistingFeatures = selectedFeatures.filter(
      (feature) => !isTempFeatureId(feature.getId()?.toString() ?? ""),
    );
    const selectedNewFeatures = selectedFeatures.filter((feature) =>
      isTempFeatureId(feature.getId()?.toString() ?? ""),
    );
    archiveFeatures(selectedExistingFeatures);
    deleteFeaturesAndAddHistoryEntry(selectedNewFeatures);
    addFeaturesToSource("edit", [mergeFeature]);
    addHistoryEntry({
      type: "merge_grenser",
      changes: removeNil([createMergeGrenserHistoryChange(selectedFeatures, mergeFeature)]),
    });

    clearSelection();
    toast({
      status: "success",
      title: `${selectedFeatures.length} grense${selectedFeatures.length > 1 ? "r" : ""} ble slått sammen til en ny grense`,
      description: "Husk å oppdatere relevante egenskaper for den nye grensen",
    });
  };

  const deleteSelectedFeatures = () => {
    const selectedFeatureIds = removeNil(selectedFeatures.map((feature) => feature.getId()?.toString()));
    if (selectedFeatureIds.length === 0) {
      return;
    }

    deleteFeaturesAndAddHistoryEntry(selectedFeatures);
    clearSelection();

    toast({
      status: "success",
      title: `${selectedFeatureIds.length} grense${selectedFeatureIds.length > 1 ? "r" : ""} ble slettet`,
    });
  };

  const deleteFeaturesAndAddHistoryEntry = (featuresToDelete: typeof selectedFeatures) => {
    const selectedFeatureIds = removeNil(featuresToDelete.map((feature) => feature.getId()?.toString()));
    const selectedFeaturesContainsExistingGrenser = !selectedFeatureIds.every((id) => isTempFeatureId(id));

    if (selectedFeaturesContainsExistingGrenser) {
      toast({
        status: "error",
        title: "Kan ikke slette eksisterende grenser",
        description: "Ønsker du å fjerne en eksisterende grense må du benytte Arkiver grense-verktøyet.",
      });
      return;
    }
    removeFeaturesFromSourceByIds("edit", selectedFeatureIds);

    // Oppretter entry som sier at grensen blir slettet, denne blir tatt i bruk ved lagring for å fjerne grenser man har slettet.
    // Denne entrien blir selv slettet (ignorert) ved lagring da den ikke skal med i utkastet.
    addGrenseDeleteEntryFromFeatureList(featuresToDelete, addHistoryEntry);
  };

  const handleHistoriskeGrenser = async (gyldigTilDate: string) => {
    getHistoriskeGrenser(gyldigTilDate);
    clearSelection();
  };
  const handleHistoriskeGrenserChangeDate = () => {
    resetHistoriskeGrenser();
  };
  const handleRestoreHistoriskeGrenser = () => {
    gjenopprettHistoriskeGrenser(selectedFeatures);
    clearSelection();
  };
  const isNotHistorical = () => {
    return selectedFeatures.some((feature) => feature.getProperties().isHistorical !== true);
  };
  const handleSplit = () => {
    split();
    clearSelection();
    toast({
      status: "success",
      title: "Grensen ble delt",
    });
  };

  const handleMatrikkel = async () => {
    const zoom = map.getView().getZoom();
    if (zoom == null || zoom < 15) {
      toast({
        status: "error",
        title: "Kartutsnittet er for stort. Zoom inn nærmere før du henter inn eiendomsgrensene",
      });
    } else {
      setMatrikkelIsLoading(true);
      const matrikkelFeatures = await getMatrikkelFeatures();
      if (matrikkelFeatures) {
        if (matrikkelFeatures.length === 10000) {
          toast({
            status: "warning",
            title: "Utsnittet inneholder for mange grenser. Zoom nærmere, og prøv igjen.",
          });
        } else if (matrikkelFeatures.length === 0) {
          toast({
            status: "warning",
            title: `Fant ingen grenser for dette utsnittet, forsøk å zoom ut eller panorer.`,
          });
        } else {
          toast({
            status: "success",
            title: `${matrikkelFeatures.length} grenser ble hentet og vises nå i kartet`,
          });
        }
      } else {
        setError({
          title: "Feil ved henting av grenser fra matrikkelen",
          description:
            "En ukjent feil skjedde ved henting av grenser fra matrikkelen. Hvis feilen vedvarer, vennligst kontakt Kartverket.",
        });
      }
      setMatrikkelIsLoading(false);
    }
  };

  const handleClearMatrikkel = () => {
    if (clearMatrikkelLayer()) {
      toast({
        status: "success",
        title: "Teiggrensene ble fjernet fra kartet",
      });
    }
  };

  const getActiveToolPopup = () => {
    switch (activeTool) {
      case null:
        if (!activeModeTools.includes("move") && anyFeatureIsEditable()) {
          return (
            <ToolbarPopup
              icon="control_camera"
              text={
                selectedFeatures.length === 0
                  ? "Velg én eller flere grenser du ønsker å flytte"
                  : `Flytt punkt på ${selectedFeatures.length === 1 ? "den valgte grensen" : "de valgte grensene"}`
              }
            />
          );
        }
        break;

      case "draw":
        return (
          <ToolbarPopup
            icon="draw"
            text="Start tegning ved å klikke på kartet. Avslutt med dobbeltklikk."
            subtext="Tegninger kan startes i eksisterende punkter eller på et tomt område. Ønsker du å panorere underveis, bruk piltastene."
            onClose={resetTool}
          />
        );

      case "split":
        if (selectedFeatures.length === 0) {
          return <ToolbarPopup icon="cut" text="Velg grensen du ønsker å dele" onClose={resetTool} />;
        }
        if (selectedFeatures.length === 1) {
          return (
            <ToolbarPopup
              icon="cut"
              text="Velg hvilket punkt du ønsker å dele grensen på"
              buttonText="Del grense"
              onClick={() => handleSplit()}
              isDisabled={selectedPoint == null}
              onClose={resetTool}
            />
          );
        }
        break;

      case "grenseinfo":
        if (selectedFeatures.length > 1) {
          return (
            <ToolbarPopup
              text="Du kan kun se informasjon om én grense om gangen. Velg grensen på nytt som du ønsker å se informasjon til."
              onClose={resetTool}
              icon={"function"}
            />
          );
        }
        return (
          <ToolbarPopup
            text="Velg en grense i kartet for å se grenseinformasjon"
            onClose={resetTool}
            icon={"function"}
          />
        );
      case "grensecoordinates":
        return (
          <ToolbarPopup
            icon="my_location"
            text="Hold over punktet du ønsker å se koordinatet til"
            onClose={resetTool}
          />
        );
      case "measure":
        return (
          <ToolbarPopup
            icon={"straighten"}
            text="Start målingen ved å velge startpunkt i kartet. Avslutt med dobbeltklikk."
            subtext="Målingen kan snappes til punkter eller startes fritt utenfor andre grenser. Ønsker du å panorere underveis, bruk piltastene."
            onClose={resetTool}
          />
        );
      case "archive":
        return (
          <ToolbarPopup
            icon="archive"
            text="Velg en eller flere grenser du ønsker å arkivere"
            buttonText="Arkiver"
            onClick={archiveSelectedFeatures}
            isDisabled={selectedFeatures.length === 0}
            onClose={resetTool}
          />
        );

      case "delete":
        return (
          <ToolbarPopup
            icon="delete_forever"
            text="Velg en eller flere grenser du ønsker å slette"
            buttonText="Slett"
            onClick={deleteSelectedFeatures}
            isDisabled={selectedFeatures.length === 0}
            onClose={resetTool}
          />
        );
      case "duplicate":
        return (
          <ToolbarPopup
            icon="copy_all"
            text="Velg en eller flere grenser du ønsker å duplisere"
            buttonText="Dupliser"
            onClick={duplicateFeaturesToEditLayer}
            isDisabled={selectedFeatures.length === 0}
            onClose={resetTool}
          />
        );
      case "merge_grenser":
        return (
          <ToolbarPopup
            icon="merge"
            text="Velg en eller flere grenser du ønsker å slå sammen"
            buttonText="Slå sammen"
            onClick={mergeSelectedFeatures}
            isDisabled={selectedFeatures.length < 2}
            onClose={resetTool}
          />
        );

      case "historiskeGrenser":
        return (
          <>
            {historiskeGrenserFetched === false && (
              <HistoriskeGrenserDatoModal
                isOpen={activeTool === "historiskeGrenser"}
                onClose={resetTool}
                onSubmit={handleHistoriskeGrenser}
              />
            )}
            {historiskeGrenserFetched === true && (
              <ToolbarPopup
                text="Velg grensene du ønsker å gjenopprette"
                subtext=""
                buttonText="Gjenopprett"
                secondaryButtonText="Endre tidsrom"
                onClick={handleRestoreHistoriskeGrenser}
                secondaryOnClick={handleHistoriskeGrenserChangeDate}
                onClose={resetTool}
                isDisabled={selectedFeatures.length === 0 || isNotHistorical()}
                isSecondaryButtonDisabled={false}
                isLoading={historiskeGrenserIsLoading}
                icon={"history"}
              />
            )}
          </>
        );
      case "koordinater":
        return (
          <ToolbarPopup
            icon="my_location"
            text="Velg et punkt på en grense for å åpne koordinatmenyen"
            onClose={resetTool}
          />
        );

      case "add":
        return (
          <ToolbarPopup
            icon="add_circle"
            text={
              selectedFeatures.length === 0
                ? "Velg én eller flere grenser du ønsker å legge til punkt på"
                : "Trykk på en grense for å legge til et punkt"
            }
            onClose={resetTool}
          />
        );

      case "remove":
        return (
          <ToolbarPopup
            icon="do_not_disturb_on"
            text={
              selectedFeatures.length === 0
                ? "Velg én eller flere grenser du ønsker å fjerne punkt fra"
                : "Trykk på et punkt for fjerne punktet fra grensen"
            }
            onClose={resetTool}
          />
        );
      default:
        break;
    }
  };

  return (
    <>
      {activeModeTools.includes("matrikkel") && (
        <ToolbarPopup
          icon="holiday_village"
          text="Hent og vis eiendomsgrenser fra matrikkelen"
          subtext="Grensene hentes ut basert på kartutsnittet du ser på."
          buttonText="Hent grenser"
          secondaryButtonText="Nullstill"
          onClick={handleMatrikkel}
          secondaryOnClick={handleClearMatrikkel}
          onClose={resetModeTools}
          isDisabled={matrikkelIsLoading}
          isLoading={matrikkelIsLoading}
        />
      )}
      {getActiveToolPopup()}
    </>
  );
};
export default ToolbarPopups;
