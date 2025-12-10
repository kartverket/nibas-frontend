import { Map } from "ol";

declare global {
  interface Window {
    testingGlobals: {
      map: Map;
    };
    enableBopliktViewing?: () => void;
    enableBopliktEditing?: () => void;
  }
}

export {};
