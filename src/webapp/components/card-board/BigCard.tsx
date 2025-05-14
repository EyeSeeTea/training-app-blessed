import React, { ReactNode } from "react";
import styled from "styled-components";
import { CardTitleIcon } from "./CardTitleIcon";
import i18n from "../../../utils/i18n";
import { CardProgress, CardProgressBar, CardProgressText } from "./CardProgress";

const BaseCard: React.FC<BigCardProps> = ({ className, label, icon, progress, onClick, onContextMenu, disabled }) => {
    const normalizedProgress = normalizeProgress(progress);

    return (
        <Container className={className} onClick={disabled ? undefined : onClick} onContextMenu={onContextMenu}>
            <Title>
                <BigCardTitle>{label}</BigCardTitle>
                {progress && progress >= 100 ? <CardTitleIcon>{i18n.t("done")}</CardTitleIcon> : null}
            </Title>
            {icon ? <BigCardIcon>{icon}</BigCardIcon> : null}
            <CardProgress>
                {progress !== undefined ? <CardProgressText>{`${normalizedProgress}%`}</CardProgressText> : null}
                {progress !== undefined ? (
                    <CardProgressBar value={normalizedProgress} max="100"></CardProgressBar>
                ) : null}
            </CardProgress>
        </Container>
    );
};

export const BigCard = styled(BaseCard)`
    background: #6d98b8;
    padding: 20px;
    border-radius: 8px;
    text-align: left;
    color: #fff;
    margin: 10px 10px 10px;
    user-select: none;
    cursor: ${({ onClick, disabled }) => (onClick && !disabled ? "pointer" : "inherit")};
`;

const normalizeProgress = (progress?: number) => {
    if (progress === undefined) return undefined;
    return Math.max(0, Math.min(100, progress));
};

export interface BigCardProps {
    className?: string;
    label: string;
    progress?: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    disabled?: boolean;
    icon?: ReactNode;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.div`
    display: flex;
`;

const BigCardTitle = styled.span`
    color: #fff;
    min-height: 48px;
    font-size: 22px;
    font-size: 1.2vw;
    font-weight: 700;
    display: block;
`;

const BigCardIcon = styled.span`
    display: flex;
    place-content: center;
    margin: 20px 0px;

    img,
    svg {
        max-height: 10vw;
        max-width: 18vh;
        margin: 0;
        user-drag: none;
    }
`;
