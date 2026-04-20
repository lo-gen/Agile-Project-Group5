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
