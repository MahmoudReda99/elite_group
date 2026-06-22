import { ContainerCatalogGroup, FreightStatus, PrismaClient, TrackingStatus, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const demoPassword = 'Elite@2026!';

async function main() {
  const passwordHash = await argon2.hash(demoPassword);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@elitegroup.local' },
    update: { passwordHash, active: true, role: UserRole.ADMIN },
    create: {
      name: 'Elite Group Admin',
      email: 'admin@elitegroup.local',
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@elitegroup.local' },
    update: { passwordHash, active: true, role: UserRole.OPERATOR },
    create: {
      name: 'Elite Group Operator',
      email: 'operator@elitegroup.local',
      passwordHash,
      role: UserRole.OPERATOR
    }
  });

  const standardContainerTypes = [
    { name: '20FT Standard Dry', description: 'Standard 20FT dry container for general cargo.', capacityInfo: '20GP' },
    { name: '40FT Standard Dry', description: 'Standard 40FT dry container for general cargo.', capacityInfo: '40GP' },
    { name: '40FT High Cube', description: 'High-cube 40FT dry container for taller general cargo.', capacityInfo: '40HC' },
    { name: '20FT Reefer', description: 'Temperature-controlled 20FT reefer container.', capacityInfo: '20RF' },
    { name: '40FT Reefer High Cube', description: 'Temperature-controlled 40FT high-cube reefer container.', capacityInfo: '40RH' },
    { name: '20FT Open Top', description: '20FT open-top container for top-loaded cargo.', capacityInfo: '20OT' },
    { name: '40FT Open Top', description: '40FT open-top container for top-loaded cargo.', capacityInfo: '40OT' },
    { name: '20FT Flat Rack', description: '20FT flat-rack equipment for heavy or oversized cargo.', capacityInfo: '20FR' },
    { name: '40FT Flat Rack', description: '40FT flat-rack equipment for heavy or oversized cargo.', capacityInfo: '40FR' },
    { name: '20FT Tank Container', description: 'ISO tank container for liquid cargo.', capacityInfo: '20TK' }
  ];

  await prisma.containerType.updateMany({
    where: {
      name: {
        in: ['Dry Container', 'Reefer Container', 'Open Top', 'Flat Rack', 'Tank / Special Equipment']
      }
    },
    data: { active: false }
  });

  for (const container of standardContainerTypes) {
    await prisma.containerType.upsert({
      where: { name: container.name },
      update: { ...container, active: true },
      create: container
    });
  }

  const nominalDisclaimer =
    'Nominal sample dimensions and weights for planning. Actual equipment can vary by manufacturer, series, cargo requirements, and local road or rail limits.';

  const containerCatalogItems = [
    {
      slug: '20-standard-dry',
      group: ContainerCatalogGroup.DRY,
      name: "20' Standard Dry",
      summary: 'Compact dry cargo container for dense general cargo and balanced payload planning.',
      useCase: 'General cargo, packaged goods, pallets, machinery parts, cartons, and dry non-temperature-sensitive cargo.',
      imageAsset: 'assets/images/services/container-dry-cargo.png',
      sortOrder: 10,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '5,900 mm', detail: '19 ft 4 1/4 in' },
          { label: 'Inside width', value: '2,352 mm', detail: '7 ft 8 5/8 in' },
          { label: 'Inside height', value: '2,393 mm', detail: '7 ft 10 1/4 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,292 mm', detail: '7 ft 6 1/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '32,500 kg', detail: '71,650 lb' },
          { label: 'Tare', value: '2,300 kg', detail: '5,071 lb' },
          { label: 'Max payload', value: '30,200 kg', detail: '66,579 lb' }
        ],
        capacity: { label: 'Capacity', value: '33.2 m3', detail: '1,172 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Suitable for general dry cargo.', 'Lashing points support standard cargo securing.', 'Steel-floor equipment can be planned when higher point-load resistance is required.']
      }
    },
    {
      slug: '40-standard-dry',
      group: ContainerCatalogGroup.DRY,
      name: "40' Standard Dry",
      summary: 'Standard 40-foot dry equipment for higher-volume general cargo.',
      useCase: 'Retail goods, cartons, furniture, industrial parts, and full-container general cargo.',
      imageAsset: 'assets/images/services/container-dry-cargo.png',
      sortOrder: 20,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,032 mm', detail: '39 ft 5 5/8 in' },
          { label: 'Inside width', value: '2,352 mm', detail: '7 ft 8 5/8 in' },
          { label: 'Inside height', value: '2,395 mm', detail: '7 ft 10 1/4 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,292 mm', detail: '7 ft 6 1/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '32,500 kg', detail: '71,650 lb' },
          { label: 'Tare', value: '3,700 kg', detail: '8,157 lb' },
          { label: 'Max payload', value: '28,800 kg', detail: '63,493 lb' }
        ],
        capacity: { label: 'Capacity', value: '67.7 m3', detail: '2,391 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Best suited to volume-sensitive general cargo.', 'Gooseneck chassis compatibility is considered during road planning.', 'Cargo weight distribution must respect route limits.']
      }
    },
    {
      slug: '40-high-cube-dry',
      group: ContainerCatalogGroup.DRY,
      name: "40' High Cube Dry",
      summary: 'High-cube dry container with extra internal height for voluminous shipments.',
      useCase: 'Lightweight bulky goods, furniture, packaging, tall pallets, and cargo requiring additional height.',
      imageAsset: 'assets/images/services/container-dry-cargo.png',
      sortOrder: 30,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,032 mm', detail: '39 ft 5 5/8 in' },
          { label: 'Inside width', value: '2,342 mm', detail: '7 ft 8 1/2 in' },
          { label: 'Inside height', value: '2,700 mm', detail: '8 ft 10 1/4 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,597 mm', detail: '8 ft 6 1/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '32,500 kg', detail: '71,650 lb' },
          { label: 'Tare', value: '3,850 kg', detail: '8,488 lb' },
          { label: 'Max payload', value: '28,650 kg', detail: '63,162 lb' }
        ],
        capacity: { label: 'Capacity', value: '76.3 m3', detail: '2,695 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Extra height helps with voluminous cargo.', 'Bridge, tunnel, and terminal clearances must be checked for inland moves.', 'Payload remains route- and regulation-dependent.']
      }
    },
    {
      slug: '45-high-cube-dry',
      group: ContainerCatalogGroup.DRY,
      name: "45' Standard High Cube",
      summary: 'Extended high-cube dry equipment for maximum volume planning on approved routes.',
      useCase: 'High-volume lightweight cargo, retail goods, packaging, and tall palletized shipments.',
      imageAsset: 'assets/images/services/container-dry-cargo.png',
      sortOrder: 40,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '13,556 mm', detail: '44 ft 5 5/8 in' },
          { label: 'Inside width', value: '2,352 mm', detail: '7 ft 8 5/8 in' },
          { label: 'Inside height', value: '2,698 mm', detail: '8 ft 10 1/4 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,585 mm', detail: '8 ft 5 3/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '32,500 kg', detail: '71,650 lb' },
          { label: 'Tare', value: '4,800 kg', detail: '10,582 lb' },
          { label: 'Max payload', value: '27,700 kg', detail: '61,068 lb' }
        ],
        capacity: { label: 'Capacity', value: '86.0 m3', detail: '3,037 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Useful for maximum cubic capacity.', 'Route, chassis, and terminal availability must be checked before booking.', 'Payload is subject to inland regulations and road limits.']
      }
    },
    {
      slug: '20-standard-hardtop',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "20' Standard / Hardtop",
      summary: 'Hardtop equipment with a removable roof for top loading and secure covered carriage.',
      useCase: 'Heavy units, tall machinery, and cargo that needs crane loading with a solid roof after stuffing.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 50,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '5,886 mm', detail: '19 ft 3 3/4 in' },
          { label: 'Inside width', value: '2,342 mm', detail: '7 ft 8 1/4 in' },
          { label: 'Inside height', value: '2,388 mm', detail: '7 ft 10 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,280 mm', detail: '7 ft 5 3/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '30,480 kg', detail: '67,196 lb' },
          { label: 'Tare', value: '2,550 kg', detail: '5,622 lb' },
          { label: 'Max payload', value: '27,930 kg', detail: '61,574 lb' }
        ],
        capacity: { label: 'Capacity', value: '32.9 m3', detail: '1,162 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Removable roof supports crane loading.', 'Roof weight and lifting plan must be confirmed before operation.', 'Suitable when cargo benefits from hard covered protection after loading.']
      }
    },
    {
      slug: '40-standard-hardtop',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "40' Standard / Hardtop",
      summary: 'Forty-foot hardtop equipment for long cargo requiring removable-roof loading access.',
      useCase: 'Long machinery, steel products, packed project cargo, and cargo that needs top-side access.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 60,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,020 mm', detail: '39 ft 5 1/4 in' },
          { label: 'Inside width', value: '2,342 mm', detail: '7 ft 8 1/4 in' },
          { label: 'Inside height', value: '2,388 mm', detail: '7 ft 10 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,280 mm', detail: '7 ft 5 3/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '30,480 kg', detail: '67,196 lb' },
          { label: 'Tare', value: '4,700 kg', detail: '10,362 lb' },
          { label: 'Max payload', value: '25,780 kg', detail: '56,834 lb' }
        ],
        capacity: { label: 'Capacity', value: '67.2 m3', detail: '2,373 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Supports top loading with hard roof protection.', 'Cargo dimensions must be checked against roof and door opening limits.', 'Availability depends on carrier and terminal equipment.']
      }
    },
    {
      slug: '40-high-cube-hardtop',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "40' Standard / Hardtop High Cube",
      summary: 'High-cube hardtop equipment for taller cargo that needs roof access during loading.',
      useCase: 'Tall packed cargo, high machinery, and special loads that need crane loading with covered transport.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 70,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,020 mm', detail: '39 ft 5 1/4 in' },
          { label: 'Inside width', value: '2,342 mm', detail: '7 ft 8 1/4 in' },
          { label: 'Inside height', value: '2,684 mm', detail: '8 ft 9 5/8 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,340 mm', detail: '7 ft 8 1/8 in' },
          { label: 'Door height', value: '2,585 mm', detail: '8 ft 5 3/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '34,000 kg', detail: '74,957 lb' },
          { label: 'Tare', value: '4,900 kg', detail: '10,803 lb' },
          { label: 'Max payload', value: '29,100 kg', detail: '64,154 lb' }
        ],
        capacity: { label: 'Capacity', value: '75.5 m3', detail: '2,666 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Combines high-cube height with removable-roof access.', 'Out-of-gauge height must be reviewed before booking.', 'Roof handling and cargo securing plan should be agreed early.']
      }
    },
    {
      slug: '20-open-top',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "20' Open Top",
      summary: 'Open-top equipment for cargo loaded by crane or exceeding standard door handling.',
      useCase: 'Over-height cargo, heavy lifts, machinery, and cargo lowered from above.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 10,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '5,895 mm', detail: '19 ft 4 1/8 in' },
          { label: 'Inside width', value: '2,350 mm', detail: '7 ft 8 1/2 in' },
          { label: 'Inside height', value: '2,380 mm', detail: '7 ft 9 5/8 in' }
        ],
        doorOpenings: [
          { label: 'Roof opening length', value: '5,338 mm', detail: '17 ft 6 1/8 in' },
          { label: 'Door width', value: '2,280 mm', detail: '7 ft 5 3/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '32,500 kg', detail: '71,650 lb' },
          { label: 'Tare', value: '2,450 kg', detail: '5,402 lb' },
          { label: 'Max payload', value: '30,050 kg', detail: '66,248 lb' }
        ],
        capacity: { label: 'Capacity', value: '32.5 m3', detail: '1,148 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Designed for top loading and crane operations.', 'Cargo securing and tarpaulin access must be confirmed before loading.', 'Door-header and roof-opening limits should be checked against cargo drawings.']
      }
    },
    {
      slug: '40-open-top',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "40' Open Top",
      summary: 'Open-top equipment for longer cargo that needs top-side loading access.',
      useCase: 'Long machinery, steel products, project cargo, and oversized packed cargo.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 20,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,030 mm', detail: '39 ft 5 5/8 in' },
          { label: 'Inside width', value: '2,350 mm', detail: '7 ft 8 1/2 in' },
          { label: 'Inside height', value: '2,377 mm', detail: '7 ft 9 1/2 in' }
        ],
        doorOpenings: [
          { label: 'Roof opening length', value: '11,573 mm', detail: '37 ft 11 5/8 in' },
          { label: 'Door width', value: '2,292 mm', detail: '7 ft 6 1/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '30,480 kg', detail: '67,196 lb' },
          { label: 'Tare', value: '3,850 kg', detail: '8,488 lb' },
          { label: 'Max payload', value: '26,630 kg', detail: '58,708 lb' }
        ],
        capacity: { label: 'Capacity', value: '66.4 m3', detail: '2,345 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Useful when cargo cannot pass through standard container doors.', 'Hardtop alternatives can be planned where removable roof security is preferred.', 'Out-of-gauge checks are required for height and width.']
      }
    },
    {
      slug: '40-high-cube-open-top',
      group: ContainerCatalogGroup.OPEN_TOP_HARDTOP,
      name: "40' Open Top High Cube",
      summary: 'High-cube open-top equipment for tall cargo loaded from above.',
      useCase: 'Tall machinery, long cargo, project cargo, and loads requiring crane access with extra height.',
      imageAsset: 'assets/images/services/container-open-top-hardtop.png',
      sortOrder: 25,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '12,020 mm', detail: '39 ft 5 1/4 in' },
          { label: 'Inside width', value: '2,350 mm', detail: '7 ft 8 1/2 in' },
          { label: 'Inside height', value: '2,680 mm', detail: '8 ft 9 1/2 in' }
        ],
        doorOpenings: [
          { label: 'Roof opening length', value: '11,573 mm', detail: '37 ft 11 5/8 in' },
          { label: 'Door width', value: '2,292 mm', detail: '7 ft 6 1/4 in' }
        ],
        weights: [
          { label: 'Max gross', value: '30,480 kg', detail: '67,196 lb' },
          { label: 'Tare', value: '4,250 kg', detail: '9,370 lb' },
          { label: 'Max payload', value: '26,230 kg', detail: '57,826 lb' }
        ],
        capacity: { label: 'Capacity', value: '75.8 m3', detail: '2,677 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Extra height supports tall cargo loaded by crane.', 'Tarpaulin coverage and out-of-gauge approvals must be checked.', 'Cargo securing and lashing plan is required before loading.']
      }
    },
    {
      slug: '20-flat-rack',
      group: ContainerCatalogGroup.SPECIAL,
      name: "20' Flat Rack",
      summary: 'Flat-rack equipment for concentrated, heavy, or awkward project cargo.',
      useCase: 'Heavy machinery, steel structures, crated industrial cargo, and cargo requiring side or top access.',
      imageAsset: 'assets/images/services/container-special-cargo.png',
      sortOrder: 10,
      specsJson: {
        dimensions: [
          { label: 'Length between posts', value: '5,612 mm', detail: '18 ft 4 7/8 in' },
          { label: 'Width between posts', value: '2,227 mm', detail: '7 ft 3 5/8 in' },
          { label: 'Bottom height', value: '370 mm', detail: '1 ft 2 1/2 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Max gross', value: '34,000 kg', detail: '74,957 lb' },
          { label: 'Tare', value: '2,740 kg', detail: '6,041 lb' },
          { label: 'Max payload', value: '31,260 kg', detail: '68,916 lb' }
        ],
        capacity: { label: 'Load surface', value: '20 ft platform', detail: 'Collapsible-end flat rack' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Best for oversized and heavy cargo requiring strong lashing.', 'Payload depends on cargo footprint and weight distribution.', 'Stanchions, bracing, and route permits should be planned case by case.']
      }
    },
    {
      slug: '40-high-cube-flat-rack',
      group: ContainerCatalogGroup.SPECIAL,
      name: "40' High Cube Flat Rack",
      summary: 'Heavy-duty special equipment for long, oversized, or break-bulk style cargo.',
      useCase: 'Large machinery, industrial units, steel fabrications, generators, boats, and over-length cargo.',
      imageAsset: 'assets/images/services/container-special-cargo.png',
      sortOrder: 20,
      specsJson: {
        dimensions: [
          { label: 'Length between posts', value: '11,652 mm', detail: '38 ft 2 3/4 in' },
          { label: 'Width between posts', value: '2,224 mm', detail: '7 ft 3 1/2 in' },
          { label: 'Bottom height', value: '648 mm', detail: '2 ft 1 1/2 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Max gross', value: '50,000 kg', detail: '110,230 lb' },
          { label: 'Tare', value: '5,950 kg', detail: '13,117 lb' },
          { label: 'Max payload', value: '44,050 kg', detail: '97,113 lb' }
        ],
        capacity: { label: 'Load surface', value: '40 ft platform', detail: 'High-cube flat rack' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Designed for oversized cargo and project logistics.', 'Heavy cargo must rest on the main load-bearing members.', 'Out-of-gauge approvals and special securing plans are required.']
      }
    },
    {
      slug: '40-flat-rack',
      group: ContainerCatalogGroup.SPECIAL,
      name: "40' Flat Rack",
      summary: 'Flat-rack equipment for long and oversized cargo requiring side or top loading.',
      useCase: 'Long industrial cargo, crated machinery, steel fabrications, and project cargo.',
      imageAsset: 'assets/images/services/container-special-cargo.png',
      sortOrder: 25,
      specsJson: {
        dimensions: [
          { label: 'Length between posts', value: '11,652 mm', detail: '38 ft 2 3/4 in' },
          { label: 'Width between posts', value: '2,224 mm', detail: '7 ft 3 1/2 in' },
          { label: 'Bottom height', value: '648 mm', detail: '2 ft 1 1/2 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Max gross', value: '45,000 kg', detail: '99,208 lb' },
          { label: 'Tare', value: '5,500 kg', detail: '12,125 lb' },
          { label: 'Max payload', value: '39,500 kg', detail: '87,083 lb' }
        ],
        capacity: { label: 'Load surface', value: '40 ft platform', detail: 'Collapsible-end flat rack' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Useful for long and heavy cargo.', 'Payload depends on cargo footprint and route regulations.', 'Out-of-gauge approval is required when cargo exceeds platform dimensions.']
      }
    },
    {
      slug: '20-platform',
      group: ContainerCatalogGroup.SPECIAL,
      name: "20' Platform",
      summary: 'Collapsed flat-rack platform for compact heavy cargo foundations.',
      useCase: 'Heavy pieces, machinery bases, dense industrial cargo, and engineered project shipments.',
      imageAsset: 'assets/images/services/container-special-cargo.png',
      sortOrder: 35,
      specsJson: {
        dimensions: [
          { label: 'Bottom length', value: '6,058 mm', detail: '20 ft' },
          { label: 'Bottom width', value: '2,438 mm', detail: '8 ft' },
          { label: 'Bottom height', value: '370 mm', detail: '1 ft 2 1/2 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Max gross', value: '34,000 kg', detail: '74,957 lb' },
          { label: 'Tare', value: '2,740 kg', detail: '6,041 lb' },
          { label: 'Max payload', value: '31,260 kg', detail: '68,916 lb' }
        ],
        capacity: { label: 'Load surface', value: '20 ft platform', detail: 'Collapsed flat-rack base' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Useful for concentrated heavy loads.', 'Engineering review is required for point loads.', 'Securing and route checks must be completed before acceptance.']
      }
    },
    {
      slug: '40-platform',
      group: ContainerCatalogGroup.SPECIAL,
      name: "40' Platform",
      summary: 'Collapsed flat-rack platform for heavy and oversized cargo foundations.',
      useCase: 'Break-bulk style cargo, concentrated loads, oversized length cargo, and engineered project shipments.',
      imageAsset: 'assets/images/services/container-special-cargo.png',
      sortOrder: 30,
      specsJson: {
        dimensions: [
          { label: 'Bottom length', value: '12,192 mm', detail: '40 ft' },
          { label: 'Bottom width', value: '2,245 mm', detail: '7 ft 4 3/8 in' },
          { label: 'Bottom height', value: '648 mm', detail: '2 ft 1 1/2 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Max gross', value: '50,000 kg', detail: '110,230 lb' },
          { label: 'Tare', value: '5,950 kg', detail: '13,117 lb' },
          { label: 'Max payload', value: '44,050 kg', detail: '97,113 lb' }
        ],
        capacity: { label: 'Load surface', value: '40 ft platform', detail: 'Collapsed flat-rack base' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Useful as a heavy cargo foundation.', 'Engineering review is required for concentrated loads.', 'Road, terminal, and vessel acceptance must be checked before booking.']
      }
    },
    {
      slug: '20-reefer',
      group: ContainerCatalogGroup.REEFER,
      name: "20' Reefer",
      summary: 'Temperature-controlled equipment for smaller chilled or frozen shipments.',
      useCase: 'Foodstuff, pharmaceuticals, flowers, chemicals requiring temperature care, and sensitive cargo.',
      imageAsset: 'assets/images/services/container-reefer.png',
      sortOrder: 10,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '5,450 mm', detail: '17 ft 10 1/2 in' },
          { label: 'Inside width', value: '2,284 mm', detail: '7 ft 5 7/8 in' },
          { label: 'Inside height', value: '2,267 mm', detail: '7 ft 5 1/4 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,290 mm', detail: '7 ft 6 1/8 in' },
          { label: 'Door height', value: '2,264 mm', detail: '7 ft 5 1/8 in' }
        ],
        weights: [
          { label: 'Max gross', value: '30,480 kg', detail: '67,196 lb' },
          { label: 'Tare', value: '2,905 kg', detail: '6,404 lb' },
          { label: 'Max payload', value: '27,575 kg', detail: '60,792 lb' }
        ],
        capacity: { label: 'Capacity', value: '28.2 m3', detail: '996 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Temperature, ventilation, and humidity settings must be confirmed before release.', 'Pre-trip inspection should be completed before stuffing.', 'Requires compatible power during terminal and vessel operations.']
      }
    },
    {
      slug: '40-high-cube-reefer',
      group: ContainerCatalogGroup.REEFER,
      name: "40' High Cube Reefer",
      summary: 'High-cube reefer capacity for larger temperature-controlled shipments.',
      useCase: 'Frozen food, chilled produce, pharmaceuticals, confectionery, and other controlled-temperature cargo.',
      imageAsset: 'assets/images/services/container-reefer.png',
      sortOrder: 20,
      specsJson: {
        dimensions: [
          { label: 'Inside length', value: '11,590 mm', detail: '38 ft 1/4 in' },
          { label: 'Inside width', value: '2,294 mm', detail: '7 ft 6 1/4 in' },
          { label: 'Inside height', value: '2,554 mm', detail: '8 ft 4 1/2 in' }
        ],
        doorOpenings: [
          { label: 'Door width', value: '2,290 mm', detail: '7 ft 6 1/8 in' },
          { label: 'Door height', value: '2,569 mm', detail: '8 ft 5 1/8 in' }
        ],
        weights: [
          { label: 'Max gross', value: '35,000 kg', detail: '77,161 lb' },
          { label: 'Tare', value: '4,500 kg', detail: '9,921 lb' },
          { label: 'Max payload', value: '30,500 kg', detail: '67,241 lb' }
        ],
        capacity: { label: 'Capacity', value: '67.8 m3', detail: '2,394 ft3' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Designed for controlled-temperature supply chains.', 'Airflow space and load-line limits must be respected.', 'Power plug, setpoint, and monitoring requirements should be confirmed before loading.']
      }
    },
    {
      slug: '20-tank-container',
      group: ContainerCatalogGroup.TANK,
      name: "20' Tank Container",
      summary: 'Tank equipment planning for eligible liquid foodstuff and chemical cargo.',
      useCase: 'Alcohols, fruit juices, edible oils, additives, and approved liquid chemical products.',
      imageAsset: 'assets/images/services/container-tank.png',
      sortOrder: 10,
      specsJson: {
        dimensions: [
          { label: 'ISO frame length', value: '6,058 mm', detail: '20 ft' },
          { label: 'ISO frame width', value: '2,438 mm', detail: '8 ft' },
          { label: 'ISO frame height', value: '2,591 mm', detail: '8 ft 6 in' }
        ],
        doorOpenings: [],
        weights: [
          { label: 'Fill guidance', value: '80%-95%', detail: 'Depends on product expansion and regulations' },
          { label: 'Cleaning', value: 'Dedicated rules', detail: 'Residue and prior-cargo controls apply' }
        ],
        capacity: { label: 'Capacity', value: 'Design-dependent', detail: 'Confirm tank series before booking' }
      },
      notesJson: {
        disclaimer: nominalDisclaimer,
        notes: ['Tank suitability depends on the exact product and regulatory classification.', 'Cleaning, residue handling, and prior-cargo restrictions must be checked.', 'Ullage space must account for thermal expansion during transport.']
      }
    }
  ];

  const containerCatalogMetadata: Record<
    string,
    {
      categorySlug: string;
      categoryName: string;
      subgroupName: string;
      subgroupSortOrder: number;
      illustrationKey: string;
    }
  > = {
    '20-standard-dry': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard',
      subgroupSortOrder: 10,
      illustrationKey: 'dry'
    },
    '40-standard-dry': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard',
      subgroupSortOrder: 10,
      illustrationKey: 'dry'
    },
    '40-high-cube-dry': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard',
      subgroupSortOrder: 10,
      illustrationKey: 'dry'
    },
    '45-high-cube-dry': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard',
      subgroupSortOrder: 10,
      illustrationKey: 'dry'
    },
    '20-standard-hardtop': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard / Hardtop',
      subgroupSortOrder: 20,
      illustrationKey: 'hardtop'
    },
    '40-standard-hardtop': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard / Hardtop',
      subgroupSortOrder: 20,
      illustrationKey: 'hardtop'
    },
    '40-high-cube-hardtop': {
      categorySlug: 'dry-cargo',
      categoryName: 'Dry Cargo container',
      subgroupName: 'Standard / Hardtop',
      subgroupSortOrder: 20,
      illustrationKey: 'hardtop'
    },
    '20-reefer': {
      categorySlug: 'reefer-cargo',
      categoryName: 'Reefer Cargo container',
      subgroupName: 'Reefer',
      subgroupSortOrder: 10,
      illustrationKey: 'reefer'
    },
    '40-high-cube-reefer': {
      categorySlug: 'reefer-cargo',
      categoryName: 'Reefer Cargo container',
      subgroupName: 'Reefer',
      subgroupSortOrder: 10,
      illustrationKey: 'reefer'
    },
    '20-open-top': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Open Top',
      subgroupSortOrder: 10,
      illustrationKey: 'open-top'
    },
    '40-open-top': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Open Top',
      subgroupSortOrder: 10,
      illustrationKey: 'open-top'
    },
    '40-high-cube-open-top': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Open Top',
      subgroupSortOrder: 10,
      illustrationKey: 'open-top'
    },
    '20-flat-rack': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Flat Rack',
      subgroupSortOrder: 20,
      illustrationKey: 'flat-rack'
    },
    '40-flat-rack': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Flat Rack',
      subgroupSortOrder: 20,
      illustrationKey: 'flat-rack'
    },
    '40-high-cube-flat-rack': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Flat Rack',
      subgroupSortOrder: 20,
      illustrationKey: 'flat-rack'
    },
    '20-platform': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Platform',
      subgroupSortOrder: 30,
      illustrationKey: 'platform'
    },
    '40-platform': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Platform',
      subgroupSortOrder: 30,
      illustrationKey: 'platform'
    },
    '20-tank-container': {
      categorySlug: 'special-cargo',
      categoryName: 'Special Cargo container',
      subgroupName: 'Tank',
      subgroupSortOrder: 40,
      illustrationKey: 'tank'
    }
  };

  for (const item of containerCatalogItems) {
    const metadata = containerCatalogMetadata[item.slug] || containerCatalogMetadata['20-standard-dry'];
    const catalogItem = { ...item, ...metadata };
    await prisma.containerCatalogItem.upsert({
      where: { slug: catalogItem.slug },
      update: { ...catalogItem, active: true },
      create: catalogItem
    });
  }

  await prisma.serviceCategory.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Reefer Cargo', slug: 'reefer-cargo', description: 'Cold chain handling for temperature-sensitive cargo.' },
      { name: 'Special Cargo', slug: 'special-cargo', description: 'Project cargo and non-standard logistics coordination.' },
      { name: 'Dangerous Goods', slug: 'dangerous-goods', description: 'Compliant handling for regulated hazardous cargo.' },
      { name: 'Ocean Freight', slug: 'ocean-freight', description: 'FCL and LCL ocean freight solutions.' },
      { name: 'Inland Transportation', slug: 'inland-transportation', description: 'Truck and intermodal movements across the Middle East.' },
      { name: 'Customs / Logistics Support', slug: 'customs-logistics-support', description: 'Documentation, customs coordination, and cargo support.' }
    ]
  });

  await prisma.companyProfile.upsert({
    where: { id: 'company-profile' },
    update: {
      name: 'Elite Group logistics desk',
      email: 'operations@elitegroup.local',
      phone: '+20 1115456274',
      address: 'cairo street 90',
      description: 'Shipping, supply, and freight support for regional operations.',
      active: true
    },
    create: {
      id: 'company-profile',
      name: 'Elite Group logistics desk',
      email: 'operations@elitegroup.local',
      phone: '+20 1115456274',
      address: 'cairo street 90',
      description: 'Shipping, supply, and freight support for regional operations.'
    }
  });

  const services = [
    {
      title: 'Jebel Ali to Nhava Sheva Reefer Express',
      originCountry: 'United Arab Emirates',
      originPort: 'Jebel Ali',
      destinationCountry: 'India',
      destinationPort: 'Nhava Sheva',
      tradeLane: 'Middle East - India',
      cargoType: 'Reefer Cargo',
      containerType: '40FT Reefer High Cube',
      vesselName: 'Elite Horizon',
      voyageNumber: 'EH2606W',
      etd: new Date('2026-07-05T08:00:00.000Z'),
      eta: new Date('2026-07-11T08:00:00.000Z'),
      scheduleMonth: '2026-07',
      validFrom: new Date('2026-07-01T00:00:00.000Z'),
      validTo: new Date('2026-07-31T23:59:59.000Z'),
      oceanFreight: '1250.00',
      thc: '185.00',
      currency: 'USD',
      freeTimeNotes: '14 days destination free time subject to carrier approval.',
      remarks: 'Plug-in monitoring available on request.',
      status: FreightStatus.PUBLISHED,
      createdById: operator.id,
      updatedById: operator.id
    },
    {
      title: 'Alexandria to Rotterdam FCL Service',
      originCountry: 'Egypt',
      originPort: 'Alexandria',
      destinationCountry: 'Netherlands',
      destinationPort: 'Rotterdam',
      tradeLane: 'Middle East - Europe',
      cargoType: 'General Cargo',
      containerType: '40FT Standard Dry',
      vesselName: 'Mediterranean Star',
      voyageNumber: 'MS174E',
      etd: new Date('2026-07-12T10:00:00.000Z'),
      eta: new Date('2026-07-22T10:00:00.000Z'),
      scheduleMonth: '2026-07',
      validFrom: new Date('2026-07-01T00:00:00.000Z'),
      validTo: new Date('2026-07-31T23:59:59.000Z'),
      oceanFreight: '980.00',
      thc: '210.00',
      currency: 'USD',
      freeTimeNotes: '7 days origin and 10 days destination free time.',
      remarks: 'Subject to space and equipment availability.',
      status: FreightStatus.PUBLISHED,
      createdById: admin.id,
      updatedById: admin.id
    },
    {
      title: 'Dammam to Aqaba Special Equipment',
      originCountry: 'Saudi Arabia',
      originPort: 'Dammam',
      destinationCountry: 'Jordan',
      destinationPort: 'Aqaba',
      tradeLane: 'Middle East Inland & Ocean',
      cargoType: 'Special Cargo',
      containerType: '40FT Flat Rack',
      vesselName: 'Gulf Bridge',
      voyageNumber: 'GB900S',
      etd: new Date('2026-08-02T09:00:00.000Z'),
      eta: new Date('2026-08-06T09:00:00.000Z'),
      scheduleMonth: '2026-08',
      validFrom: new Date('2026-08-01T00:00:00.000Z'),
      validTo: new Date('2026-08-31T23:59:59.000Z'),
      oceanFreight: '1425.00',
      thc: '260.00',
      currency: 'USD',
      freeTimeNotes: 'Demurrage terms to be confirmed case by case.',
      remarks: 'Draft lane for operator review.',
      status: FreightStatus.DRAFT,
      createdById: operator.id,
      updatedById: operator.id
    }
  ];

  for (const service of services) {
    const existingService = await prisma.freightService.findFirst({
      where: { title: service.title }
    });

    if (existingService) {
      await prisma.freightService.update({
        where: { id: existingService.id },
        data: service
      });
    } else {
      await prisma.freightService.create({ data: service });
    }
  }

  const tracking = await prisma.trackingRecord.upsert({
    where: { trackingNumber: 'ELT-2026-0001' },
    update: {},
    create: {
      trackingNumber: 'ELT-2026-0001',
      customerName: 'Demo Customer',
      originPort: 'Jebel Ali',
      destinationPort: 'Nhava Sheva',
      vesselName: 'Elite Horizon',
      voyageNumber: 'EH2606W',
      currentStatus: TrackingStatus.DEPARTED,
      published: true,
      events: {
        create: [
          {
            status: TrackingStatus.BOOKING_RECEIVED,
            location: 'Dubai',
            eventDate: new Date('2026-07-01T09:00:00.000Z'),
            notes: 'Booking confirmed by Elite Group operations.'
          },
          {
            status: TrackingStatus.DEPARTED,
            location: 'Jebel Ali',
            eventDate: new Date('2026-07-05T14:00:00.000Z'),
            notes: 'Cargo departed on scheduled vessel.'
          }
        ]
      }
    }
  });

  await prisma.trackingRecord.upsert({
    where: { trackingNumber: 'ELT-PRIVATE-0002' },
    update: {},
    create: {
      trackingNumber: 'ELT-PRIVATE-0002',
      customerName: 'Private Demo Customer',
      originPort: 'Alexandria',
      destinationPort: 'Rotterdam',
      currentStatus: TrackingStatus.VESSEL_SCHEDULED,
      published: false
    }
  });

  const existingSeedAudit = await prisma.auditLog.findFirst({
    where: {
      action: 'SEED_DATABASE',
      entityType: 'System',
      entityId: tracking.id
    }
  });

  if (!existingSeedAudit) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'SEED_DATABASE',
        entityType: 'System',
        entityId: tracking.id,
        metadataJson: { demoUsers: ['admin@elitegroup.local', 'operator@elitegroup.local'] }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
