import { D2Api } from "../../types/d2-api";
import { Debug, Migration } from "../types";
import { saveDataStore } from "../dataStore";
import { dataStoreNamespace, Namespaces } from "../../data/clients/storage/Namespaces";
import { PersistedLandingPage } from "../../data/entities/PersistedLandingPage";
import { PersistedConfig } from "../../data/entities/PersistedConfig";
import { getDefaultCustomText } from "../../domain/entities/CustomText";
import { defaultRoot } from "../../data/repositories/LandingPageDefaultRepository";

async function migrate(api: D2Api, debug: Debug): Promise<void> {
    const landingNodes = await getLandingNodes(api);

    if (landingNodes.length === 0) {
        debug("No landing nodes found, migration not needed.");
        return;
    }

    const config = await getConfig(api);
    const defaultCustomText = getDefaultCustomText();

    debug("Updating main landing page as default landing page");
    debug("Updating default landing page title and content with custom text");
    debug("Updating default landing page icon with customized or default logo");
    const updatedLandingNodes = landingNodes.map(node => {
        if (node.name.referenceValue === "Main landing page" && node.type === "root") {
            return {
                ...node,
                name: defaultRoot.name,
                title: config.customText?.rootTitle ?? defaultCustomText.rootTitle,
                content: config.customText?.rootSubtitle ?? defaultCustomText.rootSubtitle,
                icon: config.logo || process.env["REACT_APP_LOGO_PATH"] || "img/logo-eyeseetea.png",
            };
        }
        return node;
    });
    await saveLandingNodes(api, updatedLandingNodes);
}

function getLandingNodes(api: D2Api): Promise<PersistedLandingPage[]> {
    const dataStore = api.dataStore(dataStoreNamespace);
    return dataStore
        .get<PersistedLandingPage[]>(Namespaces.LANDING_PAGES)
        .getData()
        .then(nodes => nodes || []);
}

function saveLandingNodes(api: D2Api, landingNodes: PersistedLandingPage[]): Promise<void> {
    return saveDataStore(api, dataStoreNamespace, Namespaces.LANDING_PAGES, landingNodes);
}

function getConfig(api: D2Api): Promise<PersistedConfig> {
    const dataStore = api.dataStore(dataStoreNamespace);
    return dataStore
        .get<PersistedConfig>(Namespaces.CONFIG)
        .getData()
        .then(config => config || {});
}

const migration: Migration = { name: "Move customizations to default landing node", migrate };

export default migration;
