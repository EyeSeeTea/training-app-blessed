import React from "react";

import { ModalContent, ModalTitle } from "../modal";
import {
    GroupContainer,
    Header,
    HomePageContentComponent,
    HomePageContentComponentProps,
    IconContainer,
    MarkdownContents,
} from "./HomePageContent";
import { Modules } from "./Modules";

export const Section: React.FC<HomePageContentComponentProps> = props => {
    const { currentPage, translate } = props;

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
                    <HomePageContentComponent key={`node-${node.id}`} {...props} currentPage={node} />
                ))}
                <Modules {...props} />
            </ModalContent>
        </GroupContainer>
    );
};
