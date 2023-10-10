import { Divider, Text } from "@kvib/react";
import styled from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useState } from "react";

const EditContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  column-gap: 16px;
  padding: 9px 28px 9px 28px;
  align-items: center;
`;

const EditRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDivider = styled(Divider)`
  align-self: center;
  width: calc(100% - 56px);
`;

interface Props {
  name: string;
  value: string | undefined;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
}

export const MetadataRow = ({
  name,
  value,
  children,
  onMetadataSubmit,
  isDisabled,
}: Props) => {
  const [isEdit, setIsEdit] = useState(false);

  return (
    <EditRow style={{ display: "flex", flexDirection: "column" }}>
      <EditContent>
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
