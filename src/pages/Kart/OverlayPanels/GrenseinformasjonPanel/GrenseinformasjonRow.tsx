import { SkeletonText, Text } from "@kvib/react";
import { styled } from "styled-components";
import { TitleWithIconTooltip } from "./TitleWithIconTooltip";

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
  return (
    <Container>
      <EditContent>
        <Row>
          <TitleWithIconTooltip tooltipLabel={tooltipLabel}>
            <Text as="b">{`${name}${isRequired ? "" : " (valgfri)"}`}</Text>
          </TitleWithIconTooltip>
        </Row>
        {isEditing ? (
          <Field>{children}</Field>
        ) : isLoading ? (
          <SkeletonText noOfLines={1} skeletonHeight={5} marginTop="8px" />
        ) : (
          <Field>{valueLabel != null && valueLabel.length > 0 ? valueLabel : "Ikke spesifisert"}</Field>
        )}
      </EditContent>
    </Container>
  );
};

const EditContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
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
