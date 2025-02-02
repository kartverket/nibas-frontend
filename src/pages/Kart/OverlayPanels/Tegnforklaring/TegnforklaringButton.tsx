import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { IconButton, Tooltip } from "@kvib/react";

export const TegnforklaringButton = () => {
  const { toggleOverlayPanel } = useOverlayPanel();

  return (
    <Tooltip label="Vis tegnforklaring for grensetypene i kartet" placement="left">
      <RoundButton
        onClick={() => toggleOverlayPanel("tegnforklaring")}
        aria-label="Åpne og lukke tegnforklaring"
        icon="question_mark"
        size="sm"
      />
    </Tooltip>
  );
};

const RoundButton = styled(IconButton)`
  position: absolute;
  grid-area: overlay;
  top: 12px;
  right: 14px;
  border-radius: 50%;
  box-shadow: var(--kvib-shadows-sm);
`;
