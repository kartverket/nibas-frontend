import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsTable } from "../KretsTable";
import { BlockLabel } from "../metadataComponents";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Heading from "components/typography/Heading";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import useSearch from "hooks/useSearch";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";
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

  const { isRowOpen, toggleRow } = useAccordionRows();
  const { inputValue, setInputValue, searchValue } = useSearch();

  const { data: grunnkretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/grunnkretser",
    {
      id: kommune.id,
    }
  );

  const sortedGrunnkretser = useMemo(
    () => sortGrenserAlphabetically(grunnkretserByKommune),
    [grunnkretserByKommune]
  );

  const utkastGrunnkretser = useUtkastEntity(
    sortedGrunnkretser,
    "grunnkretsendringer"
  ) as GrunnkretsRef[] | undefined;

  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  return (
    <div>
      <PanelTitle tag="h2" size="xs">
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <SmallerBlockLabel>
        {t("sidebar.Søk")}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </SmallerBlockLabel>
      <PanelTitle tag="h2" size="xs">
        {t("inndelinger.Grunnkretser")}
      </PanelTitle>
      {filteredGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <th>{t("tabell.Navn")}</th>
              <th>{t("grunnkrets.Grunnkretsnummer")}</th>
              <th>{t("action.Endre")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrunnkretser.map((grunnkrets) => (
              <React.Fragment key={grunnkrets.id}>
                <KretsRow onClick={() => toggleRow(grunnkrets.id)}>
                  <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                  <td>{grunnkrets.grunnkretsnummer}</td>
                  <td>
                    <Button
                      variant="unstyled"
                      onClick={() => toggleRow(grunnkrets.id)}
                      icon={
                        isRowOpen(grunnkrets.id) ? <CaretUp /> : <CaretDown />
                      }
                    />
                  </td>
                </KretsRow>
                {isRowOpen(grunnkrets.id) && (
                  <EditRow grunnkrets={grunnkrets} kommuneId={kommune.id} />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </KretsTable>
      )}
    </div>
  );
};

const PanelTitle = styled(Heading)`
  margin: 0;
  margin-bottom: 8px;
`;

const KretsRow = styled.tr`
  cursor: pointer;
`;

const SmallerBlockLabel = styled(BlockLabel)`
  max-width: 400px;
`;

export default GrunnkretserPanel;
