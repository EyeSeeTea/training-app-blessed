import styled from "styled-components";

export const Cardboard = styled.div.attrs({
    "data-component": "cardboard",
})<{ rowSize?: number }>`
    display: grid;
    grid-template-columns: repeat(${props => props.rowSize ?? 5}, minmax(0, 1fr));
    margin-right: 30px;
`;
