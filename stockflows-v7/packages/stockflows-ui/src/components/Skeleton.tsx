import React from "react";

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-sm)",
  className = "",
  circle = false,
}) => {
  const computedBorderRadius = circle ? "50%" : borderRadius;

  return (
    <div
      className={`bg-[var(--skeleton-bg)] animate-pulse ${className}`}
      style={{ width, height, borderRadius: computedBorderRadius }}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={`${100 - (index === lines - 1 ? 30 : 0)}%`}
        height="0.875rem"
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: string;
  className?: string;
}> = ({ size = "3rem", className = "" }) => (
  <Skeleton
    width={size}
    height={size}
    circle
    className={`rounded-full ${className}`}
  />
);

export default Skeleton;