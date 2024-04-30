import Input from "components/Input";
import { forwardRef } from "react";
import { styled } from "styled-components";

type InputProps = React.ComponentProps<typeof Input>;

type Props = {
  data: string;
  isEditing: boolean;
} & InputProps;

const InputCell = forwardRef<HTMLInputElement, Props>(function InputCell(
  { data, isEditing, ...inputProps }: Props,
  ref,
) {
  return <TableCell>{isEditing ? <Input {...inputProps} ref={ref} size="sm" /> : data}</TableCell>;
});

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td>
    <CenteredText>{children}</CenteredText>
  </td>
);

const CenteredText = styled.span`
  vertical-align: middle;
`;

export default InputCell;
