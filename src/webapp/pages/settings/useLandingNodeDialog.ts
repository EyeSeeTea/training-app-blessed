import { useState } from "react";

import { LandingPageEditDialogProps } from "../../components/landing-page-edit-dialog/LandingPageEditDialog";
import { LandingNode } from "../../../domain/entities/LandingPage";
import { useLandingNodeActions } from "./useLandingNodeActions";

export function useLandingNodeDialog(props: { nodes: LandingNode[] }) {
    const { nodes } = props;
    const [landingNodeDetailsDialog, setLandingNodeDetailsDialog] = useState<LandingPageEditDialogProps>();

    const actions = useLandingNodeActions(nodes, setLandingNodeDetailsDialog);

    return {
        landingNodeDetailsDialog,
        ...actions,
    };
}
