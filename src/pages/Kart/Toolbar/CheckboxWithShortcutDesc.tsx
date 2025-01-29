import { Checkbox, Flex, Text } from "@kvib/react";

type CheckboxWithShortcutDescProps = {
  value: string;
  onChange: () => void;
  isChecked: boolean;
  shortcut: string;
  children: React.ReactNode;
};

const CheckboxWithShortcutDesc = ({
  value,
  onChange,
  isChecked,
  shortcut,
  children,
}: CheckboxWithShortcutDescProps) => {
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

export default CheckboxWithShortcutDesc;
