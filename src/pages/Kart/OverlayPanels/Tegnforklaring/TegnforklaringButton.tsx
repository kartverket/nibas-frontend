import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { IconButton, Tooltip } from "@kvib/react";

export const TegnforklaringButton = () => {
  const { toggleOverlayPanel } = useOverlayPanel();

  return (
    // TODO: missing hasArrow prop, placement=left
    <Tooltip content="Vis tegnforklaring for grensetypene i kartet">
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
  top: 12px;
  right: 14px;
  border-radius: 50%;
  box-shadow: var(--kvib-shadows-sm);
`;
