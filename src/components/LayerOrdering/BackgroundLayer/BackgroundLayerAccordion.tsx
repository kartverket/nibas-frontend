import { useState } from "react";
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
};

const BackgroundLayerAccordion: React.FC<Props> = ({
  mappedLayer,
  indent,
  visible,
  onVisibilityClick,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Wrapper indent={indent}>
        <Button variant="icon" onClick={onVisibilityClick}>
          {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </Button>
        <span>{mappedLayer.title}</span>
        {mappedLayer.layers.length > 0 && (
          <Button variant="icon" onClick={() => setOpen(!open)}>
            {open ? <CaretUpIcon /> : <CaretDownIcon />}
          </Button>
        )}
      </Wrapper>

      {open && children}
    </div>
  );
};

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

export default BackgroundLayerAccordion;
