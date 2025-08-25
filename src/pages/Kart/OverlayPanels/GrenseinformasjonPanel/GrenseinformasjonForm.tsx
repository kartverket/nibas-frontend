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
  Tooltip,
  useDisclosure,
  useToast,
} from "@kvib/react";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useInndelingFeatures from "contexts/InndelingerContext/useInndelingFeatures";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { editableGrenseTypes } from "hooks/layers/types";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import {
  getNonEditableFeatureId,
  isNonEditableFeatureId,
  isTempFeatureId,
} from "pages/Kart/interactions/feature-id-utils";
import { ContextualPosisjonskvalitet } from "pages/Kart/interactions/useModify";
import { TooltipBody } from "pages/Kart/Toolbar/CustomTooltip";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { styled } from "styled-components";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { removeNil } from "utils/list-utils";
import { isLineStringFeature } from "utils/type-utils";
import { getKretsIdFromKontekstegenskaper } from "../hooks/tilhorighet-utils";
import { useGrenseinformasjonForm } from "../hooks/useGrenseinformasjonForm";
import { PanelHeader } from "../Panel";
import {
  datestringToFormattedDatestring,
  dateToFormattedDatestring,
  isGrenseinformasjonPanelDisabled,
} from "./grenseinformasjon-utils";
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
  tooltip: string | null;
  isDisabled: boolean;
};

export const EditGrenseInfoButton = ({
  isEditing,
  handleSubmit,
  toggleEdit,
  tooltip,
  isDisabled,
}: EditGrenseInfoButtonProps) => {
  return isEditing ? (
    <Button
      onClick={() => {
        handleSubmit();
        toggleEdit();
      }}
      isDisabled={isDisabled}
      rightIcon="check_circle"
    >
      Fullfør redigering
    </Button>
  ) : tooltip != null && isDisabled ? (
    <Tooltip hasArrow placement="left" label={<TooltipBody text={tooltip != null ? tooltip : ""} />}>
      {<Button isDisabled={true}>Rediger</Button>}
    </Tooltip>
  ) : (
    <Button onClick={() => toggleEdit()}>Rediger</Button>
  );
};

