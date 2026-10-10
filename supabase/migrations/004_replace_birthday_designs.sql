-- ============================================================
-- Sri Kubera Decor & Events
-- REPLACE Birthday Designs with 16 Real Birthday Photos
-- Run this in your Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_birthday_id uuid;
BEGIN
  SELECT id INTO v_birthday_id FROM public.categories WHERE name = 'Birthday' LIMIT 1;

  IF v_birthday_id IS NULL THEN
    RAISE EXCEPTION 'Birthday category not found. Aborting.';
  END IF;

  -- Step 1: Remove all existing Birthday designs
  DELETE FROM public.designs WHERE category_id = v_birthday_id;

  -- Step 2: Insert 16 new Birthday designs
  INSERT INTO public.designs (title, description, category_id, image_url, price, inclusions, status)
  VALUES
    (
      'Purple Butterfly First Birthday',
      'A dreamy purple butterfly-themed setup featuring a full shimmer sequin wall, cascading purple, white and gold balloon garland, large butterfly cutouts, and a glowing Happy Birthday neon sign. Perfect for a little girl turning one.',
      v_birthday_id,
      '/assets/birthday-01.jpeg',
      35000,
      'Purple & Gold Balloon Garland, Shimmer Sequin Wall, Neon Happy Birthday Sign, Giant Butterfly Cutouts, Custom Printed Backdrop',
      'published'
    ),
    (
      'Black & Gold Legend Retirement Celebration',
      'An elegant black, gold and white balloon arch with hanging Edison bulb droplets and a bold custom calligraphy backdrop. Ideal for milestone birthday and retirement celebrations.',
      v_birthday_id,
      '/assets/birthday-02.jpeg',
      30000,
      'Black & Gold Balloon Arch, Edison Bulb Droplets, Custom Calligraphy Backdrop, Stage Floral Border, Ambient Spotlights',
      'published'
    ),
    (
      'Teddy Bear First Birthday Party',
      'A warm and playful first birthday setup with a green artificial hedge wall, glittering gold sequin panel, organic balloon garland in brown, peach and white tones, LED number 1, and a teddy bear custom backdrop.',
      v_birthday_id,
      '/assets/birthday-03.jpeg',
      28000,
      'Artificial Hedge Wall, Gold Sequin Panel, Organic Balloon Garland, LED Number Display, Custom Teddy Backdrop, Stage Grass Mat',
      'published'
    ),
    (
      'Blue Hot Air Balloon First Birthday',
      'A premium sky-blue first birthday stage with a sculpted balloon arch, custom hot air balloon props, a giant illuminated number 1, oversized teddy bears, and a tiered dessert display. Perfect for baby boys.',
      v_birthday_id,
      '/assets/birthday-04.jpeg',
      45000,
      'Full Balloon Arch, Hot Air Balloon Props, LED Number 1, Giant Teddy Bears, Tiered Cake Display, Floral Stage Border',
      'published'
    ),
    (
      'Boho Teddy Garden First Birthday',
      'A charming boho-style setup with a glitter shimmer panel, green hedge arch, warm Edison bulb string lights, an organic peach and white balloon garland, a giant teddy bear, and personalised name blocks.',
      v_birthday_id,
      '/assets/birthday-06.jpeg',
      38000,
      'Gold Shimmer Wall, Hedge Arch, Organic Balloon Garland, LED Name Blocks, Giant Teddy Bear, Custom Printed Backdrop',
      'published'
    ),
    (
      'Fairy Princess Butterfly Birthday',
      'A grand purple and gold butterfly-fairy stage with large illuminated marquee name letters, shimmering butterfly wings, princess character cutouts, gold arch frames, and a vibrant shimmer wall backdrop.',
      v_birthday_id,
      '/assets/birthday-07.jpeg',
      50000,
      'Illuminated Marquee Name Letters, Shimmer Butterfly Wings, Princess Character Cutouts, Gold Arch Frames, Custom Backdrop, Flower Pedestals',
      'published'
    ),
    (
      'Jungle Safari First Birthday',
      'A lively jungle safari themed birthday featuring green and gold balloon arches, a grass wall backdrop, wild animal cutouts including tiger, lion and giraffe, printed animal cylinders, and milestone photo boards.',
      v_birthday_id,
      '/assets/birthday-08.jpeg',
      42000,
      'Green & Gold Balloon Arch, Grass Wall Backdrop, Animal Character Cutouts, Printed Cylinder Pedestals, Milestone Photo Board, Stage Carpet',
      'published'
    ),
    (
      'Purple Butterfly Marquee Name Setup',
      'A sophisticated purple and yellow butterfly birthday with large wooden marquee name letters, butterfly wing props, a custom printed backdrop, and soft balloon garland draping.',
      v_birthday_id,
      '/assets/birthday-09.jpeg',
      32000,
      'Marquee Name Letters, Butterfly Wing Props, Purple & Gold Balloon Garland, Custom Printed Backdrop, LED Number, Floral Floor Border',
      'published'
    ),
    (
      'Blue Butterfly Marquee Birthday Stage',
      'An elegant blue and white butterfly birthday setup with giant illuminated name letters, honeycomb-pattern backdrop, deep blue and white balloon arch spanning the full stage width, and vintage-style props.',
      v_birthday_id,
      '/assets/birthday-10.jpeg',
      48000,
      'Giant LED Marquee Letters, Full-Width Balloon Arch, Honeycomb Backdrop Panel, Butterfly Cutouts, Cake Display Table, Vintage Photo Props',
      'published'
    ),
    (
      'Wild One Safari Birthday Outdoor',
      'A fresh outdoor safari setup with a sage green and gold balloon garland, arched green hedge panel, and adorable jungle animal cutouts including giraffe, lion and zebra on a custom backdrop.',
      v_birthday_id,
      '/assets/birthday-11.jpeg',
      35000,
      'Outdoor Balloon Arch, Green Hedge Panel, Safari Animal Cutouts, Custom Wild One Backdrop, Stage Grass Mat',
      'published'
    ),
    (
      'Fairy Butterfly Princess Stage',
      'A vibrant pink and purple butterfly birthday stage with large pink butterfly frame panels, a printed princess character backdrop, balloon columns and a lit cake pedestal centrepiece.',
      v_birthday_id,
      '/assets/birthday-12.jpeg',
      36000,
      'Pink Butterfly Frame Panels, Princess Character Backdrop, Balloon Columns, Lit Cake Pedestal, Stage Skirting, Welcome Board',
      'published'
    ),
    (
      'Baby Boss Blue & Gold Birthday',
      'A bold Baby Boss themed first birthday with a dramatic blue and gold balloon arch, Baby Boss character cutouts, illuminated BAB letter blocks, a sequin shimmer wall and striped patterned backdrop panels.',
      v_birthday_id,
      '/assets/birthday-13.jpeg',
      40000,
      'Blue & Gold Balloon Arch, Baby Boss Character Cutouts, LED Letter Blocks, Shimmer Sequin Wall, Patterned Backdrop Panels, Cake Tables',
      'published'
    ),
    (
      'Rustic Outdoor Teddy Bear Birthday',
      'A magical outdoor evening setup featuring a rustic wooden pallet wall with Edison bulb string lights, a giant ONE marquee, a green hedge panel, organic balloon garlands in terracotta and teal, and illuminated arch frames.',
      v_birthday_id,
      '/assets/birthday-14.jpeg',
      44000,
      'Rustic Pallet Wall, Edison String Lights, Giant ONE Marquee, Hedge Panel, Organic Balloon Garland, LED Arch Frame, Teddy Bear Props',
      'published'
    ),
    (
      'Rainbow Unicorn Birthday',
      'A magical rainbow unicorn party with multicolour balloon columns, a printed unicorn rainbow backdrop, a draped white dessert table and a glowing number 5 balloon. Full of colour and fantasy for little ones.',
      v_birthday_id,
      '/assets/birthday-15.jpeg',
      26000,
      'Rainbow Balloon Columns, Unicorn Rainbow Backdrop, White Draped Dessert Table, Number Balloon, Coloured Stage Lighting',
      'published'
    ),
    (
      'Jungle Safari Marquee Grand Birthday',
      'A grand outdoor safari birthday with a full gold and green balloon garland, a premium round mirror disc, safari animal cutouts and backdrop panels, illuminated name marquee letters, and a royal crown cake pedestal.',
      v_birthday_id,
      '/assets/birthday-16.jpeg',
      52000,
      'Gold & Green Balloon Garland, Mirror Disc Backdrop, Safari Animal Cutouts, Illuminated Name Marquee, Crown Cake Pedestal, Outdoor Stage Setup',
      'published'
    );

END $$;
