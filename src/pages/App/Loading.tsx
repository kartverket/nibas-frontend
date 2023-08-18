import { styled } from "styled-components";
import { Modal, ModalContent, ModalOverlay, Spinner } from "@kvib/react";

type Props = {
  isLoading: boolean;
};

const Loading = ({ isLoading }: Props) => (
  <Modal isOpen={isLoading} onClose={() => undefined} isCentered size="xs">
    <ModalOverlay />
    <Content>
      <Spinner size="xl" color="var(--kvib-colors-blue-500)" />
    </Content>
  </Modal>
);

const Content = styled(ModalContent)`
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1;
`;

export default Loading;
