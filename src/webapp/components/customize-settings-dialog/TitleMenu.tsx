import React, { useCallback, useMemo, useState } from "react";
import { Box, Icon, IconButton } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Menu from "@material-ui/core/Menu";
import styled from "styled-components";
import MenuItem from "@material-ui/core/MenuItem";

import i18n from "../../../utils/i18n";

type TitleMenuProps = {
    importTranslations: () => void;
    exportTranslations: () => Promise<void>;
};

export const TitleMenu: React.FC<TitleMenuProps> = props => {
    const { exportTranslations, importTranslations } = props;

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const handleClickMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setMenuAnchor(null);
    }, []);

    const menuAction = useMemo(
        () => [
            {
                key: "export",
                icon: <Icon>cloud_download</Icon>,
                text: i18n.t("Export JSON translations"),
                onClick: async () => {
                    await exportTranslations();
                    handleCloseMenu();
                },
            },
            {
                key: "import",
                icon: <Icon>translate</Icon>,
                text: i18n.t("Import JSON translations"),
                onClick: () => {
                    importTranslations();
                    handleCloseMenu();
                },
            },
        ],
        [exportTranslations, importTranslations, handleCloseMenu]
    );

    return (
        <Box display="flex" alignItems="center">
            {i18n.t("Customize main landing page")}

            <IconButton onClick={handleClickMenu}>
                <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleCloseMenu}>
                {menuAction.map(action => (
                    <StyledMenuItem key={action.key} onClick={action.onClick}>
                        {action.icon}
                        {action.text}
                    </StyledMenuItem>
                ))}
            </Menu>
        </Box>
    );
};

const StyledMenuItem = styled(MenuItem)`
    gap: 1.25em;
`;
