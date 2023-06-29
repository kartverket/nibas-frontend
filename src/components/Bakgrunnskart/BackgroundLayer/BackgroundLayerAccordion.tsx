import { forwardRef, useState } from "react";
import styled from "styled-components";
import useLayerOpacity from "./useLayerOpacity";
import Icon from "components/Icon";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";
import { Outline } from "style/mixins";
import {
  Button,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@kvib/react";

type SharedProps = {
  indent: number;
  onVisibilityClick: () => void;
  visible: boolean;
  isAktiveKartlag?: boolean;
  children: React.ReactNode;
};

type MainLayerProps = SharedProps & {
  mappedLayer: MainMappedLayer;
  isMainLayer: true;
};

type SubLayerProps = SharedProps & {
  mappedLayer: MappedLayer;
  isMainLayer?: false | undefined;
};

/**
 * Hvis isMainLayer er true, betyr det at mappedLayer har en id vi kan hente layer/source med
 * via MainMappedLayer.sourceId, hvis ikke er det et vanlig MappedLayer.
 *
 * Vi kan dermed bruke TypeScript til å gjøre sjekker og snevre inn typen basert på props.isMainLayer.
 * Hvis vi destructurer vil vi miste denne snevringen
 */
type Props = MainLayerProps | SubLayerProps;

const BackgroundLayerAccordion = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const { indent, visible, onVisibilityClick, isAktiveKartlag, children } =
      props;
    const [open, setOpen] = useState(false);
    const { opacity, onSliderChange } = useLayerOpacity({
      mappedLayer: props.mappedLayer,
      isMainLayer: props.isMainLayer,
    });

    const getAddRemove = (aktivtKartlag: boolean) => (
      <AddRemove
        onClick={onVisibilityClick}
        aktivtKartlag={aktivtKartlag}
        visible={visible}
      >
        <Icon
          icon={visible ? "remove" : "add"}
          aria-label={
            visible
              ? `Fjern ${props.mappedLayer.title}`
              : `Vis ${props.mappedLayer.title}`
          }
        />
      </AddRemove>
    );

    const renderNameAndCaret = () => {
      // hvis hovedlag uten barn
      if (props.isMainLayer && props.mappedLayer.layers.length === 0) {
        return (
          <AddableLayer
            onClick={() => onVisibilityClick()}
            aria-label={
              (visible ? `Fjern` : `Vis`) + ` ${props.mappedLayer.title}`
            }
          >
            <span>{props.mappedLayer.title}</span>
            {getAddRemove(false)}
          </AddableLayer>
        );
      }

      // hvis har sub-lag, la navnet være klikkbart for å åpne accordion
      if (props.mappedLayer.layers.length > 0) {
        return (
          <ClickableName
            variant="ghost"
            onClick={() => setOpen(!open)}
            open={open}
            aria-label={
              open
                ? `Lukk ${props.mappedLayer.title}`
                : `Åpne ${props.mappedLayer.title}`
            }
          >
            <span>{props.mappedLayer.title}</span>

            <Caret open={open}>
              <Icon icon={open ? "expand_less" : "expand_more"} />
            </Caret>
          </ClickableName>
        );
      }

      // ellers bare render tittelen til et sub-lag
      return (
        <AddableLayer
          activeLayer={visible}
          onClick={() => onVisibilityClick()}
          aria-label={
            (visible ? `Fjern` : `Vis`) + ` ${props.mappedLayer.title}`
          }
        >
          {props.mappedLayer.title}
          {getAddRemove(false)}
        </AddableLayer>
      );
    };

    const renderAktivtMainLayer = () => {
      return (
        <AktivtMainLayerWrapper>
          <DraggableLayer ref={ref}>
            <Icon
              icon="format_line_spacing"
              aria-label={`Bytt rekkefølge på kartlag ${props.mappedLayer.title}`}
            />
            <span>{props.mappedLayer.title}</span>
          </DraggableLayer>
          <OpacitySlider
            aria-label="slider-ex-1"
            defaultValue={30}
            min={0}
            max={100}
            value={opacity ?? 100}
            onChange={onSliderChange}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </OpacitySlider>
          <AddRemoveIconButton
            variant="ghost"
            aria-label="Fjern aktivt kartlag"
            icon={getAddRemove(true)}
          />
        </AktivtMainLayerWrapper>
      );
    };

    const renderAktivtSubLayer = () => {
      if (visible && props.mappedLayer.layers.length === 0) {
        return (
          <AktivtSubLayerWrapper onClick={() => onVisibilityClick()}>
            <span>{props.mappedLayer.title}</span>
            {getAddRemove(true)}
          </AktivtSubLayerWrapper>
        );
      }
    };

    //aktivekartlag-liste burde på sikt trekkes ut i egen komponent
    if (isAktiveKartlag) {
      return (
        <div>
          {props.isMainLayer ? renderAktivtMainLayer() : renderAktivtSubLayer()}
          {children}
        </div>
      );
    }

    return (
      <div>
        <Wrapper indent={indent}>{renderNameAndCaret()}</Wrapper>
        {open && children}
      </div>
    );
  }
);

