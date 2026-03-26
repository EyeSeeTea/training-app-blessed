import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { CustomText, getDefaultCustomText } from "../entities/CustomText";
import { Config } from "../entities/Config";
import { Permission } from "../entities/Permission";
import { Maybe } from "../../types/utils";
import { TranslatableText } from "../entities/TranslatableText";

export type PartialConfig = Pick<Partial<Config>, "showAllModules" | "logo" | "containerConfig"> & {
    settingsPermissions?: Partial<Permission>;
    customText?: Partial<CustomText>;
};

export class SaveConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(update: PartialConfig): Promise<void> {
        const config = await this.configRepository.get();
        const defaultCustomText = getDefaultCustomText();

        const updatedConfig: Config = {
            settingsPermissions: {
                users: update.settingsPermissions?.users ?? config.settingsPermissions?.users ?? [],
                userGroups: update.settingsPermissions?.userGroups ?? config.settingsPermissions?.userGroups ?? [],
            },
            showAllModules: update.showAllModules ?? config.showAllModules,
            logo: update.logo ?? config.logo,
            customText: {
                rootTitle:
                    this.normalizeTextField(update.customText?.rootTitle, defaultCustomText.rootTitle) ??
                    config.customText.rootTitle,
                rootSubtitle:
                    this.normalizeTextField(update.customText?.rootSubtitle, defaultCustomText.rootSubtitle) ??
                    config.customText.rootSubtitle,
            },
            containerConfig: update.containerConfig ?? config.containerConfig,
        };

        return await this.configRepository.save(updatedConfig);
    }

    private normalizeTextField(
        field: Maybe<TranslatableText>,
        defaultValue: TranslatableText
    ): Maybe<TranslatableText> {
        if (!field) return undefined;

        if (field.referenceValue?.trim() === "") {
            return defaultValue;
        }

        return field;
    }
}
