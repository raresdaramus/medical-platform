-- Translate symptom names, descriptions, and codes to English

UPDATE symptoms SET name = 'Fever',                          description = 'High body temperature above 38°C',            code = 'SYM-001' WHERE id = 'a1000001-0000-0000-0000-000000000001';
UPDATE symptoms SET name = 'Chills',                         description = 'Shaking and feeling cold',                    code = 'SYM-002' WHERE id = 'a1000001-0000-0000-0000-000000000002';
UPDATE symptoms SET name = 'Extreme fatigue',                description = 'Severe exhaustion and lack of energy',        code = 'SYM-003' WHERE id = 'a1000001-0000-0000-0000-000000000003';
UPDATE symptoms SET name = 'Dizziness',                      description = 'Sensation of spinning or imbalance',          code = 'SYM-004' WHERE id = 'a1000001-0000-0000-0000-000000000004';
UPDATE symptoms SET name = 'Nausea',                         description = 'Sensation of wanting to vomit',               code = 'SYM-005' WHERE id = 'a1000001-0000-0000-0000-000000000005';
UPDATE symptoms SET name = 'Weight loss',                    description = 'Involuntary weight loss',                     code = 'SYM-006' WHERE id = 'a1000001-0000-0000-0000-000000000006';
UPDATE symptoms SET name = 'Loss of appetite',               description = 'Reduced appetite or anorexia',                code = 'SYM-007' WHERE id = 'a1000001-0000-0000-0000-000000000007';

UPDATE symptoms SET name = 'Headache',                       description = 'Pain or discomfort in the head area',         code = 'SYM-010' WHERE id = 'a1000001-0000-0000-0000-000000000010';
UPDATE symptoms SET name = 'Blurred vision',                 description = 'Difficulty seeing clearly',                   code = 'SYM-011' WHERE id = 'a1000001-0000-0000-0000-000000000011';
UPDATE symptoms SET name = 'Light sensitivity',              description = 'Photophobia or pain on light exposure',       code = 'SYM-012' WHERE id = 'a1000001-0000-0000-0000-000000000012';
UPDATE symptoms SET name = 'Nasal congestion',               description = 'Nasal obstruction',                          code = 'SYM-013' WHERE id = 'a1000001-0000-0000-0000-000000000013';
UPDATE symptoms SET name = 'Runny nose',                     description = 'Rhinorrhea or nasal discharge',               code = 'SYM-014' WHERE id = 'a1000001-0000-0000-0000-000000000014';
UPDATE symptoms SET name = 'Sinus pain',                     description = 'Pain in the facial sinus area',               code = 'SYM-015' WHERE id = 'a1000001-0000-0000-0000-000000000015';
UPDATE symptoms SET name = 'Ear pain',                       description = 'Otalgia or pain in the ear',                  code = 'SYM-016' WHERE id = 'a1000001-0000-0000-0000-000000000016';
UPDATE symptoms SET name = 'Tinnitus',                       description = 'Ringing or noise in the ears',                code = 'SYM-017' WHERE id = 'a1000001-0000-0000-0000-000000000017';
UPDATE symptoms SET name = 'Facial swelling',                description = 'Facial edema',                               code = 'SYM-018' WHERE id = 'a1000001-0000-0000-0000-000000000018';

UPDATE symptoms SET name = 'Sore throat',                    description = 'Pain or irritation of the throat',            code = 'SYM-020' WHERE id = 'a1000001-0000-0000-0000-000000000020';
UPDATE symptoms SET name = 'Difficulty swallowing',          description = 'Dysphagia or painful swallowing',             code = 'SYM-021' WHERE id = 'a1000001-0000-0000-0000-000000000021';
UPDATE symptoms SET name = 'Hoarse voice',                   description = 'Dysphonia or voice change',                   code = 'SYM-022' WHERE id = 'a1000001-0000-0000-0000-000000000022';
UPDATE symptoms SET name = 'Swollen lymph nodes',            description = 'Cervical lymphadenopathy',                    code = 'SYM-023' WHERE id = 'a1000001-0000-0000-0000-000000000023';
UPDATE symptoms SET name = 'Globus sensation',               description = 'Sensation of a lump in the throat',           code = 'SYM-024' WHERE id = 'a1000001-0000-0000-0000-000000000024';
UPDATE symptoms SET name = 'Cough',                          description = 'Airway clearing reflex',                      code = 'SYM-025' WHERE id = 'a1000001-0000-0000-0000-000000000025';
UPDATE symptoms SET name = 'Neck swelling',                  description = 'Cervical edema',                              code = 'SYM-026' WHERE id = 'a1000001-0000-0000-0000-000000000026';

