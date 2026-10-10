import type { Design, Category } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "15f8dad9-3d1d-4c37-9b5b-cbf9bfbc1c94",
    name: "Birthday",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "492383f7-b261-4bf2-a0e4-5ad2e04159b0",
    name: "Marriage",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
  {
    id: "eada5ea5-9fc8-4e67-8f59-897dd86b2280",
    name: "Baby Shower",
    created_at: "2026-10-02T13:03:12.682359+00:00",
  },
];

const catBirthday = INITIAL_CATEGORIES[0];
const catMarriage = INITIAL_CATEGORIES[1];
const catBabyShower = INITIAL_CATEGORIES[2];

export const INITIAL_DESIGNS: Design[] = [
  // ── BIRTHDAY ──────────────────────────────────────────────────────────────
  {
    id: "bday-01",
    title: "Purple Butterfly First Birthday",
    description:
      "A dreamy purple butterfly-themed setup featuring a full shimmer sequin wall, cascading purple, white and gold balloon garland, large butterfly cutouts, and a glowing Happy Birthday neon sign.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-01.jpeg",
    price: 35000,
    inclusions:
      "Purple & Gold Balloon Garland, Shimmer Sequin Wall, Neon Happy Birthday Sign, Giant Butterfly Cutouts, Custom Printed Backdrop",
    created_at: "2026-10-02T06:30:00.000Z",
  },
  {
    id: "bday-02",
    title: "Black & Gold Legend Celebration",
    description:
      "An elegant black, gold and white balloon arch with hanging Edison bulb droplets and a bold custom calligraphy backdrop. Ideal for milestone birthday and retirement celebrations.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-02.jpeg",
    price: 30000,
    inclusions:
      "Black & Gold Balloon Arch, Edison Bulb Droplets, Custom Calligraphy Backdrop, Stage Floral Border, Ambient Spotlights",
    created_at: "2026-10-02T06:15:00.000Z",
  },
  {
    id: "bday-03",
    title: "Teddy Bear First Birthday Party",
    description:
      "A warm and playful first birthday setup with a green artificial hedge wall, glittering gold sequin panel, organic balloon garland in brown, peach and white tones, LED number 1, and a teddy bear custom backdrop.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-03.jpeg",
    price: 28000,
    inclusions:
      "Artificial Hedge Wall, Gold Sequin Panel, Organic Balloon Garland, LED Number Display, Custom Teddy Backdrop, Stage Grass Mat",
    created_at: "2026-10-02T06:00:00.000Z",
  },
  {
    id: "bday-04",
    title: "Blue Hot Air Balloon First Birthday",
    description:
      "A premium sky-blue first birthday stage with a sculpted balloon arch, custom hot air balloon props, a giant illuminated number 1, oversized teddy bears, and a tiered dessert display.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-04.jpeg",
    price: 45000,
    inclusions:
      "Full Balloon Arch, Hot Air Balloon Props, LED Number 1, Giant Teddy Bears, Tiered Cake Display, Floral Stage Border",
    created_at: "2026-10-02T05:45:00.000Z",
  },
  {
    id: "bday-05",
    title: "Boho Teddy Garden First Birthday",
    description:
      "A charming boho-style setup with a glitter shimmer panel, green hedge arch, warm Edison bulb string lights, an organic peach and white balloon garland, a giant teddy bear, and personalised name blocks.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-06.jpeg",
    price: 38000,
    inclusions:
      "Gold Shimmer Wall, Hedge Arch, Organic Balloon Garland, LED Name Blocks, Giant Teddy Bear, Custom Printed Backdrop",
    created_at: "2026-10-02T05:30:00.000Z",
  },
  {
    id: "bday-06",
    title: "Fairy Princess Butterfly Birthday",
    description:
      "A grand purple and gold butterfly-fairy stage with large illuminated marquee name letters, shimmering butterfly wings, princess character cutouts, gold arch frames, and a vibrant shimmer wall backdrop.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-07.jpeg",
    price: 50000,
    inclusions:
      "Illuminated Marquee Name Letters, Shimmer Butterfly Wings, Princess Character Cutouts, Gold Arch Frames, Custom Backdrop, Flower Pedestals",
    created_at: "2026-10-02T05:15:00.000Z",
  },
  {
    id: "bday-07",
    title: "Jungle Safari First Birthday",
    description:
      "A lively jungle safari themed birthday featuring green and gold balloon arches, a grass wall backdrop, wild animal cutouts including tiger, lion and giraffe, printed animal cylinders, and milestone photo boards.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-08.jpeg",
    price: 42000,
    inclusions:
      "Green & Gold Balloon Arch, Grass Wall Backdrop, Animal Character Cutouts, Printed Cylinder Pedestals, Milestone Photo Board, Stage Carpet",
    created_at: "2026-10-02T05:00:00.000Z",
  },
  {
    id: "bday-08",
    title: "Purple Butterfly Marquee Name Setup",
    description:
      "A sophisticated purple and yellow butterfly birthday with large wooden marquee name letters, butterfly wing props, a custom printed backdrop, and soft balloon garland draping.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-09.jpeg",
    price: 32000,
    inclusions:
      "Marquee Name Letters, Butterfly Wing Props, Purple & Gold Balloon Garland, Custom Printed Backdrop, LED Number, Floral Floor Border",
    created_at: "2026-10-02T04:45:00.000Z",
  },
  {
    id: "bday-09",
    title: "Blue Butterfly Marquee Birthday Stage",
    description:
      "An elegant blue and white butterfly birthday setup with giant illuminated name letters, honeycomb-pattern backdrop, deep blue and white balloon arch spanning the full stage width, and vintage-style props.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-10.jpeg",
    price: 48000,
    inclusions:
      "Giant LED Marquee Letters, Full-Width Balloon Arch, Honeycomb Backdrop Panel, Butterfly Cutouts, Cake Display Table, Vintage Photo Props",
    created_at: "2026-10-02T04:30:00.000Z",
  },
  {
    id: "bday-10",
    title: "Wild One Safari Birthday Outdoor",
    description:
      "A fresh outdoor safari setup with a sage green and gold balloon garland, arched green hedge panel, and adorable jungle animal cutouts including giraffe, lion and zebra on a custom backdrop.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-11.jpeg",
    price: 35000,
    inclusions:
      "Outdoor Balloon Arch, Green Hedge Panel, Safari Animal Cutouts, Custom Wild One Backdrop, Stage Grass Mat",
    created_at: "2026-10-02T04:15:00.000Z",
  },
  {
    id: "bday-11",
    title: "Fairy Butterfly Princess Stage",
    description:
      "A vibrant pink and purple butterfly birthday stage with large pink butterfly frame panels, a printed princess character backdrop, balloon columns and a lit cake pedestal centrepiece.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-12.jpeg",
    price: 36000,
    inclusions:
      "Pink Butterfly Frame Panels, Princess Character Backdrop, Balloon Columns, Lit Cake Pedestal, Stage Skirting, Welcome Board",
    created_at: "2026-10-02T04:00:00.000Z",
  },
  {
    id: "bday-12",
    title: "Baby Boss Blue & Gold Birthday",
    description:
      "A bold Baby Boss themed first birthday with a dramatic blue and gold balloon arch, Baby Boss character cutouts, illuminated letter blocks, a sequin shimmer wall and striped patterned backdrop panels.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-13.jpeg",
    price: 40000,
    inclusions:
      "Blue & Gold Balloon Arch, Baby Boss Character Cutouts, LED Letter Blocks, Shimmer Sequin Wall, Patterned Backdrop Panels, Cake Tables",
    created_at: "2026-10-02T03:45:00.000Z",
  },
  {
    id: "bday-13",
    title: "Rustic Outdoor Teddy Bear Birthday",
    description:
      "A magical outdoor evening setup featuring a rustic wooden pallet wall with Edison bulb string lights, a giant ONE marquee, a green hedge panel, organic balloon garlands in terracotta and teal, and illuminated arch frames.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-14.jpeg",
    price: 44000,
    inclusions:
      "Rustic Pallet Wall, Edison String Lights, Giant ONE Marquee, Hedge Panel, Organic Balloon Garland, LED Arch Frame, Teddy Bear Props",
    created_at: "2026-10-02T03:30:00.000Z",
  },
  {
    id: "bday-14",
    title: "Rainbow Unicorn Birthday",
    description:
      "A magical rainbow unicorn party with multicolour balloon columns, a printed unicorn rainbow backdrop, a draped white dessert table and a glowing number 5 balloon.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-15.jpeg",
    price: 26000,
    inclusions:
      "Rainbow Balloon Columns, Unicorn Rainbow Backdrop, White Draped Dessert Table, Number Balloon, Coloured Stage Lighting",
    created_at: "2026-10-02T03:15:00.000Z",
  },
  {
    id: "bday-15",
    title: "Jungle Safari Marquee Grand Birthday",
    description:
      "A grand outdoor safari birthday with a full gold and green balloon garland, a premium round mirror disc, safari animal cutouts and backdrop panels, illuminated name marquee letters, and a royal crown cake pedestal.",
    category_id: catBirthday.id,
    categories: catBirthday,
    image_url: "/assets/birthday-16.jpeg",
    price: 52000,
    inclusions:
      "Gold & Green Balloon Garland, Mirror Disc Backdrop, Safari Animal Cutouts, Illuminated Name Marquee, Crown Cake Pedestal, Outdoor Stage Setup",
    created_at: "2026-10-02T03:00:00.000Z",
  },

  // ── MARRIAGE ───────────────────────────────────────────────────────────────
  {
    id: "mar-01",
    title: "Wisteria Garden Wedding Stage",
    description:
      "A breathtaking stage draped in cascading wisteria and soft cream roses with hanging Edison bulbs, floral pillar borders, and an elegant gold love seat. Perfect for a garden-inspired wedding.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-01.jpeg",
    price: 110000,
    inclusions:
      "Cascading Wisteria Ceiling, Fresh Rose Pillar Borders, Hanging Edison Bulbs, Floral Urns, Gold Love Seat, White Fabric Backdrop",
    created_at: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "mar-02",
    title: "Royal Red Chandelier Wedding Stage",
    description:
      "A dramatic red and gold wedding stage with flowing scarlet fabric drapes, crystal chandeliers, a golden grid candle wall, twin golden horse sculptures, and dense floral borders along the stage edge.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-02.jpeg",
    price: 120000,
    inclusions:
      "Scarlet Fabric Draping, Crystal Chandeliers, Gold Grid Candle Wall, Golden Horse Sculptures, Fresh Floral Stage Border, Couple Sofa",
    created_at: "2026-10-02T09:45:00.000Z",
  },
  {
    id: "mar-03",
    title: "Red Rose Celestial Mandap Stage",
    description:
      "A spectacular red rose wedding stage with a living green wall backdrop on both sides, a vibrant full-width red floral spread, cascading red amaranth from the ceiling, and warm candleabra lighting.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-03.jpeg",
    price: 150000,
    inclusions:
      "Red Rose Full-Width Backdrop, Living Green Wall Panels, Cascading Amaranth Ceiling, Candelabra Lights, Stage Border Flowers, Red Carpet",
    created_at: "2026-10-02T09:30:00.000Z",
  },
  {
    id: "mar-04",
    title: "Ivory Garden Couple Stage",
    description:
      "A refined ivory and blush wedding stage featuring a white tufted chesterfield sofa surrounded by lush mixed flower arrangements in pink, white and purple tones with personalised couple monogram letters.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-04.jpeg",
    price: 165000,
    inclusions:
      "White Tufted Sofa, Mixed Floral Clusters, Couple Monogram Letters, Floral Pillar Stands, Soft Backdrop Drape, Stage Floor Flowers",
    created_at: "2026-10-02T09:15:00.000Z",
  },
  {
    id: "mar-05",
    title: "Traditional South Indian Kolam Stage",
    description:
      "An authentic traditional setup with hand-painted kolam backdrop, brass urlis, fresh marigold and white flower garlands, banana plants, and a classic wooden bench seat for the couple.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-05.jpeg",
    price: 20000,
    inclusions:
      "Kolam Painted Backdrop, Brass Urlis, Fresh Marigold Garlands, Banana Plant Decor, Traditional Bench, Kumkum Rangoli Border",
    created_at: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "mar-06",
    title: "Pastel Butterfly Arch Wedding Stage",
    description:
      "A romantic pastel lavender and pink arch stage with crystal chandeliers on gold stands, a sweeping tropical floral half-arch, neon butterfly motifs, and a carved royal chaise sofa as centrepiece.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-06.jpeg",
    price: 25000,
    inclusions:
      "Crystal Chandeliers on Gold Stands, Tropical Floral Arch, Neon Butterfly Motifs, Royal Chaise Sofa, Floral Floor Clusters, Pastel Backdrop Panels",
    created_at: "2026-10-02T08:45:00.000Z",
  },
  {
    id: "mar-07",
    title: "Rustic Floral Grid Wedding Backdrop",
    description:
      "A warm rustic wedding stage with a custom wooden grid frame adorned with lush flower bouquets, hanging lanterns and Edison bulbs, a cascading red flower ceiling, and the couple's name in neon.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-07.jpeg",
    price: 25000,
    inclusions:
      "Wooden Grid Backdrop, Flower Bouquet Clusters, Hanging Lanterns, Edison Bulb Ceiling, Neon Name Sign, Stage Floral Pedestals",
    created_at: "2026-10-02T08:30:00.000Z",
  },
  {
    id: "mar-08",
    title: "Lavender Circle Arch Wedding Stage",
    description:
      "An elegant lavender and green wedding stage with a circular floral wreath arch, gold candelabra stands, gold rod stands with floral tops, a white floral ring backdrop, and fairy light curtain wall.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-08.jpeg",
    price: 30000,
    inclusions:
      "Circular Floral Arch, Gold Candelabra Stands, Fairy Light Curtain Wall, White Carved Backdrop Panels, Stage Flower Border, Floral Urns",
    created_at: "2026-10-02T08:15:00.000Z",
  },
  {
    id: "mar-09",
    title: "White Hoop Floral Circle Stage",
    description:
      "A clean and modern wedding stage with a large white rose circular hoop centrepiece, gold rod torch stands, carved white floral wall panels, and a dense white rose and green leaf stage border.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-09.jpeg",
    price: 35000,
    inclusions:
      "White Rose Circular Hoop, Gold Rod Torch Stands, Carved White Backdrop Panels, White Rose Stage Border, Fairy Light Curtain, Floral Urns",
    created_at: "2026-10-02T08:00:00.000Z",
  },
  {
    id: "mar-10",
    title: "Garden Green Wall Wedding Stage",
    description:
      "A vibrant garden-themed wedding stage with lush artificial green walls flanking the stage, a circular floral hoop arch in pink and white, gold staggered candle stands, and a rich mixed flower stage border.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-10.jpeg",
    price: 35000,
    inclusions:
      "Artificial Green Wall Panels, Circular Floral Hoop, Gold Candle Stands, Mixed Flower Stage Border, Royal Sofa, Stage Uplighting",
    created_at: "2026-10-02T07:45:00.000Z",
  },
  {
    id: "mar-11",
    title: "Classic Fairy Light Floral Stage",
    description:
      "A timeless white and pink wedding stage with a full fairy light curtain backdrop, hanging floral medallions, tall floral vase pillars, a cascading pink rose top border, and a carved royal sofa as centrepiece.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-11.jpeg",
    price: 40000,
    inclusions:
      "Fairy Light Curtain Backdrop, Hanging Floral Medallions, Tall Floral Vase Pillars, Rose Top Border, Carved Royal Sofa, Stage Carpet",
    created_at: "2026-10-02T07:30:00.000Z",
  },
  {
    id: "mar-12",
    title: "Red Rose Entrance Arch Wedding",
    description:
      "A dramatic entrance arch densely wrapped in fresh red roses and green foliage leading to the main stage, with a red carpet walkway and a matching floral inner arch creating a grand bridal entry.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-12.jpeg",
    price: 45000,
    inclusions:
      "Dense Red Rose Entrance Arch, Inner Floral Arch, Red Carpet Walkway, Green Foliage Wrapping, Stage View Corridor, Mood Lighting",
    created_at: "2026-10-02T07:15:00.000Z",
  },
  {
    id: "mar-13",
    title: "White Mughal Arch Wedding Gate",
    description:
      "A regal white Mughal-motif entrance gate with intricate lattice panels, lush pink and white floral column wrapping, and a grand ceremonial corridor leading to the main wedding hall.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-13.jpeg",
    price: 45000,
    inclusions:
      "White Mughal Lattice Gate, Floral Column Wrapping, Ceremonial Corridor, Ambient Entry Lighting, Flower Topping, Rose Petal Floor",
    created_at: "2026-10-02T07:00:00.000Z",
  },
  {
    id: "mar-14",
    title: "Gold Crystal Chandelier Wedding Stage",
    description:
      "A glamorous outdoor evening wedding stage with multiple gold crystal chandeliers, gold arch frames, white fabric draping, orchid and white flower arrangements, and a plush cream couple sofa.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-14.jpeg",
    price: 60000,
    inclusions:
      "Gold Crystal Chandeliers, Gold Arch Frames, White Fabric Draping, White Orchid Arrangements, Cream Couple Sofa, Stage Uplighting",
    created_at: "2026-10-02T06:45:00.000Z",
  },
  {
    id: "mar-15",
    title: "Pink & Gold Multi-Arch Marriage Stage",
    description:
      "A vibrant pink, coral and gold multi-arch wedding stage with bamboo-ceiling ambiance, multiple floral arches, a central ring backdrop, and a full fresh flower stage border in pink, white and yellow.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-15.jpeg",
    price: 65000,
    inclusions:
      "Multi Floral Arch Set, Central Ring Backdrop, Bamboo Ceiling Decor, Fresh Stage Border, Gold Urn Pedestals, Stage Lighting",
    created_at: "2026-10-02T06:30:00.000Z",
  },
  {
    id: "mar-16",
    title: "Pastel Bohemian Floral Arch Stage",
    description:
      "A soft bohemian wedding stage featuring asymmetric tropical floral arches, a white arched wall panel backdrop, crystal chandeliers on tall gold stands, and a rich colourful flower border.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-16.jpeg",
    price: 85000,
    inclusions:
      "Asymmetric Tropical Floral Arch, White Arched Backdrop Wall, Crystal Chandeliers, Gold Tall Stands, Colourful Flower Border, Stage Skirting",
    created_at: "2026-10-02T06:15:00.000Z",
  },
  {
    id: "mar-17",
    title: "Red Floral Neon Wedding Stage",
    description:
      "A bold red and orange wedding stage with a full red flower wall backdrop, gold frame arches, neon hanging pendants, a centre circular arch with the couple's name, and a velvet burgundy sofa.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-17.jpeg",
    price: 85000,
    inclusions:
      "Red Flower Wall Backdrop, Gold Frame Arches, Neon Name Pendant, Circular Floral Arch, Velvet Burgundy Sofa, Stage Tray Decor",
    created_at: "2026-10-02T06:00:00.000Z",
  },
  {
    id: "mar-18",
    title: "Lotus Neon LED Grand Wedding Stage",
    description:
      "A magnificent wedding stage with dramatic LED lotus petal neon wings on both sides, a luxurious gold satin drape backdrop, dense pink and purple flower arches along pillars, and a vibrant full-width flower border.",
    category_id: catMarriage.id,
    categories: catMarriage,
    image_url: "/assets/marriage-18.jpeg",
    price: 90000,
    inclusions:
      "LED Lotus Neon Wings, Gold Satin Drape Backdrop, Floral Pillar Arches, Crystal Pendant Chandelier, Couple Love Seat, Full Flower Stage Border",
    created_at: "2026-10-02T05:45:00.000Z",
  },

  // ── BABY SHOWER ────────────────────────────────────────────────────────────
  {
    id: "bs-01",
    title: "Traditional Boho Baby Shower Stage",
    description:
      "A charming traditional baby shower setup with sage green woven bamboo panels, white flower chandelier drops, gold frame wall art, brass urli accents, and a rattan chair centrepiece in a soft botanical setting.",
    category_id: catBabyShower.id,
    categories: catBabyShower,
    image_url: "/assets/babyshower-01.jpeg",
    price: 25000,
    inclusions:
      "Woven Bamboo Panels, White Flower Chandelier Drops, Gold Frame Wall Art, Brass Urlis, Rattan Chair, Fresh White Chrysanthemum Arrangements",
    created_at: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "bs-02",
    title: "Kolam Kolam Baby Shower Backdrop",
    description:
      "A beautiful traditional South Indian baby shower stage with an intricate white kolam motif printed backdrop in deep maroon, traditional brass pots, fresh pink flower arrangements, and a banana plant border.",
    category_id: catBabyShower.id,
    categories: catBabyShower,
    image_url: "/assets/babyshower-02.jpeg",
    price: 25000,
    inclusions:
      "Kolam Motif Printed Backdrop, Brass Pot Decor, Fresh Pink Flower Arrangements, Banana Plant Border, Hanging Bells, White Jasminum Garland Top",
    created_at: "2026-10-02T09:45:00.000Z",
  },
];
