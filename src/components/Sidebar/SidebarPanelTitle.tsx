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
        icon={<Icon icon="close" aria-label={`Lukk ${title}`} />}
        onClick={closePanel}
        variant="unstyled"
      />
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grayLight};
  padding: 0 3px 8px 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled(Heading)`
  margin: 0;
`;

const CloseButton = styled(Button)`
  border-radius: 50%;

  > span {
    font-size: 28px;
    color: ${({ theme }) => theme.colors.blueDark};
    padding: 6px;
    border-radius: 50%;

    &:hover {
      background-color: ${({ theme }) => theme.colors.blueLight};
    }
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.blueDark};
  }
`;

export default SidebarPanelTitle;
