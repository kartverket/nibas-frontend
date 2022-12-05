import { forwardRef, useState } from "react";
import styled from "styled-components";
import useLayerOpacity from "./useLayerOpacity";
import Button from "components/form/Button";
import Slider from "components/form/Slider";
import Icon from "components/Icon";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";

const getCaretIcon = (open: boolean) => (
  <Caret open={open}>
    {open ? (
      <Icon icon="expand_less" aria-label="Lukk" />
    ) : (
      <Icon icon="expand_more" aria-label="Åpne" />
    )}
  </Caret>
);

type SharedProps = {
  indent: number;
  onVisibilityClick: (layerId: string) => void;
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
        onClick={() => onVisibilityClick(props.mappedLayer.title)}
        aktivtKartlag={aktivtKartlag}
        visible={visible}
        variant="unstyled"
      >
        {visible ? (
          <Icon icon="remove" aria-label={`Fjern ${props.mappedLayer.title}`} />
        ) : (
          <Icon icon="add" aria-label={`Vis ${props.mappedLayer.title}`} />
        )}
      </AddRemove>
    );
    const renderNameAndCaret = () => {
      // hvis hovedlag uten barn
      if (props.isMainLayer && props.mappedLayer.layers.length === 0) {
        return (
          <ClickableName
            variant="unstyled"
            open={false}
            icon={getAddRemove(false)}
          >
            <span>{props.mappedLayer.title}</span>
          </ClickableName>
        );
      }

      // hvis har sub-lag, la navnet være klikkbart for å åpne accordion
      if (props.mappedLayer.layers.length > 0) {
        return (
          <ClickableName
            variant="unstyled"
            icon={getCaretIcon(open)}
            onClick={() => setOpen(!open)}
            open={open}
            dropDown={true}
          >
            <span>{props.mappedLayer.title}</span>
          </ClickableName>
        );
      }

      // ellers bare render tittelen til et sub-lag
      return (
        <SubKartlagName activeLayer={visible}>
          {props.mappedLayer.title}
          {getAddRemove(false)}
        </SubKartlagName>
      );
    };

    const renderAktivtMainLayer = () => {
      return (
        <AktivtMainLayerWrapper>
          <DraggableLayer ref={ref}>
            <Icon
              icon="reorder"
              aria-label={`Bytt rekkefølge på kartlag ${props.mappedLayer.title}`}
            />
            <span>{props.mappedLayer.title}</span>
          </DraggableLayer>
          <AktivtKartlagSlider>
            <Slider
              min={0}
              max={100}
              value={opacity ?? 100}
              onChange={onSliderChange}
            />
          </AktivtKartlagSlider>
          {getAddRemove(true)}
        </AktivtMainLayerWrapper>
      );
    };

    const renderAktivtSubLayer = () => {
      if (visible && props.mappedLayer.layers.length === 0) {
        return (
          <AktivtSubLayerWrapper>
            <span>{props.mappedLayer.title}</span>
            <AddRemove
              onClick={() => onVisibilityClick(props.mappedLayer.title)}
              aktivtKartlag={true}
              visible={visible}
              variant="unstyled"
            >
              <Icon
                icon="remove"
                aria-label={`Fjern ${props.mappedLayer.title} fra aktive kartlag`}
              />
            </AddRemove>
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

const AddRemove = styled(Button)<{ visible: boolean; aktivtKartlag: boolean }>`
  cursor: pointer;

  color: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? "var(--gray)" : "var(--blue_dark)"};

  padding: 0 12px;
  opacity: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? 0.4 : 1};
`;

const Caret = styled.div<{ open: boolean }>`
  color: ${({ open }) => (open ? "var(--white)" : "var(--blue_dark)")};
  background-color: ${({ open }) =>
    open ? "var(--blue_dark)" : "var(--white)"};

  height: 100%;
  padding: 0 12px;
  align-items: center;
  display: flex;
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

const SubKartlagName = styled.span<{ activeLayer?: boolean }>`
  color: ${({ activeLayer }) => (activeLayer ? "var(--gray)" : "var(--black)")};
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
`;

const ClickableName = styled(Button)<{
  open: boolean;
  dropDown?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;

  > :first-child {
    flex: 1;
    text-align: left;
    padding: 6px;
    background-color: ${({ open, dropDown }) =>
      open && dropDown ? "var(--blue_light)" : "var(--white)"};
    padding-top: ${({ dropDown }) => (dropDown ? 16 : 0)}px;
    padding-bottom: ${({ dropDown }) => (dropDown ? 16 : 0)}px;
    padding-left: 16px;
  }
`;

const DraggableLayer = styled.span`
  cursor: move;

  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: unset;
  justify-content: left;

  > :first-child {
    margin-right: 8px;
    margin-left: 4px;
  }
`;

const AktivtKartlagSlider = styled.div`
  width: 64px;
  margin-left: 4px;
  margin-right: 20px;
  margin-bottom: 6px;
`;

const AktivtMainLayerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 8px 0;
  padding: 6px 0;
  font-weight: bold;
  padding-top: 16px;
`;

const AktivtSubLayerWrapper = styled.div`
  margin-left: 38px;
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content: space-between;
  padding: 4px 0;
`;

export default BackgroundLayerAccordion;
