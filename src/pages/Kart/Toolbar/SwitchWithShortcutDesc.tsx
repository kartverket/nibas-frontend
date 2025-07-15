import { Flex, Switch, Text } from "@kvib/react";

type SwitchWithShortcurDescProps = {
  value: string;
  onChange: () => void;
  isChecked: boolean;
  shortcut: string;
  children: React.ReactNode;
};

const SwitchWithShortcutDesc = ({ value, onChange, isChecked, shortcut, children }: SwitchWithShortcurDescProps) => {
  return (
    <Flex align="center" justifyContent={"space-between"}>
      <Switch value={value} onChange={onChange} isChecked={isChecked} size="sm">
        {children}
      </Switch>
      <Text fontSize="sm" color="gray.500" ml="auto" marginLeft={2}>
        {shortcut}
      </Text>
    </Flex>
  );
};

export default SwitchWithShortcutDesc;
