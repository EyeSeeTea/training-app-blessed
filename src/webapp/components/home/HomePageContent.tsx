import React, { useMemo } from "react";
import styled from "styled-components";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";

import { LandingNode } from "../../../domain/entities/LandingPage";
import { Root } from "./Root";
import { Section } from "./Section";
import { SubSection } from "./SubSection";
import { Category } from "./Category";
import { TrainingModule } from "../../../domain/entities/TrainingModule";
import { Config } from "../../../domain/entities/Config";
import { TranslateMethod } from "../../../domain/entities/TranslatableText";
import { useAppContext } from "../../contexts/app-context";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { LogoInfo } from "../../hooks/useAppConfig";
import { Maybe, MaybeBy } from "../../../types/utils";
import { MainLandingPage } from "./MainLandingPage";

export type HomePageProps = {
    currentPage: Maybe<LandingNode>;
    isRoot: boolean;
    openPage: (page: LandingNode) => void;
    loadModule: (module: string, step: number) => void;
    userLandings: LandingNode[];
    isMainLandingVisible?: boolean;
};

export const HomePageContent: React.FC<HomePageProps> = props => {
    const { currentPage } = props;

    const { modules, translate } = useAppContext();
    const { logoInfo, appConfig } = useAppConfigContext();

    return (
        <HomePageContentComponent
            {...props}
            currentPage={currentPage}
            modules={modules}
            translate={translate}
            logoInfo={logoInfo}
            appConfig={appConfig}
        />
    );
};

export type HomePageContentComponentProps = {
    currentPage: LandingNode;
    isRoot: boolean;
    openPage: (page: LandingNode) => void;
    loadModule: (module: string, step: number) => void;
    modules: TrainingModule[];
    appConfig: Config;
    translate: TranslateMethod;
    logoInfo: LogoInfo;
    userLandings: LandingNode[];
    isMainLandingVisible?: boolean;
};
export const HomePageContentComponent: React.FC<MaybeBy<HomePageContentComponentProps, "currentPage">> = props => {
    const { currentPage, isMainLandingVisible, userLandings } = props;

    const contentMap = useMemo(
        () =>
            currentPage
                ? {
                      root: <Root {...props} currentPage={currentPage} />,
                      section: <Section {...props} currentPage={currentPage} />,
                      "sub-section": <SubSection {...props} currentPage={currentPage} />,
                      category: <Category {...props} currentPage={currentPage} />,
                  }
                : {},
        [props, currentPage]
    );

    if (currentPage) return contentMap[currentPage.type] || null;
    else if (isMainLandingVisible) return <MainLandingPage {...props} landingNodes={userLandings} />;
    else return null;
};

export const IconContainer = styled.div`
    background: #6d98b8;
    margin-right: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    height: 12vh;
    width: 12vh;
    display: flex;
    align-items: center;

    img {
        width: 100%;
        height: auto;
        user-drag: none;
    }
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    font-size: 36px;
    line-height: 47px;
    font-weight: 300;
    margin: 40px 0px 30px 50px;
`;

export const GroupContainer = styled.div`
    margin-bottom: 20px;
`;

export const MarkdownContents = styled(MarkdownViewer)`
    padding: 0;

    h1 {
        display: block;
        text-align: left;
        font-size: 32px;
        line-height: 47px;
        font-weight: 700;
        margin: 0;
    }

    h2 {
        text-align: left;
    }
`;
