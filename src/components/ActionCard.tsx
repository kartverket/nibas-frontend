import { Button, Heading, Text, MaterialSymbol } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  title: string;
  description: string;
  icon?: MaterialSymbol;
  onClick: () => void;
};

const ActionCard = ({ title, description, icon, onClick }: Props) => (
  <Container onClick={onClick} leftIcon={icon}>
    <div>
      <Title size="md">{title}</Title>
      <Description>{description}</Description>
    </div>
  </Container>
);

const Container = styled(Button).attrs({ variant: "ghost" })`
  width: 100%;
  padding: 36px;
  text-align: left;
  height: unset;
  border: 2px solid transparent;
  transition: border-color 0.25s;
  cursor: pointer;

  background: var(--kvib-colors-chakra-body-bg);
  color: inherit;
  box-shadow: var(--kvib-shadows-base);

  &:hover {
    border-color: var(--kvib-colors-blue-500);
    background: white;
    color: inherit;
  }

  & > div {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .material-symbols-rounded {
    width: 36px !important;
    font-size: 36px !important;
  }
`;

const Title = styled(Heading)`
  margin: 0 0 0.5rem;
`;

const Description = styled(Text)`
  font-size: 14px;
  color: var(--kvib-colors-gray-500);
`;

export default ActionCard;
