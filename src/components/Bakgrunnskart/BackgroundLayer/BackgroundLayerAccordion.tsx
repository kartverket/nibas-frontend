import { forwardRef, ReactElement, useState } from "react";
import styled from "styled-components";
import useLayerOpacity from "./useLayerOpacity";
import Button from "components/form/Button";
import Slider from "components/form/Slider";
import Icon from "components/Icon";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";

const getCaretIcon = (open: boolean) => {
  if (open) {
    return <Icon icon="expand_less" aria-label="Lukk" />;
  } else {
    return <Icon icon="expand_more" aria-label="Åpne" />;
  }
};

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

    const renderNameAndCaret = () => {
      // hvis hovedlag som kan dras på, vis annen musepeker på navnet
      if (props.isMainLayer && ref) {
        let icon: ReactElement | undefined = undefined;
        if (props.mappedLayer.layers.length > 0) {
          icon = getCaretIcon(open);
        }

        return (
          <ClickableName
            variant="unstyled"
            onClick={() => setOpen(!open)}
            icon={icon}
          >
            {visible && props.mappedLayer.layers.length === 0 ? (
              <span>{props.mappedLayer.title}</span>
            ) : (
              <span>{props.mappedLayer.title}</span>
            )}
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
          >
            <span>{props.mappedLayer.title}</span>
          </ClickableName>
        );
      }

      // ellers bare render tittelen til sub-laget
      return <span>{props.mappedLayer.title}</span>;
    };

    const renderAktivtMainLayer = () => {
      return (
        <DraggableLayer ref={ref}>
          <AktivtMainLayerWrapper>
            <div>
              <Icon icon="reorder" aria-label={`Bytt rekkefølge på kartlag`} />
              <span>{props.mappedLayer.title}</span>
            </div>
            <div>
              <Slider
                min={0}
                max={100}
                value={opacity ?? 100}
                onChange={onSliderChange}
              />
            </div>
          </AktivtMainLayerWrapper>
        </DraggableLayer>
      );
    };

    const renderAktivtSubLayer = () => {
      if (visible && props.mappedLayer.layers.length === 0) {
        return (
          <AktivtSubLayerWrapper>
            <span>{props.mappedLayer.title}</span>
            <Icon
              icon="remove"
              aria-label={`Fjern fra aktive kartlag`}
              onClick={onVisibilityClick}
            />
          </AktivtSubLayerWrapper>
        );
      }

      return;
    };

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
        <Wrapper indent={indent}>
          {renderNameAndCaret()}
          {props.mappedLayer.layers.length == 0 && (
            <IconButton onClick={onVisibilityClick}>
              {!visible && (
                <Icon
                  icon="add"
                  aria-label={`Vis ${props.mappedLayer.title}`}
                />
              )}
            </IconButton>
          )}
        </Wrapper>
        {open && children}
      </div>
    );
  }
);

BackgroundLayerAccordion.displayName = "BackgroundLayerAccordion";

const IconButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))``;

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

const AktivtKartlagName = styled.span<{ visible: boolean }>`
  color: ${({ theme }) => theme.colors.grayLight};
`;

const ClickableName = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;

  > :first-child {
    flex: 1;
    text-align: left;
  }
`;

const DraggableLayer = styled.span`
  cursor: move;
`;

const AktivtMainLayerWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-around;
  margin: 8px 0;
  > :first-child {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: unset;
    justify-content: left;

    > :first-child {
      margin-right: 4px;
      margin-left: 4px;
    }
  }
  div:nth-child(2) {
    width: 100px;
    margin-left: 4px;
  }
`;

const AktivtSubLayerWrapper = styled.div`
  margin-left: 38px;
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content: space-between;
`;

export default BackgroundLayerAccordion;
