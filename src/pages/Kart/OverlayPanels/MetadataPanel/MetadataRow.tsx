import { Divider, Text } from "@kvib/react";
import styled from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useState } from "react";

const EditRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const EditContent = styled.div<{ $twoRows: boolean }>`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  ${(props) => props.$twoRows && "grid-template-rows: 1fr 2fr;"};
  column-gap: 16px;
  row-gap: 16px;
  padding: 21px 28px 21px 28px;
  align-items: center;

  :nth-child(2) {
    ${(props) => props.$twoRows && "grid-row: 2; grid-column: 1 / -1"};
  }

  td {
    // Setter EditAndSaveButton til å alltid ligge i siste kolonne
    padding: 0 !important;
    grid-column: 3;
  }
`;

const StyledDivider = styled(Divider)`
  align-self: center;
  width: calc(100% - 56px); // 56px er padding-bottom + padding-top
`;

interface Props {
  name: string;
  value: string | undefined;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  useSeperateRowForChildren?: boolean;
}

export const MetadataRow = ({
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
    <EditRow>
      <EditContent $twoRows={twoRows}>
        <Text>{name}</Text>

        {!isEdit ? <Text as="b">{value}</Text> : children}

        <EditAndSaveButton
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
      <StyledDivider />
    </EditRow>
  );
};
