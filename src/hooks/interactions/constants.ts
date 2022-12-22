import { Modify } from "ol/interaction";
import Style from "ol/style/Style";
import { editSource } from "hooks/layers/constants";

export const modify = new Modify({
  source: editSource,
  style: new Style({}), // fjerne sirkel som kommer når man hoverer feature
  condition: (e) => {
    const feature = editSource.getFeaturesAtCoordinate(e.coordinate);

    // skru av modify hvis det er en punkt som dras på
    // når dette lages gjelder dette kun representasjonspunkt
    if (
      feature.length === 1 &&
      feature[0].getGeometry()?.getType() === "Point"
    ) {
      return false;
    }

    return true;
  },
});
