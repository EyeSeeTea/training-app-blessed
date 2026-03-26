import React from "react";
import { Cardboard } from "../card-board/Cardboard";
import { BigCard } from "../card-board/BigCard";

import { LandingNode } from "../../../domain/entities/LandingPage";
import { ModalParagraph } from "../modal";
import i18n from "../../../utils/i18n";
import { removeEmptyStepsFromModules } from "../../../domain/entities/TrainingModule";
import { TrainingModule } from "../../../domain/entities/TrainingModule";
import { TranslateMethod } from "../../../domain/entities/TranslatableText";
import { Config } from "../../../domain/entities/Config";
import { Maybe } from "../../../types/utils";

type ModulesProps = {
    isRoot: boolean;
    currentPage: Maybe<LandingNode>;
    loadModule: (module: string, step: number) => void;
    modules: TrainingModule[];
    translate: TranslateMethod;
    appConfig: Config;
};

export const Modules: React.FC<ModulesProps> = props => {
    const { currentPage, loadModule, isRoot, modules, translate, appConfig } = props;

    const allPageModules =
        isRoot && appConfig.showAllModules
            ? modules
            : currentPage
            ? modules.filter(module => currentPage.modules.includes(module.id))
            : [];
    const pageModules = removeEmptyStepsFromModules(allPageModules);

    return (
        <React.Fragment>
            {isRoot && appConfig.showAllModules ? (
                <ModalParagraph size={28} align={"left"}>
                    {i18n.t("Select a module below to learn how to use applications in DHIS2:")}
                </ModalParagraph>
            ) : null}

            <Cardboard rowSize={3} key={`group-${currentPage?.id ?? "root"}`}>
                {pageModules.map(module => {
                    if (!module.compatible) return null;

                    const percentage =
                        module && module.contents.steps.length > 0
                            ? Math.round((module.progress.lastStep / module.contents.steps.length) * 100)
                            : undefined;

                    const handleClick = () => {
                        loadModule(module.id, module.progress.completed ? 0 : module.progress.lastStep + 1);
                    };

                    const name = translate(module.name);

                    return (
                        <BigCard
                            key={`card-${module.id}`}
                            label={name}
                            progress={module.progress.completed ? 100 : percentage}
                            onClick={handleClick}
                            disabled={module.disabled}
                            icon={
                                module.icon ? (
                                    <img src={module.icon} alt={i18n.t("Icon for {{name}}", { name: name })} />
                                ) : undefined
                            }
                        />
                    );
                })}
            </Cardboard>
        </React.Fragment>
    );
};
