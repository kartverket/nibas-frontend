type Props = {
  data: string;
  isEditing: boolean;
  children: React.ReactNode;
};

const InputCell = ({ data, isEditing, children }: Props) => {
  return <td>{isEditing ? { children } : data}</td>;
};

export default InputCell;
