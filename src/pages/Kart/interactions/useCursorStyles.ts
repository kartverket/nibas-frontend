import BaseEvent from "ol/events/Event";
import { useEffect } from "react";
import { map } from "../constants";
import { Types } from "ol/MapBrowserEventType";

type ConditionalCursorStyle = (e?: Event | BaseEvent) => string;
type EventName = Exclude<Types, "pointermove">;
type CustomEventName = "mouseup" | "mousedown";

type EventsAndCursor = {
  name: EventName | CustomEventName;
  cursor: ConditionalCursorStyle;
  callback?: (e: Event | BaseEvent) => void;
};

type CursorStyleProps = {
  isEnabled: boolean;
  defaultCursor?: ConditionalCursorStyle;
  eventsAndCursor?: EventsAndCursor[];
};

const isCustomEventName = (value: string): value is CustomEventName => {
  return value === "mouseup" || value === "mousedown";
};

/**
 * Hook for å håndtere cursorsstiler i kartet basert på en gitt state og/eller OpenLayers-hendelser.
 * @param {boolean} isEnabled - Indikerer om cursorsstilene skal være aktivert.
 * @param {EventsAndCursor[]} eventsAndCursor - Liste med EventsAndCursor-objekter som knytter MapBrowserEvents opp mot et callback som returnerer en cursorstil.
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
      const customEvents = eventsAndCursor?.filter((event) => isCustomEventName(event.name));
      customEvents?.forEach((event) => {
        const callback = (e: Event | BaseEvent) => {
          mapViewportStyle.cursor = event.cursor(e);
        };
        map.getTargetElement().addEventListener(event.name, callback);
        event.callback = callback;
      });
    };

    const addEventListeners = (events?: EventsAndCursor[]) => {
      map.on("pointermove", setDefaultCursor);

      const olEvents = events?.filter((event) => !isCustomEventName(event.name));

      olEvents?.forEach((event) => {
        const callback = (e: Event | BaseEvent) => {
          mapViewportStyle.cursor = event.cursor(e);
        };
        const eventName = event.name as EventName;
        map.on(eventName, callback);
        event.callback = callback;
      });

      map.once("postrender", addCustomEventListeners); // legger til dom events når mappet har rendret ferdig
    };

    const removeEventListeners = (events?: EventsAndCursor[]) => {
      map.un("pointermove", setDefaultCursor);

      const customEvents = events?.filter((event) => isCustomEventName(event.name));
      const olEvents = events?.filter((event) => !isCustomEventName(event.name));

      olEvents?.forEach((event) => {
        if (event.callback) {
          const eventName = event.name as EventName;
          map.un(eventName, event.callback);
        }
      });

      customEvents?.forEach((event) => {
        if (event.callback && map.getTargetElement()) {
          map.getTargetElement()?.removeEventListener(event.name, event.callback);
        }
      });
      map.un("postrender", addCustomEventListeners);
    };

    if (isEnabled) {
      addEventListeners(eventsAndCursor);
      mapViewportStyle.cursor = defaultCursor ? defaultCursor() : "";
    }
    return () => {
      removeEventListeners(eventsAndCursor);
      mapViewportStyle.cursor = "";
    };
  }, [defaultCursor, eventsAndCursor, isEnabled, mapViewportStyle]);
};
