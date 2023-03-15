import React, { LabelHTMLAttributes } from "react";
import styled from "styled-components";

// TODO: hent styling fra blocklabel rundt om
const Container = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--gray_dark);
`;

type Props = { label: string } & LabelHTMLAttributes<HTMLLabelElement>;

// TODO: sjekk hva som skjer om man har tom label-streng
const Label: React.FC<Props> = ({ label, className, children, ...props }) => {
  return (
    <Container {...props} className={className}>
      {label}
      {children}
    </Container>
  );
};

export default Label;
