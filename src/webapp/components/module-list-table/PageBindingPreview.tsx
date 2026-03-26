import React from "react";
import _ from "lodash";
import styled from "styled-components";

import { PageBinding, getEventBindingIdentifiers, isEventBinding } from "../../../domain/entities/PageBinding";

type PageBindingPreviewProps = {
    bindings: PageBinding[];
};

export const PageBindingPreview: React.FC<PageBindingPreviewProps> = props => {
    const { bindings } = props;
    const [eventBindings, sectionBindings] = _(bindings).partition(isEventBinding).value();

    return (
        <Container>
            {eventBindings.map(binding => {
                const identifiers = getEventBindingIdentifiers(binding);
                return (
                    <BindingRow key={binding.id}>
                        <Tag type={binding.eventType}>{binding.eventType}</Tag>
                        {identifiers.length > 0 ? (
                            identifiers.map((id, idx) => <Identifier key={idx}>{id}</Identifier>)
                        ) : (
                            <Muted>no identifiers</Muted>
                        )}
                    </BindingRow>
                );
            })}

            {sectionBindings.map(binding => (
                <BindingRow key={binding.id}>
                    <Tag type="section">section</Tag>
                    <UrlPattern>{binding.urlPattern}</UrlPattern>
                </BindingRow>
            ))}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    max-width: 250px;
    margin-left: 250px;
`;

const BindingRow = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
`;

type TagType = "click" | "focus" | "all" | "section";

const tagColors: Record<TagType, { bg: string; color: string }> = {
    click: { bg: "#e3f2fd", color: "#1565c0" },
    focus: { bg: "#fff3e0", color: "#e65100" },
    all: { bg: "#e8f5e9", color: "#2e7d32" },
    section: { bg: "#f3e5f5", color: "#7b1fa2" },
};

const Tag = styled.span<{ type: TagType }>`
    background-color: ${({ type }) => tagColors[type]?.bg ?? "#f5f5f5"};
    color: ${({ type }) => tagColors[type]?.color ?? "#333"};
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
`;

const Identifier = styled.span`
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 11px;
`;

const UrlPattern = styled.span`
    font-family: monospace;
    color: #555;
`;

const Muted = styled.span`
    color: #999;
    font-style: italic;
`;
