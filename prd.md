# RideShare — Product Requirements Document (PRD)

## Qëllimi dhe problemi

RideShare ndihmon studentët të gjejnë udhëtime drejt AAB duke paraqitur në telefon nisjen, destinacionin, orën, vendtakimin dhe vendet e lira. Synimi është të zvogëlojë paqartësinë gjatë gjetjes së transportit dhe të shpjegojë qartë gjendjen e çdo veprimi.

Ky dokument përshkruan MVP-në dhe funksionet që ekzistojnë në repository. Aplikacioni është projekt mësimor Next.js me të dhëna fiktive për ushtrime në Neon/PostgreSQL; nuk është shërbim transporti me rezervime të konfirmuara.

## Përdoruesit dhe nevojat

| Përdoruesi | Nevoja | Mundësia aktuale |
| --- | --- | --- |
| Vizitori | Të shohë udhëtimet pa hyrë në llogari | Listë, detaje dhe lexim publik offline pas ruajtjes fillestare online |
| Udhëtari i autentikuar | Të mbajë mend udhëtimet që i interesojnë | Hyrje me GitHub dhe ruajtje e preferimeve personale |
| Shoferi pronar | Të përditësojë informacionin e nisjes | Ndryshim i orës së udhëtimit 2 nga paneli, me autorizim në server |

## Kërkesat funksionale

1. **Lista publike:** faqja `/` lexon udhëtimet nga databaza dhe shfaq kartat me informacionin bazë. Kur lista është bosh, shfaq mesazh të posaçëm.
2. **Detajet:** `/udhetimi/[id]` paraqet nisjen, destinacionin, orën, vendtakimin dhe vendet e lira. ID-ja që mungon paraqet faqen “Udhëtimi nuk u gjet”.
3. **Kërkesa e simuluar:** kur ka vende, lidhja hap `/udhetimi/[id]/kerkesa`, ku shfaqet “Simulim: Në pritje” dhe sqarohet se kërkesa nuk është dërguar te shoferi. Kur nuk ka vende, butoni te detajet çaktivizohet dhe faqja e kërkesës tregon mungesën e vendeve.
4. **Autentikimi dhe paneli:** hyrja/dalja përdor GitHub; `/panel` paraqet profilin dhe rolin. Ndryshimi i orës së udhëtimit 2 lejohet vetëm për shoferin pronar, me orë të vlefshme `HH:mm` nga `00:00` deri në `23:59`.
5. **Preferimet personale:** përdoruesi i autentikuar ruan një udhëtim dhe sheh numrin e preferimeve të veta. Ndërfaqja dallon pritjen nga suksesi; në dështim rikthen gjendjen e mëparshme dhe lejon riprovim. Përsëritja e ruajtjes nuk krijon dublikate.
6. **Vendtakimi lokal:** përdoruesi shkruan dhe konfirmon një vendtakim në ndërfaqe. Teksti pastrohet nga hapësirat anësore dhe teksti bosh refuzohet. Zgjedhja mbetet lokale, nuk ruhet në databazë dhe nuk dërgohet te shoferi.
7. **Vendndodhja me leje:** GPS-i kërkohet vetëm pas klikimit. Shfaqen pritja, suksesi dhe saktësia në metra ose gabimi për refuzim, tejkalim kohe dhe mungesë shërbimi. Shkrimi manual i vendtakimit mbetet i disponueshëm.
8. **Leximi offline/PWA:** pas vizitës fillestare online dhe ruajtjes së të dhënave publike, lexuesi offline shfaq kopjen e udhëtimeve, burimin dhe kohën e ruajtjes. Kërkesat për vend janë të çaktivizuara offline; të dhënat personale dhe veprimet e autentikuara nuk ruhen në cache-in publik.
9. **Gabimet:** dështimi i lidhjes me databazën shfaq mesazh të sigurt dhe mundësi kthimi ose riprovimi, pa ekspozuar sekretet.

## MVP

MVP-ja bazë është rrjedha **listë → detaje → simulim i kërkesës**, me informacion të qartë për orën, vendtakimin dhe disponueshmërinë. Skenari kryesor: Arta hap udhëtimin drejt AAB, kontrollon vendet dhe provon kërkesën; aplikacioni sqaron që nuk ka rezervim real.

