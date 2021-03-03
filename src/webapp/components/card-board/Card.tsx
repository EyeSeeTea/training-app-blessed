import React from "react";
import styled from "styled-components";
import { getColor } from "../../themes/colors";
import { CardTitleIcon } from "./CardTitleIcon";
import { CardProgress, CardProgressText } from "./CardProgress";

const BaseCard: React.FC<CardProps> = ({ className, label, progress, onClick, onContextMenu, disabled }) => {
    const normalizedProgress = normalizeProgress(progress);

    return (
        <div className={className} onClick={disabled ? undefined : onClick} onContextMenu={onContextMenu}>
            {progress >= 100 ? <CardTitleIcon>done</CardTitleIcon> : null}
            <CardTitle>{label}</CardTitle>
            <CardProgressText>{`${normalizedProgress}%`}</CardProgressText>
            <CardProgress value={normalizedProgress} max="100"></CardProgress>
        </div>
    );
};

/**
 * This will likely remain unused after Phase II redesign, remove when necessary
 */
export const Card = styled(BaseCard)`
    color: ${props => getCardColor(normalizeProgress(props.progress))};
    background: #fff;
    padding: 12px;
    border-radius: 8px;
    width: 104px;
    text-align: left;
    margin: 6px;
    user-select: none;
    cursor: ${({ onClick, disabled }) => (onClick && !disabled ? "pointer" : "inherit")};
`;

const getCardColor = (progress: number) => {
    if (progress === 0) return "#C6D8E6";
    else if (progress === 100) return getColor("primary");
    else return "#626262";
};

const normalizeProgress = (progress: number) => {
    return Math.max(0, Math.min(100, progress));
};

export interface CardProps {
    className?: string;
    label: string;
    progress: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    disabled?: boolean;
}

const CardTitle = styled.span`
    min-height: 48px;
    font-size: 15px;
    display: block;
`;
