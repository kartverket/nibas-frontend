import { FormControl, IconButton, IconButtonProps } from "@kvib/react";
import { forwardRef } from "react";
import { styled } from "styled-components";
import CustomTooltip, { CustomTooltipProps } from "./CustomTooltip";

export type ToolbarButtonProps = {
  isActive?: boolean;
  tooltip: CustomTooltipProps;
} & IconButtonProps;

const ToolbarButton = ({ icon, tooltip, ...props }: ToolbarButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => (
  <CustomTooltip {...tooltip}>
    <ButtonContainer>
      <IconButton icon={icon} variant="ghost" ref={ref} {...props} />
    </ButtonContainer>
  </CustomTooltip>
);

const ButtonContainer = styled(FormControl)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default forwardRef(ToolbarButton);