UPDATE symptoms SET name = 'Chest pain',                     description = 'Discomfort or pain in the chest area',        code = 'SYM-030' WHERE id = 'a1000001-0000-0000-0000-000000000030';
UPDATE symptoms SET name = 'Chest pressure',                 description = 'Sensation of weight or pressure in chest',    code = 'SYM-031' WHERE id = 'a1000001-0000-0000-0000-000000000031';
UPDATE symptoms SET name = 'Shortness of breath',            description = 'Dyspnea or difficulty breathing',             code = 'SYM-032' WHERE id = 'a1000001-0000-0000-0000-000000000032';
UPDATE symptoms SET name = 'Rapid heartbeat',                description = 'Tachycardia or rapid palpitations',           code = 'SYM-033' WHERE id = 'a1000001-0000-0000-0000-000000000033';
UPDATE symptoms SET name = 'Irregular heartbeat',            description = 'Arrhythmia or irregular palpitations',        code = 'SYM-034' WHERE id = 'a1000001-0000-0000-0000-000000000034';
UPDATE symptoms SET name = 'Coughing up blood',              description = 'Hemoptysis',                                  code = 'SYM-035' WHERE id = 'a1000001-0000-0000-0000-000000000035';
UPDATE symptoms SET name = 'Pain radiating to arm or jaw',   description = 'Radiation typical of heart attack',           code = 'SYM-036' WHERE id = 'a1000001-0000-0000-0000-000000000036';

UPDATE symptoms SET name = 'Abdominal pain',                 description = 'Pain or discomfort in abdomen',               code = 'SYM-040' WHERE id = 'a1000001-0000-0000-0000-000000000040';
UPDATE symptoms SET name = 'Vomiting',                       description = 'Expulsion of gastric contents',               code = 'SYM-041' WHERE id = 'a1000001-0000-0000-0000-000000000041';
UPDATE symptoms SET name = 'Diarrhea',                       description = 'Frequent loose or watery stools',             code = 'SYM-042' WHERE id = 'a1000001-0000-0000-0000-000000000042';
UPDATE symptoms SET name = 'Constipation',                   description = 'Difficulty with bowel movements',             code = 'SYM-043' WHERE id = 'a1000001-0000-0000-0000-000000000043';
UPDATE symptoms SET name = 'Bloating',                       description = 'Sensation of abdominal distension',           code = 'SYM-044' WHERE id = 'a1000001-0000-0000-0000-000000000044';
UPDATE symptoms SET name = 'Heartburn',                      description = 'Pyrosis or gastroesophageal reflux',          code = 'SYM-045' WHERE id = 'a1000001-0000-0000-0000-000000000045';
UPDATE symptoms SET name = 'Blood in stool',                 description = 'Rectal bleeding or melena',                   code = 'SYM-046' WHERE id = 'a1000001-0000-0000-0000-000000000046';

UPDATE symptoms SET name = 'Lower back pain',                description = 'Pain in the lumbar area',                     code = 'SYM-050' WHERE id = 'a1000001-0000-0000-0000-000000000050';
UPDATE symptoms SET name = 'Upper back pain',                description = 'Posterior thoracic pain',                     code = 'SYM-051' WHERE id = 'a1000001-0000-0000-0000-000000000051';
UPDATE symptoms SET name = 'Pain radiating down the leg',    description = 'Sciatica or lower limb radiation',            code = 'SYM-052' WHERE id = 'a1000001-0000-0000-0000-000000000052';
UPDATE symptoms SET name = 'Numbness',                       description = 'Sensation of numbness or tingling',           code = 'SYM-053' WHERE id = 'a1000001-0000-0000-0000-000000000053';
UPDATE symptoms SET name = 'Muscle weakness',                description = 'Reduced muscle strength',                     code = 'SYM-054' WHERE id = 'a1000001-0000-0000-0000-000000000054';
UPDATE symptoms SET name = 'Stiffness',                      description = 'Joint or muscle stiffness',                   code = 'SYM-055' WHERE id = 'a1000001-0000-0000-0000-000000000055';
UPDATE symptoms SET name = 'Difficulty moving',              description = 'Limited range of motion',                     code = 'SYM-056' WHERE id = 'a1000001-0000-0000-0000-000000000056';

