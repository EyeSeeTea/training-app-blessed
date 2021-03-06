import React from "react";
import styled from "styled-components";
import { SimpleMarkdownViewer } from "../../markdown-viewer/MarkdownViewer";

export const StepHeader: React.FC<StepHeaderProps> = ({ index, title, subtitle = "" }) => {
    return (
        <Wrapper>
            <Bullet>{index}</Bullet>
            <Content>
                <Title>{title}</Title>
                <br></br>
                <Subtitle source={subtitle} />
            </Content>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    padding: 10px 35px 0px;
    margin: 10px;
`;

const Content = styled.div`
    place-self: center;
`;

const Bullet = styled.span`
    color: white;
    display: inline-block;
    font-size: 32px;
    font-weight: 700;
    border: 2px solid #fff;
    padding: 15px;
    height: 36px;
    width: 36px;
    border-radius: 100px;
    margin-right: 20px;
    place-self: center;
    text-align: center;
`;

const Title = styled.span`
    color: white;
    font-size: 32px;
    line-height: 40px;
    font-weight: 300;
    margin: 0px 0px 30px 0px;
`;

const Subtitle = styled(SimpleMarkdownViewer)`
    color: #ff8f02;
    font-size: 18px;
    line-height: 0;
    text-align: left;
`;

export interface StepHeaderProps {
    index: number;
    title: string;
    subtitle?: string;
}
