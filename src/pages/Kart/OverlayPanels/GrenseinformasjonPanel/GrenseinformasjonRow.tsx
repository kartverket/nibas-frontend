import { Divider, Icon, SkeletonText, Text, Tooltip } from "@kvib/react";
import { styled } from "styled-components";
import EditAndSaveButton from "../Flatedata/EditAndSaveButton";
import { useEffect, useState } from "react";
import { Geometry } from "ol/geom";
import { Feature } from "ol";

interface Props {
  feature: Feature<Geometry>;
  name: string;
  valueLabel?: string;
  tooltipLabel: string;
  children: React.ReactNode;
  onMetadataSubmit: () => void;
  isDisabled?: boolean;
  isDirty: boolean;
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
  isUneditable,
  isLoading,
  reset,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [feature]);

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
              onSubmit={() => {
                if (isDirty) {
                  onMetadataSubmit();
                }
                setIsEditing(false);
              }}
              toggleEditing={() =>
                setIsEditing((prevState) => {
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
          <Field>{children}</Field>
        ) : isLoading ? (
          <SkeletonText noOfLines={1} skeletonHeight={5} marginTop="8px" />
        ) : (
          <Field>{valueLabel || "Ikke spesifisert"}</Field>
        )}
      </EditContent>
      <Divider />
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
  flex-direction: row;
  justify-content: space-between;
`;

const TextWithIcon = styled.div`
  display: flex;
  flex-direction: row;
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
