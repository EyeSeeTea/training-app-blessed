import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import i18n from "../../../utils/i18n";
import { LandingPageListTable } from "../../components/landing-page-list-table/LandingPageListTable";
import { buildListModules, ModuleListTable } from "../../components/module-list-table/ModuleListTable";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useAppContext } from "../../contexts/app-context";
import { DhisPage } from "../dhis/DhisPage";
import { CreateButton } from "./CreateButton";
import { LandingPageEditDialog } from "../../components/landing-page-edit-dialog/LandingPageEditDialog";
import { SettingsConfig } from "./SettingsConfig";
import { useLandingNodeDialog } from "./useLandingNodeDialog";

export const SettingsPage: React.FC = () => {
    const { modules, landings, reload, setAppState, isLoading } = useAppContext();
    const { landingNodeDetailsDialog, onAddLandingPage, ...actionsDialog } = useLandingNodeDialog({ nodes: landings });

    const openTraining = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    const refreshModules = useCallback(async () => {
        await reload();
    }, [reload]);

    useEffect(() => {
        reload();
    }, [reload]);

    return (
        <DhisPage>
            {landingNodeDetailsDialog && <LandingPageEditDialog isOpen={true} {...landingNodeDetailsDialog} />}

            <Header title={i18n.t("Settings")} onBackClick={openTraining} />

            <Container>
                <Title>{i18n.t("General Settings")}</Title>
                <SettingsConfig modules={modules} landings={landings} />

                <Title>{i18n.t("Landing page")}</Title>

                <LandingPageListTable nodes={landings} isLoading={isLoading} {...actionsDialog} />

                <Title>{i18n.t("Training modules")}</Title>

                <ModuleListTable rows={buildListModules(modules)} refreshRows={refreshModules} isLoading={isLoading} />

                <CreateButton onAddLandingPage={onAddLandingPage} />
            </Container>
        </DhisPage>
    );
};

const Title = styled.h3`
    margin-top: 25px;
`;

const Container = styled.div`
    margin: 1.5rem;
`;

const Header = styled(PageHeader)`
    margin-top: 1rem;
`;
