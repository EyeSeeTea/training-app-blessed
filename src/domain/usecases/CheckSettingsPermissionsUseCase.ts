import _ from "lodash";

import { User } from "../../data/entities/User";
import { UseCase } from "../../webapp/CompositionRoot";
import { NamedRef } from "../entities/Ref";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config } from "../entities/Config";

export class CheckSettingsPermissionsUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(config: Config): Promise<boolean> {
        const user = await this.configRepository.getUser();
        const { settingsPermissions: permissions } = config ?? (await this.configRepository.get());

        const isAdmin = !!user.userRoles.find(role => role.authorities.find(authority => authority === "ALL"));

        const sharedByUser = this.findCurrentUser(user, permissions.users ?? []);
        const sharedByGroup = this.findCurrentUser(user, permissions.userGroups ?? []);

        return isAdmin || sharedByUser || sharedByGroup;
    }

    private findCurrentUser(user: User, collection: NamedRef[]): boolean {
        return !_([user, ...user.userGroups])
            .intersectionBy(collection, userGroup => userGroup.id)
            .isEmpty();
    }
}
