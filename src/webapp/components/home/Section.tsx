import React from "react";

import { ModalContent, ModalTitle } from "../modal";
import {
    GroupContainer,
    Header,
    HomePageContent,
    HomePageProps,
    IconContainer,
    MarkdownContents,
} from "./HomePageContent";
import { useAppContext } from "../../contexts/app-context";
import { Modules } from "./Modules";

export const Section: React.FC<HomePageProps> = props => {
    const { currentPage, loadModule, isRoot } = props;
    const { translate } = useAppContext();

    return (
        <GroupContainer>
            <Header>
                {currentPage.icon ? (
                    <IconContainer>
                        <img src={currentPage.icon} alt={`Page icon`} />
                    </IconContainer>
                ) : null}

                <ModalTitle>{translate(currentPage.title ?? currentPage.name)}</ModalTitle>
            </Header>

            <ModalContent>
                {currentPage.content ? <MarkdownContents source={translate(currentPage.content)} /> : null}
                {currentPage.children.map(node => (
                    <HomePageContent key={`node-${node.id}`} {...props} currentPage={node} />
                ))}
                <Modules currentPage={currentPage} isRoot={isRoot} loadModule={loadModule} />
            </ModalContent>
        </GroupContainer>
    );
};