const GrenseinformasjonForm = ({ feature, onClose }: Props) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { data: matrikkelkodeliste } = useNibasApi("/v1/matrikkelkodelister");
  const { currentlyEditingInndelinger } = useInndelinger();
  const { utkast, utkastHarSammenslaainger } = useUtkast();
  const { inndelingFeatures } = useInndelingFeatures(currentlyEditingInndelinger);
  const { history } = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const { openAsync } = useConfirmationModal();
  const { register, handleSubmit, getValues, setValue, control, reset, getDefaultValues, onSubmit, isDirty } =
    useGrenseinformasjonForm(feature);
  const toast = useToast();
  const featureId = feature.getId()?.toString();
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const gyldigTil = metadata.common?.gyldigTil;
  const isCommonFieldDisabled = isGrenseinformasjonPanelDisabled(feature) || metadata?.common?.gyldigTil != null;

  const getMaalemetodeText = (maalemetoder: KodelisteRespons, id: string | undefined) => {
    if (id === undefined || id.length === 0) {
      return "Ikke spesifisert";
    }

    const maalemetode = maalemetoder.items.find((item) => item.id === id);
    if (maalemetode) {
      return maalemetode?.kode + " " + maalemetode?.label;
    } else if (matrikkelkodeliste !== undefined) {
      // Hvis målemetode ikke finnes i kodeliste med den id'n, sjekk matrikkelkodeliste
      const matrikkelMaalemetode = matrikkelkodeliste.maalemetodeKodeliste.find((item) => item.id?.toString() === id);
      if (matrikkelMaalemetode !== undefined) {
        // Matcher kodeverdi fra matrikkelkodeliste med kodeliste
        const match = maalemetoder.items.find((item) => item.kode === matrikkelMaalemetode.kodeverdi);
        if (match) {
          return match.kode + " " + match.label;
        }
      }
    }

    return "Ukjent målemetode er registrert på grensen";
  };

  const getSistOppdatert = () => {
    const oppdateringsDato = metadata?.common?.sporingsinformasjon.oppdateringsdato;
    return oppdateringsDato !== undefined ? datestringToFormattedDatestring(oppdateringsDato) : "Ukjent";
  };

  useEffect(() => {
    setIsEditing(false);
    reset(getDefaultValues(feature));
  }, [feature, getDefaultValues, reset, history]);

  const relevantPosisjonskvaliteter = (() => {
    const eksisterendePosisjonskvalitet = metadata.commonGrense?.posisjonskvalitet;
    const posisjonskvaliteter: Map<string, ContextualPosisjonskvalitet> | undefined = feature.get("snapData");
    if (posisjonskvaliteter != null && posisjonskvaliteter.size > 0 && isLineStringFeature(feature)) {
      const featureCoordinates = feature.getGeometry()?.getCoordinates();
      const featureCoordinatesAsString =
        featureCoordinates != null ? featureCoordinates.map((coord) => coord.toString()) : [];
      // Hvis man har snappet bort fra en grense man tidligere snappet til i utkastet ønsker vi ikke å bruke denne posisjonskvaliteten
      const allowedGrensetyper = ["nibas", "teig"];
      const relevant: ContextualPosisjonskvalitet[] = [...posisjonskvaliteter.entries()]
        .filter(([coordKey]) => featureCoordinatesAsString.includes(coordKey))
        .map(([, posisjonskvalitet]) => {
          // Gjør matching fra matrikkelkodeliste til kodeliste
          if (matrikkelkodeliste !== undefined && posisjonskvalitet.maalemetode !== undefined) {
            const matrikkelMaalemetode = matrikkelkodeliste.maalemetodeKodeliste.find(
              (item) => item.id?.toString() === posisjonskvalitet.maalemetode,
            );

            if (matrikkelMaalemetode !== undefined) {
              const match = kodeliste?.items.find((item) => item.kode === matrikkelMaalemetode.kodeverdi);
              if (match) {
                // Oppdater maalemetode til å bruke ID fra kodeliste istedenfor matrikkelkodeliste-id'en
                return {
                  ...posisjonskvalitet,
                  maalemetode: match.id,
                };
              }
            }
          }
          return posisjonskvalitet;
        })
        .filter(
          (posisjonskvalitet) =>
            posisjonskvalitet.noeyaktighet !== eksisterendePosisjonskvalitet?.noeyaktighet ||
            posisjonskvalitet.maalemetode !== eksisterendePosisjonskvalitet?.maalemetode.id,
        )
        .filter((posisjonskvalitet) => allowedGrensetyper.includes(posisjonskvalitet.grensetype));
      return relevant;
    }
    return [];
  })();

  const [autofillLoading, setAutofillLoading] = useState(false);
  const mockAutofillLoading = () => {
    setAutofillLoading(true);
    setTimeout(() => {
      setAutofillLoading(false);
    }, 1000);
  };

  const autoFillFormValues = () => {
    if (relevantPosisjonskvaliteter != null) {
      // Separerer "teig" og "nibas"
      const teigPosisjonskvaliteter = relevantPosisjonskvaliteter.filter(
        (posisjonskvalitet) => posisjonskvalitet.grensetype === "teig",
      );
      const nibasPosisjonskvaliteter = relevantPosisjonskvaliteter.filter(
        (posisjonskvalitet) => posisjonskvalitet.grensetype === "nibas",
      );

      // Prioriterer posisjonskvaliteter fra teiggrense hvis de finnes, ellers bruker nibas
      const prioritizedPosisjonskvaliteter =
        teigPosisjonskvaliteter.length > 0 ? teigPosisjonskvaliteter : nibasPosisjonskvaliteter;

      // Finner den dårligste posisjonskvaliteten basert på nøyaktighet
      const worstPosisjonskvalitet = prioritizedPosisjonskvaliteter.toSorted((a, b) => {
        if (a != null && b != null && a.noeyaktighet != null && b.noeyaktighet != null) {
          return a.noeyaktighet - b.noeyaktighet;
        }
        return 0;
      })[prioritizedPosisjonskvaliteter.length - 1];
      if (worstPosisjonskvalitet != null && (kodeliste != null || matrikkelkodeliste != null)) {
        // Bruker matrikkelkodeliste hvis det er teig, ellers bruker vi nibas-kodeliste
        let maalemetodeIdToSet = worstPosisjonskvalitet.maalemetode;
        if (matrikkelkodeliste !== undefined) {
          const matrikkelMaalemetode = matrikkelkodeliste.maalemetodeKodeliste.find(
            (item) => item.id?.toString() === worstPosisjonskvalitet.maalemetode,
          );
          if (matrikkelMaalemetode !== undefined) {
            // Finn match i kodeliste basert på kodeverdien fra matrikkelkodeliste
            const match = kodeliste?.items.find((item) => item.kode === matrikkelMaalemetode.kodeverdi);
            if (match) {
              maalemetodeIdToSet = match.id; // Bruk ID-en fra kodeliste, ikke fra matrikkelkodeliste
            }
          }
        }
        setValue("noeyaktighet", worstPosisjonskvalitet.noeyaktighet, { shouldDirty: true, shouldValidate: true });
        setValue("maalemetode", maalemetodeIdToSet, { shouldDirty: true, shouldValidate: true });
        handleSubmit(onSubmit)();
        mockAutofillLoading();
        onCloseAutofill();
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

  const { isOpen: isAutofillOpen, onOpen: onOpenAutofill, onClose: onCloseAutofill } = useDisclosure();
  useEffect(() => {
    if (relevantPosisjonskvaliteter.length > 0) {
      onOpenAutofill();
    }
  }, [relevantPosisjonskvaliteter, onOpenAutofill]);

  const featureIsMergeFeatureInUtkast = (): boolean => {
    const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
    const involverteKretserLokalids =
      sammenslaaing?.stemmekretserTilSammenslaaing
        .flatMap((sk) => sk.lokalId)
        .concat(sammenslaaing.viderefoertStemmekrets.lokalId) ?? [];
    const mergeFeatures = inndelingFeatures
      .flatMap((i) => i.features)
      .filter((f) => {
        // Finner kontekstegenskapene til featuren (kretsene featuren er en del av)
        const kretserIdFromKontekst = removeNil(
          (f.getProperties() as FeatureProperties).kontekstEgenskaper.map((ke) => getKretsIdFromKontekstegenskaper(ke)),
        );
        // hvis featuren har to av de involverte kretsene som kontekster så betyr det at det er en feature som deler de to kretsene
        const overlap = new Set(involverteKretserLokalids.filter((id) => new Set(kretserIdFromKontekst).has(id)));
        return overlap.size >= 2;
      });

    return mergeFeatures.map((mf) => mf.getId()).includes(featureId);
  };
  const mergeInformasjon = utkast?.operasjoner.stemmekretsSammenslaaingsendring?.informasjon;

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
          !isCommonFieldDisabled ? (
            <EditGrenseInfoButton
              isEditing={isEditing}
              handleSubmit={handleSubmit(onSubmit)}
              isDisabled={utkastHarSammenslaainger()}
              tooltip={
                utkastHarSammenslaainger() === true
                  ? "Utkastet har sammenslåinger og grenseinformasjon kan derfor ikke redigeres"
                  : null
              }
              toggleEdit={() => {
                if (isEditing) {
                  reset(getDefaultValues(feature));
                }
                setIsEditing(!isEditing);
              }}
            />
          ) : null
        }
      >
        Informasjon
      </PanelHeader>
      {relevantPosisjonskvaliteter.length > 0 && isAutofillOpen && (
        <AutofillAlert status={"info"}>
          <AutofillAlertHeader>
            <TitleWithIconTooltip
              tooltipLabel={
                "Grensen har blitt snappet til en annen grense, og vi kan derfor kopiere egenskapene fra den tilsnappede grensen over til denne grensen."
              }
            >
              <AlertTitle>Noen egenskaper kan fylles ut automatisk</AlertTitle>
            </TitleWithIconTooltip>
            <IconButton
              icon={"close"}
              aria-label={"Lukk autofyll dialog"}
              variant="ghost"
              onClick={() => onCloseAutofill()}
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
              Fyll ut automatisk
            </Button>
            <Button size={"sm"} variant="secondary" onClick={() => onCloseAutofill()}>
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
          {editableGrenseTypes.map((type) => (
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
        isLoading={autofillLoading}
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
        isLoading={autofillLoading}
      >
        <Input type="number" {...register("noeyaktighet")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Opphav"
        tooltipLabel="Ansvarlig organisasjon som er opphav til grensedataene."
        valueLabel={getValues("opphav")}
        isEditing={isEditing}
      >
        <Input placeholder="Fyll ut informasjon om opphav" {...register("opphav")} />
      </GrenseinformasjonRow>

      <GrenseinformasjonRow
        name="Ekstra informasjon"
        tooltipLabel="Åpent felt med ekstra informasjon om grensen"
        valueLabel={
          featureIsMergeFeatureInUtkast() && mergeInformasjon != null ? mergeInformasjon : getValues("informasjon")
        }
        isEditing={isEditing}
      >
        <Textarea placeholder="Fyll ut ekstra informasjon" {...register("informasjon")} />
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
