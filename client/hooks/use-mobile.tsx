import * as React from "react";
import { safeWindow } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // SAFE WINDOW ACCESS - Previene crashes en SSR
    if (!safeWindow.isAvailable()) {
      setIsMobile(false); // Assume desktop in SSR
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(safeWindow.getInnerWidth() < MOBILE_BREAKPOINT);
    };
    
    // Initial check
    setIsMobile(safeWindow.getInnerWidth() < MOBILE_BREAKPOINT);
    
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
