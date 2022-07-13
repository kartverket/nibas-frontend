import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useNibasApi from "hooks/useNibasApi";
import { KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import StemmekretsRow from "./StemmekretsRow";

type Props = {
  kommune: KommuneRef;
};

const StemmekretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();

  const { data: stemmekretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/stemmekretser",
    {
      id: kommune.id,
    }
  );

  const sortedStemmekretser = sortGrenserAlphabetically(stemmekretserByKommune);

  return (
    <div>
      <PanelTitle>
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <PanelTitle>{t("inndelinger.Stemmekretser")}</PanelTitle>
      {sortedStemmekretser && (
        <GrunnkretsTable>
          <thead>
            <tr>
              <th>{t("tabell.Navn")}</th>
              <th>{t("stemmekrets.Stemmekretsnummer")}</th>
              <th>{t("stemmekrets.Valgdistriktsnummer")}</th>
              <th>{t("stemmekrets.Tellekretsnavn")}</th>
              <th>{t("stemmekrets.Tellekretsnummer")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedStemmekretser.map((stemmekrets) => (
              <StemmekretsRow key={stemmekrets.id} id={stemmekrets.id} />
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

export default StemmekretserPanel;
