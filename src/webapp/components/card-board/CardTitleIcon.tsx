import styled from "styled-components";
import { Icon } from "@material-ui/core";
import { getColor } from "../../themes/colors";

export const CardTitleIcon = styled(Icon)`
    margin-left: auto;
    background: ${getColor("primary")};
    color: #fff;
    border-radius: 100px;
    padding: 3px;
    font-size: 14px;
`;
