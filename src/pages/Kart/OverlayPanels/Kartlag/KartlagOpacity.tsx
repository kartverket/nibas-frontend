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
import { KartlagId } from "hooks/layers/types";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { getLayerById } from "utils/map/layers";

type Props = {
  layerId: KartlagId;
};

const KartlagOpacity = ({ layerId }: Props) => {
  const layer = getLayerById(layerId);
  const [opacity, setOpacity] = useState(layer.getOpacity() * 100);

  useEffect(() => {
    layer.setOpacity(opacity / 100);
  }, [layer, opacity]);

  return (
    <Popover>
      <PopoverTrigger>
        <OpacityButton
          aria-label="Juster gjennomsiktighet"
          variant="ghost"
          icon="tonality"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent onClick={(e) => e.stopPropagation()}>
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

const OpacityButton = styled(IconButton)`
  &:hover {
    background: var(--kvib-colors-blue-100);
  }
`;

export default KartlagOpacity;
