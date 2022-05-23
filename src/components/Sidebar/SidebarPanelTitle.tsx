import styled from "styled-components";
import Button from "components/form/Button";
import { ReactComponent as CaretLeft } from "icons/caretleft.svg";

type Props = {
  closePanel: () => void;
  title: string;
};

const SidebarPanelTitle = ({ title, closePanel }: Props) => {
  return (
    <TitleWrapper>
      <StyledTitle>{title}</StyledTitle>
      <CloseButton
        icon={<CaretLeft aria-label={`Lukk ${title}`} />}
        onClick={closePanel}
        variant="unstyled"
      ></CloseButton>
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

const StyledTitle = styled.h3`
  margin: 0;
`;

const CloseButton = styled(Button)`
  svg {
    width: 36px;
    height: 36px;
  }
`;

export default SidebarPanelTitle;
