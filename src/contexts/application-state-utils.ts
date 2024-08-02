import {
  GrenseDelingEntry,
  HistoryChange,
  HistoryEntry,
  HistoryState,
  HistoryTypeValues,
  NyGrense,
  NyGrenseEntry,
} from "contexts/HistoryContext/types";
import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { GeoJSON } from "ol/format";
import { LineString, Point } from "ol/geom";
import { SelectedPoint } from "./FeatureStyleContext/types";
import { Inndeling, isInndeling } from "./InndelingerContext/InndelingerContext";
import { OverlayModal, OverlayPanel, isOverlayModal, isOverlayPanel } from "./OverlayPanelContext";
import { ModeTool, Tool, isModeTool, isTool } from "./ToolbarContext";
import { UtkastResponse } from "types/api";

export const sessionStorageKeys = {
  utkast: "utkast",
  history: "history",
  inndeling: "inndeling",
  activeModeTools: "mode-tool",
  activeTool: "tool",
  selectedFeatures: "selected-features",
  selectedPoint: "selected-point",
  overlayPanel: "overlay-panel",
  overlayModal: "overlay-modal",
  mapPosition: "map-position",
} as const;

type SessionStorageKeys = typeof sessionStorageKeys;

export type SessionStorageKey = SessionStorageKeys[keyof SessionStorageKeys];

export type ApplicationState = {
  utkast: UtkastResponse;
  selectedInndelinger: SelectedInndelinger;
  historyState: HistoryState | null;
  selectedPoint: SelectedPoint | null;
  selectedFeatures: Feature<LineString>[];
  activeTool: Tool;
  activeModeTools: ModeTool[];
  activeOverlayPanel: OverlayPanel | null;
  activeOverlayModal: OverlayModal | null;
  mapPosition: MapPosition;
};

export type MapPosition = {
  center: Coordinate | undefined;
  zoom: number | undefined;
};

export type SelectedInndelinger = {
  selectedFylkeId: string;
  inndelinger: Inndeling[];
};

// Legger til type-felt her bare for å være mer sikker på at de ikke blandes i type guards
type SerializableHistoryState = Omit<HistoryState, "entries"> & {
  entries: SerializableHistoryEntry[];
  type: "serializable";
};

type SerializableHistoryChange<T> = HistoryChange<T>;

type SerializableHistoryTypeValues =
  | Exclude<HistoryTypeValues, "nygrense" | "grensedeling" | "property">
  | "serializablenygrense"
  | "serializablegrensedeling"
  | "serializableproperty";

type SerializableNyGrense = Omit<NyGrense, "grensedeling"> & {
  grensedeling: string;
};

type SerializableGrensedelingEntry = SerializableBaseHistoryEntry<"serializablegrensedeling", string>;

type SerializableBaseHistoryEntry<HistoryType extends SerializableHistoryTypeValues, Model> = {
  type: HistoryType;
  changes: SerializableHistoryChange<Model>[];
};

type SerializableNyGrenseEntry = SerializableBaseHistoryEntry<"serializablenygrense", SerializableNyGrense>;

type SerializableHistoryEntry =
  | Exclude<HistoryEntry, NyGrense | Feature[]>
  | SerializableGrensedelingEntry
  | SerializableNyGrenseEntry;

const isSerializableHistoryState = (historyState: unknown): historyState is SerializableHistoryState => {
  if (
    historyState instanceof Object &&
    "type" in historyState &&
    historyState.type === "serializable" &&
    "index" in historyState &&
    "entries" in historyState &&
    historyState.entries instanceof Array
  ) {
    return true;
  }
  return false;
};

const isSelectedInndelinger = (
  selectedInndelinger: SelectedInndelinger,
): selectedInndelinger is SelectedInndelinger => {
  if (
    selectedInndelinger instanceof Object &&
    "selectedFylkeId" in selectedInndelinger &&
    "inndelinger" in selectedInndelinger &&
    selectedInndelinger.inndelinger instanceof Array &&
    selectedInndelinger.inndelinger.every(isInndeling)
  ) {
    return true;
  }

  return false;
};

