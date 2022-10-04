import { useEffect, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Link, useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { publishUtkast } from "api/utkast";
import Button from "components/form/Button";
import useNibasApi from "hooks/useNibasApi";
import { ReactComponent as PublishIcon } from "icons/pluss.svg";
import { ReactComponent as CancelIcon } from "icons/visibility_off.svg";
import { UtkastRef } from "types/api";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  const [shouldPublish, setShouldPublish] = useState(false);
  const { data: fullUtkast } = useNibasApi(
    shouldPublish ? "/v1/utkast/{id}" : null,
    {
      id: utkast.id,
    }
  );
  const { tokenHolderFunc } = useAuthenticationFlow();
  const navigate = useNavigate();

  useEffect(() => {
    if (!fullUtkast) return;

    const publish = async () => {
      await publishUtkast(fullUtkast.id, fullUtkast, tokenHolderFunc()?.token);

      setShouldPublish(false);
      navigate("/");
    };

    publish();
  }, [fullUtkast, tokenHolderFunc, navigate]);

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
      <UnstyledButton onClick={() => setShouldPublish(true)}>
        <PublishIcon />
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
