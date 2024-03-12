import { ModeTool, Tool } from "contexts/ToolbarContext";
import { GrenseId } from "hooks/layers/types";
import { selectedPointStyle } from "utils/map/layerStyles";
import { pixelTolerance } from "./constants";
import { Modify, Snap } from "ol/interaction";
import { Collection } from "ol";
import { grenserLayers } from "hooks/layers/constants";

export type SnapData = {
  snap: Snap;
  hover: Modify;
};

type SnapDataOptions = {
  snapEnabled: boolean;
  hoverEnabled: boolean;
};

const getSourceFromGrenselayer = (grenseId: GrenseId) => (grenseId in grenserLayers ? grenserLayers[grenseId] : null);

const createSnapDataForSource = (
  grenseId: GrenseId,
  activeModeTools: ModeTool[],
  activeTool: Tool,
): SnapData | null => {
  const source = getSourceFromGrenselayer(grenseId)?.getSource();
  if (!source) return null;

  const config = getSnapDataConfig(grenseId, activeModeTools, activeTool);
  const snap = new Snap({ source, pixelTolerance });
  const modify = new Modify({
    condition: () => false,
    style: selectedPointStyle,
    pixelTolerance,
    features: new Collection(
      source.getFeatures().filter((feature) => !feature.getId()?.toString().includes("representasjonspunkt")),
    ),
  });

  snap.setActive(config.snapEnabled);
  modify.setActive(config.hoverEnabled);
  return { snap, hover: modify };
};

const isNibasgrense = (grense: GrenseId) => {
  const nibasGrenser: GrenseId[] = ["archived", "edit", "fylke", "grunnkrets", "kommune", "nasjon", "stemmekrets"];
  return nibasGrenser.includes(grense);
};

/*
 * Definerer regler for når snapping og hover er aktivert
 */
const getSnapDataConfig = (grense: GrenseId, activeModeTools: ModeTool[], activeTool: Tool): SnapDataOptions => {
  const snapTypes = {
    includesNibas: activeModeTools.includes("snap_nibas"),
    includesMatrikkel: activeModeTools.includes("snap_matrikkel"),
  };

  const grenseType = {
    isNibas: isNibasgrense(grense),
    isMatrikkel: grense === "matrikkel",
  };

  const isSnappingEnabled =
    (grenseType.isNibas && snapTypes.includesNibas) ||
    (grenseType.isMatrikkel && snapTypes.includesMatrikkel) ||
    (snapTypes.includesMatrikkel && snapTypes.includesNibas);

  const config = {
    snapEnabled: isSnappingEnabled,
    hoverEnabled: false,
  };

  const enableHoverPointForTools: Tool[] = [
    "split",
    "detach",
    "archive",
    "add",
    "grenseinfo",
    "koordinater",
    "remove",
    "draw",
  ];

  // Redigering og ingen verktøy eller snapping er valgt
  if (
    !snapTypes.includesNibas &&
    !snapTypes.includesMatrikkel &&
    !activeTool &&
    !activeModeTools.includes("move") &&
    grenseType.isNibas
  ) {
    config.hoverEnabled = true;
    return config;
  }

  // Default er av hvis snapping er av
  if (!snapTypes.includesNibas && !snapTypes.includesMatrikkel) return config;

  // Grenseinfo med kun nibas valgt
  if (activeTool === "grenseinfo" && snapTypes.includesNibas && !snapTypes.includesMatrikkel) {
    config.hoverEnabled = true;
    return config;
  }

  // Kun nibas er valgt i redigering uten verktøy, og grensetypen er matrikkel
  if (
    snapTypes.includesNibas &&
    !snapTypes.includesMatrikkel &&
    grenseType.isMatrikkel &&
    !activeTool &&
    !activeModeTools.includes("move")
  ) {
    config.hoverEnabled = false;
    return config;
  }

  // Redigering dersom matrikkel er valgt
  if (!activeTool && !activeModeTools.includes("move")) {
    config.hoverEnabled = true;
    return config;
  }

  // Kun nibas er valgt med grensetype matrikkel
  if (snapTypes.includesNibas && !snapTypes.includesMatrikkel && grenseType.isMatrikkel) {
    config.hoverEnabled = false;
    return config;
  }

  // Panorering
  if (activeModeTools.includes("move")) {
    config.hoverEnabled = false;
    return config;
  }

  // På for verktøy
  if (enableHoverPointForTools.includes(activeTool)) {
    config.hoverEnabled = true;
    return config;
  }

  return config;
};

// Definer hvilke grenselag som skal ha snapping og modify
export const createKartlagSnapsData = (
  activeModeTools: ModeTool[],
  activeTool: Tool,
): Record<GrenseId, SnapData | null> => ({
  matrikkel: createSnapDataForSource("matrikkel", activeModeTools, activeTool),
  fylke: createSnapDataForSource("fylke", activeModeTools, activeTool),
  nasjon: createSnapDataForSource("nasjon", activeModeTools, activeTool),
  kommune: createSnapDataForSource("kommune", activeModeTools, activeTool),
  grunnkrets: createSnapDataForSource("grunnkrets", activeModeTools, activeTool),
  stemmekrets: createSnapDataForSource("stemmekrets", activeModeTools, activeTool),
  archived: createSnapDataForSource("archived", activeModeTools, activeTool),
  edit: createSnapDataForSource("edit", activeModeTools, activeTool),
});
