import { useCallback } from "react";
import _ from "lodash";
import JSZip from "jszip";
import FileSaver from "file-saver";

import i18n from "../../utils/i18n";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Translations } from "../../domain/entities/TranslatableText";

export function useImportExportTranslation() {
    const snackbar = useSnackbar();

    const exportTranslation = useCallback(async (exportFn: () => Promise<Translations>, name: string) => {
        const translations = await exportFn();
        const files = _.toPairs(translations);
        const zip = new JSZip();

        for (const [lang, contents] of files) {
            const json = JSON.stringify(contents, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${lang}.json`, blob);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const fileName = _.kebabCase(name);
        FileSaver.saveAs(blob, `translations-${fileName}.zip`);
    }, []);

    const importTranslation = useCallback(
        async (importFn: () => Promise<number>) => {
            const total = await importFn();
            if (total > 0) {
                snackbar.success(i18n.t("Imported {{total}} translation terms", { total }));
            } else {
                snackbar.warning(i18n.t("Unable to import translation terms"));
            }
        },
        [snackbar]
    );

    return { exportTranslation, importTranslation };
}
