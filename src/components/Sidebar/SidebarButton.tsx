import styled from "styled-components";
import Button from "components/form/Button";
import { SidebarPanel, useSidebarPanel } from "contexts/SidebarPanelContext";

type Props = {
  title: string;
  panel: SidebarPanel;
  icon: React.ReactNode;
};

const SidebarButton = ({ title, panel, icon }: Props) => {
  const { activeSidebarPanel, setActiveSidebarPanel, closeSidebar } =
    useSidebarPanel();

  const toggleSidebar = () => {
    if (activeSidebarPanel) {
      closeSidebar();
    } else {
      setActiveSidebarPanel(panel);
    }
  };

  return (
    <Wrapper>
      <StyledButton
        active={activeSidebarPanel === panel}
        onClick={toggleSidebar}
        title={title}
      >
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
  margin: 0 0 8px;
  padding: 8px 6px 8px 0;
  width: 100%;
  z-index: 2;
  text-align: center;
  border-left: 5px solid
    ${({ active }) => (active ? "var(--blue_dark)" : "transparent")};

  color: ${({ active }) => (active ? "var(--blue)" : "var(--black)")};

  background-color: ${({ active }) =>
    active ? "var(--blue_light)" : "transparent"};

  :hover {
    background-color: var(--blue_light);
  }

  & ${SidebarButtonTitle} {
    color: ${({ active }) => (active ? "var(--blue)" : "var(--black)")};
    font-weight: ${({ active }) => (active ? 600 : 400)};
  }

  :focus-visible {
    box-shadow: 0px 0px 0px 2px var(--blue_dark) inset;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default SidebarButton;
