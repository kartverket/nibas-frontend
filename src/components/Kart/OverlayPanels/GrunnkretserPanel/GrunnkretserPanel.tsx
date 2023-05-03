import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  ButtonCell,
  KretsRow,
  KretsTable,
  KretsTableWrapper,
} from "../KretsTable";
import {
  OverlayPanelWrapper,
  PanelHeader,
  PanelTitle,
} from "../metadataComponents";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import Input from "components/form/Input";
import Icon from "components/Icon";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import useSearch from "hooks/useSearch";
import { GrunnkretsRef, GrunnkretsResponse } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import FutureChangesTable, { TableRow } from "./FutureChangesTable";
import {
  FutureChangesTableData,
  ToggleableKretsButton,
} from "../kretserComponents";
import FutureChangesButton from "../FutureChangesButton";
import { getIdFromEntity } from "utils/api";
import { useDataPanel } from "contexts/DataPanelContext";

const GrunnkretserPanel = () => {
  const { flatedata } = useDataPanel();
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { t } = useTranslation();
  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();
  const { inputValue, setInputValue, searchValue } = useSearch();

  const { data: grunnkretserByKommune } = useNibasApi(
    kommuneId ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommuneId,
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

  const headers = [
    "Grunnkretsnummer",
    "Grunnkrets",
    "Oppdatert",
    "Type",
    "Gyldig fra",
    "Gyldig til",
  ];

  const getFutureChangesRows = useCallback(
    (futureChanges: GrunnkretsResponse[]): TableRow[] =>
      futureChanges.map(
        (grunnkrets) =>
          ({
            id: getIdFromEntity(grunnkrets),
            cells: [
              grunnkrets.grunnkretsnummer,
              grunnkrets.navn,
              grunnkrets.oppdateringsdato,
              grunnkrets.endringstype ?? "---",
              grunnkrets.gyldighet.gyldigFra,
              grunnkrets.gyldighet.gyldigTil,
            ],
          } as TableRow)
      ),
    []
  );

  const shouldShowFutureChangesButton = (grunnkrets: GrunnkretsRef) =>
    grunnkrets.antallFramtidigeVersjoner > 0;

  if (!flatedata) {
    return null;
  }

  return (
    <OverlayPanelWrapper key="grunnkrets" gridArea="kretser">
      <PanelHeader>
        <PanelTitle tag="h2" size="xs">
          {t("{{ kommuneNavn }} kommune", {
            kommuneNavn: getNavnInSpraak(flatedata.navn, "nor"),
          })}
        </PanelTitle>
        <PanelHeaderInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("grunnkrets.Søk")}
        />
      </PanelHeader>
      {filteredGrunnkretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <GrunnkretsnummerColumn>
                  {t("grunnkrets.Grunnkretsnummer")}
                </GrunnkretsnummerColumn>
                <GrunnkretsnavnColumn>
                  {t("grunnkrets.Grunnkretsnavn")}
                </GrunnkretsnavnColumn>
                <Remainder />
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredGrunnkretser.map((grunnkrets) => (
                <React.Fragment key={getIdFromEntity(grunnkrets)}>
                  <KretsRow isActive={isRowOpen(getIdFromEntity(grunnkrets))}>
                    <td>{grunnkrets.grunnkretsnummer}</td>
                    <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                    <ButtonCell>
                      {shouldShowFutureChangesButton(grunnkrets) && (
                        <FutureChangesButton
                          krets={grunnkrets}
                          isOpen={isFutureChangesOpen(
                            getIdFromEntity(grunnkrets)
                          )}
                          toggleRow={toggleFutureChangesRow}
                        />
                      )}
                    </ButtonCell>
                    <ButtonCell>
                      <ToggleableKretsButton
                        isOpen={isRowOpen(getIdFromEntity(grunnkrets))}
                        onClick={() => toggleRow(getIdFromEntity(grunnkrets))}
                        icon={<Icon icon="settings" />}
                      />
                    </ButtonCell>
                  </KretsRow>

                  {isRowOpen(getIdFromEntity(grunnkrets)) && (
                    <EditRow grunnkrets={grunnkrets} kommuneId={kommuneId} />
                  )}

                  {isFutureChangesOpen(getIdFromEntity(grunnkrets)) && (
                    <tr>
                      <FutureChangesTableData colSpan={4}>
                        <FutureChangesTable
                          id={getIdFromEntity(grunnkrets)}
                          futureChangesUrl="/v1/grunnkretser/{lokalid}/framtidigeversjoner"
                          headers={headers}
                          getRows={getFutureChangesRows}
                        />
                      </FutureChangesTableData>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </KretsTable>
        </KretsTableWrapper>
      )}
    </OverlayPanelWrapper>
  );
};

const PanelHeaderInput = styled(Input)`
  width: 100%;
  max-width: 300px;
`;

const GrunnkretsnummerColumn = styled.th`
  width: 25%;
`;

const GrunnkretsnavnColumn = styled.th`
  width: 25%;
`;

const Remainder = styled.th`
  width: 100%;
`;

export default GrunnkretserPanel;
