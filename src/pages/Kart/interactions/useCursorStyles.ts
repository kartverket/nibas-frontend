import BaseEvent from "ol/events/Event";
import { useEffect } from "react";
import { map } from "../constants";
import { Types as MapBrowserEventType } from "ol/MapBrowserEventType";

type ConditionalCursorStyle = {
  style: (e?: Event | BaseEvent) => string;
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
      if (defaultCursor && e) {
        mapViewport.style.cursor = defaultCursor.style(e);
      } else {
        mapViewport.style.cursor = "";
      }
    };

    const addEventListeners = (events?: EventsAndCursor[]) => {
      map.on("pointermove", setDefaultCursor);
      events?.forEach((event) => {
        const callback = (e: Event | BaseEvent) => {
          mapViewport.style.cursor = event.cursor.style(e);
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
    } else {
      mapViewport.style.cursor = "";
    }
    return () => {
      removeEventListeners(eventsAndCursor);
    };
  }, [defaultCursor, eventsAndCursor, isEnabled, mapViewport.style]);
};
