import styled from "styled-components";
import Button from "components/form/Button";
import Icon from "components/Icon";
import Heading from "components/typography/Heading";

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
      <CloseButton
        icon={<Icon icon="chevron_left" aria-label={`Lukk ${title}`} />}
        onClick={closePanel}
        variant="unstyled"
      />
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled(Heading)`
  margin: 0;
`;

const CloseButton = styled(Button)`
  > span {
    font-size: 36px;
  }
`;

export default SidebarPanelTitle;
