import { Suspense, useState } from "react";
import styled from "styled-components";
import { SWRConfig } from "swr";
import Feedback from "components/Feedback/Feedback";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";

const PageLayout = () => {
  const [errorFeedback, setErrorFeedback] = useState("");
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  return (
    <Grid utkastActive={redigeringsmodusAktiv}>
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
            title="Det har skjedd en feil"
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

const Grid = styled.div<{ utkastActive: boolean }>`
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    ". topbar"
    "sidebar map";

  &::after {
    content: "";
    display: block;
    position: absolute;
    width: 100vw;
    height: 100vh;
    border: 6px solid
      ${({ utkastActive }) => (utkastActive ? "#ffbf00" : "transparent")};
    z-index: -99999;
  }
`;

export default PageLayout;
