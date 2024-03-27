import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { IconButton, Tooltip } from "@kvib/react";

export const TegnforklaringButton = () => {
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  const onClick = () => {
    if (activeOverlayPanel === "tegnforklaring") {
      closeOverlayPanel();
    } else {
      openOverlayPanel("tegnforklaring");
    }
  };

  return (
    <Tooltip label="Vis tegnforklaring for grensetypene i kartet" hasArrow>
      <RoundButton onClick={onClick} aria-label="Åpne og lukke tegnforklaring" icon="question_mark" />
    </Tooltip>
  );
};

const RoundButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 50%;
  box-shadow: var(--kvib-shadows-base);
`;
