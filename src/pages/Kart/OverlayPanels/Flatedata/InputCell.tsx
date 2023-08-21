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
  ref
) {
  return (
    <Cell $isEditing={isEditing}>
      {isEditing ? <InlineInput {...inputProps} ref={ref} /> : data}
    </Cell>
  );
});

const Cell = styled.td<{ $isEditing: boolean }>`
  ${(props) => props.$isEditing && "padding: 12px !important;"};
`;

const InlineInput = styled(Input)`
  input {
    padding: 12px;
    font-size: 15px;
  }
`;

export default InputCell;
