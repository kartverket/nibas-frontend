import { Suspense } from "react";
import styled from "styled-components";
import { SWRConfig } from "swr";
import Kart from "pages/Kart";
import Sidebar from "components/Sidebar";
import AlertModal from "components/AlertModal";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { ApiErrorResponse } from "../../types/api";

// TODO: Gi denne et bedre navn, kanskje bare "Kart", da Kart-komponenten er lite beskrivende selv
const PageLayout = () => {
  const { error, setError } = useErrorHandling();

  return (
    <Grid>
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
              text: "Lukk",
              onClick: () => setError(null),
            }}
          />
        )}
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
