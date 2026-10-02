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
      'Fairytale Princess Birthday Theme',
      'A whimsical pastel dream with an organic balloon garland, fairytale castle backdrop silhouette, lighted giant age number, and dessert pedestal tables.',
      v_birthday_id,
      '/assets/40000.jpeg',
      40000,
      'Organic Balloon Garland, Castle Silhouette Backdrop, LED Number Display, Cake Table Styling, Kids Themed Photo Cutouts'
    ),
    (
      'Carnival & Jungle Birthday Fiesta',
      'Vibrant animal cutouts, lush green and golden balloon arches, personalized milestone board, and an action-packed party backdrop designed for kids celebrations.',
      v_birthday_id,
      '/assets/35000.jpeg',
      35000,
      'Animal Themed Cutouts, Colorful Balloon Columns, Milestone Board, Personalized Banner, Stage Balloon Base'
    ),
    (
      'Starry Night Shimmer Birthday',
      'Glamorous dark navy and gold balloon garland paired with a sparkling shimmer wall, neon happy birthday sign, and stage uplighting.',
      v_birthday_id,
      '/assets/25000.jpeg',
      25000,
      'Dark Blue & Gold Balloon Arch, Shimmer Sequin Wall, Warm Lighting, Number Marquee, Welcome Board'
    ),
    (
      'Pastel Cloud Dream Birthday Setup',
      'Soft macaron-toned balloon clouds, acrylic arch with custom childs name, circular stage carpet, and matching dessert plinths.',
      v_birthday_id,
      '/assets/25000-1.jpeg',
      25000,
      'Pastel Balloon Cloud, Custom Acrylic Name Sign, Cylindrical Cake Pedestals, Backlighting, Welcome Easel'
    ),
    (
      'Joyful Celebration Archway Setup',
      'A festive rainbow balloon archway with cheerful backdrop ring, stage floor runner, and themed party props suitable for all milestones.',
      v_birthday_id,
      '/assets/25000-4.jpeg',
      25000,
      'Multi-Color Balloon Archway, Party Backdrop Screen, Themed Props, Floor Mats, Number Balloons'
    );
END $$;
