import { ContainerCatalogItem } from '../../core/models';

export interface ContainerCategoryMeta {
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  description: string;
  icon: string;
  image: string;
}

export interface TransportItem {
  name: string;
  summary: string;
  cargo: string;
  visual: string;
  image: string;
  imagePosition: string;
  brand?: boolean;
}

export interface SolutionItem {
  name: string;
  summary: string;
  visual: string;
  image: string;
  imagePosition: string;
}

export const CONTAINER_CATEGORIES: ContainerCategoryMeta[] = [
  {
    slug: 'dry-cargo',
    name: 'Dry Cargo container',
    shortName: 'Dry Cargo',
    summary: 'Suitable for general cargo, high-volume dry shipments, and hardtop loading needs.',
    description:
      'Suitable for any general cargo. Standard and high cube equipment support common dry shipments, while hardtop containers support cargo that needs top loading or extra loading flexibility.',
    icon: 'dry',
    image: 'assets/images/services/container-dry-cargo.png'
  },
  {
    slug: 'reefer-cargo',
    name: 'Reefer Cargo container',
    shortName: 'Reefer Cargo',
    summary: 'Temperature-controlled equipment for chilled, frozen, and sensitive cargo.',
    description:
      'Reefer equipment is designed for cargo that needs controlled temperatures, airflow, and careful handover between terminal, vessel, and inland transportation.',
    icon: 'reefer',
    image: 'assets/images/services/container-reefer.png'
  },
  {
    slug: 'special-cargo',
    name: 'Special Cargo container',
    shortName: 'Special Cargo',
    summary: 'Open top, flat rack, platform, and tank options for complex cargo.',
    description:
      'Special cargo equipment supports oversized, heavy, top-loaded, project, and eligible liquid cargo where standard containers are not the right fit.',
    icon: 'flat-rack',
    image: 'assets/images/services/container-special-cargo.png'
  }
];

export const TRANSPORT_TYPES: TransportItem[] = [
  {
    name: 'Container chassis',
    summary: 'Port drayage and inland moves for 20-foot, 40-foot, and high-cube equipment.',
    cargo: 'FCL containers, reefers, tanks',
    visual: 'container-chassis',
    image: 'assets/images/services/container-chasis.jpg',
    imagePosition: '18% 58%',
    brand: true
  },
  {
    name: 'Flatbed trailers',
    summary: 'Open trailer movement for crane-loaded cargo and industrial material.',
    cargo: 'Steel, crates, packed machinery',
    visual: 'flatbed',
    image: 'assets/images/services/flatbed-trailers.jpg',
    imagePosition: '42% 58%'
  },
  {
    name: 'Lowbed trailers',
    summary: 'Low-platform transport for high, heavy, or abnormal cargo.',
    cargo: 'Generators, machinery, equipment',
    visual: 'lowbed',
    image: 'assets/images/services/lowbed-trailers.jpg',
    imagePosition: '57% 58%',
    brand: true
  },
  {
    name: 'Curtain side trucks',
    summary: 'Side-access regional transport with weather protection.',
    cargo: 'Pallets, retail goods, packed cargo',
    visual: 'curtain-side',
    image: 'assets/images/services/curtain-side trucks.jpg',
    imagePosition: '63% 58%',
    brand: true
  },
  {
    name: 'Box trucks',
    summary: 'Closed-body delivery support for dry cargo and local distribution.',
    cargo: 'Cartons, spare parts, general cargo',
    visual: 'box',
    image: 'assets/images/services/box-trucks.jpg',
    imagePosition: '78% 58%',
    brand: true
  },
  {
    name: 'Reefer trucks',
    summary: 'Temperature-controlled road transport for cold-chain moves.',
    cargo: 'Foodstuff, pharma, chilled cargo',
    visual: 'reefer',
    image: 'assets/images/services/reefer-trucks.jpg',
    imagePosition: '70% 58%',
    brand: true
  },
  {
    name: 'Tank trailers',
    summary: 'Liquid cargo movement coordinated with safety and cleaning requirements.',
    cargo: 'Eligible foodstuff and chemicals',
    visual: 'tank',
    image: 'assets/images/services/tank-trailers.jpg',
    imagePosition: '35% 58%'
  },
  {
    name: 'Car carriers',
    summary: 'Vehicle transport for fleet, dealer, auction, and relocation cargo.',
    cargo: 'Cars and light vehicles',
    visual: 'car-carrier',
    image: 'assets/images/services/car-carriers.jpg',
    imagePosition: '28% 58%',
    brand: true
  },
  {
    name: 'Heavy haul trucks',
    summary: 'Special project transport with route checks, permits, and escorts.',
    cargo: 'Oversized and overweight cargo',
    visual: 'heavy-haul',
    image: 'assets/images/services/heavy-haul-trucks.jpg',
    imagePosition: '86% 58%',
    brand: true
  }
];

export const SOLUTIONS: SolutionItem[] = [
  {
    name: 'Port handling coordination',
    summary: 'Terminal release, gate moves, inspection timing, empty return, and port-side issue follow-up.',
    visual: 'port',
    image: 'assets/images/services/port-handling-coordination.webp',
    imagePosition: '18% 55%'
  },
  {
    name: 'Airport cargo support',
    summary: 'Air cargo documentation, pickup and delivery coordination, airline handoff, and urgent shipment handling.',
    visual: 'airport',
    image: 'assets/images/services/port-air-customs-solutions.png',
    imagePosition: '70% 52%'
  },
  {
    name: 'Customs clearance',
    summary: 'Document preparation, broker coordination, duty workflow follow-up, and inspection response.',
    visual: 'customs',
    image: 'assets/images/services/custom-clearence-solution.jpg',
    imagePosition: '45% 55%'
  },
  {
    name: 'Documentation control',
    summary: 'Bill of lading, invoice, packing list, certificate, dangerous goods, and special cargo paperwork checks.',
    visual: 'documents',
    image: 'assets/images/services/documentation-control.webp',
    imagePosition: '58% 74%'
  },
  {
    name: 'Warehousing handoff',
    summary: 'Cargo staging, cross-dock coordination, delivery appointments, and local storage handover.',
    visual: 'warehouse',
    image: 'assets/images/services/warehousing-handoff.webp',
    imagePosition: '88% 55%'
  },
  {
    name: 'Problem solving desk',
    summary: 'Support for holds, missed cutoffs, route changes, damage reporting, and urgent operations escalations.',
    visual: 'support',
    image: 'assets/images/services/problem-solving-desk.jpg',
    imagePosition: '52% 70%'
  }
];

export function categoryBySlug(slug: string | null | undefined) {
  return CONTAINER_CATEGORIES.find((category) => category.slug === slug);
}

export function categoryItems(items: ContainerCatalogItem[], slug: string) {
  return items
    .filter((item) => item.categorySlug === slug)
    .sort((a, b) => a.subgroupSortOrder - b.subgroupSortOrder || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function subgroupItems(items: ContainerCatalogItem[]) {
  const groups = new Map<string, ContainerCatalogItem[]>();
  items.forEach((item) => {
    const group = groups.get(item.subgroupName) || [];
    group.push(item);
    groups.set(item.subgroupName, group);
  });

  return [...groups.entries()].map(([name, groupItems]) => ({
    name,
    items: groupItems.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    illustrationKey: groupItems[0]?.illustrationKey || 'dry',
    imageAsset: groupItems[0]?.imageAsset || ''
  }));
}
