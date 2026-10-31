import { CircularProgressProps } from "@/app/interfaces/seller/DashboardInterfaces";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const CircularProgress = ({
  size,
  strokeWidth,
  data,
}: CircularProgressProps) => {
  const cardColor = useThemeColor({}, "cards");

  // Ensure data is always defined with safe defaults
  const safeData = data || { delivered: 0, shipped: 0, returned: 0, total: 0 };

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Calculate total and percentages
  const total = safeData.total || 0;
  const gapSize = 20; // Size of gap in degrees
  const totalGaps = 3 * gapSize; // Total degrees taken by gaps
  const availableDegrees = 360 - totalGaps;

  // Calculate the actual degrees for each segment
  const getSegmentDegrees = (value: number) => {
    if (total === 0) return 0;
    return (value / total) * availableDegrees;
  };

  // Define segments with their angles
  const segments = [
    {
      value: data?.shipped || 0,
      degrees: getSegmentDegrees(data?.shipped || 0),
      color: "#FFD700",
      startAngle: -60, // Position at bottom right
    },
    {
      value: data?.delivered || 0,
      degrees: getSegmentDegrees(data?.delivered || 0),
      color: "#4040FF",
      startAngle: -60 + getSegmentDegrees(data?.shipped || 0) + gapSize, // After shipped
    },
    {
      value: data?.returned || 0,
      degrees: getSegmentDegrees(data?.returned || 0),
      color: "#FF4040",
      startAngle:
        -60 +
        getSegmentDegrees(data?.shipped || 0) +
        getSegmentDegrees(data?.delivered || 0) +
        2 * gapSize, // After delivered
    },
  ];

  // Function to create an arc path
  const createArcPath = (startAngle: number, degrees: number) => {
    const startAngleRad = startAngle * (Math.PI / 180);
    const endAngleRad = (startAngle + degrees) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = degrees > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Draw each segment as a separate arc */}
        {segments.map((segment, index) => (
          <Path
            key={index}
            d={createArcPath(segment.startAngle, segment.degrees)}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </View>
  );
};

export default CircularProgress;
