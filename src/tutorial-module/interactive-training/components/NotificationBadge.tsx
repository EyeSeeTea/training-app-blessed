import styled, { css, keyframes } from "styled-components";

const pulseAnimation = keyframes`
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.4);
        opacity: 0.8;
    }
`;

type NotificationBadgeProps = {
    isVisible?: boolean;
    isPulsing?: boolean;
};

export const NotificationBadge = styled.div<NotificationBadgeProps>`
    position: absolute;
    top: -4px;
    right: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #f5a623;
    box-shadow: 0 0 4px rgba(245, 166, 35, 0.6);
    transition: opacity 200ms ease;
    z-index: 9999;

    ${({ isVisible }) =>
        isVisible
            ? css`
                  opacity: 1;
              `
            : css`
                  opacity: 0;
                  pointer-events: none;
              `}

    ${({ isPulsing }) =>
        isPulsing &&
        css`
            animation: ${pulseAnimation} 350ms ease 3;
        `}
`;
