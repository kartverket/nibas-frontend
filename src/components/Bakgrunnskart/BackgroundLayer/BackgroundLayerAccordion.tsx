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

    const getAddRemove = (aktivtKartlag: boolean) => (
      <AddRemove
        onClick={onVisibilityClick}
        aktivtKartlag={aktivtKartlag}
        visible={visible}
      >
        <AddRemoveIcon
          title={props.mappedLayer.title}
          type={visible ? "REMOVE" : "ADD"}
        />
      </AddRemove>
    );
    const renderNameAndCaret = () => {
      // hvis hovedlag uten barn
      if (props.isMainLayer && props.mappedLayer.layers.length === 0) {
        return (
          <AddableLayer
            onClick={() => onVisibilityClick()}
            icon={
              <AddRemoveIcon
                title={props.mappedLayer.title}
                type={visible ? "REMOVE" : "ADD"}
              />
            }
          >
            <span>{props.mappedLayer.title}</span>
          </AddableLayer>
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
        <AddableLayer
          activeLayer={visible}
          onClick={() => onVisibilityClick()}
          icon={getAddRemove(false)}
        >
          {props.mappedLayer.title}
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
          <AktivtKartlagSlider>
            <Slider
              min={0}
              max={100}
              value={opacity ?? 100}
              onChange={onSliderChange}
            />
          </AktivtKartlagSlider>
          <RemoveAktivtKartlag variant="unstyled" icon={getAddRemove(true)} />
        </AktivtMainLayerWrapper>
      );
    };

    const renderAktivtSubLayer = () => {
      if (visible && props.mappedLayer.layers.length === 0) {
        return (
          <AktivtSubLayerWrapper
            icon={getAddRemove(true)}
            onClick={() => onVisibilityClick()}
          >
            <span>{props.mappedLayer.title}</span>
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

type AddRemoveIconProps = {
  title: string;
  type: "ADD" | "REMOVE";
};

const AddRemoveIcon = ({ title, type }: AddRemoveIconProps) => {
  switch (type) {
    case "ADD":
      return <BlueIcon icon="add" aria-label={`Vis ${title}`} />;
    case "REMOVE":
      return <BlueIcon icon="remove" aria-label={`Fjern ${title}`} />;
  }
};

const AddRemove = styled.div<{ visible: boolean; aktivtKartlag: boolean }>`
  cursor: pointer;

  color: ${({ theme, visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? theme.colors.gray : theme.colors.blueDark};

  margin: 0 8px;
  opacity: ${({ visible, aktivtKartlag }) =>
    visible && !aktivtKartlag ? 0.4 : 1};
  border-radius: 50%;
  padding: 4px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.blueLight};
    color: ${({ theme }) => theme.colors.blueDark};
  }
`;

const RemoveAktivtKartlag = styled(Button)`
  &:focus-visible {
    ${AddRemove} {
      outline: 2px solid ${({ theme }) => theme.colors.blueDark};
      outline-offset: 2px;
    }
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

const BlueIcon = styled(Icon)`
  padding: 0 12px;
  color: var(--blue_dark);
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

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }

  &:hover {
    > :first-child {
      background: ${({ theme }) => theme.colors.blueLight};
    }

    ${Caret} {
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

const AktivtSubLayerWrapper = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
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
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 8px;
  }

  &:hover {
    ${AddRemove} {
      color: ${({ theme }) => theme.colors.white};
      background: ${({ theme }) => theme.colors.blueDark};
    }
  }
`;

const AddableLayer = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ activeLayer?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  padding: 6px 0 6px 6px;

  > :first-child {
    flex: 1;
    text-align: left;
  }

  &:hover {
    ${AddRemove} {
      background: ${({ theme }) => theme.colors.blueLight};
      color: ${({ theme }) => theme.colors.blueDark};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
    outline-offset: 2px;
  }
`;

export default BackgroundLayerAccordion;
