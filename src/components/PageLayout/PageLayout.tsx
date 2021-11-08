import { useState } from "react";
import styled from "styled-components";
import Map from "components/Map";
import Sidebar from "components/Sidebar";

const PageLayout = () => {
  // navn er ikke helt riktige
  const [backgroundLayersOpen, setBackgroundLayersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const onLayersClick = () => {
    setEditOpen(false);
    setBackgroundLayersOpen(!backgroundLayersOpen);
  };

  const onEditClick = () => {
    setBackgroundLayersOpen(false);
    setEditOpen(!editOpen);
  };

  return (
    <Grid>
      <Sidebar onLayersClick={onLayersClick} onEditClick={onEditClick} />
      <Map backgroundLayersOpen={backgroundLayersOpen} editingOpen={editOpen} />
    </Grid>
  );
};

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 30px 1fr;
  grid-template-areas:
    ". topbar"
    "sidebar map";
`;

export default PageLayout;
