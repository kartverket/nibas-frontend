import { useOverlayPanel } from "contexts/OverlayPanelContext";
import styled from "styled-components";
import { Button } from "@kvib/react";

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
    <RoundButton onClick={onClick} ariaLabel="Åpne og lukke tegnforklaring">
      ?
    </RoundButton>
  );
};

const RoundButton = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  font-size: 24px;
`;
