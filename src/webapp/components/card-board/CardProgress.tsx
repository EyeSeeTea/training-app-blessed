import styled from "styled-components";
import { getColor } from "../../themes/colors";

export const CardProgress = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
`;

export const CardProgressBar = styled.progress`
    display: block;
    width: 100%;
    height: 12px;
    margin: 0;
    background: #c6d8e6;
    border: 0;
    border-radius: 18px;

    ::-webkit-progress-bar {
        height: 12px;
        width: 100%;
        margin: 0 auto;
        background-color: #c6d8e6;
        border-radius: 15px;
    }

    ::-moz-progress-bar {
        height: 12px;
        width: 100%;
        margin: 0 auto;
        background-color: ${getColor("primary")};
        border-radius: 15px;
    }

    ::-webkit-progress-value {
        float: left;
        height: 12px;
        margin: 0px -10px 0 0;
        background: ${getColor("primary")};
        border-radius: 12px;
    }
`;

export const CardProgressText = styled.span`
    display: block;
    text-align: right;
    margin-bottom: 0.25em;
`;
