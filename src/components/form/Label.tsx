import { LabelHTMLAttributes } from "react";
import { styled } from "styled-components";

const Container = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  color: var(--black);
`;

type Props = { label: string } & LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ label, className, children, ...props }: Props) => {
  return (
    <Container {...props} className={className}>
      {label}
      {children}
    </Container>
  );
};

export default Label;
