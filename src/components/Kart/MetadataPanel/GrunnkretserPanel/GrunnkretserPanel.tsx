import { useTranslation } from "react-i18next";
import styled from "styled-components";
import GrunnkretsRow from "./GrunnkretsRow";
import useNibasApi from "hooks/useNibasApi";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommuneId: string;
};

const GrunnkretserPanel = ({ kommuneId }: Props) => {
  const { t } = useTranslation();
  // denne blir unødvendig når vi kan hente grunnkretser med kommuneId i stedet
  const { data: kommune } = useNibasApi("/v1/kommuner/{id}", {
    id: kommuneId,
  });

  const { data: grunnkretserByKommune } = useNibasApi(
    kommune ? "/v1/grunnkretser" : null,
    {
      kommunenummer: kommune?.kommunenummer.id,
    }
  );

  if (!kommune) return null;

  return (
    <div>
      <PanelTitle>
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune?.administrativenhetnavn, "nor"),
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
          {grunnkretserByKommune?.map((grunnkrets) => (
            <GrunnkretsRow key={grunnkrets.id} grunnkrets={grunnkrets} />
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
