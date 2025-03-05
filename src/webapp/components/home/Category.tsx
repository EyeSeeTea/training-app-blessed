import { ModalContent, ModalTitle } from "../modal";
import { Cardboard } from "../card-board/Cardboard";
import { BigCard } from "../card-board/BigCard";
import React from "react";

import { GroupContainer, Header, HomePageProps, IconContainer, MarkdownContents } from "./HomePageContent";
import { useAppContext } from "../../contexts/app-context";
import { Modules } from "./Modules";
import i18n from "../../../locales";

export const Category: React.FC<HomePageProps> = props => {
    const { currentPage, loadModule, isRoot, openPage } = props;
    const { translate } = useAppContext();

    return (
        <GroupContainer>
            <Header>
                {currentPage.icon ? (
                    <IconContainer>
                        <img src={currentPage.icon} alt={i18n.t("Page icon")} />
                    </IconContainer>
                ) : null}

                <ModalTitle>{translate(currentPage.title ?? currentPage.name)}</ModalTitle>
            </Header>

            <ModalContent>
                {currentPage.content ? <MarkdownContents source={translate(currentPage.content)} /> : null}
                <Cardboard rowSize={5} key={`group-${currentPage.id}`}>
                    {currentPage.children.map((item, idx) => {
                        return (
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
                        );
                    })}
                </Cardboard>

                <Modules currentPage={currentPage} isRoot={isRoot} loadModule={loadModule} />
            </ModalContent>
        </GroupContainer>
    );
};
