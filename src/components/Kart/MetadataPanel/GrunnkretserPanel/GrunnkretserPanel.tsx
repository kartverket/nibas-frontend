import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsTable } from "../KretsTable";
import EditRow from "./EditRow";
import Button from "components/form/Button";
import useNibasApi from "hooks/useNibasApi";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";
import { GrunnkretsRef, KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";

const removeIdFromList = (id: string, list: string[]) => {
  const newOpenRows = list.slice();
  newOpenRows.splice(newOpenRows.indexOf(id));

  return newOpenRows;
};

type Props = {
  kommune: KommuneRef;
};

const GrunnkretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const [openRows, setOpenRows] = useState<string[]>([]);

  const { data: grunnkretserByKommune, mutate } = useNibasApi(
    "/v1/kommuner/{id}/grunnkretser",
    {
      id: kommune.id,
    }
  );

  const sortedGrunnkretser = sortGrenserAlphabetically(grunnkretserByKommune);

  const toggleRow = (grunnkrets: GrunnkretsRef) => {
    if (openRows.includes(grunnkrets.id)) {
      setOpenRows(removeIdFromList(grunnkrets.id, openRows));
    } else {
      setOpenRows([...openRows, grunnkrets.id]);
    }
  };

  const postGrunnkretsUpdate = (grunnkretsId: string) => {
    // oppdater lista etter oppdateringen er gjort i backend
    mutate();
    setOpenRows(removeIdFromList(grunnkretsId, openRows));
  };

  return (
    <div>
      <PanelTitle>
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <PanelTitle>{t("inndelinger.Grunnkretser")}</PanelTitle>
      {sortedGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <th>{t("tabell.Navn")}</th>
              <th>{t("grunnkrets.Grunnkretsnummer")}</th>
              <th>Endre</th>
            </tr>
          </thead>
          <tbody>
            {sortedGrunnkretser.map((grunnkrets) => (
              <React.Fragment key={grunnkrets.id}>
                <KretsRow>
                  <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                  <td>{grunnkrets.grunnkretsnummer}</td>
                  <td>
                    <Button
                      variant="unstyled"
                      onClick={() => toggleRow(grunnkrets)}
                      icon={
                        openRows.includes(grunnkrets.id) ? (
                          <CaretUp />
                        ) : (
                          <CaretDown />
                        )
                      }
                    />
                  </td>
                </KretsRow>
                {openRows.includes(grunnkrets.id) && (
                  <EditRow
                    grunnkrets={grunnkrets}
                    postSubmit={postGrunnkretsUpdate}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </KretsTable>
      )}
    </div>
  );
};

const PanelTitle = styled.h3`
  margin: 0;
  margin-bottom: 8px;
`;

const KretsRow = styled.tr``;

export default GrunnkretserPanel;
