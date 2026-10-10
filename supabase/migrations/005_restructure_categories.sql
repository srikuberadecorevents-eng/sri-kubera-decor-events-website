-- ============================================================
-- Sri Kubera Decor & Events
-- RESTRUCTURE CATEGORIES + ADD MARRIAGE & BABY SHOWER DESIGNS
-- Run this in your Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_birthday_id   uuid;
  v_marriage_id   uuid;
  v_babyshower_id uuid;
BEGIN

  -- ─── STEP 1: Deactivate removed categories ───────────────────────────────
  -- Remove designs that belong to Wedding, Housewarming, Corporate Event, Surprise Party
  DELETE FROM public.designs
  WHERE category_id IN (
    SELECT id FROM public.categories
    WHERE name IN ('Wedding', 'Housewarming', 'Corporate Event', 'Surprise Party')
  );

  -- Deactivate the old categories (safe: keeps rows but hides from public)
  UPDATE public.categories
  SET is_active = false
  WHERE name IN ('Wedding', 'Housewarming', 'Corporate Event', 'Surprise Party');

  -- ─── STEP 2: Rename Reception → Marriage ─────────────────────────────────
  UPDATE public.categories
  SET name = 'Marriage', sort_order = 2
  WHERE name = 'Reception';

  -- ─── STEP 3: Get / create required category IDs ──────────────────────────
  SELECT id INTO v_birthday_id   FROM public.categories WHERE name = 'Birthday'  LIMIT 1;
  SELECT id INTO v_marriage_id   FROM public.categories WHERE name = 'Marriage'  LIMIT 1;
  SELECT id INTO v_babyshower_id FROM public.categories WHERE name = 'Baby Shower' LIMIT 1;

  -- Create Baby Shower if it doesn't exist
  IF v_babyshower_id IS NULL THEN
    INSERT INTO public.categories (name, is_active, sort_order)
    VALUES ('Baby Shower', true, 3)
    RETURNING id INTO v_babyshower_id;
  ELSE
    UPDATE public.categories SET is_active = true, sort_order = 3 WHERE id = v_babyshower_id;
  END IF;

  -- Ensure Birthday and Marriage are active with correct sort order
  UPDATE public.categories SET is_active = true, sort_order = 1 WHERE id = v_birthday_id;
  UPDATE public.categories SET is_active = true, sort_order = 2 WHERE id = v_marriage_id;

  -- ─── STEP 4: Remove OLD Marriage designs (from Reception category) ────────
  DELETE FROM public.designs WHERE category_id = v_marriage_id;

  -- ─── STEP 5: Insert 18 Marriage designs ──────────────────────────────────
  INSERT INTO public.designs (title, description, category_id, image_url, price, inclusions, status)
  VALUES
    (
      'Wisteria Garden Wedding Stage',
      'A breathtaking stage draped in cascading wisteria and soft cream roses with hanging Edison bulbs, floral pillar borders, and an elegant gold love seat. Perfect for a garden-inspired wedding.',
      v_marriage_id, '/assets/marriage-01.jpeg', 110000,
      'Cascading Wisteria Ceiling, Fresh Rose Pillar Borders, Hanging Edison Bulbs, Floral Urns, Gold Love Seat, White Fabric Backdrop',
      'published'
    ),
    (
      'Royal Red Chandelier Wedding Stage',
      'A dramatic red and gold wedding stage with flowing scarlet fabric drapes, crystal chandeliers, a golden grid candle wall, twin golden horse sculptures, and dense floral borders along the stage edge.',
      v_marriage_id, '/assets/marriage-02.jpeg', 120000,
      'Scarlet Fabric Draping, Crystal Chandeliers, Gold Grid Candle Wall, Golden Horse Sculptures, Fresh Floral Stage Border, Couple Sofa',
      'published'
    ),
    (
      'Red Rose Celestial Mandap Stage',
      'A spectacular red rose wedding stage with a living green wall backdrop on both sides, a vibrant full-width red floral spread, cascading red amaranth from the ceiling, and warm candelabra lighting.',
      v_marriage_id, '/assets/marriage-03.jpeg', 150000,
      'Red Rose Full-Width Backdrop, Living Green Wall Panels, Cascading Amaranth Ceiling, Candelabra Lights, Stage Border Flowers, Red Carpet',
      'published'
    ),
    (
      'Ivory Garden Couple Stage',
      'A refined ivory and blush wedding stage featuring a white tufted chesterfield sofa surrounded by lush mixed flower arrangements in pink, white and purple tones with personalised couple monogram letters.',
      v_marriage_id, '/assets/marriage-04.jpeg', 165000,
      'White Tufted Sofa, Mixed Floral Clusters, Couple Monogram Letters, Floral Pillar Stands, Soft Backdrop Drape, Stage Floor Flowers',
      'published'
    ),
    (
      'Traditional South Indian Kolam Stage',
      'An authentic traditional setup with hand-painted kolam backdrop, brass urlis, fresh marigold and white flower garlands, banana plants, and a classic wooden bench seat for the couple.',
      v_marriage_id, '/assets/marriage-05.jpeg', 20000,
      'Kolam Painted Backdrop, Brass Urlis, Fresh Marigold Garlands, Banana Plant Decor, Traditional Bench, Kumkum Rangoli Border',
      'published'
    ),
    (
      'Pastel Butterfly Arch Wedding Stage',
      'A romantic pastel lavender and pink arch stage with crystal chandeliers on gold stands, a sweeping tropical floral half-arch, neon butterfly motifs, and a carved royal chaise sofa as centrepiece.',
      v_marriage_id, '/assets/marriage-06.jpeg', 25000,
      'Crystal Chandeliers on Gold Stands, Tropical Floral Arch, Neon Butterfly Motifs, Royal Chaise Sofa, Floral Floor Clusters, Pastel Backdrop Panels',
      'published'
    ),
    (
      'Rustic Floral Grid Wedding Backdrop',
      'A warm rustic wedding stage with a custom wooden grid frame adorned with lush flower bouquets, hanging lanterns and Edison bulbs, a cascading red flower ceiling, and the couple''s name in neon.',
      v_marriage_id, '/assets/marriage-07.jpeg', 25000,
      'Wooden Grid Backdrop, Flower Bouquet Clusters, Hanging Lanterns, Edison Bulb Ceiling, Neon Name Sign, Stage Floral Pedestals',
      'published'
    ),
    (
      'Lavender Circle Arch Wedding Stage',
      'An elegant lavender and green wedding stage with a circular floral wreath arch, gold candelabra stands, a white floral ring backdrop, and a fairy light curtain wall.',
      v_marriage_id, '/assets/marriage-08.jpeg', 30000,
      'Circular Floral Arch, Gold Candelabra Stands, Fairy Light Curtain Wall, White Carved Backdrop Panels, Stage Flower Border, Floral Urns',
      'published'
    ),
    (
      'White Hoop Floral Circle Stage',
      'A clean and modern wedding stage with a large white rose circular hoop centrepiece, gold rod torch stands, carved white floral wall panels, and a dense white rose and green leaf stage border.',
      v_marriage_id, '/assets/marriage-09.jpeg', 35000,
      'White Rose Circular Hoop, Gold Rod Torch Stands, Carved White Backdrop Panels, White Rose Stage Border, Fairy Light Curtain, Floral Urns',
      'published'
    ),
    (
      'Garden Green Wall Wedding Stage',
      'A vibrant garden-themed wedding stage with lush artificial green walls flanking the stage, a circular floral hoop arch in pink and white, gold staggered candle stands, and a rich mixed flower stage border.',
      v_marriage_id, '/assets/marriage-10.jpeg', 35000,
      'Artificial Green Wall Panels, Circular Floral Hoop, Gold Candle Stands, Mixed Flower Stage Border, Royal Sofa, Stage Uplighting',
      'published'
    ),
    (
      'Classic Fairy Light Floral Stage',
      'A timeless white and pink wedding stage with a full fairy light curtain backdrop, hanging floral medallions, tall floral vase pillars, a cascading pink rose top border, and a carved royal sofa as centrepiece.',
      v_marriage_id, '/assets/marriage-11.jpeg', 40000,
      'Fairy Light Curtain Backdrop, Hanging Floral Medallions, Tall Floral Vase Pillars, Rose Top Border, Carved Royal Sofa, Stage Carpet',
      'published'
    ),
    (
      'Red Rose Entrance Arch Wedding',
      'A dramatic entrance arch densely wrapped in fresh red roses and green foliage leading to the main stage, with a red carpet walkway and a matching floral inner arch creating a grand bridal entry.',
      v_marriage_id, '/assets/marriage-12.jpeg', 45000,
      'Dense Red Rose Entrance Arch, Inner Floral Arch, Red Carpet Walkway, Green Foliage Wrapping, Stage View Corridor, Mood Lighting',
      'published'
    ),
    (
      'White Mughal Arch Wedding Gate',
      'A regal white Mughal-motif entrance gate with intricate lattice panels, lush pink and white floral column wrapping, and a grand ceremonial corridor leading to the main wedding hall.',
      v_marriage_id, '/assets/marriage-13.jpeg', 45000,
      'White Mughal Lattice Gate, Floral Column Wrapping, Ceremonial Corridor, Ambient Entry Lighting, Flower Topping, Rose Petal Floor',
      'published'
    ),
    (
      'Gold Crystal Chandelier Wedding Stage',
      'A glamorous outdoor evening wedding stage with multiple gold crystal chandeliers, gold arch frames, white fabric draping, orchid and white flower arrangements, and a plush cream couple sofa.',
      v_marriage_id, '/assets/marriage-14.jpeg', 60000,
      'Gold Crystal Chandeliers, Gold Arch Frames, White Fabric Draping, White Orchid Arrangements, Cream Couple Sofa, Stage Uplighting',
      'published'
    ),
    (
      'Pink & Gold Multi-Arch Marriage Stage',
      'A vibrant pink, coral and gold multi-arch wedding stage with bamboo-ceiling ambiance, multiple floral arches, a central ring backdrop, and a full fresh flower stage border.',
      v_marriage_id, '/assets/marriage-15.jpeg', 65000,
      'Multi Floral Arch Set, Central Ring Backdrop, Bamboo Ceiling Decor, Fresh Stage Border, Gold Urn Pedestals, Stage Lighting',
      'published'
    ),
    (
      'Pastel Bohemian Floral Arch Stage',
      'A soft bohemian wedding stage featuring asymmetric tropical floral arches, a white arched wall panel backdrop, crystal chandeliers on tall gold stands, and a rich colourful flower border.',
      v_marriage_id, '/assets/marriage-16.jpeg', 85000,
      'Asymmetric Tropical Floral Arch, White Arched Backdrop Wall, Crystal Chandeliers, Gold Tall Stands, Colourful Flower Border, Stage Skirting',
      'published'
    ),
    (
      'Red Floral Neon Wedding Stage',
      'A bold red and orange wedding stage with a full red flower wall backdrop, gold frame arches, neon hanging pendants, a centre circular arch with the couple''s name, and a velvet burgundy sofa.',
      v_marriage_id, '/assets/marriage-17.jpeg', 85000,
      'Red Flower Wall Backdrop, Gold Frame Arches, Neon Name Pendant, Circular Floral Arch, Velvet Burgundy Sofa, Stage Tray Decor',
      'published'
    ),
    (
      'Lotus Neon LED Grand Wedding Stage',
      'A magnificent wedding stage with dramatic LED lotus petal neon wings on both sides, a luxurious gold satin drape backdrop, dense pink and purple flower arches along pillars, and a vibrant full-width flower border.',
      v_marriage_id, '/assets/marriage-18.jpeg', 90000,
      'LED Lotus Neon Wings, Gold Satin Drape Backdrop, Floral Pillar Arches, Crystal Pendant Chandelier, Couple Love Seat, Full Flower Stage Border',
      'published'
    );

  -- ─── STEP 6: Insert 2 Baby Shower designs ────────────────────────────────
  INSERT INTO public.designs (title, description, category_id, image_url, price, inclusions, status)
  VALUES
    (
      'Traditional Boho Baby Shower Stage',
      'A charming traditional baby shower setup with sage green woven bamboo panels, white flower chandelier drops, gold frame wall art, brass urli accents, and a rattan chair centrepiece in a soft botanical setting.',
      v_babyshower_id, '/assets/babyshower-01.jpeg', 25000,
      'Woven Bamboo Panels, White Flower Chandelier Drops, Gold Frame Wall Art, Brass Urlis, Rattan Chair, Fresh White Chrysanthemum Arrangements',
      'published'
    ),
    (
      'Kolam Baby Shower Backdrop',
      'A beautiful traditional South Indian baby shower stage with an intricate white kolam motif printed backdrop in deep maroon, traditional brass pots, fresh pink flower arrangements, and a banana plant border.',
      v_babyshower_id, '/assets/babyshower-02.jpeg', 25000,
      'Kolam Motif Printed Backdrop, Brass Pot Decor, Fresh Pink Flower Arrangements, Banana Plant Border, Hanging Bells, White Jasminum Garland Top',
      'published'
    );

END $$;
