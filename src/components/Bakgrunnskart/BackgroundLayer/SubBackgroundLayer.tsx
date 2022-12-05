import TileWMS from "ol/source/TileWMS";
import { bakgrunnskartLayers } from "../../../hooks/layers/constants";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import { BakgrunnskartId } from "hooks/layers/types";
import { MappedLayer } from "utils/getLayersFromWMS";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";

const getLayersStringToReplace = (
  layersInParams: string,
  mappedLayerName: string
) => {
  const commaRegex = new RegExp(`(,{0,1})(${mappedLayerName})(,{0,1})`, "i");
  const match = commaRegex.exec(layersInParams);

  if (!match) return;

  const prefixComma = match[1];
  const trailingComma = match[3];
  let replaceString = "";

  if (trailingComma) {
    // komma på slutten, potensielt på starten i tillegg men spiller ingen rolle
    replaceString = `${mappedLayerName},`;
  } else if (prefixComma && !trailingComma) {
    // bare komma på starten
    replaceString = `,${mappedLayerName}`;
  } else if (!prefixComma && !trailingComma) {
    // ikke noe komma
    replaceString = `${mappedLayerName}`;
  }

  return replaceString;
};

type Props = {
  mappedLayer: MappedLayer;
  indent: number;
  mainLayerSourceId: BakgrunnskartId;
  mainLayerName: string;
  isAktiveKartlag?: boolean;
};

const SubBackgroundLayer = ({
  mappedLayer,
  indent,
  mainLayerSourceId,
  mainLayerName,
  isAktiveKartlag,
}: Props) => {
  const { toggleLayerVisibility, visibleLayers, recursiveIsVisible } =
    useBakgrunnskart();
  const visible = visibleLayers.some(
    (vl) =>
      vl.mainLayer === mainLayerSourceId &&
      vl.subLayers.some((sl) => sl === mappedLayer.title)
  );

  const updateSourceParams = () => {
    const source = bakgrunnskartLayers[
      mainLayerSourceId
    ].getSource() as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;
    const mappedLayerId = mappedLayer.id;

    if (!mappedLayerId) return;

    let newParamsLayerString = "";

    if (visible) {
      const replaceString = getLayersStringToReplace(
        layersInParams,
        mappedLayerId
      );

      if (!replaceString) return;

      const layersReplacedString = layersInParams.replace(replaceString, "");

      // hvis param layer ville vært tom, gjør den til hovedlaget igjen
      if (!layersReplacedString) {
        newParamsLayerString = mainLayerName;
      } else {
        newParamsLayerString = layersReplacedString;
      }
    } else {
      let newLayers = "";

      if (!layersInParams || mainLayerName === layersInParams) {
        newLayers = `${mappedLayerId}`;
      } else {
        newLayers = `${layersInParams},${mappedLayerId}`;
      }

      newParamsLayerString = newLayers;
    }

    source.updateParams({ LAYERS: newParamsLayerString });
  };

  const onVisibilityClick = (layerId: string) => {
    updateSourceParams();
    const source = bakgrunnskartLayers[
      mainLayerSourceId
    ].getSource() as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;

    const isMainLayerVisible = visibleLayers.find(
      (visibleLayer) => visibleLayer.mainLayer === layerId
    );

    if (layersInParams && !isMainLayerVisible) {
      toggleLayerVisibility(mainLayerSourceId, mappedLayer.title);
    } else if (layersInParams === mainLayerName && isMainLayerVisible) {
      toggleLayerVisibility(mainLayerSourceId, mappedLayer.title);
    }
  };

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={indent}
      visible={visible}
      onVisibilityClick={onVisibilityClick}
      isAktiveKartlag={isAktiveKartlag}
    >
      <>
        {mappedLayer.layers
          .filter((layer) =>
            isAktiveKartlag
              ? recursiveIsVisible(mainLayerSourceId, layer)
              : true
          )
          .map((layer) => (
            <SubBackgroundLayer
              key={layer.title}
              mappedLayer={layer}
              mainLayerSourceId={mainLayerSourceId}
              mainLayerName={mainLayerName}
              indent={indent + 1}
              isAktiveKartlag={isAktiveKartlag}
            />
          ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default SubBackgroundLayer;
