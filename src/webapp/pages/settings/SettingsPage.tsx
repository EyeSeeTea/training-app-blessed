import { ConfirmationDialog, ConfirmationDialogProps, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { FormGroup, Icon, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { NamedRef } from "../../../domain/entities/Ref";
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
import { CustomizeSettingsDialog } from "../../components/customize-settings-dialog/CustomizeSettingsDialog";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";

export const SettingsPage: React.FC = () => {
    const { modules, landings, reload, usecases, setAppState, isLoading, isAdmin } = useAppContext();

    const { appConfig, logoInfo, save, hasLoaded } = useAppConfigContext();

    const snackbar = useSnackbar();
    const loading = useLoading();

    const [permissionsType, setPermissionsType] = useState<string | null>(null);
    const [showCustomSettings, setShowCustomSettings] = useState(false);
    const [danglingDocuments, setDanglingDocuments] = useState<NamedRef[]>([]);
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const openTraining = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    const updateSettingsPermissions = useCallback(
        async ({ userAccesses = [], userGroupAccesses = [] }: SharedUpdate) => {
            return save({
                settingsPermissions: {
                    users: userAccesses.map(({ id, name }) => ({ id, name })),
                    userGroups: userGroupAccesses.map(({ id, name }) => ({ id, name })),
                },
            });
        },
        [save]
    );

    const closeCustomSettingsDialog = useCallback(() => {
        setShowCustomSettings(false);
    }, []);

    const saveCustomSettings = useCallback(
        async data => {
            await save(data);
            closeCustomSettingsDialog();
        },
        [save, closeCustomSettingsDialog]
    );

    const buildSharingDescription = useCallback(() => {
        const settingsPermissions = appConfig.settingsPermissions;
        const users = settingsPermissions.users.length;
        const userGroups = settingsPermissions.userGroups.length;

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
    }, [appConfig.settingsPermissions]);

    const cleanUpDanglingDocuments = useCallback(async () => {
        updateDialog({
            title: i18n.t("Clean-up unused documents"),
            description: (
                <ul>
                    {danglingDocuments.map(item => (
                        <li key={item.id}>{`${item.id} ${item.name}`}</li>
                    ))}
                </ul>
            ),
            onCancel: () => updateDialog(null),
            onSave: async () => {
                loading.show(true, i18n.t("Deleting dangling documents"));

                await usecases.document.delete(danglingDocuments.map(({ id }) => id));
                setDanglingDocuments([]);

                snackbar.success(i18n.t("Deleted dangling documents"));
                loading.reset();
                updateDialog(null);
            },
            saveText: i18n.t("Proceed"),
        });
    }, [danglingDocuments, loading, snackbar, usecases]);

    const refreshModules = useCallback(async () => {
        await reload();
    }, [reload]);

    const openAddModule = useCallback(() => {
        setAppState({ type: "CREATE_MODULE" });
    }, [setAppState]);

    const toggleShowAllModules = useCallback(() => {
        return save({
            showAllModules: !appConfig.showAllModules,
        });
    }, [appConfig, save]);

    const getModule = React.useCallback(
        (id: string) => {
            return usecases.modules.get(id, { autoInstallDefaultModules: true });
        },
        [usecases.modules]
    );

    const openCustomizeSettingsDialog = useCallback(() => setShowCustomSettings(true), []);

    const tableActions: ComponentParameter<typeof ModuleListTable, "tableActions"> = useMemo(
        () => ({
            openEditModulePage: ({ id }) => {
                setAppState({ type: "EDIT_MODULE", module: id });
            },
            openCloneModulePage: ({ id }) => {
                setAppState({ type: "CLONE_MODULE", module: id });
            },
            editContents: async ({ id, text, value }) => {
                const module = await getModule(id);
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

                const module = await getModule(id);
                if (module) await usecases.modules.update(updateOrder(module, from, to));
                else snackbar.error(i18n.t("Unable to move item"));
            },
            uploadFile: ({ data, name }) => usecases.document.uploadFile(data, name),
            installApp: ({ id }) => usecases.instance.installApp(id),
            addStep: async ({ id, title }) => {
                const module = await getModule(id);
                if (module) await usecases.modules.update(addStep(module, title));
                else snackbar.error(i18n.t("Unable to add step"));
            },
            addPage: async ({ id, step, value }) => {
                const module = await getModule(id);
                if (module) await usecases.modules.update(addPage(module, step, value));
                else snackbar.error(i18n.t("Unable to add page"));
            },
            deleteStep: async ({ id, step }) => {
                const module = await getModule(id);
                if (module) await usecases.modules.update(removeStep(module, step));
                else snackbar.error(i18n.t("Unable to remove step"));
            },
            deletePage: async ({ id, step, page }) => {
                const module = await getModule(id);
                if (module) await usecases.modules.update(removePage(module, step, page));
                else snackbar.error(i18n.t("Unable to remove page"));
            },
        }),
        [usecases, setAppState, snackbar, getModule]
    );

    useEffect(() => {
        if (!hasLoaded || isLoading) return;
        const data = [...modules, ...landings, appConfig];
        usecases.document.listDangling(data).then(setDanglingDocuments);
    }, [usecases, modules, landings, appConfig, isLoading, hasLoaded]);

    useEffect(() => {
        reload();
    }, [reload]);

    return (
        <DhisPage>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"lg"} fullWidth={true} {...dialogProps} />}
            {showCustomSettings && (
                <CustomizeSettingsDialog
                    onSave={saveCustomSettings}
                    customText={appConfig?.customText ?? emptyObject}
                    onClose={closeCustomSettingsDialog}
                    logo={logoInfo.logoPath}
                />
            )}

            {!!permissionsType && (
                <PermissionsDialog
                    object={{
                        name: "Access to settings",
                        publicAccess: "--------",
                        userAccesses:
                            appConfig.settingsPermissions.users.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                        userGroupAccesses:
                            appConfig.settingsPermissions.userGroups.map(ref => ({
                                ...ref,
                                access: "rw----",
                            })) ?? [],
                    }}
                    onChange={updateSettingsPermissions}
                    onClose={() => setPermissionsType(null)}
                />
            )}

            <Header title={i18n.t("Settings")} onBackClick={openTraining} />

            <Container>
                <Title>{i18n.t("General Settings")}</Title>

                <Group row={true}>
                    <ListItem button onClick={() => setPermissionsType("settings")}>
                        <ListItemIcon>
                            <Icon>settings</Icon>
                        </ListItemIcon>
                        <ListItemText primary={i18n.t("Access to Settings")} secondary={buildSharingDescription()} />
                    </ListItem>

                    <ListItem button onClick={toggleShowAllModules}>
                        {appConfig.showAllModules}

                        <ListItemIcon>
                            <Icon>{appConfig.showAllModules ? "visibility" : "visibility_off"}</Icon>
                        </ListItemIcon>
                        <ListItemText
                            primary={i18n.t("Show list with modules on main landing page")}
                            secondary={
                                appConfig.showAllModules
                                    ? i18n.t("A list with all the existing modules is visible")
                                    : i18n.t("The list with all the existing  modules is hidden")
                            }
                        />
                    </ListItem>

                    <ListItem button onClick={openCustomizeSettingsDialog}>
                        <ListItemIcon>
                            <Icon>format_shapes</Icon>
                        </ListItemIcon>
                        <ListItemText
                            primary={i18n.t("Customize the landing page")}
                            secondary={i18n.t("Update the logo or content")}
                        />
                    </ListItem>

                    {isAdmin && (
                        <ListItem button disabled={danglingDocuments.length === 0} onClick={cleanUpDanglingDocuments}>
                            <ListItemIcon>
                                <Icon>delete_forever</Icon>
                            </ListItemIcon>
                            <ListItemText
                                primary={i18n.t("Clean-up unused documents")}
                                secondary={
                                    danglingDocuments.length === 0
                                        ? i18n.t("There are no unused documents to clean")
                                        : i18n.t("There are {{total}} documents available to clean", {
                                              total: danglingDocuments.length,
                                          })
                                }
                            />
                        </ListItem>
                    )}
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

const emptyObject = {};

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
