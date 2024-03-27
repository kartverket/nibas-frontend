import { styled } from "styled-components";
import { ReactElement, ReactNode } from "react";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

type ErrorBoxProps = {
  title: string | ReactElement | ReactNode;
  text: string | ReactElement | ReactNode;
};

export const ErrorBox = ({ title, text }: ErrorBoxProps) => {
  const auth = useAuthentication();

  return (
    <AlertWithButton status="error">
      <AlertIcon />
      <TextContainer>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{text}</AlertDescription>
      </TextContainer>
      <LogoutButton variant="ghost" onClick={() => auth.signOut()}>
        Logg ut
      </LogoutButton>
    </AlertWithButton>
  );
};

const AlertWithButton = styled(Alert)`
  justify-content: space-between;
`;

const TextContainer = styled(Box)`
  flex: 1;
`;

const LogoutButton = styled(Button)`
  min-width: 6rem;
`;
