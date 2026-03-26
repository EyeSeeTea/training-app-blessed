import React, { useCallback } from "react";
import { Description, OpenInBrowser } from "@material-ui/icons";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";

import i18n from "../../../utils/i18n";
import { useAppContext } from "../../contexts/app-context";
import styled from "styled-components";

export interface CreateButtonProps {
    onAddLandingPage: () => void;
}

export const CreateButton: React.FC<CreateButtonProps> = props => {
    const { onAddLandingPage } = props;

    const { setAppState } = useAppContext();
    const onAddModule = useCallback(() => {
        setAppState({ type: "CREATE_MODULE" });
    }, [setAppState]);

    const [isOpen, open] = useOpenAction();

    return (
        <>
            <StyledSpeedDial open={isOpen} onClick={open} ariaLabel={i18n.t("Create")} icon={<SpeedDialIcon />}>
                <SpeedDialAction
                    onClick={onAddModule}
                    tooltipOpen
                    icon={<OpenInBrowser />}
                    tooltipTitle={i18n.t("Module")}
                />

                <SpeedDialAction
                    onClick={onAddLandingPage}
                    tooltipOpen
                    icon={<Description />}
                    tooltipTitle={i18n.t("Landing Page")}
                />
            </StyledSpeedDial>
        </>
    );
};

const StyledSpeedDial = styled(SpeedDial)`
    position: fixed;
    bottom: 16px;
    right: 16px;
`;

function useOpenAction() {
    const [isOpen, setOpen] = React.useState(false);
    const open = React.useCallback(() => setOpen(prev => !prev), []);
    return [isOpen, open] as const;
}
