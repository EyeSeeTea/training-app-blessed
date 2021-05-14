import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { FormGroup, Icon, ListItem, ListItemIcon, ListItemText, TextField } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Permission } from "../../../domain/entities/Permission";
import {
    addPage,
    addStep,
    removePage,
    removeStep,
    updateOrder,
    updateTranslation,
} from "../../../domain/helpers/TrainingModuleHelpers";
import i18n from "../../../locales";
import { ComponentParameter } from "../../../types/utils";
import { LandingPageListTable } from "../../components/landing-page-list-table/LandingPageListTable";
import { buildListModules, ModuleListTable } from "../../components/module-list-table/ModuleListTable";
import { PageHeader } from "../../components/page-header/PageHeader";
import { PermissionsDialog, SharedUpdate } from "../../components/permissions-dialog/PermissionsDialog";
import { useAppContext } from "../../contexts/app-context";
import { DhisPage } from "../dhis/DhisPage";

export const SettingsPage: React.FC = () => {
    const { modules, landings, reload, usecases, setAppState, showAllModules, isLoading } = useAppContext();

    const snackbar = useSnackbar();

    const [poEditorToken, setPoEditorToken] = useState<string>();
    const [permissionsType, setPermissionsType] = useState<string | null>(null);
    const [existsPoEditorToken, setExistsPoEditorToken] = useState<boolean>(false);
    const [isPOEditorDialogOpen, setPOEditorDialogOpen] = useState(false);
    const [settingsPermissions, setSettingsPermissions] = useState<Permission>();

    const defaultToken = existsPoEditorToken ? "HIDDEN_TOKEN" : "";

    const updateToken = useCallback(
        (event: React.ChangeEvent<{ value: string }>) => {
            usecases.config.savePoEditorToken(event.target.value);
            setPoEditorToken(event.target.value);
        },
        [usecases]
    );

    const openTraining = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    const updateSettingsPermissions = useCallback(
        async ({ userAccesses, userGroupAccesses }: SharedUpdate) => {
            await usecases.config.updateSettingsPermissions({
                users: userAccesses?.map(({ id, name }) => ({ id, name })),
                userGroups: userGroupAccesses?.map(({ id, name }) => ({ id, name })),
            });

            const newSettings = await usecases.config.getSettingsPermissions();
            setSettingsPermissions(newSettings);
        },
        [usecases]
    );

    const buildSharingDescription = useCallback(() => {
        const users = settingsPermissions?.users?.length ?? 0;
        const userGroups = settingsPermissions?.userGroups?.length ?? 0;

        if (users > 0 && userGroups > 0) {
            return i18n.t("Accessible to {{users}} users and {{userGroups}} user groups", {
                users,
                userGroups,
            });
        } else if (users > 0) {
            return i18n.t("Accessible to {{users}} users", { users });
        } else if (userGroups > 0) {
            return i18n.t("Accessible to {{userGroups}} user groups", { userGroups });
        } else {
            return i18n.t("Only accessible to system administrators");
        }
    }, [settingsPermissions]);

    const refreshModules = useCallback(async () => {
        await reload();
    }, [reload]);

    const openAddModule = useCallback(() => {
        setAppState({ type: "CREATE_MODULE" });
    }, [setAppState]);

    const toggleShowAllModules = useCallback(async () => {
        await usecases.config.setShowAllModules(!showAllModules);
        await reload();
    }, [showAllModules, reload, usecases]);

    const tableActions: ComponentParameter<typeof ModuleListTable, "tableActions"> = useMemo(
        () => ({
            openEditModulePage: ({ id }) => {
                setAppState({ type: "EDIT_MODULE", module: id });
            },
            editContents: async ({ id, text, value }) => {
                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(updateTranslation(module, text.key, value));
                else snackbar.error(i18n.t("Unable to update module contents"));
            },
            deleteModules: ({ ids }) => usecases.modules.delete(ids),
            resetModules: ({ ids }) => usecases.modules.resetDefaultValue(ids),
            swap: async ({ type, id, from, to }) => {
                if (type === "module") {
                    await usecases.modules.swapOrder(from, to);
                    return;
                }

                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(updateOrder(module, from, to));
                else snackbar.error(i18n.t("Unable to move item"));
            },
            publishTranslations: ({ id }) => usecases.translations.publishTerms(id),
            uploadFile: ({ data }) => usecases.instance.uploadFile(data),
            installApp: ({ id }) => usecases.instance.installApp(id),
            addStep: async ({ id, title }) => {
                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(addStep(module, title));
                else snackbar.error(i18n.t("Unable to add step"));
            },
            addPage: async ({ id, step, value }) => {
                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(addPage(module, step, value));
                else snackbar.error(i18n.t("Unable to add page"));
            },
            deleteStep: async ({ id, step }) => {
                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(removeStep(module, step));
                else snackbar.error(i18n.t("Unable to remove step"));
            },
            deletePage: async ({ id, step, page }) => {
                const module = await usecases.modules.get(id);
                if (module) await usecases.modules.update(removePage(module, step, page));
                else snackbar.error(i18n.t("Unable to remove page"));
            },
        }),
        [usecases, setAppState, snackbar]
    );

    useEffect(() => {
        usecases.config.existsPoEditorToken().then(setExistsPoEditorToken);
    }, [usecases]);

    useEffect(() => {
        usecases.config.getSettingsPermissions().then(setSettingsPermissions);
    }, [usecases]);

    useEffect(() => {
        reload();
    }, [reload]);

    return (
        <DhisPage>
            {!!permissionsType && (
                <PermissionsDialog
                    object={{
                        name: "Access to settings",
                        publicAccess: "--------",
                        userAccesses:
                            settingsPermissions?.users?.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                        userGroupAccesses:
                            settingsPermissions?.userGroups?.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                    }}
                    onChange={updateSettingsPermissions}
                    onClose={() => setPermissionsType(null)}
                />
            )}

            <ConfirmationDialog
                isOpen={isPOEditorDialogOpen}
                title={i18n.t("Connection with POEditor")}
                onCancel={() => setPOEditorDialogOpen(false)}
                cancelText={i18n.t("Close")}
                maxWidth={"md"}
                fullWidth={true}
            >
                <form>
                    <TextField
                        name="token"
                        type="password"
                        autoComplete="new-password"
                        fullWidth={true}
                        label={i18n.t("POEditor token")}
                        value={poEditorToken ?? defaultToken}
                        onChange={updateToken}
                    />
                </form>
            </ConfirmationDialog>

            <Header title={i18n.t("Settings")} onBackClick={openTraining} />

            <Container>
                <Title>{i18n.t("Permissions")}</Title>

                <Group row={true}>
                    <ListItem button onClick={() => setPermissionsType("settings")}>
                        <ListItemIcon>
                            <Icon>settings</Icon>
                        </ListItemIcon>
                        <ListItemText primary={i18n.t("Access to Settings")} secondary={buildSharingDescription()} />
                    </ListItem>

                    <ListItem button onClick={() => setPOEditorDialogOpen(true)}>
                        <ListItemIcon>
                            <Icon>translate</Icon>
                        </ListItemIcon>
                        <ListItemText
                            primary={i18n.t("Connection with POEditor")}
                            secondary={i18n.t("Connect the application with POEditor to sync translations")}
                        />
                    </ListItem>

                    <ListItem button onClick={toggleShowAllModules}>
                        <ListItemIcon>
                            <Icon>{showAllModules ? "visibility" : "visibility_off"}</Icon>
                        </ListItemIcon>
                        <ListItemText
                            primary={i18n.t("Show list with modules on main landing page")}
                            secondary={
                                showAllModules
                                    ? i18n.t("A list with all the existing modules is visible")
                                    : i18n.t("The list with all the existing  modules is hidden")
                            }
                        />
                    </ListItem>
                </Group>

                <Title>{i18n.t("Landing page")}</Title>

                <LandingPageListTable nodes={landings} isLoading={isLoading} />

                <Title>{i18n.t("Training modules")}</Title>

                <ModuleListTable
                    rows={buildListModules(modules)}
                    refreshRows={refreshModules}
                    tableActions={tableActions}
                    onActionButtonClick={openAddModule}
                    isLoading={isLoading}
                />
            </Container>
        </DhisPage>
    );
};

const Title = styled.h3`
    margin-top: 25px;
`;

const Group = styled(FormGroup)`
    margin-bottom: 35px;
    margin-left: 0;
`;

const Container = styled.div`
    margin: 1.5rem;
`;

const Header = styled(PageHeader)`
    margin-top: 1rem;
`;
