-- Add Romanian name column to symptoms for bilingual search support

ALTER TABLE symptoms ADD COLUMN name_ro VARCHAR(200);

-- General
UPDATE symptoms SET name_ro = 'Febră'                                    WHERE id = 'a1000001-0000-0000-0000-000000000001';
UPDATE symptoms SET name_ro = 'Frisoane'                                  WHERE id = 'a1000001-0000-0000-0000-000000000002';
UPDATE symptoms SET name_ro = 'Oboseală extremă'                          WHERE id = 'a1000001-0000-0000-0000-000000000003';
UPDATE symptoms SET name_ro = 'Amețeală'                                  WHERE id = 'a1000001-0000-0000-0000-000000000004';
UPDATE symptoms SET name_ro = 'Greață'                                    WHERE id = 'a1000001-0000-0000-0000-000000000005';
UPDATE symptoms SET name_ro = 'Pierdere în greutate'                      WHERE id = 'a1000001-0000-0000-0000-000000000006';
UPDATE symptoms SET name_ro = 'Lipsa poftei de mâncare'                   WHERE id = 'a1000001-0000-0000-0000-000000000007';

-- Cap / față
UPDATE symptoms SET name_ro = 'Durere de cap'                             WHERE id = 'a1000001-0000-0000-0000-000000000010';
UPDATE symptoms SET name_ro = 'Vedere încețoșată'                         WHERE id = 'a1000001-0000-0000-0000-000000000011';
UPDATE symptoms SET name_ro = 'Sensibilitate la lumină'                   WHERE id = 'a1000001-0000-0000-0000-000000000012';
UPDATE symptoms SET name_ro = 'Nas înfundat'                              WHERE id = 'a1000001-0000-0000-0000-000000000013';
UPDATE symptoms SET name_ro = 'Secreții nazale'                           WHERE id = 'a1000001-0000-0000-0000-000000000014';
UPDATE symptoms SET name_ro = 'Durere de sinusuri'                        WHERE id = 'a1000001-0000-0000-0000-000000000015';
UPDATE symptoms SET name_ro = 'Durere de ureche'                          WHERE id = 'a1000001-0000-0000-0000-000000000016';
UPDATE symptoms SET name_ro = 'Țiuit în urechi'                           WHERE id = 'a1000001-0000-0000-0000-000000000017';
UPDATE symptoms SET name_ro = 'Umflare a feței'                           WHERE id = 'a1000001-0000-0000-0000-000000000018';

-- Gât
UPDATE symptoms SET name_ro = 'Durere în gât'                             WHERE id = 'a1000001-0000-0000-0000-000000000020';
UPDATE symptoms SET name_ro = 'Dificultate la înghițire'                  WHERE id = 'a1000001-0000-0000-0000-000000000021';
UPDATE symptoms SET name_ro = 'Voce răgușită'                             WHERE id = 'a1000001-0000-0000-0000-000000000022';
UPDATE symptoms SET name_ro = 'Ganglioni inflamați'                       WHERE id = 'a1000001-0000-0000-0000-000000000023';
UPDATE symptoms SET name_ro = 'Senzație de nod în gât'                    WHERE id = 'a1000001-0000-0000-0000-000000000024';
UPDATE symptoms SET name_ro = 'Tuse'                                      WHERE id = 'a1000001-0000-0000-0000-000000000025';
UPDATE symptoms SET name_ro = 'Umflare a gâtului'                         WHERE id = 'a1000001-0000-0000-0000-000000000026';

-- Piept / inimă
UPDATE symptoms SET name_ro = 'Durere în piept'                           WHERE id = 'a1000001-0000-0000-0000-000000000030';
UPDATE symptoms SET name_ro = 'Presiune în piept'                         WHERE id = 'a1000001-0000-0000-0000-000000000031';
UPDATE symptoms SET name_ro = 'Respirație dificilă'                       WHERE id = 'a1000001-0000-0000-0000-000000000032';
UPDATE symptoms SET name_ro = 'Bătăi rapide ale inimii'                   WHERE id = 'a1000001-0000-0000-0000-000000000033';
UPDATE symptoms SET name_ro = 'Bătăi neregulate ale inimii'               WHERE id = 'a1000001-0000-0000-0000-000000000034';
UPDATE symptoms SET name_ro = 'Tuse cu sânge'                             WHERE id = 'a1000001-0000-0000-0000-000000000035';
UPDATE symptoms SET name_ro = 'Durere care merge spre braț sau maxilar'   WHERE id = 'a1000001-0000-0000-0000-000000000036';

-- Abdomen / stomac
UPDATE symptoms SET name_ro = 'Durere abdominală'                         WHERE id = 'a1000001-0000-0000-0000-000000000040';
UPDATE symptoms SET name_ro = 'Vărsături'                                 WHERE id = 'a1000001-0000-0000-0000-000000000041';
UPDATE symptoms SET name_ro = 'Diaree'                                    WHERE id = 'a1000001-0000-0000-0000-000000000042';
UPDATE symptoms SET name_ro = 'Constipație'                               WHERE id = 'a1000001-0000-0000-0000-000000000043';
UPDATE symptoms SET name_ro = 'Balonare'                                  WHERE id = 'a1000001-0000-0000-0000-000000000044';
UPDATE symptoms SET name_ro = 'Arsuri la stomac'                          WHERE id = 'a1000001-0000-0000-0000-000000000045';
UPDATE symptoms SET name_ro = 'Sânge în scaun'                            WHERE id = 'a1000001-0000-0000-0000-000000000046';