BackgroundLayerAccordion.displayName = "BackgroundLayerAccordion";

const AktivtMainLayerWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 64px auto;
  align-items: center;
  gap: 8px;
  font-weight: bold;
`;

const AddRemove = styled.span<{ visible: boolean; aktivtKartlag: boolean }>`
  color: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? "var(--gray)" : "var(--blue_dark)"};

  margin: 0 8px;
  opacity: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? 0.4 : 1};
  border-radius: 50%;
  padding: 8px;

  span {
    vertical-align: top;
  }

  &:focus-visible {
    ${Outline}
  }

  &:hover {
    background: var(--blue_light);
    color: var(--blue_dark);
  }
`;

const Caret = styled.span<{ open: boolean }>`
  display: flex;
  align-items: center;
  height: 100%;
  color: ${({ open }) => (open ? "var(--white)" : "var(--blue_dark)")};
  background-color: ${({ open }) =>
    open ? "var(--blue_dark)" : "var(--white)"};

  padding: 0 16px;

  &:hover {
    background: var(--blue_dark);
    color: var(--white);
  }
`;

const Wrapper = styled.div<{ indent: number }>`
  display: flex;
  margin: 8px 0;
  margin-left: ${({ indent }) => indent * 36}px;

  > span {
    flex: 1;
  }

  > div {
    width: 50%;
  }
`;

const ClickableName = styled(Button)<{ open: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  border-radius: unset;
  height: unset;
  padding: 0;
  color: inherit;

  > :first-child {
    flex: 1;
    text-align: left;
    padding: 16px;

    background-color: ${({ open }) =>
      open ? "var(--blue_light)" : "var(--white)"};
    border-left: 3px solid
      ${({ open }) => (open ? "var(--blue_dark)" : "transparent")};
    background: ${({ open }) => (open ? "var(--blue_light)" : "var(--white)")};
  }

  &:focus-visible {
    ${Outline}
  }

  &:hover {
    > :first-child {
      background: var(--blue_light);
    }

    ${Caret} {
      background: var(--blue_dark);
      color: var(--white);
    }
  }
`;

const DraggableLayer = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
  flex: 1;
  gap: 8px;
  cursor: move;

  > :first-child {
    padding: 6px;
  }

  &:hover {
    ${Icon} {
      color: var(--blue_dark);
      background: var(--blue_light);
      border-radius: 50%;
    }
  }

  &:active {
    ${Icon} {
      color: var(--white);
      background: var(--blue_dark);
      border-radius: 50%;
    }
  }
`;

const OpacitySlider = styled(Slider)``;

const AddRemoveIconButton = styled(IconButton)`
  width: unset;

  &:hover {
    background: none;
  }
`;

const AktivtSubLayerWrapper = styled.button`
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 4px 42px;
  display: flex;
  width: 100%;

  > :first-child {
    text-align: left;
    flex: 1;
  }

  &:focus-visible {
    ${Outline}
  }

  &:hover {
    ${AddRemove} {
      color: var(--blue_dark);
      background: var(--blue_light);
    }
  }
`;

const AddableLayer = styled.button<{ activeLayer?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding: 6px 0 6px 6px;
  text-align: left;

  &:hover {
    ${AddRemove} {
      background: var(--blue_light);
      color: var(--blue_dark);
    }
  }

  &:focus-visible {
    ${Outline}
  }
`;

export default BackgroundLayerAccordion;
