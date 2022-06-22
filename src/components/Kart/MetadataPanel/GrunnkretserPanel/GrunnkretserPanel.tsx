import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useNibasApi from "hooks/useNibasApi";
import { KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const GrunnkretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();

  const { data: grunnkretserByKommune } = useNibasApi(
    kommune ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommune.id,
    }
  );

  const sortedGrunnkretser = sortGrenserAlphabetically(grunnkretserByKommune);

  return (
    <div>
      <PanelTitle>
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <PanelTitle>{t("inndelinger.Grunnkretser")}</PanelTitle>
      <GrunnkretsTable>
        <thead>
          <tr>
            <th>{t("tabell.Navn")}</th>
            <th>{t("grunnkrets.Grunnkretsnummer")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedGrunnkretser?.map((grunnkrets) => (
            <tr key={grunnkrets.id}>
              <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
              <td>{grunnkrets.grunnkretsnummer}</td>
            </tr>
          ))}
        </tbody>
      </GrunnkretsTable>
    </div>
  );
};

const PanelTitle = styled.h3`
  margin: 0;
  margin-bottom: 8px;
`;

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
    tr {
      background-color: ${({ theme }) => theme.colors.blueLight};

      &:nth-child(2) {
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
