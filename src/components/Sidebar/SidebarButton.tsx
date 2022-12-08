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

const SidebarButtonTitle = styled.p`
  margin: 0;
  font-size: 11px;
`;

const StyledButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<StyledButtonProps>`
  display: block;
  margin: 8px 0;
  padding: 8px 6px 8px 0;
  width: 100%;
  z-index: 2;
  text-align: center;
  border-left: 5px solid
    ${({ active, theme }) => (active ? theme.colors.blueDark : "transparent")};

  color: ${({ active, theme }) =>
    active ? theme.colors.blue : theme.colors.black};

  background-color: ${({ active, theme }) =>
    active ? theme.colors.blueLight : "transparent"};

  :hover {
    background-color: ${({ theme }) => theme.colors.blueLight};
  }

  & ${SidebarButtonTitle} {
    color: ${({ active, theme }) =>
      active ? theme.colors.blue : theme.colors.black};
    font-weight: ${({ active }) => (active ? 600 : 400)};
  }

  :focus-visible {
    box-shadow: 0px 0px 0px 2px ${({ theme }) => theme.colors.blueDark} inset;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default SidebarButton;
