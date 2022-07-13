import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import useNibasApi from "hooks/useNibasApi";
import { KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";

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
        <KretsTable>
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
        </KretsTable>
      )}
    </div>
  );
};

const PanelTitle = styled.h3`
  margin: 0;
  margin-bottom: 8px;
`;

export default StemmekretserPanel;
