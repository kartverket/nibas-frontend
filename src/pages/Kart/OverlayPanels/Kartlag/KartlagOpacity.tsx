import {
  Popover,
  PopoverTrigger,
  IconButton,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@kvib/react";
import { LayerId } from "hooks/layers/types";
import { useEffect, useState } from "react";
import { getLayerById } from "utils/map/layers";

type Props = {
  layerId: LayerId;
  isDisabled: boolean;
};

const KartlagOpacity = ({ layerId, isDisabled }: Props) => {
  const layer = getLayerById(layerId);
  const [opacity, setOpacity] = useState(layer.getOpacity() * 100);

  useEffect(() => {
    layer.setOpacity(opacity / 100);
  }, [layer, opacity]);

  return (
    <Popover placement="left">
      <PopoverTrigger>
        <IconButton
          aria-label="Juster gjennomsiktighet"
          variant="tertiary"
          icon="tonality"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          isDisabled={isDisabled}
        />
      </PopoverTrigger>
      <PopoverContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Juster gjennomsiktighet</PopoverHeader>
        <PopoverBody padding="12px 16px">
          <Slider min={0} max={100} value={opacity} step={5} onChange={setOpacity}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={4} />
          </Slider>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default KartlagOpacity;
