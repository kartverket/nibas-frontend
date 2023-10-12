import { Divider, Text } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useEffect, useState } from "react";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
interface Props {
  feature: Feature<Geometry>;
  name: string;
  value: string | undefined;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
}

const MetadataRow = ({
  feature,
  name,
  value,
  children,
  onMetadataSubmit,
  isDisabled,
}: Props) => {
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    setIsEdit(false);
  }, [feature]);

  return (
    <>
      <EditContent>
        <Text>{name}</Text>

        {!isEdit && <Text as="b">{value}</Text>}

        <EditButton
          isDisabled={isDisabled}
          isEditing={isEdit}
          canSave={true}
          onSubmit={() => {
            onMetadataSubmit();
            setIsEdit(false);
          }}
          toggleEditing={() => setIsEdit((prevState) => !prevState)}
        />
        <Field $isEditing={isEdit}>{children}</Field>
      </EditContent>
      <Divider />
    </>
  );
};

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  transition: all 0.5ms;
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
