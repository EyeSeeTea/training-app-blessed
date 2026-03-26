import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@material-ui/core";
import { Add, DeleteOutline } from "@material-ui/icons";
import styled from "styled-components";
import React from "react";
import { Dropdown } from "@eyeseetea/d2-ui-components";
import { DropdownItem } from "@eyeseetea/d2-ui-components/dropdown/GenericDropdown";

import {
    BINDING_TYPE,
    BindingType,
    EventBinding,
    EventType,
    PageBinding,
    SectionBinding,
} from "../../../domain/entities/PageBinding";
import i18n from "../../../utils/i18n";

type EditPageBindingProps = {
    bindings: PageBinding[];
    addBinding: () => void;
    handleChange: <T extends PageBinding, K extends keyof T>(id: string) => (key: K, value: T[K]) => void;
    removeBinding: (id: string) => void;
};

export const PageBindingEditor: React.FC<EditPageBindingProps> = props => {
    const { bindings, addBinding, removeBinding, handleChange } = props;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <StyledTable>
                        <TableHead>
                            <TableRow>
                                <TableCell width="15%">{i18n.t("Binding")}</TableCell>
                                <TableCell width="15%">{i18n.t("Description")}</TableCell>
                                <TableCell width="50%">{i18n.t("Config")}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {bindings.map(binding => (
                                <TableRow key={binding.id}>
                                    <Binding binding={binding} handleChange={handleChange(binding.id)} />
                                    <TableCell>
                                        <Button onClick={() => removeBinding(binding.id)}>
                                            <DeleteOutline />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </StyledTable>
                </TableContainer>
            </Grid>

            <FlexEnd item xs={12}>
                <Button variant="contained" onClick={addBinding}>
                    <Add />
                    {i18n.t("Add binding")}
                </Button>
            </FlexEnd>
        </Grid>
    );
};

type BindingEditor<T extends PageBinding = PageBinding> = {
    binding: T;
    handleChange: <K extends keyof T>(key: K, value: T[K]) => void;
};

const Binding: React.FC<BindingEditor> = props => {
    const { binding, handleChange } = props;

    return (
        <>
            <TableCell>
                <StyledDropdown
                    label={i18n.t("Binding type")}
                    items={bindingTypeOptions()}
                    onChange={value => {
                        if (value) handleChange("type", value);
                    }}
                    value={binding.type}
                    hideEmpty
                />
            </TableCell>
            <TableCell>
                <TextField
                    label={i18n.t("Description")}
                    value={binding.description}
                    onChange={event => handleChange("description", event.target.value)}
                />
            </TableCell>
            <StyledTableCell>
                {binding.type === BINDING_TYPE.event && (
                    <EventBindingEditor binding={binding} handleChange={handleChange} />
                )}
                {binding.type === BINDING_TYPE.section && (
                    <SectionBindingEditor binding={binding} handleChange={handleChange} />
                )}
            </StyledTableCell>
        </>
    );
};

const EventBindingEditor: React.FC<BindingEditor<EventBinding>> = props => {
    const { binding, handleChange } = props;

    return (
        <>
            <TextField
                label={i18n.t("Training identifiers")}
                onChange={event => handleChange("trainingIdentifiers", event.target.value)}
                value={binding.trainingIdentifiers}
            />
            <StyledDropdown
                label={i18n.t("Event type")}
                onChange={value => {
                    if (value) handleChange("eventType", value);
                }}
                value={binding.eventType}
                items={eventBindingTypeOptions()}
                hideEmpty
            />
        </>
    );
};

const SectionBindingEditor: React.FC<BindingEditor<SectionBinding>> = props => {
    const { binding, handleChange } = props;

    return (
        <>
            <TextField
                label={i18n.t("URL Pattern")}
                onChange={event => handleChange("urlPattern", event.target.value)}
                value={binding.urlPattern}
            />
        </>
    );
};

function bindingTypeOptions(): DropdownItem<BindingType>[] {
    return [
        { value: "event", text: i18n.t("Event") },
        { value: "section", text: i18n.t("Section") },
    ];
}

function eventBindingTypeOptions(): DropdownItem<EventType>[] {
    return [
        { value: "click", text: i18n.t("Click") },
        { value: "focus", text: i18n.t("Focus") },
        { value: "all", text: i18n.t("All") },
    ];
}

const FlexEnd = styled(Grid)`
    display: flex;
    justify-content: flex-end;
`;

const StyledTable = styled(Table)`
    table-layout: fixed;
`;

const StyledTableCell = styled(TableCell)`
    display: flex;
`;

const StyledDropdown = styled(Dropdown)`
    margin-top: 8px;
    label {
        color: #494949;
    }
    div {
        color: black;
    }
` as typeof Dropdown;
