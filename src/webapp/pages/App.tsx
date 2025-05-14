import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider, StylesProvider } from "@material-ui/core/styles";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import i18n from "../../utils/i18n";
import { getCompositionRoot } from "../CompositionRoot";
import { AppContextProvider } from "../contexts/app-context";
import { AppRoute } from "../router/AppRoute";
import { Router } from "../router/Router";
import muiThemeLegacy from "../themes/dhis2-legacy.theme";
import { muiTheme } from "../themes/dhis2.theme";
import { AboutPage } from "./about/AboutPage";
import { TutorialPage } from "./tutorial/TutorialPage";
import "./App.css";
import { EditPage } from "./edit/EditPage";
import { ExitPage } from "./exit/ExitPage";
import { FinalPage } from "./final/FinalPage";
import { HomePage } from "./home/HomePage";
import { SettingsPage } from "./settings/SettingsPage";
import { SummaryPage } from "./summary/SummaryPage";
import { WelcomePage } from "./welcome/WelcomePage";
import { Feedback } from "@eyeseetea/feedback-component";
import { appConfig } from "../../app-config";
import { AppConfigProvider } from "../contexts/AppConfigProvider";
import { D2Api } from "../../types/d2-api";

export const routes: AppRoute[] = [
    {
        key: "home",
        name: () => i18n.t("Home"),
        defaultRoute: true,
        paths: ["/"],
        element: <HomePage />,
        backdrop: true,
        iframe: true,
    },
    {
        key: "welcome",
        name: () => i18n.t("Welcome"),
        paths: ["/tutorial/:key", "/tutorial/:key/welcome"],
        element: <WelcomePage />,
        backdrop: true,
        iframe: true,
    },
    {
        key: "tutorial",
        name: () => i18n.t("Tutorial"),
        paths: ["/tutorial/:key/:step/:content"],
        element: <TutorialPage />,
        iframe: true,
    },
    {
        key: "contents",
        name: () => i18n.t("Contents"),
        paths: ["/tutorial/:key/contents"],
        element: <SummaryPage completed={false} />,
        backdrop: true,
        iframe: true,
    },
    {
        key: "final",
        name: () => i18n.t("Final"),
        paths: ["/tutorial/:key/final"],
        element: <FinalPage />,
        backdrop: true,
        iframe: true,
    },
    {
        key: "summary",
        name: () => i18n.t("Summary"),
        paths: ["/tutorial/:key/summary"],
        element: <SummaryPage completed={true} />,
        backdrop: true,
        iframe: true,
    },
    {
        key: "exit",
        name: () => i18n.t("Exit"),
        paths: ["/exit"],
        element: <ExitPage />,
    },
    {
        key: "settings",
        name: () => i18n.t("Settings"),
        paths: ["/settings"],
        element: <SettingsPage />,
    },
    {
        key: "about",
        name: () => i18n.t("About"),
        paths: ["/about"],
        element: <AboutPage />,
    },
    {
        key: "edit",
        name: () => i18n.t("Edit"),
        paths: ["/edit/:module"],
        element: <EditPage action="edit" />,
    },
    {
        key: "clone",
        name: () => i18n.t("Clone"),
        paths: ["/clone/:module"],
        element: <EditPage action="clone" />,
    },
    {
        key: "create",
        name: () => i18n.t("Create"),
        paths: ["/create"],
        element: <EditPage action="create" />,
    },
];

const App: React.FC<{ locale: string; baseUrl: string }> = ({ locale, baseUrl }) => {
    const compositionRoot = getCompositionRoot(new D2Api({ baseUrl: baseUrl }));

    const [username, setUsername] = useState("");

    useEffect(() => {
        async function setup() {
            const currentUser = await compositionRoot.usecases.user.getCurrent();

            setUsername(currentUser.username);
        }
        setup();
    }, [compositionRoot.usecases.user]);
    return (
        <AppContextProvider routes={routes} compositionRoot={compositionRoot} locale={locale}>
            <AppConfigProvider>
                <StylesProvider injectFirst>
                    <MuiThemeProvider theme={muiTheme}>
                        <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                            <SnackbarProvider>
                                <LoadingProvider>
                                    <div id="app" className="content">
                                        <HashRouter>
                                            <Router baseUrl={baseUrl} />
                                        </HashRouter>
                                    </div>
                                    <Feedback options={appConfig.feedback} username={username} />
                                </LoadingProvider>
                            </SnackbarProvider>
                        </OldMuiThemeProvider>
                    </MuiThemeProvider>
                </StylesProvider>
            </AppConfigProvider>
        </AppContextProvider>
    );
};

export default React.memo(App);
