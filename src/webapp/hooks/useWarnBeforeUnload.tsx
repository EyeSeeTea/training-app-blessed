import { useEffect } from "react";

export const useWarnBeforeUnload = (blockUnload: boolean) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
            return "";
        };

        if (blockUnload) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }

        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [blockUnload]);
};
