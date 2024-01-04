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
  isUneditable?: boolean;
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
  isUneditable,
  reset,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  return (
    <Container>
      <EditContent>
        <TextWithIcon>
          <Text as="b">{name}</Text>
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

        {!isUneditable && (
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
        )}
        {isEditing ? (
          <Field>{children}</Field>
        ) : (
          <Field>{valueLabel || "Ikke spesifisert"}</Field>
        )}
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
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const TextWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Field = styled.div`
  grid-row: 2;
  grid-column: 1 / -1;
`;

const EditButton = styled(EditAndSaveButton)`
  grid-column: 2;
`;

export default MetadataRow;
