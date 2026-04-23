-- Romanian symptom ontology matching checkbox labels in intake form

INSERT INTO symptoms (id, name, code, description, body_system) VALUES

-- General symptoms (GENERAL_SYMPTOMS_LIST)
('a1000001-0000-0000-0000-000000000001', 'Febră', 'RO-SYM-001', 'Temperatură corporală ridicată peste 38°C', 'General'),
('a1000001-0000-0000-0000-000000000002', 'Frisoane', 'RO-SYM-002', 'Tremurături și senzație de frig', 'General'),
('a1000001-0000-0000-0000-000000000003', 'Oboseală extremă', 'RO-SYM-003', 'Epuizare severă și lipsă de energie', 'General'),
('a1000001-0000-0000-0000-000000000004', 'Amețeală', 'RO-SYM-004', 'Senzație de rotire sau dezechilibru', 'Neurological'),
('a1000001-0000-0000-0000-000000000005', 'Greață', 'RO-SYM-005', 'Senzație de vomă', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000006', 'Pierdere în greutate', 'RO-SYM-006', 'Scădere involuntară în greutate', 'General'),
('a1000001-0000-0000-0000-000000000007', 'Lipsa poftei de mâncare', 'RO-SYM-007', 'Anorexie sau apetit redus', 'General'),

-- Cap / față
('a1000001-0000-0000-0000-000000000010', 'Durere de cap', 'RO-SYM-010', 'Durere sau disconfort în zona capului', 'Neurological'),
('a1000001-0000-0000-0000-000000000011', 'Vedere încețoșată', 'RO-SYM-011', 'Dificultate de a vedea clar', 'Neurological'),
('a1000001-0000-0000-0000-000000000012', 'Sensibilitate la lumină', 'RO-SYM-012', 'Fotofobie sau durere la expunerea la lumină', 'Neurological'),
('a1000001-0000-0000-0000-000000000013', 'Nas înfundat', 'RO-SYM-013', 'Obstrucție nazală', 'Respiratory'),
('a1000001-0000-0000-0000-000000000014', 'Secreții nazale', 'RO-SYM-014', 'Rinoree sau scurgeri nazale', 'Respiratory'),
('a1000001-0000-0000-0000-000000000015', 'Durere de sinusuri', 'RO-SYM-015', 'Durere în zona sinusurilor faciale', 'Respiratory'),
('a1000001-0000-0000-0000-000000000016', 'Durere de ureche', 'RO-SYM-016', 'Otalgie sau durere în ureche', 'ENT'),
('a1000001-0000-0000-0000-000000000017', 'Țiuit în urechi', 'RO-SYM-017', 'Tinitus sau zgomot în urechi', 'ENT'),
('a1000001-0000-0000-0000-000000000018', 'Umflare a feței', 'RO-SYM-018', 'Edem facial', 'General'),

-- Gât
('a1000001-0000-0000-0000-000000000020', 'Durere în gât', 'RO-SYM-020', 'Durere sau iritație a gâtului', 'Respiratory'),
('a1000001-0000-0000-0000-000000000021', 'Dificultate la înghițire', 'RO-SYM-021', 'Disfagie sau durere la înghițire', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000022', 'Voce răgușită', 'RO-SYM-022', 'Disfonie sau modificarea vocii', 'Respiratory'),
('a1000001-0000-0000-0000-000000000023', 'Ganglioni inflamați', 'RO-SYM-023', 'Limfadenopatie cervicală', 'Immunological'),
('a1000001-0000-0000-0000-000000000024', 'Senzație de nod în gât', 'RO-SYM-024', 'Globus faringian sau senzație de presiune', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000025', 'Tuse', 'RO-SYM-025', 'Reflex de curățare a căilor respiratorii', 'Respiratory'),
('a1000001-0000-0000-0000-000000000026', 'Umflare a gâtului', 'RO-SYM-026', 'Edem cervical', 'General'),

-- Piept / inimă
('a1000001-0000-0000-0000-000000000030', 'Durere în piept', 'RO-SYM-030', 'Disconfort sau durere în zona toracică', 'Cardiovascular'),
('a1000001-0000-0000-0000-000000000031', 'Presiune în piept', 'RO-SYM-031', 'Senzație de greutate sau presiune toracică', 'Cardiovascular'),
('a1000001-0000-0000-0000-000000000032', 'Respirație dificilă', 'RO-SYM-032', 'Dispnee sau dificultate la respirat', 'Respiratory'),
('a1000001-0000-0000-0000-000000000033', 'Bătăi rapide ale inimii', 'RO-SYM-033', 'Tahicardie sau palpitații rapide', 'Cardiovascular'),
('a1000001-0000-0000-0000-000000000034', 'Bătăi neregulate ale inimii', 'RO-SYM-034', 'Aritmie sau palpitații neregulate', 'Cardiovascular'),
('a1000001-0000-0000-0000-000000000035', 'Tuse cu sânge', 'RO-SYM-035', 'Hemoptizie', 'Respiratory'),
('a1000001-0000-0000-0000-000000000036', 'Durere care merge spre braț sau maxilar', 'RO-SYM-036', 'Iradiere a durerii caracteristică infarctului', 'Cardiovascular'),

-- Abdomen / stomac
('a1000001-0000-0000-0000-000000000040', 'Durere abdominală', 'RO-SYM-040', 'Durere sau disconfort abdominal', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000041', 'Vărsături', 'RO-SYM-041', 'Eliminarea conținutului gastric pe gură', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000042', 'Diaree', 'RO-SYM-042', 'Scaune frecvente și apoase', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000043', 'Constipație', 'RO-SYM-043', 'Dificultate la defecație sau scaune rare', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000044', 'Balonare', 'RO-SYM-044', 'Senzație de distensie abdominală', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000045', 'Arsuri la stomac', 'RO-SYM-045', 'Pirozis sau reflux gastroesofagian', 'Gastrointestinal'),
('a1000001-0000-0000-0000-000000000046', 'Sânge în scaun', 'RO-SYM-046', 'Rectoragie sau melenă', 'Gastrointestinal'),

-- Spate
('a1000001-0000-0000-0000-000000000050', 'Durere lombară', 'RO-SYM-050', 'Durere în zona lombară a spatelui', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000051', 'Durere în partea superioară a spatelui', 'RO-SYM-051', 'Durere toracică posterioară', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000052', 'Durere care coboară pe picior', 'RO-SYM-052', 'Sciatică sau iradiere pe membrul inferior', 'Neurological'),
('a1000001-0000-0000-0000-000000000053', 'Amorțeală', 'RO-SYM-053', 'Senzație de amorțeală sau furnicături', 'Neurological'),
('a1000001-0000-0000-0000-000000000054', 'Slăbiciune musculară', 'RO-SYM-054', 'Forță musculară redusă', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000055', 'Rigiditate', 'RO-SYM-055', 'Rigiditate articulară sau musculară', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000056', 'Dificultate la mișcare', 'RO-SYM-056', 'Limitarea amplitudinii de mișcare', 'Musculoskeletal'),

-- Brațe / umeri / mâini
('a1000001-0000-0000-0000-000000000060', 'Durere în umăr', 'RO-SYM-060', 'Durere sau disconfort la nivelul umărului', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000061', 'Durere în braț', 'RO-SYM-061', 'Durere la nivelul membrului superior', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000062', 'Durere în mână', 'RO-SYM-062', 'Durere la nivelul mâinii sau încheieturii', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000063', 'Furnicături', 'RO-SYM-063', 'Parestezii sau senzații de înțepături', 'Neurological'),
('a1000001-0000-0000-0000-000000000064', 'Umflare', 'RO-SYM-064', 'Edem sau umflătură localizată', 'General'),

-- Picioare / genunchi / tălpi
('a1000001-0000-0000-0000-000000000070', 'Durere în picior', 'RO-SYM-070', 'Durere la nivelul membrului inferior', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000071', 'Durere în genunchi', 'RO-SYM-071', 'Gonalgie sau durere la nivelul genunchiului', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000072', 'Crampe', 'RO-SYM-072', 'Contracții musculare involuntare și dureroase', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000073', 'Slăbiciune', 'RO-SYM-073', 'Slăbiciune generalizată a membrelor inferioare', 'Musculoskeletal'),
('a1000001-0000-0000-0000-000000000074', 'Dificultate la mers', 'RO-SYM-074', 'Dificultate de locomoție sau claudicație', 'Musculoskeletal'),

-- Piele
('a1000001-0000-0000-0000-000000000080', 'Erupție pe piele', 'RO-SYM-080', 'Rash sau erupție cutanată', 'Dermatological'),
('a1000001-0000-0000-0000-000000000081', 'Mâncărime', 'RO-SYM-081', 'Prurit sau mâncărime cutanată', 'Dermatological'),
('a1000001-0000-0000-0000-000000000082', 'Roșeață', 'RO-SYM-082', 'Eritem sau roșeață a pielii', 'Dermatological'),
('a1000001-0000-0000-0000-000000000083', 'Leziuni sau răni', 'RO-SYM-083', 'Leziuni, ulcerații sau răni cutanate', 'Dermatological'),
('a1000001-0000-0000-0000-000000000084', 'Piele uscată', 'RO-SYM-084', 'Xerodermie sau piele foarte uscată', 'Dermatological'),
('a1000001-0000-0000-0000-000000000085', 'Schimbări ale unei alunițe', 'RO-SYM-085', 'Modificări ale nevi sau alunițe suspecte', 'Dermatological'),

-- Organe urinare / genitale
('a1000001-0000-0000-0000-000000000090', 'Durere la urinare', 'RO-SYM-090', 'Disurie sau durere/arsură la urinare', 'Urological'),
('a1000001-0000-0000-0000-000000000091', 'Urinare frecventă', 'RO-SYM-091', 'Polakiurie sau urinare frecventă', 'Urological'),
('a1000001-0000-0000-0000-000000000092', 'Sânge în urină', 'RO-SYM-092', 'Hematurie', 'Urological'),
('a1000001-0000-0000-0000-000000000093', 'Dificultate la urinare', 'RO-SYM-093', 'Disurie obstructivă sau retenție urinară', 'Urological'),
('a1000001-0000-0000-0000-000000000094', 'Durere în zona genitală', 'RO-SYM-094', 'Durere pelvină sau genitală', 'Urological'),
('a1000001-0000-0000-0000-000000000095', 'Secreții anormale', 'RO-SYM-095', 'Secreții vaginale sau uretrale anormale', 'Urological'),
('a1000001-0000-0000-0000-000000000096', 'Mâncărime genitală', 'RO-SYM-096', 'Prurit genital', 'Urological'),
('a1000001-0000-0000-0000-000000000097', 'Durere în zona pelvisului', 'RO-SYM-097', 'Durere pelvină difuză', 'Urological'),

-- Stare generală
('a1000001-0000-0000-0000-000000000100', 'Oboseală', 'RO-SYM-100', 'Oboseală generalizată și lipsă de energie', 'General'),
('a1000001-0000-0000-0000-000000000101', 'Transpirații excesive', 'RO-SYM-101', 'Hiperhidroză sau transpirații nocturne', 'General'),
('a1000001-0000-0000-0000-000000000102', 'Dureri musculare', 'RO-SYM-102', 'Mialgii sau dureri musculare difuze', 'Musculoskeletal');

-- Romanian diseases with ICD-10 codes
INSERT INTO diseases (id, name, icd10_code, description, category) VALUES
('b2000001-0000-0000-0000-000000000001', 'Gripă', 'J11', 'Infecție virală respiratorie acută', 'Infecțioasă'),
('b2000001-0000-0000-0000-000000000002', 'Răceală comună', 'J00', 'Infecție virală a căilor respiratorii superioare', 'Infecțioasă'),
('b2000001-0000-0000-0000-000000000003', 'Migrenă', 'G43', 'Cefalee recurentă de intensitate moderată-severă', 'Neurologică'),
('b2000001-0000-0000-0000-000000000004', 'Sinuzită', 'J32', 'Inflamația sinusurilor paranazale', 'Respiratorie'),
('b2000001-0000-0000-0000-000000000005', 'Faringită', 'J02', 'Inflamația faringelui', 'Respiratorie'),
('b2000001-0000-0000-0000-000000000006', 'Gastrită', 'K29', 'Inflamația mucoasei gastrice', 'Gastrointestinală'),
('b2000001-0000-0000-0000-000000000007', 'Infecție urinară', 'N39.0', 'Infecție bacteriană a tractului urinar', 'Urologică'),
('b2000001-0000-0000-0000-000000000008', 'Lombalgie', 'M54.5', 'Durere lombară acută sau cronică', 'Musculo-scheletală'),
('b2000001-0000-0000-0000-000000000009', 'Bronșită acută', 'J20', 'Inflamația acută a bronhiilor', 'Respiratorie'),
('b2000001-0000-0000-0000-000000000010', 'Pneumonie', 'J18', 'Infecție pulmonară acută', 'Respiratorie'),
('b2000001-0000-0000-0000-000000000011', 'Hipertensiune arterială', 'I10', 'Tensiune arterială crescută cronic', 'Cardiovasculară'),
('b2000001-0000-0000-0000-000000000012', 'Alergie respiratorie', 'J30', 'Rinită alergică sau rinoconjunctivită', 'Alergologică'),
('b2000001-0000-0000-0000-000000000013', 'Dermatită', 'L30', 'Inflamație cutanată nespecifică', 'Dermatologică'),
('b2000001-0000-0000-0000-000000000014', 'Anxietate', 'F41', 'Tulburare de anxietate generalizată', 'Psihiatrică'),
('b2000001-0000-0000-0000-000000000015', 'Gastroenterită', 'A09', 'Inflamație gastrointestinală acută', 'Gastrointestinală');

-- Disease-symptom links
INSERT INTO disease_symptom_links (disease_id, symptom_id, probability, is_pathognomonic) VALUES

-- Gripă
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 0.95, true),   -- Febră
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000003', 0.90, false),  -- Oboseală extremă
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000025', 0.85, false),  -- Tuse
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000010', 0.75, false),  -- Durere de cap
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000102', 0.80, false),  -- Dureri musculare
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000002', 0.70, false),  -- Frisoane
('b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000020', 0.65, false),  -- Durere în gât

-- Răceală comună
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000014', 0.90, false),  -- Secreții nazale
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000013', 0.85, false),  -- Nas înfundat
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000025', 0.80, false),  -- Tuse
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000020', 0.75, false),  -- Durere în gât
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000010', 0.60, false),  -- Durere de cap
('b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 0.40, false),  -- Febră (rar)

-- Migrenă
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000010', 0.99, true),   -- Durere de cap
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000005', 0.80, false),  -- Greață
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000012', 0.75, false),  -- Sensibilitate la lumină
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000041', 0.60, false),  -- Vărsături
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000011', 0.55, false),  -- Vedere încețoșată
('b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000004', 0.50, false),  -- Amețeală

-- Sinuzită
('b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000015', 0.92, true),   -- Durere de sinusuri
('b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000013', 0.85, false),  -- Nas înfundat
('b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000014', 0.80, false),  -- Secreții nazale
('b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000010', 0.70, false),  -- Durere de cap
('b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000001', 0.55, false),  -- Febră

-- Faringită
('b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000020', 0.95, true),   -- Durere în gât
('b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000021', 0.75, false),  -- Dificultate la înghițire
('b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000023', 0.70, false),  -- Ganglioni inflamați
('b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000001', 0.65, false),  -- Febră
('b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000022', 0.60, false),  -- Voce răgușită

-- Gastrită
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000045', 0.88, true),   -- Arsuri la stomac
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000040', 0.85, false),  -- Durere abdominală
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000005', 0.70, false),  -- Greață
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000041', 0.60, false),  -- Vărsături
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000044', 0.65, false),  -- Balonare
('b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000007', 0.55, false),  -- Lipsa poftei de mâncare

-- Infecție urinară
('b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000090', 0.95, true),   -- Durere la urinare
('b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000091', 0.90, false),  -- Urinare frecventă
('b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000092', 0.60, false),  -- Sânge în urină
('b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000040', 0.55, false),  -- Durere abdominală
('b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000001', 0.50, false),  -- Febră

-- Lombalgie
('b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000050', 0.99, true),   -- Durere lombară
('b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000052', 0.65, false),  -- Durere care coboară pe picior
('b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000053', 0.55, false),  -- Amorțeală
('b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000056', 0.70, false),  -- Dificultate la mișcare
('b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000055', 0.60, false),  -- Rigiditate

-- Bronșită acută
('b2000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000025', 0.95, true),   -- Tuse
('b2000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000032', 0.75, false),  -- Respirație dificilă
('b2000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000001', 0.60, false),  -- Febră
('b2000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000030', 0.55, false),  -- Durere în piept
('b2000001-0000-0000-0000-000000000009', 'a1000001-0000-0000-0000-000000000003', 0.65, false),  -- Oboseală extremă

-- Pneumonie
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000001', 0.90, false),  -- Febră
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000025', 0.85, false),  -- Tuse
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000032', 0.85, true),   -- Respirație dificilă
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000030', 0.75, false),  -- Durere în piept
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000003', 0.80, false),  -- Oboseală extremă
('b2000001-0000-0000-0000-000000000010', 'a1000001-0000-0000-0000-000000000002', 0.70, false),  -- Frisoane

-- Hipertensiune arterială
('b2000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000010', 0.70, false),  -- Durere de cap
('b2000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000004', 0.65, false),  -- Amețeală
('b2000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000011', 0.55, false),  -- Vedere încețoșată
('b2000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000030', 0.50, false),  -- Durere în piept
('b2000001-0000-0000-0000-000000000011', 'a1000001-0000-0000-0000-000000000033', 0.55, false),  -- Bătăi rapide ale inimii

-- Alergie respiratorie
('b2000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000014', 0.90, false),  -- Secreții nazale
('b2000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000013', 0.85, false),  -- Nas înfundat
('b2000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000081', 0.70, false),  -- Mâncărime
('b2000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000025', 0.65, false),  -- Tuse
('b2000001-0000-0000-0000-000000000012', 'a1000001-0000-0000-0000-000000000080', 0.55, false),  -- Erupție pe piele

-- Dermatită
('b2000001-0000-0000-0000-000000000013', 'a1000001-0000-0000-0000-000000000080', 0.90, true),   -- Erupție pe piele
('b2000001-0000-0000-0000-000000000013', 'a1000001-0000-0000-0000-000000000081', 0.88, false),  -- Mâncărime
('b2000001-0000-0000-0000-000000000013', 'a1000001-0000-0000-0000-000000000082', 0.80, false),  -- Roșeață
('b2000001-0000-0000-0000-000000000013', 'a1000001-0000-0000-0000-000000000084', 0.65, false),  -- Piele uscată

-- Anxietate
('b2000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000100', 0.85, false),  -- Oboseală
('b2000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000033', 0.75, false),  -- Bătăi rapide ale inimii
('b2000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000004', 0.70, false),  -- Amețeală
('b2000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000101', 0.65, false),  -- Transpirații excesive
('b2000001-0000-0000-0000-000000000014', 'a1000001-0000-0000-0000-000000000032', 0.60, false),  -- Respirație dificilă

-- Gastroenterită
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000042', 0.92, true),   -- Diaree
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000041', 0.88, false),  -- Vărsături
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000040', 0.80, false),  -- Durere abdominală
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000005', 0.75, false),  -- Greață
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000001', 0.60, false),  -- Febră
('b2000001-0000-0000-0000-000000000015', 'a1000001-0000-0000-0000-000000000003', 0.65, false);  -- Oboseală extremă
