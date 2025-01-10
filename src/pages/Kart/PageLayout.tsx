import { Suspense } from "react";
import { styled } from "styled-components";
import { SWRConfig } from "swr";
import Kart from "./Kart";
import AlertModal from "components/Modals/AlertModal";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { isApiError, statusCode } from "utils/api";
import { ApiErrorResponse } from "../../types/api";
import Header from "./Header/Header";
import { useAuthRenewError } from "components/Authentication/AuthRenewError";

const PageLayout = () => {
  const { error, setError } = useErrorHandling();
  const { setAuthRenewError } = useAuthRenewError();

  return (
    <Grid>
      <SWRConfig
        value={{
          fetcher: (url) => fetch(url).then((res) => res.json()),
          onError: (err) => {
            if (statusCode.isForbidden(err.response?.status) || statusCode.isUnauhtorized(err.response?.status)) {
              setAuthRenewError(true);
            } else if (statusCode.isError(err.response?.status) && isApiError(err)) {
              const wrapper = err as ApiErrorResponse;
              setError({
                ...wrapper.errorDescription,
                errorCode: wrapper.errorCode,
              });
            } else {
              setError({
                title: `En ukjent feil har oppstått`,
                description: `Oppdater siden og prøv igjen. Dersom feilen vedvarer, kan du ta kontakt med Kartverket. Oppgi feilkoden ${err.response?.status} og en beskrivelse på hva du gjorde idet feilen oppsto.`,
              });
            }
          },
        }}
      >
        <Suspense fallback="Laster inn...">
          <Header />
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
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export default PageLayout;
