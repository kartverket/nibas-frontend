import { Suspense } from "react";
import styled from "styled-components";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";

const PageLayout = () => {
  return (
    <Grid>
      <Suspense fallback="Loading...">
        <TopBar />
        <Sidebar />
      </Suspense>
      <Kart />
    </Grid>
  );
};

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    ". topbar"
    "sidebar map";
`;

export default PageLayout;
