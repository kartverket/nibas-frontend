import styled from "styled-components";
import CloseButton from "components/form/CloseButton";
import { Heading } from "@kvib/react";

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
      <CloseButton onClick={closePanel} aria-label={`Lukk ${title}`} />
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: 2px solid var(--gray_light);
  padding: 0 3px 8px 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default SidebarPanelTitle;