UPDATE symptoms SET name = 'Shoulder pain',                  description = 'Pain or discomfort at shoulder',              code = 'SYM-060' WHERE id = 'a1000001-0000-0000-0000-000000000060';
UPDATE symptoms SET name = 'Arm pain',                       description = 'Pain in the upper limb',                      code = 'SYM-061' WHERE id = 'a1000001-0000-0000-0000-000000000061';
UPDATE symptoms SET name = 'Hand pain',                      description = 'Pain in hand or wrist',                       code = 'SYM-062' WHERE id = 'a1000001-0000-0000-0000-000000000062';
UPDATE symptoms SET name = 'Tingling',                       description = 'Paresthesia or prickling sensations',         code = 'SYM-063' WHERE id = 'a1000001-0000-0000-0000-000000000063';
UPDATE symptoms SET name = 'Swelling',                       description = 'Localized edema or swelling',                 code = 'SYM-064' WHERE id = 'a1000001-0000-0000-0000-000000000064';

UPDATE symptoms SET name = 'Leg pain',                       description = 'Pain in the lower limb',                      code = 'SYM-070' WHERE id = 'a1000001-0000-0000-0000-000000000070';
UPDATE symptoms SET name = 'Knee pain',                      description = 'Gonalgia or pain at knee',                    code = 'SYM-071' WHERE id = 'a1000001-0000-0000-0000-000000000071';
UPDATE symptoms SET name = 'Cramps',                         description = 'Involuntary painful muscle contractions',     code = 'SYM-072' WHERE id = 'a1000001-0000-0000-0000-000000000072';
UPDATE symptoms SET name = 'Weakness',                       description = 'Generalized weakness of lower limbs',         code = 'SYM-073' WHERE id = 'a1000001-0000-0000-0000-000000000073';
UPDATE symptoms SET name = 'Difficulty walking',             description = 'Locomotion difficulty or claudication',       code = 'SYM-074' WHERE id = 'a1000001-0000-0000-0000-000000000074';

UPDATE symptoms SET name = 'Skin rash',                      description = 'Cutaneous rash or eruption',                  code = 'SYM-080' WHERE id = 'a1000001-0000-0000-0000-000000000080';
UPDATE symptoms SET name = 'Itching',                        description = 'Pruritus or cutaneous itching',               code = 'SYM-081' WHERE id = 'a1000001-0000-0000-0000-000000000081';
UPDATE symptoms SET name = 'Redness',                        description = 'Erythema or skin redness',                    code = 'SYM-082' WHERE id = 'a1000001-0000-0000-0000-000000000082';
UPDATE symptoms SET name = 'Lesions or wounds',              description = 'Ulcerations or skin wounds',                  code = 'SYM-083' WHERE id = 'a1000001-0000-0000-0000-000000000083';
UPDATE symptoms SET name = 'Dry skin',                       description = 'Xeroderma or very dry skin',                  code = 'SYM-084' WHERE id = 'a1000001-0000-0000-0000-000000000084';
UPDATE symptoms SET name = 'Mole changes',                   description = 'Changes in nevus or suspicious moles',        code = 'SYM-085' WHERE id = 'a1000001-0000-0000-0000-000000000085';

UPDATE symptoms SET name = 'Pain with urination',            description = 'Dysuria or burning during urination',         code = 'SYM-090' WHERE id = 'a1000001-0000-0000-0000-000000000090';
UPDATE symptoms SET name = 'Frequent urination',             description = 'Pollakiuria or frequent urination',           code = 'SYM-091' WHERE id = 'a1000001-0000-0000-0000-000000000091';
UPDATE symptoms SET name = 'Blood in urine',                 description = 'Hematuria',                                   code = 'SYM-092' WHERE id = 'a1000001-0000-0000-0000-000000000092';
UPDATE symptoms SET name = 'Difficulty urinating',           description = 'Obstructive dysuria or urinary retention',    code = 'SYM-093' WHERE id = 'a1000001-0000-0000-0000-000000000093';
UPDATE symptoms SET name = 'Genital pain',                   description = 'Pelvic or genital pain',                      code = 'SYM-094' WHERE id = 'a1000001-0000-0000-0000-000000000094';
UPDATE symptoms SET name = 'Abnormal discharge',             description = 'Vaginal or urethral abnormal discharge',      code = 'SYM-095' WHERE id = 'a1000001-0000-0000-0000-000000000095';
UPDATE symptoms SET name = 'Genital itching',                description = 'Genital pruritus',                            code = 'SYM-096' WHERE id = 'a1000001-0000-0000-0000-000000000096';
UPDATE symptoms SET name = 'Pelvic pain',                    description = 'Diffuse pelvic pain',                         code = 'SYM-097' WHERE id = 'a1000001-0000-0000-0000-000000000097';

