import { Menu, MenuButton, MenuList, Switch, CloseButton, MenuDivider, MenuItem, Checkbox, Spacer } from "@kvib/react";
import ToolbarButton from "./ToolbarButton";
import { useToolbar } from "contexts/ToolbarContext";
import { styled } from "styled-components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const SnapMenu = ({ isOpen, onClose, onToggle }: Props) => {
  const { activeModeTools, toggleModeTool } = useToolbar();

  const toggleSnapping = () => {
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    const isNibasToggled = activeModeTools.includes("snap_nibas");

    if (isMatrikkelToggled === isNibasToggled) {
      toggleModeTool("snap_matrikkel");
      toggleModeTool("snap_nibas");
    } else if (isMatrikkelToggled) {
      toggleModeTool("snap_matrikkel");
    } else toggleModeTool("snap_nibas");
  };

  useKeyboardShortcut("snap", onToggle);

  return (
    <Menu closeOnSelect={false} closeOnBlur={false} onClose={onClose} isOpen={isOpen}>
      <MenuButton
        onClick={onToggle}
        isActive={activeModeTools.includes("snap_nibas") || activeModeTools.includes("snap_matrikkel")}
        as={ToolbarButton}
        aria-label="Snap til andre grenser i kartet"
        icon="align_justify_space_between"
        tooltip={{ text: "Skru av/på snapping mot andre grenser.", shortcut: "snap" }}
      >
        Snap
      </MenuButton>
      <MenuList minWidth="240px" marginBottom="10px">
        <SnapMenuHeader>
          <Switch
            aria-label="Switch medium"
            isChecked={activeModeTools.includes("snap_matrikkel") || activeModeTools.includes("snap_nibas")}
            onChange={() => toggleSnapping()}
          />
          <span>Snapping</span>
          <Spacer />
          <CloseButton onClick={onClose} />
        </SnapMenuHeader>
        <MenuDivider />
        <MenuItem>
          <Checkbox
            value="egne"
            onChange={() => toggleModeTool("snap_nibas")}
            isChecked={activeModeTools.includes("snap_nibas")}
          >
            Snap til egne grenser
          </Checkbox>
        </MenuItem>
        <MenuItem>
          <Checkbox
            value="matrikkel"
            onChange={() => toggleModeTool("snap_matrikkel")}
            isChecked={activeModeTools.includes("snap_matrikkel")}
          >
            Snap til teiggrenser
          </Checkbox>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const SnapMenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
`;

export default SnapMenu;
