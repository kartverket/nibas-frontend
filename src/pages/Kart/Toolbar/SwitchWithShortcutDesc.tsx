import { Switch, Text, MenuItem } from "@kvib/react";

type SwitchWithShortcutDescProps = {
  value: string;
  onChange: () => void;
  isChecked: boolean;
  shortcut: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  closeOnSelect?: boolean;
};

const SwitchWithShortcutDesc = ({
  value,
  onChange,
  isChecked,
  shortcut,
  isDisabled,
  closeOnSelect,
  children,
}: SwitchWithShortcutDescProps) => {
  return (
    <MenuItem isDisabled={isDisabled} closeOnSelect={closeOnSelect} justifyContent={"space-between"}>
      <Switch value={value} onChange={onChange} isChecked={isChecked} size="sm" display="flex" alignItems="center">
        {children}
      </Switch>
      <Text fontSize="sm" color="gray.500" ml="auto" marginLeft={2}>
        {shortcut}
      </Text>
    </MenuItem>
  );
};

export default SwitchWithShortcutDesc;
