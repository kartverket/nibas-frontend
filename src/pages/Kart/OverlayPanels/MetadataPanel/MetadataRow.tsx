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
        <TextWithIcon>
          <Text>{name}</Text>
          <Tooltip label={tooltipLabel} hasArrow placement="bottom">
            <InfoIconButton
              aria-label="Informasjon om metadatafelt"
              colorScheme="blue"
              icon="exclamation"
              size="xs"
              variant="secondary"
            />
          </Tooltip>
        </TextWithIcon>

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
  border-radius: 100%;
  margin-left: 8px;
`;

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const TextWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const Field = styled.div<{ $isEditing: boolean }>`
  grid-row: 2;
  grid-column: 1 / -1;
  ${(props) => !props.$isEditing && "display: none"};
`;

const EditButton = styled(EditAndSaveButton)`
  grid-column: 3;
`;

export default MetadataRow;
