import styled from "styled-components";
import Button from "components/form/Button";
import { SidebarPanel, useSidebarPanel } from "contexts/SidebarPanelContext";

type Props = {
  title: string;
  panel: SidebarPanel;
  icon: React.ReactNode;
};

const SidebarButton = ({ title, panel, icon }: Props) => {
  const { isOpen, togglePanel } = useSidebarPanel(panel);

  return (
    <Wrapper>
      <StyledButton active={isOpen} onClick={togglePanel} title={title}>
        {icon}
        <SidebarButtonTitle>{title}</SidebarButtonTitle>
      </StyledButton>
    </Wrapper>
  );
};

type StyledButtonProps = {
  active: boolean;
};

const StyledButton = styled(Button).attrs(() => ({
  variant: "icon",
}))<StyledButtonProps>`
  display: block;
  margin: 8px 0;
  padding: 8px 0;
  width: 100%;
  z-index: 2;

  border-top: 2px solid
    ${(props) => (props.active ? props.theme.colors.blue : "transparent")};
  border-bottom: 2px solid
    ${(props) => (props.active ? props.theme.colors.blue : "transparent")};
  border-right: 2px solid
    ${(props) => (props.active ? props.theme.colors.white : "transparent")};
  color: ${({ active, theme }) =>
    active ? theme.colors.blue : theme.colors.black};

  :hover {
    border-color: ${({ theme }) => theme.colors.blue};
    border-right-color: ${({ theme }) => theme.colors.white};
  }
`;

const SidebarButtonTitle = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.blue};
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default SidebarButton;
