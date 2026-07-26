import { useEffect, useState, type ComponentType } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsivePageProps {
  DesktopComponent: ComponentType;
  MobileComponent: ComponentType;
}

export function ResponsivePage({
  DesktopComponent,
  MobileComponent,
}: ResponsivePageProps) {
  const [isReady, setIsReady] = useState(false);
  const isMobile = useIsMobile();
  const forceFullFeatureView =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "full";
  const Component = forceFullFeatureView || !isMobile ? DesktopComponent : MobileComponent;

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <Component />;
}
