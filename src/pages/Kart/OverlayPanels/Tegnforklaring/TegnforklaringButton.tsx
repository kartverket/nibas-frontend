import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import { IconButton } from "@kvib/react";

export const TegnforklaringButton = () => {
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();

  const onClick = () => {
    if (activeOverlayPanel === "tegnforklaring") {
      closeOverlayPanel();
    } else {
      openOverlayPanel("tegnforklaring");
    }
  };

  return (
    <RoundButton
      onClick={onClick}
      aria-label="Åpne og lukke tegnforklaring"
      icon="question_mark"
    />
  );
};

const RoundButton = styled(IconButton)`
  position: absolute;
  top: 16px;
  right: 16px;
  border-radius: 50%;
`;
