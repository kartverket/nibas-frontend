import { Divider, Text } from "@kvib/react";
import styled from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useState } from "react";

const EditRow = styled.tr`
  align-items: center;
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
    <>
      <EditRow>
        <td>
          <Text>{name}</Text>
        </td>
        <td>{!isEdit ? <Text as="b">{value}</Text> : children}</td>

        <td>
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
        </td>
      </EditRow>
      <Divider />
    </>
  );
};
