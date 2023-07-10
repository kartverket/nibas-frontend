import { Button, Heading, Text } from "@kvib/react";
import styled from "styled-components";
import Icon from "./Icon";

type Props = {
  title: string;
  description: string;
  icon?: string;
  onClick: () => void;
};

const ActionCard = ({ title, description, icon, onClick }: Props) => (
  <Container onClick={onClick}>
    {icon && <ActionIcon icon={icon} />}
    <div>
      <Title size="md">{title}</Title>
      <Description>{description}</Description>
    </div>
    <Arrow icon="arrow_forward_ios" />
  </Container>
);

const Container = styled(Button).attrs({ variant: "ghost" })`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 36px;

  width: 100%;
  height: unset;
  text-align: left;

  background: var(--kvib-colors-chakra-body-bg);
  color: var(--kvib-colors-chakra-body-text);
  box-shadow: var(--kvib-shadows-base);
`;

const ActionIcon = styled(Icon)`
  font-size: 48px;
`;

const Title = styled(Heading)`
  margin: 0 0 0.5rem 0;
`;

const Description = styled(Text)`
  font-size: 14px;
`;

const Arrow = styled(Icon)`
  margin-left: auto;
  transition: transform 0.1s;

  ${Container}:hover & {
    transform: translateX(5px);
  }
`;

export default ActionCard;
