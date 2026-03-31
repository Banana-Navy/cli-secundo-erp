-- ============================================================
-- ERP Secundo — Seed Demo Data
-- Run this in the Supabase SQL Editor AFTER migration.sql
-- Generates realistic data for client presentations
-- ============================================================

-- ---------- Clients (Belgian buyers interested in Spain) ----------

INSERT INTO clients (id, first_name, last_name, email, phone, address, city, country, notes, status, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Marc', 'Vandenberghe', 'marc.vandenberghe@gmail.com', '+32 475 12 34 56', 'Rue de la Loi 42', 'Bruxelles', 'Belgique', 'Cherche villa avec vue mer, budget max 450k. Retraité depuis 2025, veut s''installer à Alicante.', 'actif', now() - interval '45 days'),
  ('a0000001-0000-0000-0000-000000000002', 'Sophie', 'Leclercq', 'sophie.leclercq@outlook.be', '+32 486 23 45 67', 'Avenue Louise 180', 'Bruxelles', 'Belgique', 'Investisseuse, cherche appartement locatif sur la Costa Blanca. Budget 150-200k.', 'actif', now() - interval '30 days'),
  ('a0000001-0000-0000-0000-000000000003', 'Jean-Pierre', 'Dubois', 'jp.dubois@proximus.be', '+32 477 34 56 78', 'Chaussée de Waterloo 15', 'Waterloo', 'Belgique', 'Couple retraité, cherche maison mitoyenne à Torrevieja. Maximum 280k.', 'actif', now() - interval '60 days'),
  ('a0000001-0000-0000-0000-000000000004', 'Nathalie', 'Claessens', 'n.claessens@telenet.be', '+32 496 45 67 89', 'Meir 78', 'Anvers', 'Belgique', 'Première visite prévue en avril. Intéressée par des appartements neufs à Benidorm.', 'prospect', now() - interval '10 days'),
  ('a0000001-0000-0000-0000-000000000005', 'Philippe', 'Hermans', 'philippe.hermans@gmail.com', '+32 478 56 78 90', 'Korenmarkt 5', 'Gand', 'Belgique', 'Client fidèle, a déjà acheté un appartement en 2024. Cherche une 2e résidence.', 'actif', now() - interval '90 days'),
  ('a0000001-0000-0000-0000-000000000006', 'Isabelle', 'Fontaine', 'isabelle.fontaine@skynet.be', '+32 479 67 89 01', 'Place du Marché 12', 'Liège', 'Belgique', 'Budget limité ~120k, cherche studio ou petit appartement. Premier achat à l''étranger.', 'prospect', now() - interval '5 days'),
  ('a0000001-0000-0000-0000-000000000007', 'Thomas', 'Peeters', 'thomas.peeters@hotmail.com', '+32 485 78 90 12', 'Bondgenotenlaan 34', 'Louvain', 'Belgique', 'Jeune couple avec enfants, cherche villa avec piscine dans la région de Murcie.', 'actif', now() - interval '20 days'),
  ('a0000001-0000-0000-0000-000000000008', 'Catherine', 'Willems', 'c.willems@gmail.com', '+32 497 89 01 23', 'Rue Neuve 90', 'Namur', 'Belgique', 'Vendeuse — propriétaire d''un bien à Orihuela Costa, souhaite vendre.', 'inactif', now() - interval '120 days')
ON CONFLICT (id) DO NOTHING;

-- ---------- Properties (Spanish coastal properties) ----------

INSERT INTO properties (id, title, description, price, surface, rooms, bedrooms, bathrooms, property_type, condition, status, location_city, location_region, location_address, latitude, longitude, features, year_built, energy_rating, slug_fr, reference, published, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001',
   'Villa Méditerranée avec Piscine',
   'Superbe villa de 4 chambres avec piscine privée, terrasse panoramique et vue dégagée sur la mer. Quartier calme et résidentiel, à 10 minutes de la plage. Cuisine équipée, salon spacieux avec cheminée, double garage.',
   385000, 220, 6, 4, 3, 'villa', 'bon_etat', 'disponible',
   'Alicante', 'Costa Blanca', 'Calle del Sol 15, Alicante',
   38.3452, -0.4810,
   '{"piscine": true, "garage": true, "terrasse": true, "jardin": true, "climatisation": true, "vue_mer": true}',
   2015, 'B', 'villa-mediterranee-piscine-alicante', 'SEC-0001', true,
   now() - interval '40 days'),

  ('b0000001-0000-0000-0000-000000000002',
   'Appartement Vue Mer Benidorm',
   'Bel appartement de 2 chambres en front de mer avec balcon offrant une vue imprenable. Résidence avec piscine communautaire, salle de sport et parking souterrain. Proche de toutes commodités.',
   189000, 85, 3, 2, 1, 'appartement', 'neuf', 'disponible',
   'Benidorm', 'Costa Blanca', 'Avenida del Mediterráneo 42, Benidorm',
   38.5410, -0.1300,
   '{"terrasse": true, "climatisation": true, "ascenseur": true, "parking": true, "vue_mer": true, "piscine": true}',
   2024, 'A', 'appartement-vue-mer-benidorm', 'SEC-0002', true,
   now() - interval '25 days'),

  ('b0000001-0000-0000-0000-000000000003',
   'Maison Mitoyenne Torrevieja',
   'Charmante maison mitoyenne de 3 chambres avec solarium, jardin privatif et place de parking. Quartier résidentiel à 5 minutes des plages et du centre commercial Habaneras. Idéal pour famille ou investissement.',
   245000, 130, 5, 3, 2, 'maison', 'renove', 'disponible',
   'Torrevieja', 'Costa Blanca', 'Calle de la Paz 8, Torrevieja',
   37.9786, -0.6823,
   '{"terrasse": true, "jardin": true, "climatisation": true, "parking": true, "chauffage": true}',
   2008, 'C', 'maison-mitoyenne-torrevieja', 'SEC-0003', true,
   now() - interval '50 days'),

  ('b0000001-0000-0000-0000-000000000004',
   'Penthouse Luxe Marbella',
   'Exceptionnel penthouse de 3 chambres avec terrasse de 80m² et jacuzzi privatif. Vue panoramique sur la mer et la montagne. Résidence de standing avec conciergerie, piscine à débordement et salle de cinéma.',
   695000, 175, 5, 3, 3, 'appartement', 'neuf', 'reserve',
   'Marbella', 'Costa del Sol', 'Paseo Marítimo 22, Marbella',
   36.5099, -4.8862,
   '{"piscine": true, "terrasse": true, "climatisation": true, "ascenseur": true, "parking": true, "vue_mer": true, "meuble": true}',
   2025, 'A', 'penthouse-luxe-marbella', 'SEC-0004', true,
   now() - interval '15 days'),

  ('b0000001-0000-0000-0000-000000000005',
   'Studio Rénové Centre Alicante',
   'Studio entièrement rénové au cœur d''Alicante. Parfait pour investissement locatif ou pied-à-terre. À 200m de la plage du Postiguet et du port.',
   115000, 42, 1, 0, 1, 'appartement', 'renove', 'disponible',
   'Alicante', 'Costa Blanca', 'Calle Mayor 30, Alicante',
   38.3460, -0.4835,
   '{"climatisation": true, "ascenseur": true, "meuble": true}',
   1998, 'D', 'studio-renove-centre-alicante', 'SEC-0005', true,
   now() - interval '35 days'),

  ('b0000001-0000-0000-0000-000000000006',
   'Villa Moderne Murcie Golf',
   'Villa contemporaine de 3 chambres à côté du golf de La Manga. Piscine privée, jardin paysager, cuisine moderne ouverte. Finitions haut de gamme, domotique intégrée.',
   420000, 200, 5, 3, 2, 'villa', 'neuf', 'disponible',
   'Murcie', 'Costa Cálida', 'Calle del Golf 7, La Manga del Mar Menor',
   37.6348, -0.7159,
   '{"piscine": true, "garage": true, "terrasse": true, "jardin": true, "climatisation": true, "chauffage": true}',
   2025, 'A', 'villa-moderne-murcie-golf', 'SEC-0006', true,
   now() - interval '12 days'),

  ('b0000001-0000-0000-0000-000000000007',
   'Appartement Orihuela Costa',
   'Appartement lumineux de 2 chambres dans résidence sécurisée avec piscine. Proche de Zenia Boulevard et des plages de sable blanc. Parking inclus.',
   168000, 78, 3, 2, 1, 'appartement', 'bon_etat', 'vendu',
   'Orihuela Costa', 'Costa Blanca', 'Calle Jazmín 14, Orihuela Costa',
   37.9330, -0.7380,
   '{"piscine": true, "terrasse": true, "climatisation": true, "parking": true}',
   2012, 'C', 'appartement-orihuela-costa', 'SEC-0007', false,
   now() - interval '80 days'),

  ('b0000001-0000-0000-0000-000000000008',
   'Terrain Constructible Calpe',
   'Terrain de 800m² avec permis de construire approuvé et vue mer. Orientation sud, accès facile, toutes connexions disponibles (eau, électricité, fibre).',
   195000, 800, 0, 0, 0, 'terrain', 'neuf', 'disponible',
   'Calpe', 'Costa Blanca', 'Partida Maryvilla, Calpe',
   38.6445, 0.0455,
   '{"vue_mer": true}',
   null, '', 'terrain-constructible-calpe', 'SEC-0008', true,
   now() - interval '20 days')
ON CONFLICT (id) DO NOTHING;

-- ---------- Contact Interactions ----------

INSERT INTO contacts (id, client_id, type, subject, content, date, created_at)
VALUES
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000001', 'appel', 'Premier contact téléphonique', 'Marc cherche une villa avec vue mer à Alicante. Budget 400-450k. Retraité, veut s''installer définitivement.', now() - interval '44 days', now() - interval '44 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000001', 'email', 'Envoi fiches biens', 'Envoi des fiches SEC-0001 et SEC-0006. Marc est très intéressé par la villa Méditerranée.', now() - interval '40 days', now() - interval '40 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000001', 'visite', 'Visite Villa Méditerranée', 'Marc a visité la villa. Très enthousiaste, aime le quartier. Demande à revenir avec sa femme.', now() - interval '30 days', now() - interval '30 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000002', 'appel', 'Demande d''informations', 'Sophie cherche un appartement locatif. Budget 150-200k, rendement minimum 5%.', now() - interval '28 days', now() - interval '28 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000002', 'email', 'Analyse rentabilité', 'Envoi analyse de rentabilité pour SEC-0002 et SEC-0005. Rendement estimé 6-7%.', now() - interval '22 days', now() - interval '22 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000003', 'visite', 'Visite Torrevieja', 'Le couple Dubois a visité 3 biens à Torrevieja. Coup de cœur pour SEC-0003.', now() - interval '20 days', now() - interval '20 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000005', 'note', 'Suivi 2e achat', 'Philippe veut une villa avec piscine comme résidence secondaire. A déjà l''appart à Orihuela.', now() - interval '15 days', now() - interval '15 days'),
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000007', 'appel', 'Premier appel', 'Thomas et sa femme cherchent une villa familiale avec piscine. 2 enfants (5 et 8 ans). Budget ~400k.', now() - interval '18 days', now() - interval '18 days')
ON CONFLICT DO NOTHING;

-- ---------- Tasks (enum: a_faire, en_cours, terminee, annulee) ----------

INSERT INTO tasks (id, title, description, status, priority, due_date, client_id, property_id, created_at)
VALUES
  (gen_random_uuid(), 'Préparer dossier de vente SEC-0001', 'Compiler photos HD, plan, certificat énergétique et compromis de vente pour la Villa Méditerranée.', 'en_cours', 'haute',
   now() + interval '2 days', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', now() - interval '5 days'),

  (gen_random_uuid(), 'Relancer Sophie Leclercq', 'Envoyer les nouvelles estimations de rendement locatif et proposer une visite virtuelle de l''appartement à Benidorm.', 'a_faire', 'normale',
   now() + interval '1 day', 'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', now() - interval '3 days'),

  (gen_random_uuid(), 'Planifier visite Nathalie Claessens', 'Organiser le déplacement à Benidorm en avril. Prévoir 3 visites : SEC-0002, un neuf en construction, et SEC-0005.', 'a_faire', 'haute',
   now() + interval '5 days', 'a0000001-0000-0000-0000-000000000004', null, now() - interval '2 days'),

  (gen_random_uuid(), 'Offre d''achat Dubois — Maison Torrevieja', 'Rédiger l''offre d''achat pour le couple Dubois sur SEC-0003. Prix négocié : 235 000€. Clause suspensive: obtention du prêt.', 'en_cours', 'urgente',
   now(), 'a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', now() - interval '1 day'),

  (gen_random_uuid(), 'Mettre à jour photos SEC-0006', 'Le photographe livre les nouvelles photos de la villa à Murcie demain. Mettre à jour l''annonce et le site web.', 'a_faire', 'normale',
   now() + interval '3 days', null, 'b0000001-0000-0000-0000-000000000006', now() - interval '1 day'),

  (gen_random_uuid(), 'Vérifier documents notaire SEC-0007', 'Vérification finale des documents pour la vente de l''appartement à Orihuela Costa. Acte prévu le 15 avril.', 'en_cours', 'haute',
   now() + interval '7 days', 'a0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007', now() - interval '10 days'),

  (gen_random_uuid(), 'Envoi newsletter avril', 'Préparer et envoyer la newsletter mensuelle avec les nouveaux biens (SEC-0004, SEC-0006, SEC-0008).', 'a_faire', 'basse',
   now() + interval '10 days', null, null, now() - interval '2 days'),

  (gen_random_uuid(), 'Appel de suivi Philippe Hermans', 'Appeler Philippe pour discuter des options villa avec piscine. Présenter SEC-0006 et nouvelles opportunités.', 'a_faire', 'normale',
   now() + interval '1 day', 'a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006', now() - interval '4 days'),

  (gen_random_uuid(), 'Rendez-vous bancaire Thomas Peeters', 'Accompagner Thomas chez CaixaBank pour la simulation de prêt hypothécaire espagnol. Apporter: NIE, justificatifs de revenus.', 'a_faire', 'haute',
   now() + interval '4 days', 'a0000001-0000-0000-0000-000000000007', null, now() - interval '3 days'),

  (gen_random_uuid(), 'Publier terrain Calpe sur portails', 'Publier SEC-0008 sur Idealista, Fotocasa et le site Secundo. Vérifier les photos drone.', 'terminee', 'normale',
   now() - interval '5 days', null, 'b0000001-0000-0000-0000-000000000008', now() - interval '15 days'),

  (gen_random_uuid(), 'Mise à jour prix marché Q1 2026', 'Analyser l''évolution des prix immobiliers sur la Costa Blanca et Costa del Sol. Rapport trimestriel à envoyer aux clients actifs.', 'terminee', 'basse',
   now() - interval '10 days', null, null, now() - interval '25 days'),

  (gen_random_uuid(), 'Répondre demande Isabelle Fontaine', 'Isabelle cherche un studio ~120k. Lui envoyer la fiche SEC-0005 et 2 autres options.', 'a_faire', 'normale',
   now() + interval '2 days', 'a0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000005', now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- ---------- Visits (Agenda) ----------
-- Columns: id, title, visit_date, duration_minutes, location, notes, status (text), client_id, property_id

INSERT INTO visits (id, title, visit_date, duration_minutes, location, notes, status, client_id, property_id, created_at)
VALUES
  (gen_random_uuid(), 'Visite Villa Méditerranée — Marc V.',
   (date_trunc('month', now()) + interval '3 days' + interval '10 hours')::timestamptz,
   90, 'Calle del Sol 15, Alicante', 'Deuxième visite avec Mme Vandenberghe. Prévoir clés et dossier complet.', 'confirmee',
   'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', now() - interval '5 days'),

  (gen_random_uuid(), 'Visite Appart Benidorm — Sophie L.',
   (date_trunc('month', now()) + interval '5 days' + interval '14 hours')::timestamptz,
   60, 'Avenida del Mediterráneo 42, Benidorm', 'Visite virtuelle puis visite sur place si intéressée.', 'planifiee',
   'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', now() - interval '3 days'),

  (gen_random_uuid(), 'Visite Maison Torrevieja — Couple Dubois',
   (date_trunc('month', now()) + interval '7 days' + interval '11 hours')::timestamptz,
   120, 'Calle de la Paz 8, Torrevieja', 'Visite finale avant offre. Le couple arrive de Belgique le matin.', 'confirmee',
   'a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', now() - interval '8 days'),

  (gen_random_uuid(), 'Discovery Tour Nathalie C. — Benidorm',
   (date_trunc('month', now()) + interval '10 days' + interval '9 hours')::timestamptz,
   240, 'Benidorm centre', 'Journée de découverte: 3 biens à visiter + déjeuner.', 'planifiee',
   'a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002', now() - interval '2 days'),

  (gen_random_uuid(), 'Visite Penthouse Marbella — Philippe H.',
   (date_trunc('month', now()) + interval '12 days' + interval '15 hours')::timestamptz,
   90, 'Paseo Marítimo 22, Marbella', 'Philippe souhaite voir le penthouse. Vol Bruxelles-Malaga le matin.', 'planifiee',
   'a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000004', now() - interval '4 days'),

  (gen_random_uuid(), 'Visite Villa Murcie — Thomas P.',
   (date_trunc('month', now()) + interval '15 days' + interval '10 hours')::timestamptz,
   120, 'Calle del Golf 7, La Manga del Mar Menor', 'Visite de la villa avec toute la famille. Tester la piscine si possible.', 'planifiee',
   'a0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000006', now() - interval '3 days'),

  (gen_random_uuid(), 'Signature Notaire — Orihuela Costa',
   (date_trunc('month', now()) + interval '17 days' + interval '10 hours')::timestamptz,
   60, 'Notaire Orihuela Costa', 'Acte de vente SEC-0007. RDV chez le notaire à 10h. Catherine Willems (vendeuse) + acheteur.', 'confirmee',
   'a0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007', now() - interval '10 days'),

  (gen_random_uuid(), 'Visite Studio Alicante — Isabelle F.',
   (date_trunc('month', now()) + interval '20 days' + interval '11 hours')::timestamptz,
   90, 'Calle Mayor 30, Alicante', 'Première visite pour Isabelle. Montrer aussi le quartier et les commodités.', 'planifiee',
   'a0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000005', now() - interval '1 day'),

  (gen_random_uuid(), 'Visite terrain Calpe — Marc V.',
   (date_trunc('month', now()) + interval '22 days' + interval '14 hours')::timestamptz,
   60, 'Partida Maryvilla, Calpe', 'Marc veut aussi voir le terrain constructible comme plan B.', 'planifiee',
   'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008', now() - interval '1 day'),

  (gen_random_uuid(), 'Visite effectuée — Appart Orihuela',
   (date_trunc('month', now()) - interval '5 days' + interval '10 hours')::timestamptz,
   60, 'Calle Jazmín 14, Orihuela Costa', 'Sophie a visité en mars. Bien aimé mais veut comparer.', 'effectuee',
   'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000007', now() - interval '20 days')
ON CONFLICT DO NOTHING;

-- ---------- Pipeline (enum: interesse, visite_planifiee, offre_faite, refuse, achete) ----------
-- Columns: id, client_id, property_id, status, note (singular), created_at

INSERT INTO client_property_interests (id, client_id, property_id, status, note, created_at)
VALUES
  -- Marc Vandenberghe: avancé sur villa Alicante
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
   'offre_faite', 'Offre verbale de 370k. En attente de la contre-offre du vendeur.', now() - interval '10 days'),

  -- Marc aussi intéressé par terrain Calpe
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000008',
   'visite_planifiee', 'Visite prévue comme alternative à la villa.', now() - interval '2 days'),

  -- Sophie: a visité Benidorm
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002',
   'visite_planifiee', 'Intéressée par le rendement locatif. Attend les chiffres finaux.', now() - interval '15 days'),

  -- Sophie: aussi intéressée par le studio Alicante
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000005',
   'interesse', 'Demande d''analyse de rentabilité envoyée.', now() - interval '10 days'),

  -- Dubois: offre sur Torrevieja
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003',
   'offre_faite', 'Offre à 235k acceptée ! En attente du financement bancaire.', now() - interval '5 days'),

  -- Nathalie: nouveau contact, intéressée par Benidorm
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002',
   'interesse', 'A demandé des infos via le site web. Premier contact à établir.', now() - interval '3 days'),

  -- Philippe: visite Marbella prévue
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000004',
   'interesse', 'Philippe veut voir le penthouse. Budget OK pour Marbella.', now() - interval '8 days'),

  -- Philippe: aussi intéressé par Murcie
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000006',
   'interesse', 'Alternative moins chère au penthouse. À présenter lors de l''appel.', now() - interval '6 days'),

  -- Isabelle: studio Alicante
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000005',
   'interesse', 'Budget serré. Vérifier possibilité de négociation.', now() - interval '2 days'),

  -- Thomas: villa Murcie
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000006',
   'visite_planifiee', 'Visite familiale planifiée. Thomas très motivé, femme à convaincre.', now() - interval '4 days'),

  -- Thomas: aussi intéressé par Villa Alicante
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000001',
   'interesse', 'Plan B si Murcie ne convient pas. Un peu au-dessus du budget.', now() - interval '1 day'),

  -- Catherine: vente Orihuela (vendu)
  (gen_random_uuid(), 'a0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000007',
   'achete', 'Vente conclue à 168 000€. Acte notarié prévu mi-avril.', now() - interval '15 days')
