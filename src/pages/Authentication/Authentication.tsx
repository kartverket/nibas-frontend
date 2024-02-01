import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Logo } from "@kvib/react";
import ActionCard from "components/ActionCard";
import { Page } from "components/Page";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { styled } from "styled-components";
import { AuthorizationStatus, useAuthorization } from "./AuthHooks";
import { ErrorBox } from "./AuthenticationErrorBox";

const Authentication = () => {
    return (
        <AuthenticationPage>
            <Logo />
            <AuthenticationBody />
            <PrivacyFooter />
        </AuthenticationPage>
    );
};

const AuthenticationBody = () => {
    const { status } = useAuthorization();
    const { handleAuthenticateFunc } = useAuthenticationFlow();

    if (status === AuthorizationStatus.ERROR) {
        return (
            <ErrorBox
                title="En feil skjedde ved pålogging."
                text="Det skjedde en uventet feil under påloggingen. Du kan forsøke å laste siden på nytt, eller logge ut og forsøke å logge inn på nytt. Om feilen vedvarer er det fint om du tar kontakt med Kartverket."
            />
        );
    }

    if (status === AuthorizationStatus.NOT_AUTHORIZED) {
        return (
            <ErrorBox
                title="Du har ikke tilgang til å se inndelingsbasen."
                text="Vennlist kontakt Kartverket hvis du mener dette er en feil."
            />
        );
    }

    return (
        <ActionCard
            title="Logg inn i Nasjonal inndelingsbase"
            description="Denne tjenesten er kun tilgjengelig for autoriserte brukere"
            onClick={() => handleAuthenticateFunc("/")}
        />
    );
};

const AuthenticationPage = styled(Page)`
    gap: 48px;
`;

export default Authentication;