Autentikimi, paneli, leximi offline, vendtakimi lokal dhe preferimet janë zgjerime tashmë të pranishme nga javët pasuese. Ato dokumentohen si gjendje aktuale, jo si kërkesa të realizuara në Javën 1.

## Kufizimet dhe jashtë fushës

- Nuk ka krijim/publikim udhëtimesh nga ndërfaqja, kërkesë të ruajtur për vend, pranim/refuzim nga shoferi ose rezervim real.
- Nuk ka pagesa, bisedë, hartë interaktive ose njoftime për konfirmim.
- Preferimi personal nuk rezervon dhe nuk zvogëlon vendet; heqja e preferimit nuk është implementuar.
- Vendtakimi lokal nuk mbijeton pas rifreskimit. Marrja e pozicionit nuk e kthen automatikisht atë në adresë dhe nuk ia dërgon shoferit.
- GPS-i varet nga leja e përdoruesit dhe kushtet e shfletuesit, përfshirë kontekstin e sigurt HTTPS ose localhost.
- Leximi offline kërkon kopje të ruajtur më parë; ajo mund të jetë e vjetruar dhe nuk garanton disponueshmëri aktuale.
- Leximi online, ruajtja e preferimeve dhe ndryshimi i orës varen nga shërbimet përkatëse të databazës dhe autentikimit. Sekretet mbeten në server.

## Kriteret e pranimit

| ID | Kushti dhe sjellja e kërkuar |
| --- | --- |
| AC-01 | Vizitori hap listën dhe mund të kalojë te detajet e udhëtimit të zgjedhur, ku shfaqen pesë fushat: nisja, destinacioni, ora, vendtakimi dhe vendet. |
| AC-02 | Kur lista nuk ka udhëtime, shfaqet mesazh për listë bosh; ID-ja joekzistuese shfaq faqen për udhëtim që mungon. |
| AC-03 | Me vende të lira, kërkesa hap simulimin me sqarim se nuk është dërguar; nuk krijon rezervim dhe nuk ndryshon numrin e vendeve. |
| AC-04 | Me zero vende, butoni te detajet është i çaktivizuar; hapja e drejtpërdrejtë e faqes së kërkesës shfaq mungesën e vendeve. |
| AC-05 | Paneli kërkon sesion; ndryshimi i orës së udhëtimit 2 refuzohet për përdoruesin pa sesion, udhëtarin, shoferin jopronar ose formatin e pavlefshëm. |
| AC-06 | Ruajtja e preferimit kërkon sesion, ruhet për përdoruesin përkatës dhe lexohet pas rifreskimit; klikimet e përsëritura nuk krijojnë kopje. |
| AC-07 | Gjatë ruajtjes së preferimit shfaqet pritja; dështimi rikthen numrin/gjendjen e mëparshme dhe mundëson riprovimin. |
| AC-08 | Vendtakimi bosh refuzohet; teksti i vlefshëm konfirmohet lokalisht. Refuzimi ose dështimi i GPS-it lejon ende shkrimin manual. |
| AC-09 | Pas ruajtjes online, lexuesi offline tregon kopjen publike me kohën e ruajtjes dhe veprimet për vend të çaktivizuara. |
| AC-10 | Gabimi i databazës paraqitet pa sekrete; ndërfaqja synon përdorimin në telefon pa lëvizje horizontale në rrjedhën kryesore. |

Kriteret janë kushte për verifikim të produktit, jo raport testesh të ekzekutuara gjatë këtij korrigjimi dokumentesh.

## Baza e dokumentimit

Përmbajtja mbështetet te `java-02.md` deri te `java-09.md` dhe te faqet, komponentët e funksionet ekzistuese në `aplikacioni/src/`, veçanërisht lista, detajet, kërkesa, paneli, `MeetingPoint`, `Preferimi` dhe lexuesi publik offline. Plotësimi i këtij PRD-je nuk ndryshon kodin, skemën ose të dhënat e aplikacionit.
