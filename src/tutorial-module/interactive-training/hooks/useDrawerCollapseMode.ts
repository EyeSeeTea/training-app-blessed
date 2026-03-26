import AddIcon from "@material-ui/icons/Add";
import MinimizeIcon from "@material-ui/icons/Minimize";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { DrawerProps } from "@material-ui/core/Drawer/Drawer";

import { SideBarConfig } from "../../../domain/entities/Config";
import i18n from "../../../utils/i18n";
import { TooltipProps } from "../../../webapp/components/tooltip/Tooltip";

type CollapseMode = SideBarConfig["collapseMode"];

function getChevronIcon(isRight: boolean, isMinimized: boolean) {
    const expandRight = isRight && isMinimized;
    const collapseLeft = !isRight && !isMinimized;
    return expandRight || collapseLeft ? ChevronLeftIcon : ChevronRightIcon;
}

export function useDrawerCollapseMode(
    collapseMode: CollapseMode,
    isRight: boolean,
    isMinimized: boolean,
    onMinimize: () => void,
    showTraining: () => void
) {
    const isHideMode = collapseMode === "hide";

    const toggleIcon = isHideMode ? (isMinimized ? AddIcon : MinimizeIcon) : getChevronIcon(isRight, isMinimized);

    const onToggleClick = isMinimized ? showTraining : onMinimize;

    const toggleTooltip = isMinimized ? i18n.t("Expand panel") : i18n.t("Collapse panel");

    const toggleTooltipPlacement: TooltipProps["placement"] = isHideMode
        ? "left"
        : isRight
        ? isMinimized
            ? "left"
            : "right"
        : isMinimized
        ? "right"
        : "left";

    const headerOptionsTooltipPlacement: TooltipProps["placement"] = isHideMode ? "right" : isRight ? "left" : "right";

    // In hide mode, the drawer header doesn't flip direction
    const drawerIsRight = isHideMode ? false : isRight;

    // hide mode uses "persistent" so MUI fully unmounts it when closed
    const drawerVariant: DrawerProps["variant"] = isHideMode ? "persistent" : "permanent";

    // In hide mode, collapsed state means no mini-rail, just gone
    const showMini = !isHideMode;

    return {
        isHideMode,
        toggleIcon,
        onToggleClick,
        toggleTooltip,
        toggleTooltipPlacement,
        headerOptionsTooltipPlacement,
        drawerIsRight,
        drawerVariant,
        showMini,
    };
}
