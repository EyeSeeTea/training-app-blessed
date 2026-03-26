import { useCallback, useState } from "react";

import { Config, ContainerConfig } from "../../../domain/entities/Config";
import { ContainerConfigDialogProps } from "../../components/container-config-dialog/ContainerConfigDialog";

type UseContainerConfigDialogProps = {
    containerConfig: ContainerConfig;
    save: (settings: Partial<Config>) => Promise<void>;
};

export function useContainerDialog(props: UseContainerConfigDialogProps) {
    const { containerConfig, save } = props;

    const [containerConfigDialogProps, setContainerConfigDialogProps] = useState<ContainerConfigDialogProps>();

    const onSave = useCallback(
        async (data: ContainerConfig) => {
            await save({ containerConfig: data });
            setContainerConfigDialogProps(undefined);
        },
        [save]
    );

    const onClose = useCallback(() => setContainerConfigDialogProps(undefined), []);

    const onOpen = useCallback(
        () => setContainerConfigDialogProps({ containerConfig, onSave, onClose }),
        [containerConfig, onSave, onClose]
    );

    return {
        onOpen,
        containerConfigDialogProps,
    };
}
