import { AlertTriangle } from "lucide-react";
import type { CollapseStatus } from "../lib/analytics";

interface CollapseWarningBannerProps {
  collapse: CollapseStatus;
}

export default function CollapseWarningBanner({
  collapse,
}: CollapseWarningBannerProps) {
  if (!collapse.isCollapsed) return null;

  const isMissed = collapse.consecutiveMissedDays >= 3;
  const isZero = collapse.consecutiveZeroDays >= 2;

  return (
    <div className="flex items-start gap-2.5 bg-risk-critical/10 border border-risk-critical/40 rounded-sm px-3 py-2.5">
      <AlertTriangle className="w-4 h-4 text-risk-critical mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-risk-critical uppercase tracking-wider">
          Behavioral Collapse Detected
        </p>
        <p className="text-xs text-muted-foreground">
          {isMissed && (
            <span>
              {collapse.consecutiveMissedDays} consecutive days missed.{" "}
            </span>
          )}
          {isZero && (
            <span>
              {collapse.consecutiveZeroDays} consecutive zero-value entries.{" "}
            </span>
          )}
          Immediate action required to restore habit momentum.
        </p>
      </div>
    </div>
  );
}
