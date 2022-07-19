import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import EditRow from "./EditRow";
import useNibasApi from "hooks/useNibasApi";
import { GrunnkretsRef, KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";

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
      const newOpenRows = openRows.slice();
      newOpenRows.splice(newOpenRows.indexOf(grunnkrets.id));
      setOpenRows(newOpenRows);
    } else {
      setOpenRows([...openRows, grunnkrets.id]);
    }
  };

  const postGrunnkretsUpdate = () => {
    mutate();
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
        <GrunnkretsTable>
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
                    <button onClick={() => toggleRow(grunnkrets)}>Endre</button>
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
        </GrunnkretsTable>
      )}
    </div>
  );
};

const PanelTitle = styled.h3`
  margin: 0;
  margin-bottom: 8px;
`;

const KretsRow = styled.tr``;

const GrunnkretsTable = styled.table`
  border-spacing: 0;
  border: none;
  width: 100%;

  thead {
    text-transform: uppercase;
    text-align: left;
    color: ${({ theme }) => theme.colors.gray};
    font-size: 16px;

    th {
      border-bottom: 1px solid ${({ theme }) => theme.colors.black};
      padding-left: 8px;
      padding-bottom: 8px;
    }
  }

  tbody {
    ${KretsRow} {
      background-color: ${({ theme }) => theme.colors.blueLight};

      &:nth-child(2n) {
        background-color: ${({ theme }) => theme.colors.white};
      }

      td {
        padding: 8px;
        font-size: 14px;
      }
    }
  }
`;

export default GrunnkretserPanel;
