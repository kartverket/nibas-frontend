import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Alert, AlertIcon, Button, Datepicker, Input, Select, Textarea } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { styled } from "styled-components";
import { addFeaturePropertiesEntryFromFeature, dateToFriendlyDatestring, getDateInFriendlyString } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { FeatureProperties, KodelisteRespons, Metadata } from "types/api";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import GrenseinformasjonRow from "./GrenseinformasjonRow";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { GrenseinformasjonFormProps, useGrenseinformasjonForm } from "../hooks/useGrenseinformasjonForm";
import { PanelHeader } from "../Panel";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler } from "react-hook-form";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { formatISO, startOfDay } from "date-fns";
import { LineString } from "ol/geom";
import { useHistory } from "contexts/HistoryContext";
import { TilhorighetField } from "./TilhorighetField";

type Props = {
  feature: Feature<Geometry>;
  onClose: () => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
`;

type EditGrenseInfoButtonProps = {
  isEditing: boolean;
  handleSubmit: () => void;
  toggleEdit: () => void;
};

const EditGrenseInfoButton = ({ isEditing, handleSubmit, toggleEdit }: EditGrenseInfoButtonProps) => {
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

const GrenseinformasjonFieldList = ({ feature, onClose }: Props) => {
  const { data: kodeliste } = useNibasApi("/v1/kodeliste/maalemetode-koder");
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const isGrenseinformasjonPanelDisabled = useIsGrenseinformasjonPanelDisabled(feature);

  const { register, handleSubmit, formState, getValues, control, reset, getDefaultValues } =
    useGrenseinformasjonForm(feature);

  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const gyldigTil = properties.metadata ? metadata.common?.gyldigTil : undefined;
  const isCommonFieldDisabled = isGrenseinformasjonPanelDisabled || metadata?.common?.gyldigTil != null;

  const getMaalemetodeFromId = (maalemetoder: KodelisteRespons, id: string) => {
    const maalemetode = maalemetoder.items.find((item) => item.id === id);
    if (maalemetode) {
      return maalemetode?.kode + " " + maalemetode?.label;
    }
    return "Ukjent målemetode er registrert på grensen";
  };

  const getPossibleGrenseTypesFromEditingType = (editingType: EditingType | null): GrenseType[] => {
    if (editingType === "stemmekrets") {
      return ["Stemmekretsgrense", "Kommunegrense"];
    }
    if (editingType === "grunnkrets") {
      return ["Grunnkretsgrense", "Delområdegrense", "Kommunegrense"];
    }

    return [];
  };

  const getSistOppdatert = () => {
    if (isTempFeatureId(feature.getId()?.toString())) return "Ny grense, aldri oppdatert";

    if (metadata) {
      const oppdateringsDato = metadata.common?.sporingsinformasjon.oppdateringsdato;

      if (oppdateringsDato) {
        return getDateInFriendlyString(oppdateringsDato);
      }
    }

    return "Ukjent";
  };

  const onSubmit: SubmitHandler<GrenseinformasjonFormProps> = (data) => {
    if (formState.isDirty) {
      const metadataDiscriminator = getMetadataDiscriminatorFromType(data.grenseType);
      if (!metadataDiscriminator) return; // errorhåndtering på noe vis her

      const newMetadata: Metadata = {
        ...metadata,
        common: {
          ...metadata.common!, // TODO ikke !
          datafangstdato: data.datafangstDato
            ? formatISO(startOfDay(data.datafangstDato))
            : metadata.common?.datafangstdato,
          informasjon: data.informasjon,
          opphav: data.opphav,
        },
        commonGrense: {
          posisjonskvalitet: {
            maalemetode: {
              id: data.maalemetode,
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              href: metadata.commonGrense?.posisjonskvalitet?.maalemetode.href!, // TODO dont
            },
            noeyaktighet: data.noeyaktighet,
          },
        },
        discriminator: metadataDiscriminator,
        dokumentasjonsreferanser: [],
      };

      // const newKontekstEgenskaper: KontekstEgenskaper[] = Object.entries(data.tilhorighet).map(
      //   ([kretsType, choices]) => {
      //     const bothChoices = [choices["a"], choices["b"]];
      //   },
      // );

      const newProperties: FeatureProperties = {
        ...properties,
        type: data.grenseType,
        metadata: newMetadata,
      };

      addFeaturePropertiesEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, newProperties);

      reset(getDefaultValues(feature));
    }
  };

  useEffect(() => {
    reset(getDefaultValues(feature));
  }, [feature, getDefaultValues, reset]);

  return (
    <Container>
      <form>
        <PanelHeader
          onClose={onClose}
          subHeading={`Sist oppdatert: ${getSistOppdatert()}`}
          button={
            !isCommonFieldDisabled
              ? EditGrenseInfoButton({
                  isEditing: isEditing,
                  handleSubmit: handleSubmit(onSubmit),
                  toggleEdit: () => setIsEditing(!isEditing),
                })
              : null
          }
        >
          Informasjon om grense
        </PanelHeader>

        <GrenseinformasjonRow
          name="Identifikator (UUID)"
          tooltipLabel="Grensen sin unike identifikator"
          valueLabel={(() => {
            const featureId = feature.getId()?.toString();

            if (featureId && isTempFeatureId(featureId)) return `Ny grense - ID blir satt ved publisering`;

            return feature.getId()?.toString() || null;
          })()}
        />

        <GrenseinformasjonRow
          name="Gyldig fra"
          tooltipLabel="Dato når grensen skal være gyldig fra. Fra-dato settes automatisk til publiseringsdato for utkastet ditt."
          valueLabel={(() => {
            const date = metadata.common?.gyldigFra;
            const formattedDate = getDateInFriendlyString(date);
            const featureId = feature.getId()?.toString();

            if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

            return formattedDate || null;
          })()}
        />

        <GrenseinformasjonRow
          name="Grensetype"
          tooltipLabel="Hvilken type grense som er valgt."
          valueLabel={getValues("grenseType")}
          isEditing={isEditing}
        >
          <Select {...register("grenseType")}>
            {getPossibleGrenseTypesFromEditingType(getCurrentlyEditingType()).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </GrenseinformasjonRow>

        {gyldigTil && (
          <div>
            <GrenseinformasjonRow
              name="Gyldig til"
              tooltipLabel="Dato når grensen skal være gyldig til."
              valueLabel={getDateInFriendlyString(gyldigTil)}
            />
            <Alert status="warning" variant="top-accent">
              <AlertIcon />
              Grensen er satt til å utgå ved en fremtidig dato, og du vil derfor ikke kunne gjøre noen endringer på
              denne grensen.
            </Alert>
          </div>
        )}

        <GrenseinformasjonRow
          name="Datafangstdato"
          tooltipLabel="Dato når grensen siste gang ble registert, observert eller målt."
          valueLabel={(() => {
            const date = getValues("datafangstDato");

            if (!date) return undefined;

            const formattedDate = dateToFriendlyDatestring(date);

            const featureId = feature.getId()?.toString();

            if (featureId && isTempFeatureId(featureId)) return "Ny grense - Dato blir satt ved publisering";

            return formattedDate || undefined;
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
          valueLabel={kodeliste ? getMaalemetodeFromId(kodeliste, getValues("maalemetode")) : getValues("maalemetode")}
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
          valueLabel={getValues("noeyaktighet")}
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
          name={"Ekstra informasjon"}
          tooltipLabel={"Åpent felt med ekstra informasjon om grensen"}
          valueLabel={getValues("informasjon")}
          isEditing={isEditing}
        >
          {<Textarea placeholder="Fyll inn ekstra informasjon" {...register("informasjon")} />}
        </GrenseinformasjonRow>

        <TilhorighetField feature={feature} />

        <Vedtaksinformasjon feature={feature} />
      </form>
    </Container>
  );
};

export default GrenseinformasjonFieldList;