-- Spate
UPDATE symptoms SET name_ro = 'Durere lombară'                            WHERE id = 'a1000001-0000-0000-0000-000000000050';
UPDATE symptoms SET name_ro = 'Durere în partea superioară a spatelui'    WHERE id = 'a1000001-0000-0000-0000-000000000051';
UPDATE symptoms SET name_ro = 'Durere care coboară pe picior'             WHERE id = 'a1000001-0000-0000-0000-000000000052';
UPDATE symptoms SET name_ro = 'Amorțeală'                                 WHERE id = 'a1000001-0000-0000-0000-000000000053';
UPDATE symptoms SET name_ro = 'Slăbiciune musculară'                      WHERE id = 'a1000001-0000-0000-0000-000000000054';
UPDATE symptoms SET name_ro = 'Rigiditate'                                WHERE id = 'a1000001-0000-0000-0000-000000000055';
UPDATE symptoms SET name_ro = 'Dificultate la mișcare'                    WHERE id = 'a1000001-0000-0000-0000-000000000056';

-- Brațe / umeri / mâini
UPDATE symptoms SET name_ro = 'Durere în umăr'                            WHERE id = 'a1000001-0000-0000-0000-000000000060';
UPDATE symptoms SET name_ro = 'Durere în braț'                            WHERE id = 'a1000001-0000-0000-0000-000000000061';
UPDATE symptoms SET name_ro = 'Durere în mână'                            WHERE id = 'a1000001-0000-0000-0000-000000000062';
UPDATE symptoms SET name_ro = 'Furnicături'                               WHERE id = 'a1000001-0000-0000-0000-000000000063';
UPDATE symptoms SET name_ro = 'Umflare'                                   WHERE id = 'a1000001-0000-0000-0000-000000000064';

-- Picioare / genunchi / tălpi
UPDATE symptoms SET name_ro = 'Durere în picior'                          WHERE id = 'a1000001-0000-0000-0000-000000000070';
UPDATE symptoms SET name_ro = 'Durere în genunchi'                        WHERE id = 'a1000001-0000-0000-0000-000000000071';
UPDATE symptoms SET name_ro = 'Crampe'                                    WHERE id = 'a1000001-0000-0000-0000-000000000072';
UPDATE symptoms SET name_ro = 'Slăbiciune'                                WHERE id = 'a1000001-0000-0000-0000-000000000073';
UPDATE symptoms SET name_ro = 'Dificultate la mers'                       WHERE id = 'a1000001-0000-0000-0000-000000000074';

-- Piele
UPDATE symptoms SET name_ro = 'Erupție pe piele'                          WHERE id = 'a1000001-0000-0000-0000-000000000080';
UPDATE symptoms SET name_ro = 'Mâncărime'                                 WHERE id = 'a1000001-0000-0000-0000-000000000081';
UPDATE symptoms SET name_ro = 'Roșeață'                                   WHERE id = 'a1000001-0000-0000-0000-000000000082';
UPDATE symptoms SET name_ro = 'Leziuni sau răni'                          WHERE id = 'a1000001-0000-0000-0000-000000000083';
UPDATE symptoms SET name_ro = 'Piele uscată'                              WHERE id = 'a1000001-0000-0000-0000-000000000084';
UPDATE symptoms SET name_ro = 'Schimbări ale unei alunițe'                WHERE id = 'a1000001-0000-0000-0000-000000000085';

-- Organe urinare / genitale
UPDATE symptoms SET name_ro = 'Durere la urinare'                         WHERE id = 'a1000001-0000-0000-0000-000000000090';
UPDATE symptoms SET name_ro = 'Urinare frecventă'                         WHERE id = 'a1000001-0000-0000-0000-000000000091';
UPDATE symptoms SET name_ro = 'Sânge în urină'                            WHERE id = 'a1000001-0000-0000-0000-000000000092';
UPDATE symptoms SET name_ro = 'Dificultate la urinare'                    WHERE id = 'a1000001-0000-0000-0000-000000000093';
UPDATE symptoms SET name_ro = 'Durere în zona genitală'                   WHERE id = 'a1000001-0000-0000-0000-000000000094';
UPDATE symptoms SET name_ro = 'Secreții anormale'                         WHERE id = 'a1000001-0000-0000-0000-000000000095';
UPDATE symptoms SET name_ro = 'Mâncărime genitală'                        WHERE id = 'a1000001-0000-0000-0000-000000000096';
UPDATE symptoms SET name_ro = 'Durere în zona pelvisului'                 WHERE id = 'a1000001-0000-0000-0000-000000000097';

-- Stare generală
UPDATE symptoms SET name_ro = 'Oboseală'                                  WHERE id = 'a1000001-0000-0000-0000-000000000100';
UPDATE symptoms SET name_ro = 'Transpirații excesive'                     WHERE id = 'a1000001-0000-0000-0000-000000000101';
UPDATE symptoms SET name_ro = 'Dureri musculare'                          WHERE id = 'a1000001-0000-0000-0000-000000000102';
