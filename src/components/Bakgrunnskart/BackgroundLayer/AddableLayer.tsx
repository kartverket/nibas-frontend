import styled from "styled-components";
import Button from "components/form/Button";
import { Outline } from "style/mixins";
import AddRemove from './BackgroundLayerAccordion'

type Props = {
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler;
  ariaLabel?: string;
  children?: React.ReactNode;
  activeLayer?: boolean;
};

const AddableLayer = ({ icon, onClick, ariaLabel, children }: Props) => {

  return (
      <StyledButton onClick={onClick} aria-label={ariaLabel}>
        {<span>{children} {icon}</span>}
      </StyledButton>
  );
};


const StyledButton = styled(Button).attrs(() => ({
    variant: "unstyled",
  }))<{ activeLayer?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    padding: 6px 0 6px 6px;
  
    > :first-child {
      flex: 1;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
    }

    > :first-child > :first-child {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      //Disse first-childene vet jeg er dårlig semantisk kode, men jeg fikk ikke til å kalle AddRemove fra BackroundLayerAccordion, help plz

    &:hover {
        > :first-child > :first-child > :first-child {
          background: var(--blue_light);
          color: var(--blue_dark);
        }
      }
  
    &:focus-visible {
      ${Outline}
    }
  `;

export default AddableLayer;
