import styled from "styled-components";
import Heading from "components/typography/Heading";
import CloseButton from "components/form/Button/CloseButton";

type Props = {
  closePanel: () => void;
  title: string;
};

const SidebarPanelTitle = ({ title, closePanel }: Props) => {
  return (
    <TitleWrapper>
      <StyledTitle tag="h2" size="xs">
        {title}
      </StyledTitle>
      <CloseButton onClick={closePanel} />
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

const StyledTitle = styled(Heading)`
  margin: 0;
`;

export default SidebarPanelTitle;
