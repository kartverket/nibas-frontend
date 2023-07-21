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
import Icon from "components/Icon";
import { BakgrunnskartId } from "hooks/layers/types";
import { useEffect, useState } from "react";
import { getLayerById } from "utils/map/layers";

type Props = {
  layerId: BakgrunnskartId;
};

const ActiveKartlagOpacity = ({ layerId }: Props) => {
  const [opacity, setOpacity] = useState(100);
  const layer = getLayerById(layerId);

  useEffect(() => {
    layer.setOpacity(opacity / 100);
  }, [layer, opacity]);

  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          aria-label="Juster gjennomsiktighet"
          variant="ghost"
          icon={<Icon icon="opacity" />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Juster gjennomsiktighet</PopoverHeader>
        <PopoverBody>
          <Slider min={0} max={100} value={opacity} onChange={setOpacity}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
export default ActiveKartlagOpacity;
