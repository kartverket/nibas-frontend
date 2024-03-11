import { styled } from "styled-components";
import { FormViewState, Referanse, VedtakinfoForm } from "./Vedtaksinformasjon";
import { Control, FieldErrors, UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { Card, Tab, TabList, TabPanel, TabPanels, Tabs } from "@kvib/react";
import { AntallReferanser } from "./AntallReferanser";
import { ReferanserPaginated } from "./ReferanserPaginated";
import { ReferanseInput } from "./ReferanseInput";
import { useState } from "react";

type ReferanserProps = {
  formViewState: FormViewState;
  deleteInternref: (index: number) => void;
  deleteDokref: (index: number) => void;
  dokref: Referanse[] | undefined;
  internref: Referanse[] | undefined;
  addInternreferanse: (ref: Referanse) => void;
  addDokumentlenke: (ref: Referanse) => void;
  errors: FieldErrors<VedtakinfoForm>;
  setError: UseFormSetError<VedtakinfoForm>;
  clearErrors: UseFormClearErrors<VedtakinfoForm>;
  control: Control<VedtakinfoForm>;
};

export const Referanser = ({
  dokref,
  internref,
  addInternreferanse,
  addDokumentlenke,
  errors,
  setError,
  clearErrors,
  deleteInternref,
  deleteDokref,
  control,
  formViewState,
}: ReferanserProps) => {
  const [dokrefSelected, setDokrefSelected] = useState(true);
  const [internrefSelected, setInternrefSelected] = useState(false);

  const toggleSelected = () => {
    setDokrefSelected(!dokrefSelected);
    setInternrefSelected(!internrefSelected);
  };
  return (
    <ReferanserWrapper variant="filled">
      <TabsContainer size="md">
        <TabList>
          <Tab onClick={toggleSelected}>
            Dokumenter
            <AntallReferanser count={dokref !== undefined ? dokref.length : 0} isSelected={dokrefSelected} />
          </Tab>
          <Tab onClick={toggleSelected}>
            Interne referanser
            <AntallReferanser count={internref !== undefined ? internref.length : 0} isSelected={internrefSelected} />
          </Tab>
        </TabList>
        <PanelsContainer>
          <Panel>
            <ReferanserPaginated
              deleteRef={(index) => deleteDokref(index)}
              referanser={dokref}
              urlMode={true}
              formViewState={formViewState}
            />
            {formViewState !== "viewing" && (
              <ReferanseInput
                control={control}
                errors={errors.leggTilDokumentlenke}
                clearErrors={clearErrors}
                pattern={/^http[s]?:\/\/.+/}
                setError={setError}
                appendFn={addDokumentlenke}
                registerName="leggTilDokumentlenke"
                tooltipLabel="URL til saksdokument."
                placeholder="URL til dokument"
                title="Legg til nytt dokument (URL)"
              />
            )}
          </Panel>
          <Panel>
            <ReferanserPaginated
              deleteRef={(index) => deleteInternref(index)}
              referanser={internref}
              urlMode={false}
              formViewState={formViewState}
            />
            {formViewState !== "viewing" && (
              <ReferanseInput
                control={control}
                errors={errors.leggTilInternreferanse}
                setError={setError}
                clearErrors={clearErrors}
                appendFn={addInternreferanse}
                registerName="leggTilInternreferanse"
                tooltipLabel="Henvisning til saksdokument i Kartverkets eget arkiv Merknad: Gjelder også link til skannet dokument på intern server."
                placeholder="Internreferanse"
                title="Legg til ny internreferanse"
              />
            )}
          </Panel>
        </PanelsContainer>
      </TabsContainer>
    </ReferanserWrapper>
  );
};

const ReferanserWrapper = styled(Card)`
  height: 100%;
`;

const Panel = styled(TabPanel)`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const PanelsContainer = styled(TabPanels)`
  display: flex;
  flex: 1;
`;

const TabsContainer = styled(Tabs)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  width: 100%;
`;