ON CONFLICT DO NOTHING;

-- ---------- Notifications ----------
-- Columns: id, user_id, type, title, message, href, read, created_at

INSERT INTO notifications (id, user_id, type, title, message, href, read, created_at)
SELECT
  gen_random_uuid(),
  u.id,
  n.type,
  n.title,
  n.message,
  n.href,
  n.read,
  n.created_at
FROM (SELECT id FROM auth.users LIMIT 1) u
CROSS JOIN (VALUES
  ('success', 'Nouvelle offre reçue', 'Marc Vandenberghe a fait une offre de 370 000€ sur Villa Méditerranée (SEC-0001).', '/pipeline', false, now() - interval '2 hours'),
  ('info', 'Visite confirmée', 'Le couple Dubois a confirmé la visite de la Maison Torrevieja pour le 7 avril.', '/agenda', false, now() - interval '5 hours'),
  ('success', 'Document signé', 'Le compromis de vente SEC-0003 a été signé par les deux parties.', '/documents', true, now() - interval '1 day'),
  ('info', 'Nouvelle prospect', 'Isabelle Fontaine s''est inscrite via le formulaire du site web.', '/clients', true, now() - interval '2 days'),
  ('warning', 'Rappel échéance', 'La tâche "Offre d''achat Dubois" arrive à échéance aujourd''hui.', '/taches', false, now() - interval '3 hours'),
  ('info', 'Prix mis à jour', 'Le prix de la Villa Moderne Murcie Golf a été ajusté de 440k à 420k.', '/biens', true, now() - interval '3 days'),
  ('info', 'Bienvenue sur Secundo', 'Votre compte ERP Secundo est actif. Explorez le tableau de bord pour commencer.', '/', true, now() - interval '30 days')
) AS n(type, title, message, href, read, created_at);

-- ============================================================
-- Done! Your demo environment is ready.
-- ============================================================
