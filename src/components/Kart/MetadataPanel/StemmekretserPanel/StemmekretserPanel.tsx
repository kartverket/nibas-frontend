import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsTable, KretsTableWrapper } from "../KretsTable";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { KommuneRef, StemmekretsRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const StemmekretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { isRowOpen, toggleRow } = useAccordionRows();

  const { data: stemmekretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/stemmekretser",
    {
      id: kommune.id,
    }
  );

  const sortedStemmekretser = sortGrenserAlphabetically(stemmekretserByKommune);

  const utkastStemmekretser = useUtkastEntity(
    sortedStemmekretser,
    "stemmekretser"
  ) as StemmekretsRef[] | undefined;

  return (
    <>
      <PanelTitle>
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <PanelTitle>{t("inndelinger.Stemmekretser")}</PanelTitle>
      {utkastStemmekretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <th>{t("tabell.Navn")}</th>
                <th>{t("stemmekrets.Stemmekretsnummer")}</th>
                <th>{t("stemmekrets.Valgdistriktsnummer")}</th>
                <th>{t("stemmekrets.Tellekretsnavn")}</th>
                <th>{t("stemmekrets.Tellekretsnummer")}</th>
                <th>{t("Endre")}</th>
              </tr>
            </thead>
            <tbody>
              {utkastStemmekretser.map((stemmekrets) => (
                <React.Fragment key={stemmekrets.id}>
                  <StemmekretsRow
                    id={stemmekrets.id}
                    toggleRow={toggleRow}
                    isRowOpen={isRowOpen}
                  />
                  {isRowOpen(stemmekrets.id) && (
                    <EditRow stemmekrets={stemmekrets} kommuneId={kommune.id} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </KretsTable>
        </KretsTableWrapper>
      )}
    </>
  );
};

const PanelTitle = styled.h3`
  margin: 0;
  margin-bottom: 8px;
`;

export default StemmekretserPanel;
