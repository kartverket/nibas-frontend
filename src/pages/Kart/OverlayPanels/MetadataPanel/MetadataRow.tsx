import { Divider, Text } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useEffect, useState } from "react";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import { Container } from "./MetadataGenerelt";

interface Props {
  feature: Feature<Geometry>;
  name: string;
  valueLabel: () => string;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  isDirty: boolean;
  reset: () => void;
}

const MetadataRow = ({
  feature,
  name,
  valueLabel,
  children,
  onMetadataSubmit,
  isDisabled,
  isDirty,
  reset,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const handleMetadataSubmit = () => {
    onMetadataSubmit();
    setIsEditing(false);
  };

  const toggleEditing = () => {
    setIsEditing((prevState) => {
      if (isEditing) {
        reset();
      }
      return !prevState;
    });
  };

  return (
    <Container>
      <EditContent>
        <Text>{name}</Text>

        {!isEditing && <Text as="b">{valueLabel()}</Text>}

        <EditButton
          isDisabled={isDisabled}
          isEditing={isEditing}
          canSave={isDirty}
          onSubmit={handleMetadataSubmit}
          toggleEditing={toggleEditing}
        />
        <Field $isEditing={isEditing}>{children}</Field>
      </EditContent>
      <Divider />
    </Container>
  );
};

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
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
