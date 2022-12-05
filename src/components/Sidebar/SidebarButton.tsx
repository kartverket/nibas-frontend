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
  variant: "unstyled",
}))<StyledButtonProps>`
  display: block;
  margin: 8px 0;
  padding: 8px 0;
  width: 100%;
  z-index: 2;
  text-align: center;

  border-top: 2px solid
    ${(props) => (props.active ? "var(--blue)" : "transparent")};
  border-bottom: 2px solid
    ${(props) => (props.active ? "var(--blue)" : "transparent")};
  border-right: 2px solid
    ${(props) => (props.active ? "var(--white)" : "transparent")};
  color: ${({ active }) => (active ? "var(--blue)" : "var(--black)")};

  :hover {
    border-color: var(--blue);
    border-right-color: var(--white);
  }
`;

const SidebarButtonTitle = styled.p`
  margin: 0;
  font-size: 11px;
  color: var(--blue);
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default SidebarButton;
