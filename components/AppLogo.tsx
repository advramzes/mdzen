import React from 'react';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Path, Text as SvgText } from 'react-native-svg';
import { ms } from '../utils/scale';

interface AppLogoProps {
  size?: number;
  primaryColor?: string;
  backgroundColor?: string;
}

export function AppLogo({
  size = ms(120),
  primaryColor = '#22C55E',
  backgroundColor = '#F0FDF4',
}: AppLogoProps) {
  const cx = size / 2;
  const cy = size / 2;
  const leafW = size * 0.42;
  const leafH = size * 0.48;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={primaryColor} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Soft glow behind leaf */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={size * 0.45}
        ry={size * 0.45}
        fill="url(#glow)"
      />

      {/* Zen leaf shape — smooth garden stone / leaf */}
      <Path
        d={`
          M ${cx} ${cy - leafH}
          C ${cx + leafW} ${cy - leafH * 0.6}
            ${cx + leafW} ${cy + leafH * 0.6}
            ${cx} ${cy + leafH}
          C ${cx - leafW} ${cy + leafH * 0.6}
            ${cx - leafW} ${cy - leafH * 0.6}
            ${cx} ${cy - leafH}
          Z
        `}
        fill={primaryColor}
        opacity={0.9}
      />

      {/* Leaf vein — subtle center line */}
      <Path
        d={`M ${cx} ${cy - leafH * 0.7} L ${cx} ${cy + leafH * 0.7}`}
        stroke={backgroundColor}
        strokeWidth={size * 0.012}
        opacity={0.3}
      />

      {/* "MD" text inside leaf */}
      <SvgText
        x={cx}
        y={cy + size * 0.05}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="700"
        fill={backgroundColor}
        letterSpacing={size * 0.01}
      >
        MD
      </SvgText>
    </Svg>
  );
}
