import { FormControl, FormLabel, IconButton, IconButtonProps } from "@kvib/react";
import { forwardRef } from "react";
import { styled } from "styled-components";
import CustomTooltip, { CustomTooltipProps } from "./CustomTooltip";

type Props = {
  isActive?: boolean;
  tooltip: CustomTooltipProps;
} & IconButtonProps;

const ToolbarButton = ({ icon, children, tooltip, ...props }: Props, ref: React.ForwardedRef<HTMLButtonElement>) => (
  <CustomTooltip {...tooltip}>
    <ButtonContainer>
      <IconButton icon={icon} variant="ghost" ref={ref} {...props} />
      <Label>{children}</Label>
    </ButtonContainer>
  </CustomTooltip>
);

const ButtonContainer = styled(FormControl)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled(FormLabel)`
  font-weight: normal;
  margin: 0;
  font-size: var(--kvib-fontSizes-sm);
`;

export default forwardRef(ToolbarButton);
