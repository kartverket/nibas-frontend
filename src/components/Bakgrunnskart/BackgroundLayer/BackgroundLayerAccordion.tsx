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
  propertiesVisible?: boolean;
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
    const {
      indent,
      visible,
      onVisibilityClick,
      propertiesVisible,
      isAktiveKartlag,
      children,
    } = props;
    const [open, setOpen] = useState(false);
    //const [propertiesVisible, setPropertiesVisible] = useState(prop);
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
            <DraggableName ref={ref}>{props.mappedLayer.title}</DraggableName>
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

    return (
      <div>
        <Wrapper indent={indent}>
          <IconButton onClick={onVisibilityClick}>
            {visible ? (
              <Icon
                icon="visibility"
                aria-label={`Skjul ${props.mappedLayer.title}`}
              />
            ) : (
              <Icon
                icon="visibility_off"
                aria-label={`Vis ${props.mappedLayer.title}`}
              />
            )}
          </IconButton>
          {renderNameAndCaret()}
          {propertiesVisible && (
            <div>
              <Slider
                min={0}
                max={100}
                value={opacity ?? 100}
                onChange={onSliderChange}
              />
            </div>
          )}
          {/* {props.isMainLayer && (
            <PropertiesButton
              onClick={() => setPropertiesVisible(!propertiesVisible)}
            >
              <Icon icon="edit" />
            </PropertiesButton>
          )} */}
        </Wrapper>
        {isAktiveKartlag && (
          <div>
            <Slider
              min={0}
              max={100}
              value={opacity ?? 100}
              onChange={onSliderChange}
            />
          </div>
        )}
        {open && children}
      </div>
    );
  }
);

BackgroundLayerAccordion.displayName = "BackgroundLayerAccordion";

const IconButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  margin-right: 8px;
`;

const PropertiesButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.black};
`;

const Wrapper = styled.div<{ indent: number }>`
  display: flex;
  margin: 8px 0;
  margin-left: ${({ indent }) => indent * 16}px;

  > span {
    flex: 1;
  }
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

const DraggableName = styled.span`
  cursor: move;
`;

export default BackgroundLayerAccordion;
