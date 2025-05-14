import React, { useMemo } from "react";
import styled from "styled-components";
import { MarkdownViewer } from "../markdown-viewer/MarkdownViewer";

import { LandingNode } from "../../../domain/entities/LandingPage";
import { Root } from "./Root";
import { Section } from "./Section";
import { SubSection } from "./SubSection";
import { Category } from "./Category";

export type HomePageProps = {
    currentPage: LandingNode;
    isRoot: boolean;
    openPage: (page: LandingNode) => void;
    loadModule: (module: string, step: number) => void;
};

export const HomePageContent: React.FC<HomePageProps> = props => {
    const { currentPage } = props;

    const contentMap = useMemo(
        () => ({
            root: <Root {...props} />,
            section: <Section {...props} />,
            "sub-section": <SubSection {...props} />,
            category: <Category {...props} />,
        }),
        [props]
    );

    return contentMap[currentPage.type] || null;
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
