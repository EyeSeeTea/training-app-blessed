import React from "react";
import styled from "styled-components";

import { LandingNode } from "../../../domain/entities/LandingPage";
import { ModalContent, ModalParagraph, ModalTitle } from "../modal";
import { Cardboard } from "../card-board/Cardboard";
import { BigCard } from "../card-board/BigCard";
import i18n from "../../../utils/i18n";
import { TranslateMethod } from "../../../domain/entities/TranslatableText";
import { Config } from "../../../domain/entities/Config";
import { LogoInfo } from "../../hooks/useAppConfig";
import { Modules } from "./Modules";
import { HomePageContentComponentProps } from "./HomePageContent";
import { MaybeBy } from "../../../types/utils";

type TrainingAreaProps = MaybeBy<HomePageContentComponentProps, "currentPage"> & {
    landingNodes: LandingNode[];
    openPage: (page: LandingNode) => void;
    translate: TranslateMethod;
    appConfig: Config;
    logoInfo: LogoInfo;
};

export const MainLandingPage: React.FC<TrainingAreaProps> = (props: TrainingAreaProps) => {
    const { landingNodes, openPage, translate, appConfig, logoInfo } = props;
    const { logoPath, logoText } = logoInfo;

    return (
        <React.Fragment>
            <LogoContainer>
                <img src={logoPath} alt={logoText} />
            </LogoContainer>
            <ModalTitle bold={true} big={true}>
                {translate(appConfig.customText.rootTitle)}
            </ModalTitle>
            <ModalContent>
                <ModalParagraph size={28} align={"left"}>
                    {translate(appConfig.customText.rootSubtitle)}
                </ModalParagraph>

                <Cardboard rowSize={3}>
                    {landingNodes.map((item, idx) => (
                        <BigCard
                            key={`card-${idx}`}
                            label={translate(item.name)}
                            onClick={() => openPage(item)}
                            icon={
                                item.icon ? (
                                    <img
                                        src={item.icon}
                                        alt={i18n.t("Icon for {{name}}", { name: translate(item.name) })}
                                    />
                                ) : undefined
                            }
                        />
                    ))}
                </Cardboard>
                <Modules {...props} />
            </ModalContent>
        </React.Fragment>
    );
};

const LogoContainer = styled.div`
    margin-top: 15px;

    img {
        margin: 0 30px;
        user-drag: none;
        max-height: 100px;
    }
`;
