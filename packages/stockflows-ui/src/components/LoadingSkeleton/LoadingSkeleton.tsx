import React from "react";
import type { LoadingSkeletonProps } from "../../types";

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-md)",
  className = "",
}) => {
  return (
    <div
      className={`bg-[var(--skeleton-bg)] animate-pulse ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};
