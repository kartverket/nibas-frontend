import React, { LabelHTMLAttributes } from "react";
import styled from "styled-components";

type Props = LabelHTMLAttributes<HTMLLabelElement>;

const Label: React.FC<Props> = ({ className, children, ...props }) => {
  return (
    <StyledLabel {...props} className={`label--sml ${className ?? ""}`}>
      {children}
    </StyledLabel>
  );
};

const StyledLabel = styled.label``;

export default Label;
