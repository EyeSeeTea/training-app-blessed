import i18n from "../../../../utils/i18n";
import React, { useCallback } from "react";
import styled from "styled-components";
import { TranslatableText } from "../../../../domain/entities/TranslatableText";
import { updateTranslation } from "../../../../domain/helpers/TrainingModuleHelpers";
import { useAppContext } from "../../../contexts/app-context";
import { MarkdownEditor } from "../../markdown-editor/MarkdownEditor";
import { ModuleCreationWizardStepProps } from "./index";
import { StepPreview } from "../../markdown-editor/StepPreview";

export const WelcomePageStep: React.FC<ModuleCreationWizardStepProps> = ({ module, onChange }) => {
    const { usecases } = useAppContext();

    const onChangeTranslation = useCallback(
        (text: TranslatableText, value: string) => {
            onChange(module => updateTranslation(module, text.key, value));
        },
        [onChange]
    );

    return (
        <Row>
            <h3>{i18n.t("Welcome page")}</h3>
            <MarkdownEditor
                value={module.contents.welcome.referenceValue}
                onChange={value => onChangeTranslation(module.contents.welcome, value)}
                markdownPreview={markdown => <StepPreview value={markdown} />}
                onUpload={(data, file) => usecases.document.uploadFile(data, file.name)}
            />
        </Row>
    );
};

const Row = styled.div`
    margin-bottom: 25px;
`;
