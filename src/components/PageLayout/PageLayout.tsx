import { Suspense, useState } from "react";
import styled from "styled-components";
import { SWRConfig } from "swr";
import Feedback from "components/Feedback/Feedback";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";

const PageLayout = () => {
  const [errorFeedback, setErrorFeedback] = useState("");

  return (
    <Grid>
      <SWRConfig
        value={{
          onError: (error) => {
            if (error.status >= 500) {
              setErrorFeedback(error.message);
            }
          },
        }}
      >
        <Suspense fallback="Loading...">
          <TopBar />
          <Sidebar />
          <Feedback
            type="negative"
            title="Noe galt har skjedd"
            isOpen={errorFeedback !== ""}
            onClose={() => setErrorFeedback("")}
          >
            {errorFeedback}
          </Feedback>
        </Suspense>
        <Kart />
      </SWRConfig>
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