UPDATE symptoms SET name = 'Fatigue',                        description = 'Generalized fatigue and lack of energy',      code = 'SYM-100' WHERE id = 'a1000001-0000-0000-0000-000000000100';
UPDATE symptoms SET name = 'Excessive sweating',             description = 'Hyperhidrosis or night sweats',               code = 'SYM-101' WHERE id = 'a1000001-0000-0000-0000-000000000101';
UPDATE symptoms SET name = 'Muscle aches',                   description = 'Myalgia or diffuse muscle pain',              code = 'SYM-102' WHERE id = 'a1000001-0000-0000-0000-000000000102';

-- Translate disease names, descriptions, and categories to English

UPDATE diseases SET name = 'Influenza',              description = 'Acute viral respiratory infection',               category = 'Infectious'        WHERE id = 'b2000001-0000-0000-0000-000000000001';
UPDATE diseases SET name = 'Common cold',            description = 'Viral infection of upper respiratory tract',      category = 'Infectious'        WHERE id = 'b2000001-0000-0000-0000-000000000002';
UPDATE diseases SET name = 'Migraine',               description = 'Recurrent headache of moderate-severe intensity', category = 'Neurological'      WHERE id = 'b2000001-0000-0000-0000-000000000003';
UPDATE diseases SET name = 'Sinusitis',              description = 'Inflammation of the paranasal sinuses',           category = 'Respiratory'       WHERE id = 'b2000001-0000-0000-0000-000000000004';
UPDATE diseases SET name = 'Pharyngitis',            description = 'Inflammation of the pharynx',                     category = 'Respiratory'       WHERE id = 'b2000001-0000-0000-0000-000000000005';
UPDATE diseases SET name = 'Gastritis',              description = 'Inflammation of the gastric mucosa',              category = 'Gastrointestinal'  WHERE id = 'b2000001-0000-0000-0000-000000000006';
UPDATE diseases SET name = 'Urinary tract infection',description = 'Bacterial infection of the urinary tract',        category = 'Urological'        WHERE id = 'b2000001-0000-0000-0000-000000000007';
UPDATE diseases SET name = 'Low back pain',          description = 'Acute or chronic lumbar pain',                    category = 'Musculoskeletal'   WHERE id = 'b2000001-0000-0000-0000-000000000008';
UPDATE diseases SET name = 'Acute bronchitis',       description = 'Acute inflammation of the bronchi',               category = 'Respiratory'       WHERE id = 'b2000001-0000-0000-0000-000000000009';
UPDATE diseases SET name = 'Pneumonia',              description = 'Acute pulmonary infection',                       category = 'Respiratory'       WHERE id = 'b2000001-0000-0000-0000-000000000010';
UPDATE diseases SET name = 'Hypertension',           description = 'Chronically elevated blood pressure',             category = 'Cardiovascular'    WHERE id = 'b2000001-0000-0000-0000-000000000011';
UPDATE diseases SET name = 'Respiratory allergy',    description = 'Allergic rhinitis or rhinoconjunctivitis',        category = 'Allergological'    WHERE id = 'b2000001-0000-0000-0000-000000000012';
UPDATE diseases SET name = 'Dermatitis',             description = 'Non-specific skin inflammation',                  category = 'Dermatological'    WHERE id = 'b2000001-0000-0000-0000-000000000013';
UPDATE diseases SET name = 'Anxiety disorder',       description = 'Generalized anxiety disorder',                    category = 'Psychiatric'       WHERE id = 'b2000001-0000-0000-0000-000000000014';
UPDATE diseases SET name = 'Gastroenteritis',        description = 'Acute gastrointestinal inflammation',             category = 'Gastrointestinal'  WHERE id = 'b2000001-0000-0000-0000-000000000015';
