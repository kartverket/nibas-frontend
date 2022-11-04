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

    const getAddRemove = () => (
      <AddRemove onClick={onVisibilityClick}>
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
            isMainLayer={props.isMainLayer}
            open={false}
            icon={getAddRemove()}
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
            isMainLayer={props.isMainLayer}
          >
            <span>{props.mappedLayer.title}</span>
          </ClickableName>
        );
      }

      // ellers bare render tittelen til et sub-lag
      return (
        <SubKartlagName activeLayer={visible}>
          {props.mappedLayer.title}
          <AddRemove onClick={onVisibilityClick}>{getAddRemove()}</AddRemove>
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
        </AktivtMainLayerWrapper>
      );
    };

    const renderAktivtSubLayer = () => {
      if (!visible || props.mappedLayer.layers.length > 0) return;

      return (
        <AktivtSubLayerWrapper>
          <span>{props.mappedLayer.title}</span>
          <AddRemove onClick={onVisibilityClick}>
            <Icon
              icon="remove"
              aria-label={`Fjern ${props.mappedLayer.title} fra aktive kartlag`}
            />
          </AddRemove>
        </AktivtSubLayerWrapper>
      );
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

const AddRemove = styled.div`
  color: ${({ theme }) => theme.colors.gray};
  cursor: pointer;

  padding: 0 2px;
`;

const Caret = styled.div<{ open: boolean }>`
  color: ${({ theme, open }) =>
    open ? theme.colors.white : theme.colors.gray};
  background-color: ${({ open, theme }) =>
    open ? theme.colors.blueDark : theme.colors.white};

  height: 100%;
  padding: 0 4px;
  align-items: center;
  display: flex;
`;

const Wrapper = styled.div<{ indent: number }>`
  display: flex;
  margin: 8px 0;
  margin-left: ${({ indent }) => indent * 16}px;

  > span {
    flex: 1;
  }

  > div {
    width: 50%;
  }
`;

const SubKartlagName = styled.span<{ activeLayer?: boolean }>`
  color: ${({ activeLayer, theme }) =>
    activeLayer ? theme.colors.gray : theme.colors.black};
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
`;

const ClickableName = styled(Button)<{ open: boolean; isMainLayer?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;

  > :first-child {
    flex: 1;
    text-align: left;
    padding: 6px;
    background-color: ${({ open, isMainLayer, theme }) =>
      open && isMainLayer ? theme.colors.blueLight : theme.colors.white};
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
    margin-right: 4px;
    margin-left: 4px;
  }
`;

const AktivtKartlagSlider = styled.div`
  width: 100px;
  margin-left: 4px;
  margin-right: 8px;
  margin-bottom: 6px;
`;

const AktivtMainLayerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 8px 0;
  background-color: ${({ theme }) => theme.colors.blueLight};
  padding: 6px;
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
