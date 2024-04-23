// TODO Skal slettes i TS-1579, kun brukt som en kopi av den gamle GrenseinformasjonRow slik at vi ikke trenger å lage en midlertidig "smart" GrenseinformasjonRow som håndterer tilhørighet i tillegg
import { FormControl, FormErrorMessage, Icon, SkeletonText, Text, Tooltip } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useEffect, useState } from "react";
import { Geometry } from "ol/geom";
import { Feature } from "ol";

interface Props {
  feature: Feature<Geometry>;
  name: string;
  valueLabel?: React.ReactNode;
  tooltipLabel: string;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  isDirty: boolean;
  isValid: boolean;
  isUneditable?: boolean;
  isLoading?: boolean;
  reset: () => void;
}

const GrenseinformasjonRow = ({
  feature,
  name,
  tooltipLabel,
  valueLabel,
  children,
  onMetadataSubmit,
  isDisabled,
  isDirty,
  isValid,
  isUneditable = false,
  isLoading = false,
  reset,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (isDirty && isValid) {
      onMetadataSubmit();
      setIsEditing(false);
    }
    if (!isDirty) {
      setIsEditing(false);
    }
  };

  return (
    <Container>
      <EditContent>
        <Row>
          <Tooltip label={tooltipLabel} hasArrow placement="bottom">
            <TextWithIcon onMouseOver={() => setIconHovered(true)} onMouseOut={() => setIconHovered(false)}>
              <Text as="b">{name}</Text>
              <InfoIcon>
                <Icon size={24} color="var(--kvib-colors-blue-500)" isFilled={iconHovered} icon="info"></Icon>
              </InfoIcon>
            </TextWithIcon>
          </Tooltip>

          {!isUneditable && (
            <EditAndSaveButton
              isDisabled={isDisabled}
              isEditing={isEditing}
              size="sm"
              onSubmit={handleSubmit}
              toggleEditing={() =>
                setIsEditing((prevState) => {
                  setIsSubmitted(false);
                  if (isEditing) {
                    reset();
                  }
                  return !prevState;
                })
              }
            />
          )}
        </Row>
        {isEditing ? (
          <FormControl isInvalid={!isValid && isSubmitted}>
            <Field>{children}</Field>
            {!isValid && isSubmitted && <FormErrorMessage>Du må velge 2 tilhørigheter for grensen</FormErrorMessage>}
          </FormControl>
        ) : isLoading ? (
          <SkeletonText noOfLines={1} skeletonHeight={5} marginTop="8px" />
        ) : (
          <Field>{valueLabel ?? "Ikke spesifisert"}</Field>
        )}
      </EditContent>
    </Container>
  );
};

const InfoIcon = styled.div`
  margin-left: 8px;
  display: flex;
  align-items: center;
  cursor: default;
`;
const EditContent = styled.div`
  display: flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;
const TextWithIcon = styled.div`
  display: flex;
  align-items: center;
`;
const Field = styled.div`
  margin-top: 8px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export default GrenseinformasjonRow;
