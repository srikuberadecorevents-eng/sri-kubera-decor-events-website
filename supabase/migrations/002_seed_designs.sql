-- ============================================================
-- Sri Kubera Decor & Events -- Seed 20 Stage Decoration Designs
-- Run this in your Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_wedding_id uuid;
  v_reception_id uuid;
  v_birthday_id uuid;
  v_housewarming_id uuid;
  v_surprise_id uuid;
  v_corporate_id uuid;
BEGIN
  -- Get category IDs by name
  SELECT id INTO v_wedding_id FROM public.categories WHERE name = 'Wedding' LIMIT 1;
  SELECT id INTO v_reception_id FROM public.categories WHERE name = 'Reception' LIMIT 1;
  SELECT id INTO v_birthday_id FROM public.categories WHERE name = 'Birthday' LIMIT 1;
  SELECT id INTO v_housewarming_id FROM public.categories WHERE name = 'Housewarming' LIMIT 1;
  SELECT id INTO v_surprise_id FROM public.categories WHERE name = 'Surprise Party' LIMIT 1;
  SELECT id INTO v_corporate_id FROM public.categories WHERE name = 'Corporate Event' LIMIT 1;

  -- Insert Designs
  INSERT INTO public.designs (title, description, category_id, image_url, price, inclusions)
  VALUES
    (
      'Royal Grand Gold Mandap Stage',
      'A majestic wedding stage featuring hand-crafted golden pillars, premium fresh floral arches, warm ambient stage lighting, and royal throne seating. Perfect for traditional and luxury South Indian weddings.',
      v_wedding_id,
      '/assets/120000.jpeg',
      120000,
      'Grand Golden Pillars, Fresh Exotic Floral Arch, Warm Ambient Spotlights, Traditional Brass Diya Pillars, Luxury Royal Sofa Seating, Full Carpet Flooring'
    ),
    (
      'Imperial Floral Palace Stage',
      'A breathtaking wedding extravaganza with dense imported rose arches, crystal chandeliers, velvet draping, and dramatic spotlighting. Crafted for couples who desire an opulent fairy-tale setting.',
      v_wedding_id,
      '/assets/165000.jpeg',
      165000,
      'Imported Dutch Rose Archways, Crystal Chandelier Array, LED Ambient Backdrop, Velvet Carpet, Designer Throne Chairs, Red Carpet Pathway'
    ),
    (
      'Maharaja Temple Gopuram Mandap',
      'Rich traditional architecture with intricately carved temple gopuram pillars, cascading strings of fresh jasmine and marigold, and warm brass lamps for an auspicious ceremony.',
      v_wedding_id,
      '/assets/150000.jpeg',
      150000,
      'Carved Temple Pillars, Fresh Jasmine & Marigold Strings, Warm Fairy Lights, Grand Entryway Pathway, Brass Urlis & Floating Diyas'
    ),
    (
      'Regal Gold Symphony Wedding Stage',
      'An enchanting blend of golden geometry and fresh floral installations. Features illuminated backlit panels, delicate hanging crystal drops, and luxurious bride & groom stage seating.',
      v_wedding_id,
      '/assets/110000.jpeg',
      110000,
      'Full Stage Floral Backdrop, Hanging Crystal Drops, Ambient Stage Lighting, VIP Stage Chairs, Welcome Board, Entrance Arch'
    ),
    (
      'Contemporary Glamour Reception Stage',
      'Sophisticated modern reception stage with geometric metallic arches, pastel rose and peony clusters, neon couple initials, and cinematic downlighting.',
      v_reception_id,
      '/assets/90000.jpeg',
      90000,
      'Geometric Gold Arches, Pastel Rose Clusters, Neon Signage, Custom Stage Carpet, Designer Backdrop, Dual Focus Stage Spotlights'
    ),
    (
      'Luxe Crystal Chandelier Reception',
      'A glamorous evening setup featuring draped silk curtains, sparkling crystal chandeliers, tiered floral panels, and a sleek contemporary couch for the couple.',
      v_reception_id,
      '/assets/85000.jpeg',
      85000,
      'Curtain Fairy Lights, Dual Tier Floral Panels, Spotlight Array, White Leather Stage Couch, Walkway Carpet'
    ),
    (
      'Modern Pastel Floral Stage',
      'Chic blush pink, peach, and ivory floral arrangements set against textured fluted wall panels with subtle warm lighting. An elegant, romantic ambiance for modern receptions.',
      v_reception_id,
      '/assets/85000-1.jpeg',
      85000,
      'Blush Pink & Ivory Backdrop, Archway Floral Arrangements, Ambient Downlighting, Plush Seating, Photo Booth Corner'
    ),
    (
      'Classic Floral Symphony Stage',
      'Graceful draped fabric backdrop highlighted by cascading floral rings, soft golden PAR cans, and a cozy love seat for timeless reception photography.',
      v_reception_id,
      '/assets/60000.jpeg',
      60000,
      'Cascade Floral Rings, Warm Gold PAR Cans, Draped Silk Backdrop, Couple Love Seat, Flower Vases along Stage Edge'
    ),
    (
      'Grand Corporate Gala & Conference Stage',
      'A sleek, professional stage setup designed for corporate annual days, conferences, award ceremonies, and product launches with integrated podium and branding panels.',
      v_corporate_id,
      '/assets/65000.jpeg',
      65000,
      'Sleek Minimalist Backdrop, Brand Accent Lighting, Acoustic Stage Paneling, Presentation Podiums, Side Wing Banners'
    ),
    (
      'Classic Seminar & Presentation Dais',
      'Clean, focused corporate stage with professional blue and gold accents, branded rostrum, executive dais seating, and sharp stage spot lighting.',
      v_corporate_id,
      '/assets/20000.jpeg',
      20000,
      'Branded Backdrop Stand, Stage Spotlights, Floral Urns for Dais, Stage Skirting, Microphone Stand Branding'
    ),
    (
      'Traditional Gruhapravesam Mandap',
      'Authentic South Indian housewarming backdrop featuring fresh banana trees, fragrant marigold and tuberose garlands, mango leaf thoranams, and brass kuthu vilakku setup.',
      v_housewarming_id,
      '/assets/45000-1.jpeg',
      45000,
      'Traditional Banana Plants, Fresh Marigold Garlands, Mango Leaf Thoran, Brass Lamp Setup, Traditional Backdrop, Rangoli Border'
    ),
    (
      'Auspicious Golden Bloom Decor',
      'Vibrant yellow, orange, and white floral arrangements with traditional brass urlis filled with floating petals and diyas, celebrating your new home with warmth and blessings.',
      v_housewarming_id,
      '/assets/30000.jpeg',
      30000,
      'Yellow & Orange Flower Backdrop, Brass Urlis with Floating Diyas, Welcome Archway, Floral Pillars'
    ),
    (
      'Enchanted Garden Surprise Party',
      'A magical surprise party setting adorned with fairy light canopies, wooden rustic frames, customized neon signage, and a dedicated photo corner for unforgettable celebrations.',
      v_surprise_id,
      '/assets/45000-2.jpeg',
      45000,
      'Fairy Light Canopies, Wooden Rustic Arch, Custom Photo Booth, Floral Table Centrepieces, Personalized Neon Sign'
    ),
    (
      'Romantic Candlelight Proposal Canopy',
      'An intimate romantic setup with sheer draped fabric cabana, tea light candles along a rose petal pathway, and marquee MARRY ME or anniversary letters.',
      v_surprise_id,
      '/assets/35000-1.jpeg',
      35000,
      'Boho Sheer Fabric Cabana, Pathway Tea Lights, Rose Petal Carpet, Customised Message Neon, Fairy Light Backdrop'
    ),
    (
      'Intimate Heart Light Surprise Decor',
      'Warm and charming setup with a glowing heart marquee frame, romantic string lights, custom photo clips, and an elegant cake table arrangement.',
      v_surprise_id,
      '/assets/250003.jpeg',
      25000,
      'Heart Light Frame, Marquee Letters, Candlelight Walkway, Champagne Table Decor, Photo Strings with Fairy Lights'
    ),
    (
      'Purple Butterfly First Birthday',
      'A dreamy purple butterfly-themed setup featuring a full shimmer sequin wall, cascading purple, white and gold balloon garland, large butterfly cutouts, and a glowing Happy Birthday neon sign. Perfect for a little girl turning one.',
      v_birthday_id,
      '/assets/birthday-01.jpeg',
      35000,
      'Purple & Gold Balloon Garland, Shimmer Sequin Wall, Neon Happy Birthday Sign, Giant Butterfly Cutouts, Custom Printed Backdrop'
    ),
    (
      'Black & Gold Legend Retirement Celebration',
      'An elegant black, gold and white balloon arch with hanging Edison bulb droplets and a bold custom calligraphy backdrop. Ideal for milestone birthday and retirement celebrations.',
      v_birthday_id,
      '/assets/birthday-02.jpeg',
      30000,
      'Black & Gold Balloon Arch, Edison Bulb Droplets, Custom Calligraphy Backdrop, Stage Floral Border, Ambient Spotlights'
    ),
    (
      'Teddy Bear First Birthday Party',
      'A warm and playful first birthday setup with a green artificial hedge wall, glittering gold sequin panel, organic balloon garland in brown, peach and white tones, LED number 1, and a teddy bear custom backdrop.',
      v_birthday_id,
      '/assets/birthday-03.jpeg',
      28000,
      'Artificial Hedge Wall, Gold Sequin Panel, Organic Balloon Garland, LED Number Display, Custom Teddy Backdrop, Stage Grass Mat'
    ),
    (
      'Blue Hot Air Balloon First Birthday',
      'A premium sky-blue first birthday stage with a sculpted balloon arch, custom hot air balloon props, a giant illuminated number 1, oversized teddy bears, and a tiered dessert display. Perfect for baby boys.',
      v_birthday_id,
      '/assets/birthday-04.jpeg',
      45000,
      'Full Balloon Arch, Hot Air Balloon Props, LED Number 1, Giant Teddy Bears, Tiered Cake Display, Floral Stage Border'
    ),
    (
      'Boho Teddy Garden First Birthday',
      'A charming boho-style setup with a glitter shimmer panel, green hedge arch, warm Edison bulb string lights, an organic peach and white balloon garland, a giant teddy bear, and personalised name blocks.',
      v_birthday_id,
      '/assets/birthday-06.jpeg',
      38000,
      'Gold Shimmer Wall, Hedge Arch, Organic Balloon Garland, LED Name Blocks, Giant Teddy Bear, Custom Printed Backdrop'
    ),
    (
      'Fairy Princess Butterfly Birthday',
      'A grand purple and gold butterfly-fairy stage with large illuminated marquee name letters, shimmering butterfly wings, princess character cutouts, gold arch frames, and a vibrant shimmer wall backdrop.',
      v_birthday_id,
      '/assets/birthday-07.jpeg',
      50000,
      'Illuminated Marquee Name Letters, Shimmer Butterfly Wings, Princess Character Cutouts, Gold Arch Frames, Custom Backdrop, Flower Pedestals'
    ),
    (
      'Jungle Safari First Birthday',
      'A lively jungle safari themed birthday featuring green and gold balloon arches, a grass wall backdrop, wild animal cutouts including tiger, lion and giraffe, printed animal cylinders, and milestone photo boards.',
      v_birthday_id,
      '/assets/birthday-08.jpeg',
      42000,
      'Green & Gold Balloon Arch, Grass Wall Backdrop, Animal Character Cutouts, Printed Cylinder Pedestals, Milestone Photo Board, Stage Carpet'
    ),
    (
      'Purple Butterfly Marquee Name Setup',
      'A sophisticated purple and yellow butterfly birthday with large wooden marquee name letters, butterfly wing props, a custom printed backdrop, and soft balloon garland draping.',
      v_birthday_id,
      '/assets/birthday-09.jpeg',
      32000,
      'Marquee Name Letters, Butterfly Wing Props, Purple & Gold Balloon Garland, Custom Printed Backdrop, LED Number, Floral Floor Border'
    ),
    (
      'Blue Butterfly Marquee Birthday Stage',
      'An elegant blue and white butterfly birthday setup with giant illuminated name letters, honeycomb-pattern backdrop, deep blue and white balloon arch spanning the full stage width, and vintage-style props.',
      v_birthday_id,
      '/assets/birthday-10.jpeg',
      48000,
      'Giant LED Marquee Letters, Full-Width Balloon Arch, Honeycomb Backdrop Panel, Butterfly Cutouts, Cake Display Table, Vintage Photo Props'
    ),
    (
      'Wild One Safari Birthday Outdoor',
      'A fresh outdoor safari setup with a sage green and gold balloon garland, arched green hedge panel, and adorable jungle animal cutouts including giraffe, lion and zebra on a custom backdrop.',
      v_birthday_id,
      '/assets/birthday-11.jpeg',
      35000,
      'Outdoor Balloon Arch, Green Hedge Panel, Safari Animal Cutouts, Custom Wild One Backdrop, Stage Grass Mat'
    ),
    (
      'Fairy Butterfly Princess Stage',
      'A vibrant pink and purple butterfly birthday stage with large pink butterfly frame panels, a printed princess character backdrop, balloon columns and a lit cake pedestal centrepiece.',
      v_birthday_id,
      '/assets/birthday-12.jpeg',
      36000,
      'Pink Butterfly Frame Panels, Princess Character Backdrop, Balloon Columns, Lit Cake Pedestal, Stage Skirting, Welcome Board'
    ),
    (
      'Baby Boss Blue & Gold Birthday',
      'A bold Baby Boss themed first birthday with a dramatic blue and gold balloon arch, Baby Boss character cutouts, illuminated BAB letter blocks, a sequin shimmer wall and striped patterned backdrop panels.',
      v_birthday_id,
      '/assets/birthday-13.jpeg',
      40000,
      'Blue & Gold Balloon Arch, Baby Boss Character Cutouts, LED Letter Blocks, Shimmer Sequin Wall, Patterned Backdrop Panels, Cake Tables'
    ),
    (
      'Rustic Outdoor Teddy Bear Birthday',
      'A magical outdoor evening setup featuring a rustic wooden pallet wall with Edison bulb string lights, a giant ONE marquee, a green hedge panel, organic balloon garlands in terracotta and teal, and illuminated arch frames.',
      v_birthday_id,
      '/assets/birthday-14.jpeg',
      44000,
      'Rustic Pallet Wall, Edison String Lights, Giant ONE Marquee, Hedge Panel, Organic Balloon Garland, LED Arch Frame, Teddy Bear Props'
    ),
    (
      'Rainbow Unicorn Birthday',
      'A magical rainbow unicorn party with multicolour balloon columns, a printed unicorn rainbow backdrop, a draped white dessert table and a glowing number 5 balloon. Full of colour and fantasy for little ones.',
      v_birthday_id,
      '/assets/birthday-15.jpeg',
      26000,
      'Rainbow Balloon Columns, Unicorn Rainbow Backdrop, White Draped Dessert Table, Number Balloon, Coloured Stage Lighting'
    ),
    (
      'Jungle Safari Marquee Grand Birthday',
      'A grand outdoor safari birthday with a full gold and green balloon garland, a premium round mirror disc, safari animal cutouts and backdrop panels, illuminated name marquee letters, and a royal crown cake pedestal.',
      v_birthday_id,
      '/assets/birthday-16.jpeg',
      52000,
      'Gold & Green Balloon Garland, Mirror Disc Backdrop, Safari Animal Cutouts, Illuminated Name Marquee, Crown Cake Pedestal, Outdoor Stage Setup'
    );
END $$;
