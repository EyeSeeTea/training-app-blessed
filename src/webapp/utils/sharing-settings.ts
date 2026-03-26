import i18n from "../../utils/i18n";
import { NamedRef } from "../../domain/entities/Ref";
import { Permission } from "../../domain/entities/Permission";
import { PermissionsDialogProps } from "../components/permissions-dialog/PermissionsDialog";

export function buildSharingDescription(props: { users: NamedRef[]; userGroups: NamedRef[] }) {
    const { users, userGroups } = props;
    const usersCount = users?.length ?? 0;
    const userGroupsCount = userGroups?.length ?? 0;

    if (usersCount > 0 && userGroupsCount > 0) {
        return i18n.t("Accessible to {{usersCount}} users and {{userGroupsCount}} user groups", {
            usersCount,
            userGroupsCount,
        });
    } else if (usersCount > 0) {
        return i18n.t("Accessible to {{usersCount}} users", { usersCount });
    } else if (userGroupsCount > 0) {
        return i18n.t("Accessible to {{userGroupsCount}} user groups", { userGroupsCount });
    } else {
        return i18n.t("Only accessible to system administrators");
    }
}

export function buildSettingsPermissionDialogProps(props: {
    permissions: Permission;
    name: string;
    publicAccess?: string;
}): PermissionsDialogProps["object"] {
    const { permissions, name, publicAccess } = props;
    return {
        name: name,
        publicAccess: publicAccess || "--------",
        userAccesses:
            permissions.users.map(ref => ({
                ...ref,
                access: "rw----",
            })) ?? [],
        userGroupAccesses:
            permissions.userGroups.map(ref => ({
                ...ref,
                access: "rw----",
            })) ?? [],
    };
}
