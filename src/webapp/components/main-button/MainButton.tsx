import { Button } from "@material-ui/core";
import styled from "styled-components";
import { getColor } from "../../themes/colors";

export const MainButton = styled(Button)`
    && {
        font-size: 1.05em;
        color: #fff;
        margin: 0 20px;
        padding: 15px 36px;
        border-radius: 100px;
        border: 0;

        background-color: ${p => getColor(p.color ?? "primary", "main")};
        text-transform: inherit;
        font-weight: inherit;
        line-height: inherit;
    }

    &&:hover {
        background-color: ${p => getColor(p.color ?? "primary", "dark")};
    }
`;