const serializeHistory = (history: HistoryState) => {
  const geoJson = new GeoJSON();

  const tempHistory: SerializableHistoryState = {
    index: history.index,
    type: "serializable",
    entries: [],
  };
  /**
   * Her må vi først gå igjennom history entries som har features, og serialisere de med GeoJSON,
   * før vi kan serialisere resten av history-objektet.
   * For å unngå at resten av applikasjonen blir påvirket, er det opprettet egne typer for dette.
   * Da slipper vi å ta høyde for serialiserte entries overalt hvor historikk benyttes.
   */
  history.entries.forEach((entry) => {
    if (entry.type === "nygrense") {
      const tmpEntry: SerializableNyGrenseEntry = {
        type: "serializablenygrense",
        changes: [],
      };

      entry.changes.forEach((change: HistoryChange<NyGrense>) => {
        const serializableChange: SerializableHistoryChange<SerializableNyGrense> = {
          id: change.id,
          from: {
            ...change.from,
            grensedeling: geoJson.writeFeatures(change.from.grensedeling ?? []),
          },
          to: {
            ...change.to,
            grensedeling: geoJson.writeFeatures(change.to.grensedeling ?? []),
          },
        };
        tmpEntry.changes.push(serializableChange);
      });

      tempHistory.entries.push(tmpEntry);
    } else if (entry.type === "grensedeling") {
      const tmpEntry: SerializableGrensedelingEntry = {
        type: "serializablegrensedeling",
        changes: [],
      };

      entry.changes.forEach((change: HistoryChange<Feature[]>) => {
        const serializableChange: SerializableHistoryChange<string> = {
          id: change.id,
          from: geoJson.writeFeatures(change.from),
          to: geoJson.writeFeatures(change.to),
        };

        tmpEntry.changes.push(serializableChange);
      });
      tempHistory.entries.push(tmpEntry);
    } else {
      tempHistory.entries.push(entry);
    }
  });

  return JSON.stringify(tempHistory);
};

const deserializeHistory = (serializedHistoryEntry: string): HistoryState | null => {
  const geoJson = new GeoJSON();
  const partiallyDeserializedHistory = JSON.parse(serializedHistoryEntry);
  if (isSerializableHistoryState(partiallyDeserializedHistory)) {
    const historyState: HistoryState = {
      index: partiallyDeserializedHistory.index,
      entries: [],
    };

    /**
     * Her går vi i motsatt rekkefølge som `serializeHistory`. Først parses hele objektet, før vi kan gå igjennom
     * endringer som har serialiserte features, og parse de med GeoJSON.
     */
    partiallyDeserializedHistory.entries.forEach((entry) => {
      if (entry.type === "serializablenygrense") {
        const tmpEntry: NyGrenseEntry = {
          type: "nygrense",
          changes: [],
        };

        entry.changes.forEach((change: HistoryChange<SerializableNyGrense>) => {
          const serializableChange: HistoryChange<NyGrense> = {
            id: change.id,
            from: {
              ...change.from,
              grensedeling: geoJson.readFeatures(change.from.grensedeling),
            },
            to: {
              ...change.to,
              grensedeling: geoJson.readFeatures(change.to.grensedeling),
            },
          };
          tmpEntry.changes.push(serializableChange);
        });
        historyState.entries.push(tmpEntry);
      } else if (entry.type === "serializablegrensedeling") {
        const tmpEntry: GrenseDelingEntry = {
          type: "grensedeling",
          changes: [],
        };

        entry.changes.forEach((change: SerializableHistoryChange<string>) => {
          const serializableChange: HistoryChange<Feature[]> = {
            id: change.id,
            from: geoJson.readFeatures(change.from),
            to: geoJson.readFeatures(change.to),
          };

          tmpEntry.changes.push(serializableChange);
        });
        historyState.entries.push(tmpEntry);
      } else {
        historyState.entries.push(entry);
      }
    });
    return historyState;
  }
  return null;
};

export const saveApplicationStateToSessionStorage = (applicationState: ApplicationState) => {
  const geoJson = new GeoJSON();
  if (applicationState.utkast != null) {
    sessionStorage.setItem(sessionStorageKeys.utkast, JSON.stringify(applicationState.utkast));
  }
  if (applicationState.historyState != null) {
    sessionStorage.setItem(sessionStorageKeys.history, serializeHistory(applicationState.historyState));
  }

  if (applicationState.selectedInndelinger != null) {
    sessionStorage.setItem(sessionStorageKeys.inndeling, JSON.stringify(applicationState.selectedInndelinger));
  }

  if (applicationState.activeTool != null) {
    sessionStorage.setItem(sessionStorageKeys.activeTool, JSON.stringify(applicationState.activeTool));
  }

  sessionStorage.setItem(sessionStorageKeys.activeModeTools, JSON.stringify(applicationState.activeModeTools));

  if (applicationState.selectedFeatures != null) {
    sessionStorage.setItem(
      sessionStorageKeys.selectedFeatures,
      geoJson.writeFeatures(applicationState.selectedFeatures),
    );
  }

  if (applicationState.selectedPoint != null) {
    sessionStorage.setItem(sessionStorageKeys.selectedPoint, geoJson.writeFeature(applicationState.selectedPoint));
  }

  if (applicationState.activeOverlayModal != null) {
    sessionStorage.setItem(sessionStorageKeys.overlayModal, JSON.stringify(applicationState.activeOverlayModal));
  }

  if (applicationState.activeOverlayPanel != null) {
    sessionStorage.setItem(sessionStorageKeys.overlayPanel, JSON.stringify(applicationState.activeOverlayPanel));
  }

  sessionStorage.setItem(sessionStorageKeys.mapPosition, JSON.stringify(applicationState.mapPosition));
};

