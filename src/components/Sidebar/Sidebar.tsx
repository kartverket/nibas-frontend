import styled from "styled-components";

type Props = {
  onLayersClick: () => void;
  onEditClick: () => void;
};

const Sidebar = ({ onLayersClick, onEditClick }: Props) => {
  return (
    <StyledSidebar>
      <button onClick={onEditClick}>Edit</button>
      <button onClick={onLayersClick}>Layers</button>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  grid-area: sidebar;
  background-color: #bbb;
  position: relative;

  button {
    display: block;
  }
`;

export default Sidebar;
