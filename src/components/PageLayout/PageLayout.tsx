import { Suspense, useState } from "react";
import styled from "styled-components";
import { SWRConfig } from "swr";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import AlertModal from "components/AlertModal";
import { useTranslation } from "react-i18next";

const PageLayout = () => {
  const { t } = useTranslation();
  const [errorStatus, setErrorStatus] = useState(200);
  const { redigeringsmodusAktiv } = useRedigeringsmodus();

  return (
    <Grid utkastActive={redigeringsmodusAktiv}>
      <SWRConfig
        value={{
          onError: (error) => {
            setErrorStatus(error.status);
          },
        }}
      >
        <Suspense fallback="Loading...">
          <TopBar />
          <Sidebar />
          <AlertModal
            status="error"
            title="Får ikke kontakt med systemet"
            body={`Vi får ikke kontakt med basen. Vennligst prøv igjen senere. Om feilen fortsetter, ta gjerne kontakt med Kartverket. Feilkode: ${errorStatus}`}
            isOpen={errorStatus >= 400}
            onClose={() => setErrorStatus(200)}
            primaryAction={{
              text: t("action.Lukk"),
              onClick: () => setErrorStatus(200),
            }}
          />
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
      ${({ utkastActive }) =>
        utkastActive ? "var(--yellow_dark)" : "transparent"};
    z-index: -99999;
  }
`;

export default PageLayout;
