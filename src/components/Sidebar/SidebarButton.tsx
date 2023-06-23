import { styled } from "styled-components";
import { SidebarPanel, useSidebarPanel } from "contexts/SidebarPanelContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Button } from "@kvib/react";

type Props = {
  title: string;
  panel: SidebarPanel;
  icon: React.ReactNode;
};

const SidebarButton = ({ title, panel, icon }: Props) => {
  const { activeSidebarPanel, openSidebarPanel, closeSidebarPanel } =
    useSidebarPanel();
  const { closeOverlayPanel } = useOverlayPanel();

  const toggleSidebar = () => {
    if (activeSidebarPanel === panel) {
      closeSidebarPanel();
    } else {
      openSidebarPanel(panel);
      closeOverlayPanel();
    }
  };

  return (
    <Wrapper>
      <StyledButton
        isActivated={activeSidebarPanel === panel}
        onClick={toggleSidebar}
        title={title}
      >
        {icon}
        <SidebarButtonTitle>{title}</SidebarButtonTitle>
      </StyledButton>
    </Wrapper>
  );
};

const SidebarButtonTitle = styled.p`
  margin: 0;
  font-size: 11px;
`;

const StyledButton = styled(Button)<{ isActivated: boolean }>`
  display: block;
  height: unset;
  margin: 0 0 8px;
  padding: 8px 6px 8px 0;
  width: 100%;
  z-index: 2;
  text-align: center;
  border-radius: 0;
  border-left: 5px solid
    ${({ isActivated }) => (isActivated ? "var(--blue_dark)" : "transparent")};

  color: ${({ isActivated }) => (isActivated ? "var(--blue)" : "var(--black)")};

  background-color: ${({ isActivated }) =>
    isActivated ? "var(--blue_light)" : "transparent"};

  &:hover {
    background-color: var(--blue_light);
  }

  & ${SidebarButtonTitle} {
    color: ${({ isActivated }) =>
      isActivated ? "var(--blue)" : "var(--black)"};
    font-weight: ${({ isActivated }) => (isActivated ? 600 : 400)};
  }

  &:focus-visible {
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
