import BaseEvent from "ol/events/Event";
import { useEffect } from "react";
import { map } from "../constants";
import { Types } from "ol/MapBrowserEventType";

type ConditionalCursorStyle = (e?: Event | BaseEvent) => string;

type OmitPointerMove<T extends string> = T extends "pointermove" ? never : T;
type MapBrowserEvent = OmitPointerMove<Types>;

type EventsAndCursor = {
  name: MapBrowserEvent[];
  cursor: ConditionalCursorStyle;
  callback?: (e: Event | BaseEvent) => void;
};

type CursorStyleProps = {
  isEnabled: boolean;
  defaultCursor?: ConditionalCursorStyle;
  eventsAndCursor?: EventsAndCursor[];
};

/**
 * Hook for å håndtere cursorsstiler i kartet basert på en gitt state og/eller OpenLayers-hendelser.
 * @param {boolean} isEnabled - Indikerer om cursorsstilene skal være aktivert.
 * @param {EventsAndCursor[]} eventsAndCursor - Liste med MapBrowserEvents knyttet til en cursorstil.
 * @param {ConditionalCursorStyle} defaultCursor - Cursorstilen som skal gjelde hvis ingen events i eventsAndCursor har blitt utløst. defaultCursor blir automatisk knyttet til "pointermove" eventet i OpenLayers.
 * @example
 * useCursorStyles({
    isEnabled: activeModeTools.includes("move"),
    defaultCursor: () => "grab",
    eventsAndCursor: [
      {
        name: ["pointerdrag"],
        cursor: (e) => (shiftKeyOnly(e) ? "zoom-in" : "grabbing"),
      },
    ],
  });
 */
export const useCursorStyles = ({ isEnabled, defaultCursor, eventsAndCursor }: CursorStyleProps) => {
  const mapViewport = map.getViewport();

  useEffect(() => {
    const setDefaultCursor = (e?: Event | BaseEvent) => {
      if (defaultCursor && e) {
        mapViewport.style.cursor = defaultCursor(e);
      } else if (defaultCursor) {
        mapViewport.style.cursor = defaultCursor();
      }
    };

    const addEventListeners = (events?: EventsAndCursor[]) => {
      map.on("pointermove", setDefaultCursor);
      events?.forEach((event) => {
        const callback = (e: Event | BaseEvent) => {
          mapViewport.style.cursor = event.cursor(e);
        };

        map.on(event.name, callback);
        event.callback = callback;
      });
    };

    const removeEventListeners = (events?: EventsAndCursor[]) => {
      map.un("pointermove", setDefaultCursor);
      events?.forEach((event) => {
        if (event.callback) {
          map.un(event.name, event.callback);
        }
      });
    };

    if (isEnabled) {
      addEventListeners(eventsAndCursor);
      mapViewport.style.cursor = defaultCursor ? defaultCursor() : "";
    }
    return () => {
      removeEventListeners(eventsAndCursor);
      mapViewport.style.cursor = "";
    };
  }, [defaultCursor, eventsAndCursor, isEnabled, mapViewport.style]);
};
