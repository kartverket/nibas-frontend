import { BopliktomraadeEntry, GrenseEntry, GrunnkretsEntry, KommuneEntry, StemmekretsEntry } from "./types";

export type HistoryEventMap = {
  grenseUndo: { entry: GrenseEntry };
  grenseRedo: { entry: GrenseEntry };
  grunnkretsUndo: { entry: GrunnkretsEntry };
  grunnkretsRedo: { entry: GrunnkretsEntry };
  stemmekretsUndo: { entry: StemmekretsEntry };
  stemmekretsRedo: { entry: StemmekretsEntry };
  bopliktomraadeUndo: { entry: BopliktomraadeEntry };
  bopliktomraadeRedo: { entry: BopliktomraadeEntry };
  kommuneUndo: { entry: KommuneEntry };
  kommuneRedo: { entry: KommuneEntry };
};

export type HistoryEventName = keyof HistoryEventMap;
export type MetadataHistoryEventName = Exclude<HistoryEventName, "grenseUndo" | "grenseRedo">;
export type HistoryEvent<Name extends HistoryEventName> = CustomEvent<HistoryEventMap[Name]>;

export const dispatchHistoryEvent = <Name extends HistoryEventName>(name: Name, detail: HistoryEventMap[Name]) =>
  document.dispatchEvent(new CustomEvent(name, { detail }));

export const addHistoryEventListener = <Name extends HistoryEventName>(
  name: Name,
  listener: (event: HistoryEvent<Name>) => void,
) => {
  const eventListener = listener as EventListener;
  document.addEventListener(name, eventListener);
  return () => document.removeEventListener(name, eventListener);
};
