import { Cardboard } from "../card-board/Cardboard";
import { BigCard } from "../card-board/BigCard";
import React from "react";
import styled from "styled-components";

import { useAppContext } from "../../contexts/app-context";
import { useAppConfigContext } from "../../contexts/AppConfigProvider";
import { ModalContent, ModalParagraph, ModalTitle } from "../modal";
import { HomePageProps } from "./HomePageContent";
import { Modules } from "./Modules";

export const Root: React.FC<HomePageProps> = props => {
    const { currentPage, loadModule, isRoot, openPage } = props;
    const { translate } = useAppContext();
    const { appConfig, logoInfo } = useAppConfigContext();
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

                <Cardboard rowSize={3} key={`group-${currentPage.id}`}>
                    {currentPage.children.map((item, idx) => {
                        return (
                            <BigCard
                                key={`card-${idx}`}
                                label={translate(item.name)}
                                onClick={() => openPage(item)}
                                icon={
                                    item.icon ? (
                                        <img src={item.icon} alt={`Icon for ${translate(item.name)}`} />
                                    ) : undefined
                                }
                            />
                        );
                    })}
                </Cardboard>

                <Modules currentPage={currentPage} isRoot={isRoot} loadModule={loadModule} />
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
