import { Icon, SkeletonText, Text, Tooltip } from "@kvib/react";
import { styled } from "styled-components";
import { useState } from "react";

interface Props {
  name: string;
  valueLabel?: string | null;
  tooltipLabel: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  isEditing?: boolean;
  isRequired?: boolean;
}

const GrenseinformasjonRow = ({
  name,
  tooltipLabel,
  valueLabel,
  children,
  isEditing = false,
  isLoading = false,
  isRequired = false,
}: Props) => {
  const [iconHovered, setIconHovered] = useState(false);

  return (
    <Container>
      <EditContent>
        <Row>
          <Tooltip label={tooltipLabel} hasArrow placement="bottom">
            <TextWithIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
              <Text as="b">{`${name}${isRequired ? "" : " (valgfri)"}`}</Text>
              <InfoIcon>
                <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon="info"></Icon>
              </InfoIcon>
            </TextWithIcon>
          </Tooltip>
        </Row>
        {isEditing ? (
          <Field>{children}</Field>
        ) : isLoading ? (
          <SkeletonText noOfLines={1} skeletonHeight={5} marginTop="8px" />
        ) : (
          <Field>{valueLabel ?? "Ikke spesifisert"}</Field>
        )}
      </EditContent>
    </Container>
  );
};

const InfoIcon = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  cursor: help;
`;

const EditContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TextWithIcon = styled.div`
  display: flex;
  align-items: center;
`;

const Field = styled.div`
  margin-top: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default GrenseinformasjonRow;
