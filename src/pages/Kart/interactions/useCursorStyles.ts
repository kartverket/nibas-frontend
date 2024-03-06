import BaseEvent from "ol/events/Event";
import { useEffect } from "react";
import { map } from "../constants";
import { Types as MapBrowserEventType } from "ol/MapBrowserEventType";

type ConditionalCursorStyle = {
  style: string;
  condition?: (e: Event | BaseEvent) => boolean;
};

type EventsAndCursor = {
  name: MapBrowserEventType[];
  cursor: ConditionalCursorStyle;
  callback?: (e: Event | BaseEvent) => void;
};

type CursorStyleProps = {
  isEnabled: boolean;
  defaultCursor?: ConditionalCursorStyle;
  eventsAndCursor?: EventsAndCursor[];
};

export const useCursorStyles = ({ isEnabled, eventsAndCursor, defaultCursor }: CursorStyleProps) => {
  const mapViewport = map.getViewport();
  useEffect(() => {
    const setDefaultCursor = (e?: Event | BaseEvent) => {
      if (defaultCursor?.condition && e) {
        if (defaultCursor?.condition(e)) {
          mapViewport.style.cursor = defaultCursor?.style;
        } else {
          mapViewport.style.cursor = "";
        }
      } else {
        mapViewport.style.cursor = defaultCursor?.style || "";
      }
    };

    const addEventListeners = (events?: EventsAndCursor[]) => {
      events?.forEach((event) => {
        const callback = (e: Event | BaseEvent) => {
          if (event.cursor.condition) {
            if (event.cursor.condition(e)) {
              mapViewport.style.cursor = event.cursor.style;
            } else {
              setDefaultCursor(e);
            }
          } else {
            mapViewport.style.cursor = event.cursor.style;
          }
        };

        map.on(event.name, callback);
        event.callback = callback;
      });
      map.on("pointermove", setDefaultCursor);
    };

    const removeEventListeners = (events?: EventsAndCursor[]) => {
      events?.forEach((event) => {
        if (event.callback) {
          map.un(event.name, event.callback);
        }
      });
      map.un("pointermove", setDefaultCursor);
    };

    if (isEnabled) {
      addEventListeners(eventsAndCursor);
    } else {
      mapViewport.style.cursor = "";
    }
    return () => {
      removeEventListeners(eventsAndCursor);
      mapViewport.style.cursor = "";
    };
  }, [defaultCursor, eventsAndCursor, isEnabled, mapViewport.style]);
};
