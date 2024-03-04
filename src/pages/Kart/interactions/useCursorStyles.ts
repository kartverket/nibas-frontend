import { useEffect } from "react";
import { map } from "../constants";

type OpenLayersEvent = (
  | "change"
  | "change:layergroup"
  | "change:size"
  | "change:target"
  | "change:view"
  | "click"
  | "dblclick"
  | "error"
  | "loadend"
  | "loadstart"
  | "moveend"
  | "movestart"
  | "pointerdrag"
  | "pointermove"
  | "postcompose"
  | "postrender"
  | "precompose"
  | "propertychange"
  | "rendercomplete"
  | "singleclick"
)[];

export type EventAndHandlerMap = {
  name: OpenLayersEvent;
  cursor: string;
  callback?: () => void;
}[];
const mapViewport = map.getViewport();

/**
 * Hook for å håndtere cursorsstiler basert på OpenLayers-hendelser.
 * @param {boolean} isEnabled - Indikerer om cursorsstilene skal være aktivert.
 * @param {EventAndHandlerMap[]} eventsAndHandlers - Array av OpenLayers-hendelser og deres tilsvarende handlers.
 * @example
 * useCursorStyles(true, [
 *   { key: 'click', handler: handleClick },
 *   { key: 'pointermove', handler: handlePointerMove },
 * ]);
 */
export const useCursorStyles = (isEnabled: boolean, eventsAndHandlers: EventAndHandlerMap) => {
  const addEventListeners = (events: EventAndHandlerMap) => {
    events.forEach((event) => {
      const callback = () => (mapViewport.style.cursor = event.cursor); // må sørge for at vi bruker samme funksjon (referanse) ellers vil unregister av event feile
      map.on(event.name, callback);
      event.callback = callback;
    });
  };

  const removeEventListeners = (events: EventAndHandlerMap) => {
    events.forEach((event) => {
      if (event.callback) {
        map.un(event.name, event.callback);
      }
    });
  };

  useEffect(() => {
    if (isEnabled) {
      addEventListeners(eventsAndHandlers);
    } else {
      mapViewport.style.cursor = "";
    }

    return () => {
      removeEventListeners(eventsAndHandlers);
      mapViewport.style.cursor = "";
    };
  }, [eventsAndHandlers, isEnabled]);
};