export const fetchMapPositionFromSessionStorage = (): MapPosition | null => {
  const serializedView = sessionStorage.getItem(sessionStorageKeys.mapPosition);

  if (serializedView == null) {
    return null;
  }

  const deserializedView = JSON.parse(serializedView);

  return deserializedView;
};

export const fetchSelectedPointFromSessionStorage = (): Feature<Point> | null => {
  const serializedPoint = sessionStorage.getItem(sessionStorageKeys.selectedPoint);
  if (serializedPoint == null || serializedPoint === "null") {
    return null;
  }

  const geoJson = new GeoJSON();
  const deserializedPoint = geoJson.readFeature(serializedPoint);

  removeApplicationStateFromSessionStorage(sessionStorageKeys.selectedPoint);
  return deserializedPoint as Feature<Point>;
};

export const fetchSelectedFeaturesFromSessionStorage = (): Feature<LineString>[] => {
  const serializedFeatures = sessionStorage.getItem(sessionStorageKeys.selectedFeatures);
  if (serializedFeatures == null) {
    return [];
  }

  const geoJson = new GeoJSON();
  const deserializedFeatures = geoJson.readFeatures(serializedFeatures);

  removeApplicationStateFromSessionStorage(sessionStorageKeys.selectedFeatures);
  return deserializedFeatures as Feature<LineString>[];
};

export const fetchActiveOverlayModalFromSessionStorage = (): OverlayModal | null => {
  const serializedOverlayModal = sessionStorage.getItem(sessionStorageKeys.overlayModal);
  if (serializedOverlayModal == null) {
    return null;
  }

  const deserializedOverlayModal = JSON.parse(serializedOverlayModal);

  if (isOverlayModal(deserializedOverlayModal) === true) {
    removeApplicationStateFromSessionStorage(sessionStorageKeys.overlayModal);
    return deserializedOverlayModal;
  }

  return null;
};

export const fetchActiveOverlayPanelFromSessionStorage = (): OverlayPanel | null => {
  const serializedOverlayPanel = sessionStorage.getItem(sessionStorageKeys.overlayPanel);
  if (serializedOverlayPanel == null) {
    return null;
  }

  const deserializedOverlayPanel = JSON.parse(serializedOverlayPanel);
  if (isOverlayPanel(deserializedOverlayPanel) === true) {
    removeApplicationStateFromSessionStorage(sessionStorageKeys.overlayPanel);
    return deserializedOverlayPanel;
  }

  return null;
};

export const fetchHistoryFromSessionStorage = (): HistoryState | null => {
  const serializedHistory = sessionStorage.getItem(sessionStorageKeys.history);
  if (serializedHistory == null) {
    return null;
  }

  const deserializedHistory = deserializeHistory(serializedHistory);
  if (deserializedHistory != null) {
    removeApplicationStateFromSessionStorage(sessionStorageKeys.history);
  }

  return deserializedHistory;
};

export const fetchInndelingFromSessionStorage = (): SelectedInndelinger | null => {
  const serializedInndelinger = sessionStorage.getItem(sessionStorageKeys.inndeling);
  if (serializedInndelinger == null) {
    return null;
  }

  const deserializedInndelinger = JSON.parse(serializedInndelinger);
  if (isSelectedInndelinger(deserializedInndelinger)) {
    removeApplicationStateFromSessionStorage(sessionStorageKeys.inndeling);
    return deserializedInndelinger;
  }

  return null;
};

export const fetchActiveModeToolsFromSessionStorage = (): ModeTool[] | null => {
  const serializedModeTools = sessionStorage.getItem(sessionStorageKeys.activeModeTools);
  if (serializedModeTools == null) {
    return null;
  }

  const deserializedModeTools = JSON.parse(serializedModeTools);

  if (deserializedModeTools instanceof Array && deserializedModeTools.every(isModeTool) === true) {
    return deserializedModeTools;
  }

  return null;
};

export const fetchActiveToolFromSessionStorage = (): Tool | null => {
  const serializedTool = sessionStorage.getItem(sessionStorageKeys.activeTool);
  if (serializedTool == null) {
    return null;
  }

  const deserializedTool = JSON.parse(serializedTool);

  if (isTool(deserializedTool) === true) {
    removeApplicationStateFromSessionStorage(sessionStorageKeys.activeTool);
    return deserializedTool;
  }

  return null;
};

const removeApplicationStateFromSessionStorage = (key: SessionStorageKey) => {
  sessionStorage.removeItem(key);
};
