import React, { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";

import { TrainingModule } from "../../domain/entities/TrainingModule";
import { LandingNode } from "../../domain/entities/LandingPage";
import { Config } from "../../domain/entities/Config";
import { TranslateMethod } from "../../domain/entities/TranslatableText";
import { LogoInfo } from "../../webapp/hooks/useAppConfig";
import { ModuleStepType, UpdateModuleStep, useUpdateModuleStep } from "../training-module/useTutorial";
import { HomePageContentComponent } from "../../webapp/components/home/HomePageContent";
import { Maybe } from "../../types/utils";
import { MainButton } from "../../webapp/components/main-button/MainButton";
import i18n from "../../utils/i18n";
import { MarkdownViewer } from "../../webapp/components/markdown-viewer/MarkdownViewer";
import { ModalParagraph, ModalTitle } from "../../webapp/components/modal";
import { SummaryStep } from "../training-module/SummaryTraining";
import { TrainingWizard } from "../../webapp/components/training-wizard/TrainingWizard";
import { Stepper } from "../../webapp/components/training-wizard/stepper/Stepper";
import _ from "lodash";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";

type TrainingLandingProps = {
    modules: TrainingModule[];
    landings: LandingNode[];
    appConfig?: Config;
    logoInfo?: LogoInfo;
    translate: TranslateMethod;
    currentPage?: LandingNode;
    isRoot: boolean;
    openPage: (page: LandingNode) => void;
    loadModule: (moduleId: string) => void;
    loadedModule: Maybe<TrainingModule>;
    onHome?: () => void;
    onBack?: () => void;
    appendToTriggerKey: (key: string) => void;
    userLandings: LandingNode[];
    isMainLandingVisible?: boolean;
};
export const TrainingLanding: React.FC<TrainingLandingProps> = props => {
    const {
        modules,
        appConfig,
        translate,
        currentPage,
        isRoot,
        openPage,
        logoInfo,
        loadModule,
        loadedModule,
        userLandings,
        isMainLandingVisible,
        ...otherProps
    } = props;

    return (
        <SnackbarProvider>
            {!loadedModule && appConfig && logoInfo && (
                <PageContainer>
                    <HomePageContentComponent
                        currentPage={currentPage}
                        isRoot={isRoot}
                        openPage={openPage}
                        loadModule={loadModule}
                        modules={modules}
                        appConfig={appConfig}
                        translate={translate}
                        logoInfo={logoInfo}
                        userLandings={userLandings}
                        isMainLandingVisible={isMainLandingVisible}
                    />
                </PageContainer>
            )}
            {loadedModule && (
                <TrainingContainer>
                    <TutorialModule translate={translate} module={loadedModule} {...otherProps} />
                </TrainingContainer>
            )}
        </SnackbarProvider>
    );
};

type TrainingModuleProps = {
    module: TrainingModule;
    translate: TranslateMethod;
    onHome?: () => void;
    onBack?: () => void;
    appendToTriggerKey: (key: string) => void;
};
const TutorialModule: React.FC<TrainingModuleProps> = props => {
    const { module, appendToTriggerKey } = props;
    const moduleNavigation = useUpdateModuleStep({
        module,
    });
    const moduleStep = moduleNavigation.moduleStep;

    const stepProps = useMemo(() => ({ ...props, ...moduleNavigation }), [props, moduleNavigation]);

    useEffect(() => {
        const { step, content } = moduleNavigation.tutorialProgress;
        appendToTriggerKey(`${moduleStep}-${step}-${content}`);
    }, [moduleStep, moduleNavigation.tutorialProgress, appendToTriggerKey]);

    return (
        <>
            {moduleStep === "welcome" && <WelcomeStep {...stepProps} />}
            {(moduleStep === "contents" || moduleStep === "summary") && <TrainingSummaryStep {...stepProps} />}
            {moduleStep === "steps" && <TrainingStep {...stepProps} />}
            {moduleStep === "final" && <FinalStep {...stepProps} />}
        </>
    );
};

type StepProps = TrainingModuleProps &
    UpdateModuleStep & {
        setModuleStep: (step: ModuleStepType) => void;
    };

const WelcomeStep: React.FC<StepProps> = props => {
    const { module, translate, onBack, setModuleStep } = props;

    const onStart = useCallback(() => {
        setModuleStep("contents");
    }, [setModuleStep]);
    return (
        <>
            <StyledMarkdownViewer source={translate(module.contents.welcome)} />
            <Footer>
                <MainButton color="secondary" onClick={onBack}>
                    {i18n.t("Exit Tutorial")}
                </MainButton>
                <MainButton color="primary" onClick={onStart}>
                    {i18n.t("Start Tutorial")}
                </MainButton>
            </Footer>
        </>
    );
};

const TrainingSummaryStep: React.FC<StepProps> = props => {
    const { module, translate, setModuleStep, setTutorialProgress, moduleStep } = props;

    const completed = moduleStep === "summary";

    const onPrev = useCallback(() => {
        setModuleStep("welcome");
    }, [setModuleStep]);

    const onStart = useCallback(() => {
        setModuleStep("steps");
    }, [setModuleStep]);

    const onStep = useCallback(
        (step: number) => {
            setModuleStep("steps");
            setTutorialProgress({ step, content: 1 });
        },
        [setModuleStep, setTutorialProgress]
    );

    const title = completed ? i18n.t("What did you learn in this tutorial?") : i18n.t("What will this tutorial cover?");

    const prevText = completed ? i18n.t("Back to tutorial") : i18n.t("Previous");
    const nextText = completed ? i18n.t("Take another tutorial") : i18n.t("Start");

    return (
        <>
            <ModalTitle>{title}</ModalTitle>
            <div>
                {module?.contents.steps.map(({ title }, idx) => {
                    return (
                        <SummaryStep
                            key={`step-${idx}`}
                            module={module}
                            onStep={onStep}
                            position={idx}
                            title={translate(title)}
                            partition={1}
                        />
                    );
                })}
            </div>
            <Footer>
                <MainButton color="secondary" onClick={onPrev}>
                    {prevText}
                </MainButton>
                <MainButton color="primary" onClick={onStart}>
                    {nextText}
                </MainButton>
            </Footer>
        </>
    );
};

const TrainingStep: React.FC<StepProps> = props => {
    const { module, updateModuleStep, tutorialProgress, translate } = props;

    const currentStep = `${module.id}-${tutorialProgress.step}-${tutorialProgress.content}`;

    return (
        <StyledTrainingWizard
            currentStep={currentStep}
            minimized={false}
            translate={translate}
            module={module}
            onChangeStep={updateModuleStep}
        />
    );
};

const FinalStep: React.FC<StepProps> = props => {
    const { module, setModuleStep, translate, onHome } = props;

    const steps = module.contents.steps.map(({ title }, idx) => ({
        key: `step-${idx}`,
        label: translate(title),
        component: () => null,
    }));

    const onPrev = useCallback(() => {
        setModuleStep("steps");
    }, [setModuleStep]);

    return (
        <>
            <ModalTitle big={true}>{i18n.t("Well done!")}</ModalTitle>
            <ModalParagraph>
                {i18n.t("You've completed the {{name}} tutorial!", {
                    name: translate(module.name),
                })}
            </ModalParagraph>
            <Stepper steps={steps} lastClickableStepIndex={-1} markAllCompleted={true} onMove={_.noop} />
            <Footer>
                <MainButton color="secondary" onClick={onPrev}>
                    {i18n.t("Back to tutorial")}
                </MainButton>
                <MainButton color="primary" onClick={onHome}>
                    {i18n.t("Finish")}
                </MainButton>
            </Footer>
        </>
    );
};

const StyledMarkdownViewer = styled(MarkdownViewer)`
    padding: 0;
`;

const Footer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const TrainingContainer = styled.div`
    color: white;
    padding: 5px 20px;
    text-align: center;
    text-align-last: center;

    button {
        font-size: 16px !important;
        padding: 14px 24px !important;
    }

    [data-component="modal-content"] {
        max-height: unset;
    }

    [data-component="card-progress"] {
        display: none !important;
    }
`;

const PageContainer = styled.div`
    color: white;
    flex: 1;
    display: flex;
    flex-direction: column;

    & > div:first-child {
        & > div:first-child {
            margin-block: 20px 0;
            margin-inline: 15px;

            span {
                margin: 0;
            }
        }
        text-align: center;
    }

    & > span {
        text-align: center;
    }

    [data-component="modal-content"] {
        max-height: unset;
        max-width: unset;
    }

    [data-component="cardboard"] {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 175px));
        margin-right: 0;

        & > div {
            max-width: 200px;
        }

        span {
            padding: 0;
            font-size: 16px;
            overflow-wrap: break-word;
            word-break: break-word;
        }
        img {
            width: 100%;
            max-width: 120px;
        }
    }
`;

const StyledTrainingWizard = styled(TrainingWizard)`
    button {
        margin: 0 !important;
    }
`;
