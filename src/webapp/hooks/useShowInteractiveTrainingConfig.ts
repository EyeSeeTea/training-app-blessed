import { useLocation } from "react-router-dom";

export function useShowInteractiveTrainingConfig(): boolean {
    const location = useLocation();
    return new URLSearchParams(location.search).has("showInteractiveTrainingConfig");
}
