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
              icon="format_line_spacing"
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

  color: ${({ theme, visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? theme.colors.gray : theme.colors.blueDark};

  margin: 0 8px;
  opacity: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? 0.4 : 1};
  border-radius: 50%;
  padding: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.blueLight};
    color: ${({ theme }) => theme.colors.blueDark};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }
`;

const Caret = styled.div<{ open: boolean }>`
  color: ${({ theme, open }) =>
    open ? theme.colors.white : theme.colors.blueDark};
  background-color: ${({ open, theme }) =>
    open ? theme.colors.blueDark : theme.colors.white};

  height: 100%;
  padding: 0 12px;
  align-items: center;
  display: flex;

  &:hover {
    background: ${({ theme }) => theme.colors.blueDark};
    color: ${({ theme }) => theme.colors.white};
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

const SubKartlagName = styled.span<{ activeLayer?: boolean }>`
  color: ${({ activeLayer, theme }) =>
    activeLayer ? theme.colors.gray : theme.colors.black};
  display: flex;
  justify-content: space-between;
  padding: 8px 0 8px 16px;
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
    background-color: ${({ open, dropDown, theme }) =>
      open && dropDown ? theme.colors.blueLight : theme.colors.white};
    padding-top: ${({ dropDown }) => (dropDown ? 16 : 0)}px;
    padding-bottom: ${({ dropDown }) => (dropDown ? 16 : 0)}px;
    padding-left: 16px;
    border-left: 3px solid
      ${({ theme, open }) => (open ? theme.colors.blueDark : "transparent")};
    background: ${({ open, theme }) =>
      open ? theme.colors.blueLight : theme.colors.white};
  }

  > :nth-child(2) {
    background: ${({ open, theme }) =>
      open ? theme.colors.blueDark : theme.colors.white};
    color: ${({ open, theme }) =>
      open ? theme.colors.white : theme.colors.blueDark};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }

  &:hover {
    > :first-child {
      background: ${({ theme }) => theme.colors.blueLight};
    }

    > :nth-child(2) {
      background: ${({ theme }) => theme.colors.blueDark};
      color: ${({ theme }) => theme.colors.white};
    }
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

    height: 100%;
    padding: 5px;
  }

  &:hover {
    ${Icon} {
      color: ${({ theme }) => theme.colors.blueDark};
      background: ${({ theme }) => theme.colors.blueLight};
      border-radius: 50%;
    }
  }

  &:active {
    ${Icon} {
      color: ${({ theme }) => theme.colors.white};
      background: ${({ theme }) => theme.colors.blueDark};
      border-radius: 50%;
    }
  }
`;

const AktivtKartlagSlider = styled.div`
  width: 64px;
  margin-left: 4px;
  margin-right: 20px;
  margin-bottom: 6px;

  > :first-child {
    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.blueDark};
      outline-offset: 8px;
    }
  }
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
  padding: 4px 0 4px 4px;
`;

export default BackgroundLayerAccordion;
