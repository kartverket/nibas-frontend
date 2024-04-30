import { styled } from "styled-components";
import { Badge, Card, Heading, Icon, IconProps, Text } from "@kvib/react";
import { FunctionComponent, ReactNode } from "react";
import { Change, NumericEndringType, ToFromChangeType } from "components/Endringslogg/Endringcard/EndringCardTypes";
import {
  getBodyTextForNumericChange,
  getTitleForEndringstype,
} from "components/Endringslogg/Endringcard/EndringCardUtils";

type EndringCardProps = {
  title: string;
  children: ReactNode;
};

export const EndringCard = ({ title, children }: EndringCardProps) => {
  return (
    <StyledCard>
      <CardTitleText as="h3">{title}</CardTitleText>
      {children}
    </StyledCard>
  );
};

type EndringNumericCard = {
  type: NumericEndringType;
  value: number;
};

export const EndringNumericCard = ({ type, value }: EndringNumericCard) => {
  if (value <= 0) {
    return null;
  }

  return (
    <EndringCard title={getTitleForEndringstype(type)}>
      <Text>{getBodyTextForNumericChange(value, type)}</Text>
    </EndringCard>
  );
};

type EndringToFromProps = {
  type: ToFromChangeType;
  changes: Change[];
};
export const EndringToFromCard = ({ type, changes }: EndringToFromProps) => {
  if (changes.length < 1) {
    return null;
  }

  return (
    <EndringCard title={getTitleForEndringstype(type)}>
      {changes.map(({ from, to }) => (
        <ChangeRow key={from.join("-") + "-" + to.join("-")}>
          {from.map((value) => (
            <TextWithBadge key={value} badge="utgår">
              {value}
            </TextWithBadge>
          ))}
          <RightArrow />
          {to.map((value) => (
            <TextWithBadge key={value} badge="ny">
              {value}
            </TextWithBadge>
          ))}
        </ChangeRow>
      ))}
    </EndringCard>
  );
};

type ValueWithBadgeProps = {
  children: ReactNode;
  badge: "ny" | "utgår";
};

const TextWithBadge = ({ children, badge }: ValueWithBadgeProps) => {
  return (
    <TextWithBadgeContainer>
      {children}
      <Badge ml="4px" variant={"subtle"} colorScheme={badge === "ny" ? "green" : "gray"}>
        {badge}
      </Badge>
    </TextWithBadgeContainer>
  );
};

const CardTitleText = styled(Heading)`
  font-size: var(--kvib-fontSizes-sm);
  color: var(--kvib-colors-gray-600);
  font-weight: normal;
`;

const ChangeRow = styled.div`
  display: flex;
  flex-flow: wrap row;
  gap: 8px;
`;

const StyledCard = styled(Card).attrs({ variant: "outline" })`
  display: flex;
  gap: var(--kvib-space-2);
  padding: var(--kvib-space-4);
  margin-bottom: var(--kvib-space-4);
`;

const RightArrow: FunctionComponent<Omit<IconProps, "icon">> = styled(Icon).attrs({
  icon: "arrow_right_alt",
})`
  color: var(--kvib-colors-blue-500);
  font-size: 20px;
  margin-top: 4px;
  vertical-align: middle;
`;

const TextWithBadgeContainer = styled.div`
  white-space: nowrap;
`;
