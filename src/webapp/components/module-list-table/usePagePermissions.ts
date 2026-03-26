import { useCallback, useMemo, useState } from "react";
import { isListItemPage, ListItem, ListItemPage, ModuleListTableAction } from "./ModuleListTable";
import { SharedUpdate } from "../permissions-dialog/PermissionsDialog";
import i18n from "../../../utils/i18n";

type UsePagePermissions = {
    rows: ListItem[];
    onChange: ModuleListTableAction["editPagePermissions"];
    refreshRows: () => Promise<void>;
};

export function usePagePermissions(props: UsePagePermissions) {
    const { rows, onChange, refreshRows } = props;

    const [activeRow, setActiveRow] = useState<ListItemPage>();

    const pagePermissionsDialog = useMemo(
        () =>
            activeRow
                ? {
                      object: { name: i18n.t("Page permissions"), ...activeRow.permissions },
                      onChange: async (sharedUpdate: SharedUpdate) => {
                          if (!onChange) return;
                          const { publicAccess, userAccesses, userGroupAccesses } = sharedUpdate;
                          const permissions = {
                              publicAccess: publicAccess ?? activeRow.permissions.publicAccess,
                              userAccesses: userAccesses ?? activeRow.permissions.userAccesses,
                              userGroupAccesses: userGroupAccesses ?? activeRow.permissions.userGroupAccesses,
                          };
                          await onChange({ id: activeRow.moduleId, page: { id: activeRow.id, permissions } });
                          await refreshRows();
                          setActiveRow({
                              ...activeRow,
                              permissions,
                          });
                      },
                      onClose: () => setActiveRow(undefined),
                      allowPublicAccess: true,
                      showOptions: {
                          publicSharing: true,
                          permissionPicker: true,
                      },
                  }
                : undefined,
        [activeRow, onChange, refreshRows]
    );

    const openPagePermissions = useCallback(
        ids => {
            const row = rows.find(({ id }) => id === ids[0]);
            if (!row || !row.value) return;

            if (isListItemPage(row)) setActiveRow(row);
        },
        [rows]
    );

    return {
        pagePermissionsDialog,
        openPagePermissions,
    };
}
