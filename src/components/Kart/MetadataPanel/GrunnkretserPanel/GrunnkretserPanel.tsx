import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsTable } from "../KretsTable";
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
    "/v1/kommuner/{id}/grunnkretser",
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
      {sortedGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <th>{t("tabell.Navn")}</th>
              <th>{t("grunnkrets.Grunnkretsnummer")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedGrunnkretser.map((grunnkrets) => (
              <tr key={grunnkrets.id}>
                <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                <td>{grunnkrets.grunnkretsnummer}</td>
              </tr>
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

export default GrunnkretserPanel;
