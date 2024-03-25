import { Button } from "@kvib/react";
import { styled } from "styled-components";

type StepButtonGroupProps = {
  secondaryButtonText: string;
  secondaryButtonOnClick: () => void;
  primaryButtonText: string;
  primaryButtonIsLoading: boolean;
  primaryButtonOnClick: () => void;
};
const StepButtonGroup = (props: StepButtonGroupProps) => {
  return (
    <ButtonGroup>
      <Button variant="secondary" onClick={props.secondaryButtonOnClick}>
        {props.secondaryButtonText}
      </Button>
      <Button isLoading={props.primaryButtonIsLoading} variant="primary" onClick={props.primaryButtonOnClick}>
        {props.primaryButtonText}
      </Button>
    </ButtonGroup>
  );
};

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 8px;
  gap: 16px;
`;

export default StepButtonGroup;
