import styled from "styled-components";
import { ReactElement, ReactNode } from "react";
import Icon from "../Icon/Icon";
import Button from "../form/Button";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

type ErrorBoxProps = {
  title: string | ReactElement | ReactNode;
  text: string | ReactElement | ReactNode;
};

export const ErrorBox = ({ title, text }: ErrorBoxProps) => {
  const { handleLogoutFunc } = useAuthenticationFlow();

  return (
    <ErrorBoxWrapper>
      <ExclamationIcon />
      <TextWrapper>
        <ErrorTitle>{title}</ErrorTitle>
        <ErrorText>{text}</ErrorText>
      </TextWrapper>
      <LogoutButton variant="tertiary" onClick={handleLogoutFunc}>
        Logg ut
      </LogoutButton>
    </ErrorBoxWrapper>
  );
};

const LogoutButton = styled(Button)`
  min-width: 6rem;
`;

const TextWrapper = styled.div`
  display: block;
  margin-right: auto;
`;

const ErrorTitle = styled.h3`
  font-weight: 900;
  margin: 0 0 0.5rem 0;
`;

const ErrorText = styled.p`
  margin: 0;
`;

const ExclamationIcon = styled(Icon).attrs({ icon: "info" })`
  font-size: 2rem;
`;

const ErrorBoxWrapper = styled.section`
  font-size: 14px;
  display: flex;
  flex-direction: row;
  justify-items: center;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 1.5rem;
  background: var(--red_error_message);
  color: var(--white);
`;
