import { Suspense } from "react";
import styled from "styled-components";
import { SWRConfig } from "swr";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import AlertModal from "components/Status/AlertModal";
import { useTranslation } from "react-i18next";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { ApiErrorResponse } from "../../types/api";

const PageLayout = () => {
  const { t } = useTranslation();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();
  const { error, setError } = useErrorHandling();

  return (
    <Grid utkastActive={redigeringsmodusAktiv}>
      <SWRConfig
        value={{
          fetcher: (url) => fetch(url).then((res) => res.json()),
          onError: (err) => {
            // TODO: lar denne stå inntil vi ser hvor mye feilaktige errors som oppstår
            // eslint-disable-next-line no-console
            console.log("onError", err);
            if (statusCode.isError(err.status)) {
              const wrapper = err as ApiErrorResponse;
              setError({
                ...wrapper.errorDescription,
                errorCode: wrapper.errorCode,
              });
            }
          },
        }}
      >
        <Suspense fallback="Loading...">
          <TopBar />
          <Sidebar />
        </Suspense>
        <Kart />
        {error && (
          <AlertModal
            status="error"
            title={error.title}
            description={error.description}
            additionalInfo={error.additionalInfo}
            errorCode={error.errorCode}
            isOpen={true}
            onClose={() => setError(null)}
            primaryAction={{
              text: t("action.Lukk"),
              onClick: () => setError(null),
            }}
          />
        )}
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
