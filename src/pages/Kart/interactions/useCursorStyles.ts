import BaseEvent from "ol/events/Event";
import { useCallback, useEffect } from "react";
import { map } from "../constants";

type OpenLayersEvents = (
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

export type EventsAndCursor = {
  name: OpenLayersEvents;
  cursor: string;
  condition?: (e: Event | BaseEvent) => boolean;
  callback?: (e: Event | BaseEvent) => void;
};
const mapViewport = map.getViewport();

/**
 * Hook for å håndtere cursorsstiler basert på OpenLayers-hendelser.
 * @param {boolean} isEnabled - Indikerer om cursorsstilene skal være aktivert.
 * @param {EventsAndCursor[]} eventsAndCursor - Array av OpenLayers-hendelser og deres tilsvarende cursor.
 * @example
 * useCursorStyles(true, [
 *   { name: 'pointermove', cursor: 'grab' },
 *   { name: 'pointerdrag', cursor: 'grabbing' },
 * ]);
 */
export const useCursorStyles = (isEnabled: boolean, eventsAndCursor: EventsAndCursor[], defaultCursor?: string) => {
  const addEventListeners = (events: EventsAndCursor[]) => {
    events.forEach((event) => {
      const callback = (e: Event | BaseEvent) => {
        if (event.condition) {
          mapViewport.style.cursor = event.condition(e) ? event.cursor : "";
        } else mapViewport.style.cursor = event.cursor;
      };

      map.on(event.name, callback);
      event.callback = callback;
    });
  };
  const removeEventListeners = (events: EventsAndCursor[]) => {
    events.forEach((event) => {
      if (event.callback) {
        map.un(event.name, event.callback);
      }
    });
  };

  useEffect(() => {
    if (isEnabled) {
      addEventListeners(eventsAndCursor);
    } else {
      mapViewport.style.cursor = "";
    }

    return () => {
      removeEventListeners(eventsAndCursor);
      mapViewport.style.cursor = "";
    };
  }, [eventsAndCursor, isEnabled]);
};
