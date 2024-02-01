import { Suspense } from "react";
import { styled } from "styled-components";
import { SWRConfig } from "swr";
import Kart from "pages/Kart";
import AlertModal from "components/Modals/AlertModal";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { isApiError, statusCode } from "utils/api";
import { ApiErrorResponse } from "../../types/api";
import Header from "./Header/Header";
import frontendLogger from "components/FrontendLogger/FrontendLogger";

const PageLayout = () => {
    const { error, setError } = useErrorHandling();

    return (
        <Grid>
            <SWRConfig
                value={{
                    fetcher: (url) => fetch(url).then((res) => res.json()),
                    onError: (err) => {
                        frontendLogger.error("Noe gikk galt med kall til baksystem", err);
                        if (statusCode.isError(err.response?.status) && isApiError(err)) {
                            const wrapper = err as ApiErrorResponse;
                            setError({
                                ...wrapper.errorDescription,
                                errorCode: wrapper.errorCode,
                            });
                        } else {
                            setError({
                                title: `Ukjent feil`,
                                description: `En ukjent feil oppstod med. Kall mot backtjenesten feilet med responskode ${err.response?.status}.`,
                            });
                        }
                    },
                }}
            >
                <Suspense fallback="Loading...">
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
    height: 100%;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
        "header header"
        "sidebar map";
`;

export default PageLayout;
