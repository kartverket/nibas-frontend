import { forwardRef, useState } from "react";
import styled from "styled-components";
import Button from "components/Button";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";
import { ReactComponent as Visibility } from "icons/visibility.svg";
import { ReactComponent as VisibilityOff } from "icons/visibility_off.svg";
import { MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MappedLayer;
  indent: number;
  onVisibilityClick: () => void;
  visible: boolean;
  children: React.ReactNode;
};

const LayerAccordion = forwardRef<HTMLDivElement, Props>(
  ({ mappedLayer, indent, visible, onVisibilityClick, children }, ref) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Wrapper indent={indent}>
          <Button variant="icon" onClick={onVisibilityClick}>
            {visible ? <Visibility /> : <VisibilityOff />}
          </Button>
          <DraggableName ref={ref}>{mappedLayer.title}</DraggableName>
          {mappedLayer.layers.length > 0 && (
            <Button variant="icon" onClick={() => setOpen(!open)}>
              {open ? <CaretUp /> : <CaretDown />}
            </Button>
          )}
        </Wrapper>

        {open && children}
      </div>
    );
  }
);

LayerAccordion.displayName = "LayerAccordion";

const Wrapper = styled.div<{ indent: number }>`
  display: flex;
  margin: 8px 0;
  margin-left: ${({ indent }) => indent * 16}px;

  > span {
    flex: 1;
  }

  button {
    margin: 0 4px;
  }
`;

const DraggableName = styled.span`
  cursor: move;
`;

export default LayerAccordion;
