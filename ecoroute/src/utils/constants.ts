export const EMISSION_FACTOR_SHORT_HAUL = 0.255;
export const EMISSION_FACTOR_LONG_HAUL  = 0.195;
export const SHORT_HAUL_THRESHOLD_KM    = 1500;
export const RFI_MULTIPLIER             = 2.7;
export const DETOUR_FACTOR_KM           = 95;
export const CAR_EMISSION_PER_KM        = 0.21;
export const TRAIN_EMISSION_PER_KM      = 0.041;
export const TREE_ABSORPTION_KG_PER_YEAR = 21;

export const CABIN_CLASS_MULTIPLIERS = {
  economy:  1.0,
  business: 1.5,
  first:    2.0,
} as const;

export const ARC_POINT_COUNT   = 50;
export const ARC_ANIMATION_MS  = 1500;
export const PLANE_DELAY_MS    = 750;
export const MAP_CENTER_LAT    = 54;
export const MAP_CENTER_LNG    = 15;
export const MAP_DEFAULT_ZOOM  = 4;
export const MARKER_RADIUS_DEFAULT = 5;
export const MARKER_RADIUS_SELECTED = 7;

export const COLOR_ORIGIN      = '#22c55e'  // Green — selected origin marker
export const COLOR_DESTINATION = '#ef4444'  // Red — selected destination marker
export const COLOR_UNSELECTED  = '#94a3b8'  // Gray — unselected city marker
export const COLOR_PANEL_BG    = '#0f1117'  // Dark background (marker border)
export const COLOR_ARC         = '#22c55e'  // Green — flight arc line
export const COLOR_CAR         = '#f97316'  // Orange — car comparison bar
export const COLOR_TRAIN       = '#22c55e'  // Green — train comparison bar
export const COLOR_FLIGHT      = '#ef4444'  // Red — flight comparison bar

export const ARC_STROKE_WEIGHT  = 2
export const ARC_STROKE_OPACITY = 0.85
export const MARKER_STROKE_WEIGHT = 1
export const PLANE_ICON_ANCHOR  = 9    // px, both x and y
export const TOOLTIP_OFFSET_Y   = -6   // px

export const EARTH_RADIUS_KM = 6371
