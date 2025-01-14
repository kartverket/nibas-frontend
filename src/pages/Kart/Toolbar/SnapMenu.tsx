import { Menu, MenuList, Switch, CloseButton, MenuDivider, MenuItem, Checkbox, Spacer } from "@kvib/react";
import { useToolbar } from "contexts/ToolbarContext";
import { styled } from "styled-components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import MenuButtonWithChevron from "./MenuButtonWithChevron";
import { useToast } from "@kvib/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const SnapMenu = ({ isOpen, onClose, onToggle }: Props) => {
  const { activeModeTools, toggleModeTool } = useToolbar();
  const toast = useToast();

  const toggleSnapping = () => {
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    const isNibasToggled = activeModeTools.includes("snap_nibas");

    if (isMatrikkelToggled === isNibasToggled) {
      toggleModeTool("snap_matrikkel");
      toggleModeTool("snap_nibas");
    } else if (isMatrikkelToggled) {
      toggleModeTool("snap_matrikkel");
    } else {
      toggleModeTool("snap_nibas");
    }
  };

  // useKeyboardShortcut("snap", toggleSnapping);
  useKeyboardShortcut("snap", () => {
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    const isNibasToggled = activeModeTools.includes("snap_nibas");
    toggleSnapping();
    if (!isMatrikkelToggled && !isNibasToggled) {
      toast({ status: "info", title: "Snapping er slått på." });
    } else {
      toast({ status: "warning", title: "Snapping er slått av." });
    }
  });
  // useKeyboardShortcut("snap_matrikkel", () => toggleModeTool("snap_matrikkel"));
  useKeyboardShortcut("snap_matrikkel", () => {
    toggleModeTool("snap_matrikkel");
    const isMatrikkelToggled = activeModeTools.includes("snap_matrikkel");
    if (isMatrikkelToggled) {
      toast({ status: "warning", title: "Snapping mot teiggrenser er slått av." });
    } else {
      toast({ status: "info", title: "Snapping mot teiggrenser er slått på." });
    }
  });
  useKeyboardShortcut("snap_nibas", () => {
    toggleModeTool("snap_nibas");
    const isMatrikkelToggled = activeModeTools.includes("snap_nibas");
    if (isMatrikkelToggled) {
      toast({ status: "warning", title: "Snapping mot egne grenser er slått av." });
    } else {
      toast({ status: "info", title: "Snapping mot egne grenser er slått på." });
    }
  });
  // useKeyboardShortcut("snap_nibas", () => toggleModeTool("snap_nibas"));
  return (
    <Menu closeOnSelect={false} closeOnBlur={false} onClose={onClose} isOpen={isOpen}>
      <MenuButtonWithChevron
        aria-label="Snap til andre grenser i kartet"
        isOpen={isOpen}
        onClick={onToggle}
        icon="align_justify_space_between"
        isActive={activeModeTools.includes("snap_nibas") || activeModeTools.includes("snap_matrikkel")}
        tooltip={{ text: "Skru av/på snapping mot andre grenser.", shortcut: "snap" }}
      >
        Snap
      </MenuButtonWithChevron>
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
