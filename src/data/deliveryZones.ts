// Delivery pricing — Lagos zones + flat-rate for other states

// ── Lagos zone-based pricing ─────────────────────────────────

export interface DeliveryZone {
  id: number;
  name: string;
  fee: number;
  areas: string[];
}

export const lagosZones: DeliveryZone[] = [
  {
    id: 1,
    name: "Zone 1",
    fee: 2500,
    areas: [
      "Ipaja", "Ayobo", "Command", "Shagari Estate", "Iyana Ipaja",
      "Gate", "Baruwa", "Mosan",
    ],
  },
  {
    id: 2,
    name: "Zone 2",
    fee: 2000,
    areas: [
      "Isheri-Igando", "Ikotun", "Ejigbo", "Igando", "Egbeda",
      "Isheri-Idimu",
    ],
  },
  {
    id: 3,
    name: "Zone 3",
    fee: 1500,
    areas: [
      "Surulere", "Akoka", "Bariga", "Yaba", "Anthony Fadeyi",
      "Ilupeju", "Mushin", "Oshodi", "Costain", "Shomolu", "Onipanu",
      "Pangrove", "Ojota", "Maryland", "Ikeja", "Isolo",
      "Omole Phase 1", "Ajao Estate", "Kola", "Meiran", "Ile-Epo",
      "Amikanle", "Ekoro", "Oko Oba",
    ],
  },
  {
    id: 4,
    name: "Zone 4",
    fee: 2500,
    areas: [
      "Oworonshoki", "Gbagada", "Magodo", "Isheri", "Ketu",
      "Mile 12", "Okota", "Orile", "Iganmu", "Okokomaiko", "Agege",
      "Ogba", "Abule Egba", "Fagba", "Iju-Ishaga", "Iju-Obawole",
      "Ifako Ijaiye", "Ait Road", "Cement", "Akowonjo", "Dopemu",
    ],
  },
  {
    id: 5,
    name: "Zone 5",
    fee: 2500,
    areas: [
      "Dalemo Alakuko", "Amuwo Odofin", "Festac", "Ogudu", "Lasu",
      "Apapa", "Ebute Metta", "Ajegunle", "Mile 2", "Oyingbo",
      "Ijora", "Iddo", "Ojodu Berger", "Ago Palace",
    ],
  },
  {
    id: 6,
    name: "Zone 6",
    fee: 4500,
    areas: ["Ajah", "Addo Road", "Badore"],
  },
  {
    id: 7,
    name: "Zone 7",
    fee: 4000,
    areas: [
      "Lbs", "Sangotedo", "Abraham Adesanya",
      "Lekki Gardens Phase 1-5", "Tradefair", "Alaba", "Ojo",
      "Ikorodu",
    ],
  },
  {
    id: 8,
    name: "Zone 8",
    fee: 5000,
    areas: ["Abijo", "Awoyaya", "Ogombo", "Langbasa"],
  },
  {
    id: 9,
    name: "Zone 9",
    fee: 3000,
    areas: [
      "Lagos Island", "Ikoyi", "Victoria Island", "Obalende", "Tbs",
      "Adeniyi", "Ikate", "Agungi", "Marina", "Cms", "Apogbon",
    ],
  },
  {
    id: 10,
    name: "Zone 10",
    fee: 4500,
    areas: [
      "Satellite Town", "Vgc", "Chevron", "Ikota", "Orchid Road",
      "Osapa", "Lekki", "Idado", "Iyana-Iba",
    ],
  },
  {
    id: 11,
    name: "Zone 11",
    fee: 7500,
    areas: ["Ibeju Lekki", "Epe"],
  },
];

/** Flat list of Lagos areas sorted alphabetically */
export const lagosAreas = lagosZones
  .flatMap((zone) =>
    zone.areas.map((area) => ({
      area,
      zoneId: zone.id,
      zoneName: zone.name,
      fee: zone.fee,
    })),
  )
  .sort((a, b) => a.area.localeCompare(b.area));

export const ogunZones: DeliveryZone[] = [
  {
    id: 1,
    name: "Zone 1",
    fee: 3000,
    areas: [
      "Sango", "Sango Ota", "Ota", "Iyana Iyesi", "Owode Ajegunle",
      "Akute", "Agbara",
    ],
  },
  {
    id: 2,
    name: "Zone 2",
    fee: 4000,
    areas: [
      "Mowe", "Ibafo", "Magboro", "Redemption Camp", "Arepo",
    ],
  },
  {
    id: 3,
    name: "Zone 3",
    fee: 5500,
    areas: [
      "Abeokuta", "Sagamu", "Ijebu Ode", "Simawa",
    ],
  },
];

/** Flat list of Ogun areas sorted alphabetically */
export const ogunAreas = ogunZones
  .flatMap((zone) =>
    zone.areas.map((area) => ({
      area,
      zoneId: zone.id,
      zoneName: zone.name,
      fee: zone.fee,
    })),
  )
  .sort((a, b) => a.area.localeCompare(b.area));

/** Look up Lagos zone info by area name (case-insensitive) */
export const findLagosZoneByArea = (
  areaName: string,
): { area: string; zoneId: number; zoneName: string; fee: number } | null => {
  const lower = areaName.toLowerCase();
  return lagosAreas.find((a) => a.area.toLowerCase() === lower) ?? null;
};

// ── State-level flat-rate pricing ────────────────────────────

export interface DeliveryState {
  name: string;
  flatFee: number;
  /** If true, use zone-based pricing instead of flat fee */
  hasZones?: boolean;
}

export const deliveryStates: DeliveryState[] = [
  { name: "Lagos", flatFee: 0, hasZones: true },
  { name: "Ogun", flatFee: 0, hasZones: true },
  // { name: "Oyo", flatFee: 6000 },
  // { name: "Abuja (FCT)", flatFee: 7500 },
  // { name: "Rivers", flatFee: 8000 },
  // { name: "Delta", flatFee: 8000 },
  // { name: "Edo", flatFee: 7500 },
  // { name: "Osun", flatFee: 6000 },
  // { name: "Ondo", flatFee: 6500 },
  // { name: "Ekiti", flatFee: 7000 },
  // { name: "Kwara", flatFee: 7000 },
  // { name: "Kano", flatFee: 9000 },
  // { name: "Kaduna", flatFee: 9000 },
  // { name: "Enugu", flatFee: 8500 },
  // { name: "Anambra", flatFee: 8500 },
  // { name: "Abia", flatFee: 8500 },
  // { name: "Cross River", flatFee: 9000 },
  // { name: "Akwa Ibom", flatFee: 9000 },
  // { name: "Imo", flatFee: 8500 },
  // { name: "Plateau", flatFee: 9000 },
];

/** Get delivery state by name */
export const getDeliveryState = (
  name: string,
): DeliveryState | null => {
  const normalizedName = name.trim().toLowerCase().replace(/\s+state$/, "");

  return deliveryStates.find(
    (s) => s.name.toLowerCase() === normalizedName,
  ) ?? null;
};
