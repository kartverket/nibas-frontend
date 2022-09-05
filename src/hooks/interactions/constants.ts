import { Modify } from "ol/interaction";
import Style from "ol/style/Style";
import { editSource } from "hooks/layers/constants";

export const modify = new Modify({
  source: editSource,
  style: new Style({}), // fjerne sirkel som kommer når man hoverer feature
});
