import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import GrunnkretsRow from "./GrunnkretsRow";
import Icon from "components/Icon";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import useSearch from "hooks/useSearch";
import { GrunnkretsRef, GrunnkretsResponse } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import FutureChangesButton from "../FutureChangesButton";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  Panel,
  PanelHeader,
  PanelProps,
  ToggleableKretsButton,
} from "../Panel";
import { useAccordionRows } from "../hooks/useAccordionRows";
import FutureChangesTable, {
  TableRow,
  FutureChangesTableData,
} from "../FutureChanges/FutureChangesTable";
import { KretsTable, KretsRow, ButtonCell } from "../KretsTable";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  const { flatedata, closeOverlay } = useOverlayPanel();
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { t } = useTranslation();
  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();
  const { searchValue } = useSearch();

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
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlay}>Endre kretsdetaljer</PanelHeader>
      {filteredGrunnkretser && (
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
                  <GrunnkretsRow
                    grunnkrets={grunnkrets}
                    kommuneId={kommuneId}
                  />
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
      )}
    </Panel>
  );
};

const GrunnkretsnummerColumn = styled.th`
  width: 25%;
`;

const GrunnkretsnavnColumn = styled.th`
  width: 25%;
`;

const Remainder = styled.th`
  width: 100%;
`;

export default GrunnkretsPanel;
