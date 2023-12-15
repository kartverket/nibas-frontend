import { Divider, IconButton, Text, Tooltip } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useEffect, useState } from "react";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import { Container } from "./MetadataGenerelt";

interface Props {
  feature: Feature<Geometry>;
  name: string;
  valueLabel: string;
  tooltipLabel: string;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  isDirty: boolean;
  reset: () => void;
}

const MetadataRow = ({
  feature,
  name,
  tooltipLabel,
  valueLabel,
  children,
  onMetadataSubmit,
  isDisabled,
  isDirty,
  reset,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(true);
  }, [feature]);

  return (
    <Container>
      <EditContent>
        <Tooltip label={tooltipLabel}>
          <InfoIconButton
            aria-label="Information Button"
            colorScheme="blue"
            icon="question_mark"
            size="xs"
            variant="secondary"
          />
        </Tooltip>
        <Text>{name}</Text>
        {!isEditing && <Text as="b">{valueLabel}</Text>}

        <EditButton
          isDisabled={isDisabled}
          isEditing={isEditing}
          canSave={isDirty}
          onSubmit={() => {
            onMetadataSubmit();
            setIsEditing(false);
          }}
          toggleEditing={() =>
            setIsEditing((prevState) => {
              if (isEditing) {
                reset();
              }
              return !prevState;
            })
          }
        />
        <Field $isEditing={isEditing}>{children}</Field>
      </EditContent>
      <Divider />
    </Container>
  );
};

const InfoIconButton = styled(IconButton)`
  border-radius: 50%;
`;

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 1fr 1fr;
  gap: 16px;
`;

const Field = styled.div<{ $isEditing: boolean }>`
  grid-row: 2;
  grid-column: 1 / -1;
  ${(props) => !props.$isEditing && "display: none"};
`;

const EditButton = styled(EditAndSaveButton)`
  grid-column: 4;
`;

export default MetadataRow;
