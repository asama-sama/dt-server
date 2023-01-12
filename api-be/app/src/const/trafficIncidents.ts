export const categorySubcategoryMap: { [key: string]: string[] } = {
  crash: ["crash", "accident"],
  hazard: ["hazard"],
  "heavy traffic": ["heavy traffic", "heavy holiday traffic"],
  "changed traffic conditions": [
    "changed traffic conditions",
    "police operations",
  ],
  events: [
    "special events",
    "A league",
    "afl",
    "concert",
    "festival",
    "nbl",
    "nrl",
    "nye",
    "race day",
    "soccer",
    "special event",
  ],
  "weather-fire-disasters": [
    "smoke",
    "fire",
    "flooding",
    "fog",
    "burst water main",
    "adverse weather",
  ],
  breakdown: ["breakdown", "ferry out of service"],
  "traffic lights": ["traffic lights", "traffic signals"],
  roadworks: ["roadwork"],
};

export const AIR_QUALITY_SITE_SEARCH_RADIUS = 50000; // 50m

type TrafficSearchLocation = {
  latitude: number;
  longitude: number;
  radius: number; // in km
};

export const TRAFFIC_SEARCH_LOCATIONS: TrafficSearchLocation =
  // centered near wetherill park, sydney
  {
    latitude: -33.83633,
    longitude: 150.90387,
    radius: 50,
  };

export const MONTHS_TO_SEARCH = 36;
