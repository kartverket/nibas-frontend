import { styled, keyframes } from "styled-components";
import { AbsolutePanel, PanelProps } from "./Panel";
import { CloseButton, Select, Text } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

export const KoordinatSystemPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();

  return (
    <Container $isOpen={isOpen}>
      <AbsoluteCloseButton onClick={() => closeOverlayModal()} aria-label="Lukk" size={"sm"} />
      <Wrapper>
        <Text as={"b"} fontSize={"lg"}>
          Koordinatsystem
        </Text>

        <Select></Select>
      </Wrapper>
    </Container>
  );
};

const AbsoluteCloseButton = styled(CloseButton)`
  position: absolute;
  right: 8px;
  top: 8px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled(AbsolutePanel)`
  top: 48px;
  left: 8px;
  padding: 16px;
  width: 340px;
  max-width: unset;
  margin: unset;
  animation: ${fadeIn} 0.25s ease-in-out;
  border-radius: 8px;
  transform: translateX(0);
`;
