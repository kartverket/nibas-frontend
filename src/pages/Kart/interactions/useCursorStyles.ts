import BaseEvent from "ol/events/Event";
import { useEffect } from "react";
import { map } from "../constants";
import { Types } from "ol/MapBrowserEventType";

type ConditionalCursorStyle = (e?: Event | BaseEvent) => string;
type EventName = Exclude<Types, "pointermove">;
type CustomEventName = "mouseup" | "mousedown";

type EventAndCursor = {
  name: EventName | CustomEventName;
  cursor: ConditionalCursorStyle;
  callback?: (e: Event | BaseEvent) => void;
};

type CursorStyleProps = {
  isEnabled: boolean;
  defaultCursor?: ConditionalCursorStyle;
  eventsAndCursor?: EventAndCursor[];
};

const isCustomEventName = (value: EventName | CustomEventName): value is CustomEventName => {
  return value === "mouseup" || value === "mousedown";
};

/**
 * Hook for å håndtere cursorsstiler i kartet basert på en gitt state og/eller OpenLayers-hendelser.
 * @param {boolean} isEnabled - Indikerer om cursorsstilene skal være aktivert.
 * @param {EventAndCursor[]} eventsAndCursor - Liste med EventsAndCursor-objekter som knytter MapBrowserEvents opp mot et callback som returnerer en cursorstil.
 * @param {ConditionalCursorStyle} defaultCursor - Cursorstilen som skal gjelde hvis ingen events i eventsAndCursor har blitt utløst.
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
  const mapViewportStyle = map.getViewport().style;

  useEffect(() => {
    const setDefaultCursor = (e?: Event | BaseEvent) => {
      if (defaultCursor && e) {
        mapViewportStyle.cursor = defaultCursor(e);
      } else if (defaultCursor) {
        mapViewportStyle.cursor = defaultCursor();
      }
    };

    const addCustomEventListeners = () => {
      // CustomEvents får ikke openlayers event sendt inn. Disse får vanlige html event basert på eventname som gis.
      if (eventsAndCursor) {
        const customEvents = eventsAndCursor.filter((event) => isCustomEventName(event.name));
        for (const event of customEvents) {
          const callback = (e: Event | BaseEvent) => {
            mapViewportStyle.cursor = event.cursor(e);
          };
          map.getTargetElement().addEventListener(event.name, callback);
          event.callback = callback;
        }
      }
    };

    const addEventListeners = (events: EventAndCursor[]) => {
      map.on("pointermove", setDefaultCursor);

      const olEvents = events.filter((event) => !isCustomEventName(event.name));

      for (const event of olEvents) {
        const callback = (e: Event | BaseEvent) => {
          mapViewportStyle.cursor = event.cursor(e);
        };
        const eventName = event.name;
        if (!isCustomEventName(eventName)) {
          map.on(eventName, callback);
          event.callback = callback;
        }
      }

      map.once("postrender", addCustomEventListeners); // legger til dom events når mappet har rendret ferdig
    };

    const removeEventListeners = (events: EventAndCursor[]) => {
      map.un("pointermove", setDefaultCursor);

      for (const event of events) {
        if (event.callback) {
          if (isCustomEventName(event.name)) {
            map.getTargetElement()?.removeEventListener(event.name, event.callback);
          } else {
            map.un(event.name, event.callback);
          }
        }
      }

      map.un("postrender", addCustomEventListeners);
    };

    if (isEnabled) {
      if (eventsAndCursor) addEventListeners(eventsAndCursor);
      mapViewportStyle.cursor = defaultCursor ? defaultCursor() : "";
    }
    return () => {
      if (eventsAndCursor) removeEventListeners(eventsAndCursor);
      mapViewportStyle.cursor = "";
    };
  }, [defaultCursor, eventsAndCursor, isEnabled, mapViewportStyle]);
};
