import { Link, useMatch } from "react-router-dom";
import styled from "styled-components";
import Button from "components/form/Button";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as CancelIcon } from "icons/visibility_off.svg";
import { UtkastRef } from "types/api";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const utkastId = useMatch("/:utkastId")?.params.utkastId;

  const publishUtkast = () => {
    // a
  };

  return (
    <ListItem>
      <UtkastName>
        {utkastId === utkast.id ? (
          <span>{utkast.navn}</span>
        ) : (
          <Link to={`/${utkast.id}`}>{utkast.navn}</Link>
        )}
      </UtkastName>
      {utkastId === utkast.id && (
        <UnstyledButton>
          <Link to="">
            <CancelIcon />
          </Link>
        </UnstyledButton>
      )}
      <UnstyledButton onClick={publishUtkast}>
        <EditIcon />
      </UnstyledButton>
    </ListItem>
  );
};

const ListItem = styled.li`
  display: flex;
  margin-right: 8px;
  margin-bottom: 8px;

  > :first-child {
    flex: 1;
  }
`;

const UtkastName = styled.p`
  margin: 0;
`;

const UnstyledButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))``;

export default UtkastItem;
