import { Checkbox, Flex, Text } from "@kvib/react";

type CustomCheckboxProps = {
  value: string;
  onChange: () => void;
  isChecked: boolean;
  shortcut: string;
  children: React.ReactNode;
};

const CustomCheckbox = ({ value, onChange, isChecked, shortcut, children }: CustomCheckboxProps) => {
  return (
    <Flex align="center" justifyContent={"space-between"}>
      <Checkbox value={value} onChange={onChange} isChecked={isChecked}>
        {children}
      </Checkbox>
      <Text fontSize="md" color="gray.500" ml="auto" marginLeft={2}>
        {shortcut}
      </Text>
    </Flex>
  );
};

export default CustomCheckbox;
