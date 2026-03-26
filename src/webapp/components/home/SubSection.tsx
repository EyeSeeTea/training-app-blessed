import { Cardboard } from "../card-board/Cardboard";
import { BigCard } from "../card-board/BigCard";
import React from "react";
import styled from "styled-components";

import { GroupContainer, HomePageContentComponentProps, MarkdownContents } from "./HomePageContent";
import { Modules } from "./Modules";
import i18n from "../../../utils/i18n";

export const SubSection: React.FC<HomePageContentComponentProps> = props => {
    const { currentPage, openPage, translate } = props;

    return (
        <GroupContainer>
            <GroupTitle>{translate(currentPage.title ?? currentPage.name)}</GroupTitle>

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

            <Modules {...props} />
        </GroupContainer>
    );
};

const GroupTitle = styled.span`
    display: block;
    text-align: left;
    font-size: 32px;
    line-height: 47px;
    font-weight: 700;
`;
