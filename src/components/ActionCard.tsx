import { Button, Heading, Text, MaterialSymbol } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
    title: string;
    description: string;
    icon?: MaterialSymbol;
    onClick: () => void;
};

const ActionCard = ({ title, description, icon, onClick }: Props) => (
    <Container onClick={onClick} leftIcon={icon} rightIcon="arrow_forward_ios">
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

    background: var(--kvib-colors-chakra-body-bg);
    color: var(--kvib-colors-chakra-body-text);
    box-shadow: var(--kvib-shadows-base);

    & > div {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .material-symbols-rounded {
        width: 36px !important;
        font-size: 36px !important;

        &:last-child {
            font-size: 30px !important;
            margin-left: auto;
            transition: transform 0.1s;
        }
    }

    &:hover .material-symbols-rounded:last-child {
        transform: translateX(8px);
    }
`;

const Title = styled(Heading)`
    margin: 0 0 0.5rem 0;
`;

const Description = styled(Text)`
    font-size: 14px;
`;

export default ActionCard;
