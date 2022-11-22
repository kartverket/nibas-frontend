import { VerticalLogo } from "components/Logo/Logo";
import styled from "styled-components";

const Container = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  height: 100%;
  background: var(--gray_light);
  padding: 160px 5rem;
`;

const Card = styled.div`
  position: relative;
  background: white;
  padding: 2rem;
  box-shadow: 0px 3px 19px 0px rgba(0, 0, 0, 0.06);

  width: 100%;
  max-width: 700px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.1s;

  &::after {
    content: "";
    position: absolute;
    right: 4rem;
    top: 50%;

    border: solid var(--blue);
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 5px;
    transform: translateY(-50%) rotate(-45deg);
    transition: transform 0.1s, border-color 0.2s;
  }

  &:hover {
    border-color: var(--blue);

    &::after {
      transform: translate(0.25rem, -50%) rotate(-45deg);
    }
  }
`;

const CardHeading = styled.h2``;

const CardDescription = styled.p``;

const Landing = () => {
  return (
    <Container>
      <VerticalLogo />
      <Card>
        <CardHeading>Logg inn i Nasjonal inndelingsbase</CardHeading>
        <CardDescription>
          Denne tjenesten er kun tilgjengelig for autoriserte brukere.
        </CardDescription>
      </Card>
    </Container>
  );
};

export default Landing;
