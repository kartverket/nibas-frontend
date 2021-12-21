import { forwardRef, useState } from "react";
import styled from "styled-components";
import Button from "components/Button";
import { ReactComponent as CaretDownIcon } from "icons/caretdown.svg";
import { ReactComponent as CaretUpIcon } from "icons/caretup.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MappedLayer;
  indent: number;
  onVisibilityClick: () => void;
  visible: boolean;
  children: React.ReactNode;
  isMainLayer?: boolean;
};

const BackgroundLayerAccordion = forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const {
      mappedLayer,
      indent,
      visible,
      onVisibilityClick,
      children,
      isMainLayer = false,
    } = props;
    const [open, setOpen] = useState(false);

    const renderNameAndCaret = () => {
      // hvis hovedlag som kan dras på, vis annen musepeker på navnet
      if (isMainLayer) {
        return (
          <ClickableName variant="unstyled" onClick={() => setOpen(!open)}>
            <DraggableName ref={ref}>{mappedLayer.title}</DraggableName>
            {mappedLayer.layers.length > 0 && (
              <>{open ? <CaretUpIcon /> : <CaretDownIcon />}</>
            )}
          </ClickableName>
        );
      }

      // hvis har sub-lag, la navnet være klikkbart for å åpne accordion
      if (mappedLayer.layers.length > 0) {
        return (
          <ClickableName variant="unstyled" onClick={() => setOpen(!open)}>
            <span>{mappedLayer.title}</span>
            {open ? <CaretUpIcon /> : <CaretDownIcon />}
          </ClickableName>
        );
      }

      // ellers bare render tittelen til sub-laget
      return <span>{mappedLayer.title}</span>;
    };

    return (
      <div>
        <Wrapper indent={indent}>
          {/* <Button variant="icon" onClick={onVisibilityClick}>
            {visible ? (
              <VisibilityIcon aria-label={`Skjul ${mappedLayer.title}`} />
            ) : (
              <VisibilityOffIcon aria-label={`Vis ${mappedLayer.title}`} />
            )}
          </Button>
          <DraggableName ref={ref}>{mappedLayer.title}</DraggableName>
          {mappedLayer.layers.length > 0 && (
            <Button variant="icon" onClick={() => setOpen(!open)}>
              {open ? (
                <CaretUpIcon aria-label={`Lukk ${mappedLayer.title}`} />
              ) : (
                <CaretDownIcon aria-label={`Åpne ${mappedLayer.title}`} />
              )}
            </Button>
          )} */}
          <IconButton onClick={onVisibilityClick}>
            {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          {renderNameAndCaret()}
        </Wrapper>

        {open && children}
      </div>
    );
  }
);

BackgroundLayerAccordion.displayName = "BackgroundLayerAccordion";

const IconButton = styled(Button).attrs(() => ({
  variant: "icon",
}))`
  margin-right: 8px;
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
