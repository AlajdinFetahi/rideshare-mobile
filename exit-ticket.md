# RideShare — Exit Ticket, Java 1

## Përmbledhja e projektit

RideShare është projekt mësimor për një aplikacion të përshtatur për telefon që ndihmon studentët të gjejnë udhëtime drejt AAB. Përdoruesi shikon listën, hap detajet dhe kontrollon nisjen, destinacionin, orën, vendtakimin dhe vendet e lira. Repository përmban aplikacionin në `aplikacioni/` dhe dokumentimin sipas javëve.

## Problemi që zgjidh

Studentët që udhëtojnë nga i njëjti drejtim kanë nevojë të gjejnë transport dhe të kuptojnë nëse ka vende të lira. Shoferët me vende të lira kanë nevojë t'ua bëjnë të qarta udhëtarëve orën dhe vendtakimin. RideShare i mbledh këto informacione në një rrjedhë të thjeshtë: listë → detaje → kërkesë për vend.

## Përdoruesit

- **Udhëtari/studenti:** kërkon një udhëtim drejt AAB, kontrollon detajet dhe vendet, provon kërkesën për vend dhe mund të ruajë preferime pas hyrjes.
- **Shoferi:** paraqitet si pronar i udhëtimit; implementimi aktual i lejon shoferit pronar ndryshimin e orës së udhëtimit 2 nga paneli.
- **Vizitori pa llogari:** lexon listën dhe detajet publike; nuk ruan preferime personale.

## Mësimet e Javës 1

Nga përcaktimi i këtij projekti dalin këto mësime bazë:

1. Problemi dhe përdoruesit përcaktohen përpara funksioneve: studenti duhet të gjejë një udhëtim të përshtatshëm drejt AAB.
2. Një MVP duhet të ketë rrjedhë të kufizuar dhe të kuptueshme: lista, detajet dhe një kërkesë e simuluar mjaftojnë për të shpjeguar idenë fillestare.
3. Kërkesa nuk është rezervim. Mesazhi i ndërfaqes duhet të shpjegojë nëse veprimi është simulim apo është konfirmuar realisht.
4. Kërkesat duhet të jenë të verifikueshme: kur ka zero vende, veprimi për kërkesë çaktivizohet dhe shfaqet arsyeja.
5. PRD-ja dokumenton qëllimin, përdoruesit, kufijtë dhe kriteret e pranimit; dokumentet e dorëzimit duhet të jenë të lehta për t'u gjetur në rrënjën e repository-t.

## Kufiri mes idesë dhe implementimit aktual

Ideja afatgjatë përfshin lidhjen e shoferit me udhëtarin, por aplikacioni aktual nuk dërgon kërkesë reale dhe nuk konfirmon rezervim. Faqja e kërkesës shfaq “Simulim: Në pritje”; nuk ruan kërkesë dhe nuk zvogëlon vendet. Publikimi i udhëtimeve dhe pranimi/refuzimi nga shoferi nuk janë implementuar.

Në javët pasuese janë shtuar leximi nga Neon/PostgreSQL, hyrja me GitHub, paneli, leximi publik offline, vendtakimi lokal dhe preferimet personale. Këto nuk paraqiten si punë e kryer në Javën 1. Hapi i ardhshëm i produktit do të ishte projektimi i kërkesave reale dhe konfirmimit nga shoferi.

## Shënim për përgatitjen

Ky dokument u plotësua për dorëzimin e Javës 1 duke u mbështetur te dokumentimi dhe kodi ekzistues, me ndihmën e Codex. Për këtë korrigjim u kontrollua dokumentacioni; nuk u kryen teste të reja të aplikacionit dhe nuk pretendohet rezultat i ri nga kontrolli automatik i profesorit.
