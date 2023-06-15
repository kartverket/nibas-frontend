import UtkastItem from "./UtkastItem";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import styled from "styled-components";
import { Fragment, useState } from "react";
import { Divider } from "components/Divider";
import Toast from "components/Kart/Toolbar/Toast";
import { useTranslation } from "react-i18next";

const List = styled(UnstyledList)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UtkastList = () => {
  const { data: utkasts } = useNibasApi("/v1/utkast");
  const { t } = useTranslation();
  const [utkastJustPublished, setUtkastJustPublished] = useState(false);

  if (!utkasts) return null;

  return (
    <>
      <List>
        {utkasts.map((utkast) => (
          <Fragment key={utkast.id}>
            <UtkastItem
              utkast={utkast}
              setUtkastJustPublished={setUtkastJustPublished}
            />
            <Divider />
          </Fragment>
        ))}
      </List>
      {utkastJustPublished && (
        <Toast title={t("utkast.utkast-opprettet")} status={"success"} />
      )}
    </>
  );
};

export default UtkastList;
