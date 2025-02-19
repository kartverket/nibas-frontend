import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  Datepicker,
  IconButton,
  Input,
  Select,
  Textarea,
  useToast,
} from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Inndelingtype, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { GrenseType } from "hooks/layers/types";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  getNonEditableFeatureId,
  isNonEditableFeatureId,
  isTempFeatureId,
} from "pages/Kart/interactions/feature-id-utils";
import { ContextualPosisjonskvalitet } from "pages/Kart/interactions/useModify";
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { styled } from "styled-components";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { isLineStringFeature } from "utils/type-utils";
import { useGrenseinformasjonForm } from "../hooks/useGrenseinformasjonForm";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { PanelHeader } from "../Panel";
import { dateToFormattedDatestring, datestringToFormattedDatestring } from "./grenseinformasjon-utils";
import GrenseinformasjonRow from "./GrenseinformasjonRow";
import { TitleWithIconTooltip } from "./TitleWithIconTooltip";

type Props = {
  feature: Feature<Geometry>;
  onClose: () => void;
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

type EditGrenseInfoButtonProps = {
  isEditing: boolean;
  handleSubmit: () => void;
  toggleEdit: () => void;
};

export const EditGrenseInfoButton = ({ isEditing, handleSubmit, toggleEdit }: EditGrenseInfoButtonProps) => {
  return isEditing ? (
    <Button
      onClick={() => {
        handleSubmit();
        toggleEdit();
      }}
      rightIcon="check_circle"
    >
      Fullfør redigering
    </Button>
  ) : (
    <Button onClick={() => toggleEdit()}>Rediger</Button>
  );
};

const GrenseinformasjonForm = ({ feature, onClose }: Props) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { currentlyEditingInndelinger } = useInndelinger();
  const { history } = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const isGrenseinformasjonPanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);
  const { openAsync } = useConfirmationModal();
  const { register, handleSubmit, getValues, setValue, control, reset, getDefaultValues, onSubmit, isDirty } =
    useGrenseinformasjonForm(feature);
  const toast = useToast();

  const featureId = feature.getId()?.toString();
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const gyldigTil = metadata.common?.gyldigTil;
  const isCommonFieldDisabled = isGrenseinformasjonPanelDisabled || metadata?.common?.gyldigTil != null;

  const getMaalemetodeText = (maalemetoder: KodelisteRespons, id: string | undefined) => {
    if (id === undefined || id.length === 0) {
      return "Ikke spesifisert";
    }

    const maalemetode = maalemetoder.items.find((item) => item.id === id);
    if (maalemetode) {
      return maalemetode?.kode + " " + maalemetode?.label;
    }
    return "Ukjent målemetode er registrert på grensen";
  };

  const getPossibleGrenseTypesFromInndelingtype = (inndelingtype: Inndelingtype | undefined): GrenseType[] => {
    switch (inndelingtype) {
      case "stemmekrets":
        return ["Stemmekretsgrense", "Kommunegrense"];
      case "grunnkrets":
        return ["Grunnkretsgrense", "Delområdegrense", "Kommunegrense"];
      case "kommune":
        return ["Kommunegrense", "Delområdegrense", "Grunnkretsgrense", "Stemmekretsgrense"];
      default:
        return [];
    }
  };

  const getSistOppdatert = () => {
    const oppdateringsDato = metadata?.common?.sporingsinformasjon.oppdateringsdato;
    return oppdateringsDato !== undefined ? datestringToFormattedDatestring(oppdateringsDato) : "Ukjent";
  };

  useEffect(() => {
    setIsEditing(false);
    reset(getDefaultValues(feature));
  }, [feature, getDefaultValues, reset, history]);

  const relevantPosisjonskvaliteter = useMemo(() => {
    const posisjonskvaliteter: Map<string, ContextualPosisjonskvalitet> | undefined = feature.get("snapData");
    if (posisjonskvaliteter != null && posisjonskvaliteter.size > 0 && isLineStringFeature(feature)) {
      const featureCoordinates = feature.getGeometry()?.getCoordinates();
      const featureCoordinatesAsString =
        featureCoordinates != null ? featureCoordinates.map((coord) => coord.toString()) : [];
      // Hvis man har snappet bort fra en grense man tidligere snappet til i utkastet ønsker vi ikke å bruke denne posisjonskvaliteten
      const relevant: ContextualPosisjonskvalitet[] = [...posisjonskvaliteter.entries()]
        .filter(([coordKey]) => featureCoordinatesAsString.includes(coordKey))
        .map(([, posisjonskvalitet]) => posisjonskvalitet)
        // TODO: håndter matrikkelgrenser når vi kan få målemetode fra matrikkel
        .filter((posisjonskvalitet) => posisjonskvalitet.grensetype === "nibas");
      return relevant;
    }
    return [];
  }, [feature]);

  const [autofillOpen, setAutofillOpen] = useState(relevantPosisjonskvaliteter.length > 0);

  const autoFillFormValues = () => {
    if (relevantPosisjonskvaliteter != null) {
      // Finner den dårligste posisjonskvaliteten basert på nøyaktighet
      const worstPosisjonskvalitet = relevantPosisjonskvaliteter.toSorted((a, b) => {
        if (a != null && b != null && a.noeyaktighet != null && b.noeyaktighet != null) {
          return a.noeyaktighet - b.noeyaktighet;
        }
        return 0;
      })[relevantPosisjonskvaliteter.length - 1];
      if (worstPosisjonskvalitet != null && kodeliste != null) {
        setValue("noeyaktighet", worstPosisjonskvalitet.noeyaktighet, { shouldDirty: true, shouldValidate: true });
        setValue("maalemetode", worstPosisjonskvalitet.maalemetode, { shouldDirty: true, shouldValidate: true });
        handleSubmit(onSubmit)();
        setAutofillOpen(false);
        return;
      }
    }
    toast({
      status: "error",
      title: "Feil ved oppdatering av grense",
      description:
        "Feilet ved automatisk utfylling av egenskaper. Prøv å fylle ut manuelt, og kontakt Kartverket hvis feilen vedvarer",
    });
  };

  return (
    <FormContainer>
      <PanelHeader
        onClose={async () => {
          if (!isDirty) {
            onClose();
            return;
          }

          const shouldNotClose = await openAsync({
            title: "Du har ulagrede endringer",
            description:
              "Hvis du går ut av informasjonspanelet uten å fullføre redigering vil du miste endringer du har gjort.",
            acceptText: "Gå tilbake til redigering",
            declineText: "Forkast endringene",
          });
          if (!shouldNotClose) {
            onClose();
          }
        }}
        subHeading={`${isTempFeatureId(featureId) ? "" : `Sist oppdatert: ${getSistOppdatert()}`}`}
        noMargin
        button={
          !isCommonFieldDisabled
            ? EditGrenseInfoButton({
                isEditing: isEditing,
                handleSubmit: handleSubmit(onSubmit),
                toggleEdit: () => {
                  if (isEditing) {
                    reset(getDefaultValues(feature));
                  }
                  setIsEditing(!isEditing);
                },
              })
            : null
        }
      >
        Informasjon
      </PanelHeader>
      {autofillOpen && (
        <AutofillAlert status={"info"}>
          <AutofillAlertHeader>
            <TitleWithIconTooltip
              tooltipLabel={
                "Grensen har blitt snappet til en annnen grense, og vi kan derfor kopiere egenskapene fra den tilsnappede grensen over til denne grensen."
              }
            >
              <AlertTitle>Noen egenskaper kan fylles ut automatisk</AlertTitle>
            </TitleWithIconTooltip>
            <IconButton
              icon={"close"}
              aria-label={"Lukk autofyll dialog"}
              variant="ghost"
              onClick={() => setAutofillOpen(false)}
            />
          </AutofillAlertHeader>
          <AlertDescription>
            Målemetoden og nøyaktigheten for denne grensen kan fylles inn automatisk. Vil du at vi skal fylle inn
            egenskapene for deg?
          </AlertDescription>
          <ButtonGroup>
            <Button
              size={"sm"}
              /* @ts-expect-error auto_fix_high er ikke i versjonen av kvib (material-symbols) vi bruker*/
              leftIcon="auto_fix_high"
              onClick={() => autoFillFormValues()}
            >
              Fyll inn automatisk
            </Button>
            <Button size={"sm"} variant="secondary" onClick={() => setAutofillOpen(false)}>
              Nei, jeg vil fylle inn selv
            </Button>
          </ButtonGroup>
        </AutofillAlert>
      )}
      <GrenseinformasjonRow
        name="Identifikator (UUID)"
        tooltipLabel="Grensen sin unike identifikator"
        isRequired
        valueLabel={(() => {
          if (isTempFeatureId(featureId)) {
            return `Ny grense - ID blir satt ved publisering`;
          }
          if (isNonEditableFeatureId(featureId)) {
            return getNonEditableFeatureId(feature);
          }
          return featureId;
        })()}
      />

      <GrenseinformasjonRow
        name="Gyldig fra"
        tooltipLabel="Dato når grensen skal være gyldig fra. Fra-dato settes automatisk til publiseringsdato for utkastet ditt."
        isRequired
        valueLabel={(() => {
          if (isTempFeatureId(featureId)) {
            return "Ny grense - Dato blir satt ved publisering";
          }
          const date = metadata.common?.gyldigFra;
          return date !== undefined ? datestringToFormattedDatestring(date) : null;
        })()}
      />

      <GrenseinformasjonRow
        name="Grensetype"
        tooltipLabel="Hvilken type grense som er valgt."
        valueLabel={getValues("grenseType")}
        isEditing={isEditing}
        isRequired
      >
        <Select {...register("grenseType")}>
          {getPossibleGrenseTypesFromInndelingtype(currentlyEditingInndelinger[0]?.inndelingtype).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </GrenseinformasjonRow>

      {gyldigTil != null && (
        <div>
          <GrenseinformasjonRow
            name="Gyldig til"
            tooltipLabel="Dato når grensen skal være gyldig til."
            valueLabel={datestringToFormattedDatestring(gyldigTil)}
          />
          <Alert status="warning" variant="top-accent">
            <AlertIcon />
            Grensen er satt til å utgå ved en fremtidig dato, og du vil derfor ikke kunne gjøre noen endringer på denne
            grensen.
          </Alert>
        </div>
      )}

      <GrenseinformasjonRow
        name="Datafangstdato"
        tooltipLabel="Dato når grensen siste gang ble registert, observert eller målt."
        valueLabel={(() => {
          const date = getValues("datafangstDato");

          if (date) {
            return dateToFormattedDatestring(date);
          }
        })()}
        isEditing={isEditing}
      >
        <Controller
          control={control}
          name="datafangstDato"
          render={({ field }) => {
            const date = field.value;

            return (
              <Datepicker
                onChange={(e): void => {
                  const eventDate = new Date(e.target.value);
                  if (eventDate.toDateString() !== date?.toDateString()) {
                    field.onChange(new Date(e.target.value));
                  }
                }}
                defaultSelected={date}
              />
            );
          }}
        />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Målemetode"
        tooltipLabel="Metode som ligger til grunn for registrering av posisjon."
        valueLabel={kodeliste ? getMaalemetodeText(kodeliste, getValues("maalemetode")) : getValues("maalemetode")}
        isEditing={isEditing}
      >
        {kodeliste && (
          <Select {...register("maalemetode")}>
            <option value="">Velg målemetode</option>
            {kodeliste.items
              .sort((a, b) => Number(a.kode) - Number(b.kode))
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kode} {item.label}
                </option>
              ))}
          </Select>
        )}
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Nøyaktighet (cm)"
        tooltipLabel="Antatt posisjonsnøyaktighet i grunnriss (x, y) oppgitt i cm. Den nøyaktigheten som angis bør være så nær det virkelige objektet som mulig."
        valueLabel={getValues("noeyaktighet")?.toString()}
        isEditing={isEditing}
      >
        <Input type="number" {...register("noeyaktighet")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Opphav"
        tooltipLabel="Ansvarlig organisasjon som er opphav til grensedataene."
        valueLabel={getValues("opphav")}
        isEditing={isEditing}
      >
        <Input placeholder="Fyll inn informasjon om opphav" {...register("opphav")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Ekstra informasjon"
        tooltipLabel="Åpent felt med ekstra informasjon om grensen"
        valueLabel={getValues("informasjon")}
        isEditing={isEditing}
      >
        <Textarea placeholder="Fyll inn ekstra informasjon" {...register("informasjon")} />
      </GrenseinformasjonRow>
    </FormContainer>
  );
};

export default GrenseinformasjonForm;

const AutofillAlert = styled(Alert)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 15px;
`;

const AutofillAlertHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
