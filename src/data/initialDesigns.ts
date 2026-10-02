import type { Design, Category } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "74a0c43c-a586-484c-902d-0abe0212ca3b",
    name: "Wedding",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "492383f7-b261-4bf2-a0e4-5ad2e04159b0",
    name: "Reception",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "15f8dad9-3d1d-4c37-9b5b-cbf9bfbc1c94",
    name: "Birthday",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "dd81b157-c500-487a-9f8a-a71bdeb6a5f4",
    name: "Housewarming",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "2d6ec414-01fb-4d9c-abe4-1caa12e86b2f",
    name: "Surprise Party",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "0a7d001b-aaa7-4e34-906c-de46c6b9049b",
    name: "Corporate Event",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
];

const catWedding = INITIAL_CATEGORIES[0];
const catReception = INITIAL_CATEGORIES[1];
const catBirthday = INITIAL_CATEGORIES[2];
const catHousewarming = INITIAL_CATEGORIES[3];
const catSurprise = INITIAL_CATEGORIES[4];
const catCorporate = INITIAL_CATEGORIES[5];

export const INITIAL_DESIGNS: Design[] = [
  {
    id: "design-1",
    title: "Royal Grand Gold Mandap Stage",
    description:
      "A majestic wedding stage featuring hand-crafted golden pillars, premium fresh floral arches, warm ambient stage lighting, and royal throne seating. Perfect for traditional and luxury South Indian weddings.",
    category_id: catWedding.id,
    categories: catWedding,
    image_url: "/assets/120000.jpeg",
    price: 120000,
    inclusions:
      "Grand Golden Pillars, Fresh Exotic Floral Arch, Warm Ambient Spotlights, Traditional Brass Diya Pillars, Luxury Royal Sofa Seating, Full Carpet Flooring",
    created_at: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "design-2",
    title: "Imperial Floral Palace Stage",
    description:
      "A breathtaking wedding extravaganza with dense imported rose arches, crystal chandeliers, velvet draping, and dramatic spotlighting. Crafted for couples who desire an opulent fairy-tale setting.",
    category_id: catWedding.id,
    categories: catWedding,
    image_url: "/assets/165000.jpeg",
    price: 165000,
    inclusions:
      "Imported Dutch Rose Archways, Crystal Chandelier Array, LED Ambient Backdrop, Velvet Carpet, Designer Throne Chairs, Red Carpet Pathway",
    created_at: "2026-10-02T09:45:00.000Z",
  },
  {
    id: "design-3",
    title: "Maharaja Temple Gopuram Mandap",
    description:
      "Rich traditional architecture with intricately carved temple gopuram pillars, cascading strings of fresh jasmine and marigold, and warm brass lamps for an auspicious ceremony.",
    category_id: catWedding.id,
    categories: catWedding,
    image_url: "/assets/150000.jpeg",
    price: 150000,
    inclusions:
      "Carved Temple Pillars, Fresh Jasmine & Marigold Strings, Warm Fairy Lights, Grand Entryway Pathway, Brass Urlis & Floating Diyas",
    created_at: "2026-10-02T09:30:00.000Z",
  },
  {
    id: "design-4",
    title: "Regal Gold Symphony Wedding Stage",
    description:
      "An enchanting blend of golden geometry and fresh floral installations. Features illuminated backlit panels, delicate hanging crystal drops, and luxurious bride & groom stage seating.",
    category_id: catWedding.id,
    categories: catWedding,
    image_url: "/assets/110000.jpeg",
    price: 110000,
    inclusions:
      "Full Stage Floral Backdrop, Hanging Crystal Drops, Ambient Stage Lighting, VIP Stage Chairs, Welcome Board, Entrance Arch",
    created_at: "2026-10-02T09:15:00.000Z",
  },
  {
    id: "design-5",
    title: "Contemporary Glamour Reception Stage",
    description:
      "Sophisticated modern reception stage with geometric metallic arches, pastel rose and peony clusters, neon couple initials, and cinematic downlighting.",
    category_id: catReception.id,
    categories: catReception,
    image_url: "/assets/90000.jpeg",
    price: 90000,
    inclusions:
      "Geometric Gold Arches, Pastel Rose Clusters, Neon Signage, Custom Stage Carpet, Designer Backdrop, Dual Focus Stage Spotlights",
    created_at: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "design-6",
    title: "Luxe Crystal Chandelier Reception",
    description:
      "A glamorous evening setup featuring draped silk curtains, sparkling crystal chandeliers, tiered floral panels, and a sleek contemporary couch for the couple.",
    category_id: catReception.id,
    categories: catReception,
    image_url: "/assets/85000.jpeg",
    price: 85000,
    inclusions:
      "Curtain Fairy Lights, Dual Tier Floral Panels, Spotlight Array, White Leather Stage Couch, Walkway Carpet",
    created_at: "2026-10-02T08:45:00.000Z",
  },
  {
    id: "design-7",
    title: "Modern Pastel Floral Stage",
    description:
      "Chic blush pink, peach, and ivory floral arrangements set against textured fluted wall panels with subtle warm lighting. An elegant, romantic ambiance for modern receptions.",
    category_id: catReception.id,
    categories: catReception,
    image_url: "/assets/85000-1.jpeg",
    price: 85000,
    inclusions:
      "Blush Pink & Ivory Backdrop, Archway Floral Arrangements, Ambient Downlighting, Plush Seating, Photo Booth Corner",
    created_at: "2026-10-02T08:30:00.000Z",
  },
  {
    id: "design-8",
    title: "Classic Floral Symphony Stage",
    description:
      "Graceful draped fabric backdrop highlighted by cascading floral rings, soft golden PAR cans, and a cozy love seat for timeless reception photography.",
    category_id: catReception.id,
    categories: catReception,
    image_url: "/assets/60000.jpeg",
    price: 60000,
    inclusions:
      "Cascade Floral Rings, Warm Gold PAR Cans, Draped Silk Backdrop, Couple Love Seat, Flower Vases along Stage Edge",
    created_at: "2026-10-02T08:15:00.000Z",
  },
  {
    id: "design-9",
    title: "Grand Corporate Gala & Conference Stage",
    description:
      "A sleek, professional stage setup designed for corporate annual days, conferences, award ceremonies, and product launches with integrated podium and branding panels.",
    category_id: catCorporate.id,
    categories: catCorporate,
    image_url: "/assets/65000.jpeg",
    price: 65000,
    inclusions:
      "Sleek Minimalist Backdrop, Brand Accent Lighting, Acoustic Stage Paneling, Presentation Podiums, Side Wing Banners",
    created_at: "2026-10-02T08:00:00.000Z",
  },
  {
    id: "design-10",
    title: "Classic Seminar & Presentation Dais",
    description:
      "Clean, focused corporate stage with professional blue and gold accents, branded rostrum, executive dais seating, and sharp stage spot lighting.",
    category_id: catCorporate.id,
    categories: catCorporate,
    image_url: "/assets/20000.jpeg",
    price: 20000,
    inclusions:
      "Branded Backdrop Stand, Stage Spotlights, Floral Urns for Dais, Stage Skirting, Microphone Stand Branding",
    created_at: "2026-10-02T07:45:00.000Z",
  },
  {
    id: "design-11",
    title: "Traditional Gruhapravesam Mandap",
    description:
      "Authentic South Indian housewarming backdrop featuring fresh banana trees, fragrant marigold and tuberose garlands, mango leaf thoranams, and brass kuthu vilakku setup.",
    category_id: catHousewarming.id,
    categories: catHousewarming,
    image_url: "/assets/45000-1.jpeg",
    price: 45000,
    inclusions:
      "Traditional Banana Plants, Fresh Marigold Garlands, Mango Leaf Thoran, Brass Lamp Setup, Traditional Backdrop, Rangoli Border",
    created_at: "2026-10-02T07:30:00.000Z",
  },
  {
    id: "design-12",
    title: "Auspicious Golden Bloom Decor",
    description:
      "Vibrant yellow, orange, and white floral arrangements with traditional brass urlis filled with floating petals and diyas, celebrating your new home with warmth and blessings.",
    category_id: catHousewarming.id,
    categories: catHousewarming,
    image_url: "/assets/30000.jpeg",
    price: 30000,
    inclusions:
      "Yellow & Orange Flower Backdrop, Brass Urlis with Floating Diyas, Welcome Archway, Floral Pillars",
    created_at: "2026-10-02T07:15:00.000Z",
  },
  {
    id: "design-13",
    title: "Enchanted Garden Surprise Party",
    description:
      "A magical surprise party setting adorned with fairy light canopies, wooden rustic frames, customized neon signage, and a dedicated photo corner for unforgettable celebrations.",
    category_id: catSurprise.id,
    categories: catSurprise,
    image_url: "/assets/45000-2.jpeg",
    price: 45000,
    inclusions:
      "Fairy Light Canopies, Wooden Rustic Arch, Custom Photo Booth, Floral Table Centrepieces, Personalized Neon Sign",
    created_at: "2026-10-02T07:00:00.000Z",
  },
  {
    id: "design-14",
    title: "Romantic Candlelight Proposal Canopy",
    description:
      "An intimate romantic setup with sheer draped fabric cabana, tea light candles along a rose petal pathway, and marquee 'MARRY ME' or anniversary letters.",
    category_id: catSurprise.id,
    categories: catSurprise,
    image_url: "/assets/35000-1.jpeg",
    price: 35000,
    inclusions:
      "Boho Sheer Fabric Cabana, Pathway Tea Lights, Rose Petal Carpet, Customised Message Neon, Fairy Light Backdrop",
    created_at: "2026-10-02T06:45:00.000Z",
  },
  {
    id: "design-15",
    title: "Intimate Heart Light Surprise Decor",
    description:
      "Warm and charming setup with a glowing heart marquee frame, romantic string lights, custom photo clips, and an elegant cake table arrangement.",
    category_id: catSurprise.id,
    categories: catSurprise,
    image_url: "/assets/250003.jpeg",
    price: 25000,
    inclusions:
      "Heart Light Frame, Marquee Letters, Candlelight Walkway, Champagne Table Decor, Photo Strings with Fairy Lights",
    created_at: "2026-10-02T06:30:00.000Z",
  },
  {
    id: "design-16",
    title: "Fairytale Princess Birthday Theme",
    description:
      "A whimsical pastel dream with an organic balloon garland, fairytale castle backdrop silhouette, lighted giant age number, and dessert pedestal tables.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/40000.jpeg",
    price: 40000,
    inclusions:
      "Organic Balloon Garland, Castle Silhouette Backdrop, LED Number Display, Cake Table Styling, Kids Themed Photo Cutouts",
    created_at: "2026-10-02T06:15:00.000Z",
  },
  {
    id: "design-17",
    title: "Carnival & Jungle Birthday Fiesta",
    description:
      "Vibrant animal cutouts, lush green and golden balloon arches, personalized milestone board, and an action-packed party backdrop designed for kids' celebrations.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/35000.jpeg",
    price: 35000,
    inclusions:
      "Animal Themed Cutouts, Colorful Balloon Columns, Milestone Board, Personalized Banner, Stage Balloon Base",
    created_at: "2026-10-02T06:00:00.000Z",
  },
  {
    id: "design-18",
    title: "Starry Night Shimmer Birthday",
    description:
      "Glamorous dark navy and gold balloon garland paired with a sparkling shimmer wall, neon happy birthday sign, and stage uplighting.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/25000.jpeg",
    price: 25000,
    inclusions:
      "Dark Blue & Gold Balloon Arch, Shimmer Sequin Wall, Warm Lighting, Number Marquee, Welcome Board",
    created_at: "2026-10-02T05:45:00.000Z",
  },
  {
    id: "design-19",
    title: "Pastel Cloud Dream Birthday Setup",
    description:
      "Soft macaron-toned balloon clouds, acrylic arch with custom child's name, circular stage carpet, and matching dessert plinths.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/25000-1.jpeg",
    price: 25000,
    inclusions:
      "Pastel Balloon Cloud, Custom Acrylic Name Sign, Cylindrical Cake Pedestals, Backlighting, Welcome Easel",
    created_at: "2026-10-02T05:30:00.000Z",
  },
  {
    id: "design-20",
    title: "Joyful Celebration Archway Setup",
    description:
      "A festive rainbow balloon archway with cheerful backdrop ring, stage floor runner, and themed party props suitable for all milestones.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/25000-4.jpeg",
    price: 25000,
    inclusions:
      "Multi-Color Balloon Archway, Party Backdrop Screen, Themed Props, Floor Mats, Number Balloons",
    created_at: "2026-10-02T05:15:00.000Z",
  },
];
