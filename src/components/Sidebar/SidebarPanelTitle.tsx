import styled from "styled-components";
import { CloseButton, Heading } from "@kvib/react";

type Props = {
  closePanel: () => void;
  title: string;
};

const SidebarPanelTitle = ({ title, closePanel }: Props) => {
  return (
    <TitleWrapper>
      <Heading as="h2" size="md">
        {title}
      </Heading>
      <CloseButton
        onClick={closePanel}
        aria-label={`Lukk ${title}`}
        size="lg"
      />
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: 2px solid var(--kvib-colors-gray-50);
  padding: 0 3px 8px 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default SidebarPanelTitle;
