import { Divider, Text } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useState } from "react";

interface Props {
  name: string;
  value: string | undefined;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  useSeperateRowForChildren?: boolean;
}

const MetadataRow = ({
  name,
  value,
  children,
  onMetadataSubmit,
  isDisabled,
  useSeperateRowForChildren,
}: Props) => {
  const [isEdit, setIsEdit] = useState(false);
  const twoRows = (useSeperateRowForChildren && isEdit) ?? false;
  return (
    <>
      <EditContent $twoRows={twoRows}>
        <Text>{name}</Text>
        <Field $twoRows={twoRows}>
          {!isEdit ? <Text as="b">{value}</Text> : children}
        </Field>
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
      </EditContent>
      <Divider />
    </>
  );
};

const EditContent = styled.div<{ $twoRows: boolean }>`
  display: grid;
  align-items: center;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 16px;
`;

const Field = styled.div<{ $twoRows: boolean }>`
  ${(props) => props.$twoRows && "grid-row: 2; grid-column: 1 / -1"};
`;

const EditButton = styled(EditAndSaveButton)`
  grid-column: 3;
`;

export default MetadataRow;
