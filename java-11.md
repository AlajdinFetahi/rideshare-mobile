# RideShare — Java 11: Njoftimet dhe angazhimi

## Çfarë shtova ndaj javës 10

Pranimi i shoferit krijon një njoftim personal të qëndrueshëm në Neon. Zilja tregon numrin e palexuar nga serveri; lista tregon ID-në e njoftimit, përgjigjen, kërkesën dhe I PALEXUAR/I LEXUAR. “Hap kërkesën” hap detajin e kërkesës përkatëse dhe shënon leximin pas kontrollit të serverit. Historia mbetet pas Refresh.

U ripërdorën projekti ekzistues, GitHub/NextAuth, klienti Neon, funksioni atomik i pranimit, stili dhe polling-u çdo 5 sekonda i Javës 10. Timer-i dhe listener-at ekzistues u nxorën në një helper të vogël të përbashkët; sjellja e sinkronizimit të udhëtimeve ruhet. Nuk u shtuan dependenca.

Burimet: [udhëzimet zyrtare](https://arbenl.github.io/lendet/2026-2027/mobile/java-11/), [ushtrimet](https://arbenl.github.io/lendet/2026-2027/mobile/java-11/ushtrimet.html) dhe [modeli zyrtar i raportit](https://arbenl.github.io/lendet/2026-2027/mobile/java-11/java-11-model.md).

## Përgatitja

Provat u kryen më 26.11.2026 lokalisht kundër databazës ekzistuese Neon, me Edge headless/Playwright. Shoferi, udhëtari dhe një profil tjetër për kontrollin e autorizimit kishin browser contexts të izoluara dhe profile vetëm fiktive me prefiks `J11-1795709448314`. Sesionet e testimit u nënshkruan lokalisht me mekanizmin ekzistues NextAuth; serveri përdori `getServerSession`. Nuk u shtua hyrje testimi ose anashkalim autentikimi në aplikacion.

Hyrja interaktive OAuth nga fillimi me dy llogari GitHub reale: **NOT VERIFIED**. Provat e mëposhtme verifikojnë sesionet server-side të dy profileve fiktive, jo procesin interaktiv OAuth. Nuk publikohen tokenë, kredenciale ose të dhëna personale.

| Përdorimi | Udhëtimi | Kërkesa | Njoftimi |
| --- | --- | --- | --- |
| Provat 1–2 | `J11-1795709448314-1` | `18` | `4` |
| Prova 3 | `J11-1795709448314-2` | `19` | `5` |
| Rollback atomik | `J11-1795709448314-atomic` | `20` | Asnjë |

Të tre udhëtimet nisën me 2 vende, nisje/destinacion dhe vendtakim fiktiv. Para pranimit u provua rrjedha e Javës 10: udhëtari dërgoi kërkesën reale, shoferi e pa pending automatikisht dhe vendet mbetën 2.

### Prova 1: Rasti 1 · Përgjigjja bëhet njoftim

- **Hapat:** udhëtari dërgoi kërkesën `18`; shoferi pronar shtypi “Prano kërkesën”. U prit polling-u i udhëtarit pa Refresh. Më pas u dërguan 8 pranime identike paralelisht dhe u lexua Neon drejtpërdrejt.
- **Pritshmëria:** një njoftim personal i palexuar për kërkesën e saktë; vendet 2 → 1 vetëm një herë. Përsëritjet nuk krijojnë rekord tjetër.
- **Vëzhgimi:** udhëtari pa automatikisht njoftimin `4`, kërkesën `18`, I PALEXUAR dhe numrin 1. Toast-i tregoi pranimin. Neon kishte saktësisht 1 rekord, `read_at = NULL`, status accepted dhe 1 vend. Të 8 përsëritjet kthyen HTTP 200, duke lënë të njëjtin rekord dhe 1 vend.
- **Refresh/hapja:** Refresh ngarkoi historinë pa toast të vjetër. Hapja e kërkesës `18` u verifikua në provën 2.
- **Rezultati real: PASS.**

### Prova 2: Rasti 2 · Hapja dhe shënimi si i lexuar

- **Hapat:** për njoftimin `4`, fillimisht u simulua përgjigje HTTP 503 për POST-in e leximit përpara shkrimit në server. Pastaj u riprovua me serverin real; përgjigjja e suksesshme u mbajt përkohësisht pezull në browser për të kontrolluar numëruesin. U hap kërkesa, u shtyp “Kthehu te njoftimet”, u bë Refresh dhe u përsërit leximi dy herë.
- **Pritshmëria:** dështimi mban njoftimin të palexuar dhe lejon retry. Numri ulet vetëm pas konfirmimit; hapet kërkesa `18` e udhëtimit të parë. Historia dhe koha origjinale e leximit mbeten.
- **Vëzhgimi:** gjatë dështimit numri mbeti 1, I PALEXUAR dhe `read_at = NULL`, me mesazh për retry. Gjatë mbajtjes së përgjigjes numri mbeti 1. Pas konfirmimit u shfaq “Kërkesa #18” dhe udhëtimi `J11-1795709448314-1`; numri u bë 0. Pas kthimit/Refresh, njoftimi `4` mbeti I LEXUAR, pa toast. Koha e leximit e vëzhguar nga Neon: `2026-11-26T16:11:01.698Z` (UTC, paraqitje JavaScript). Dy lexime të tjera nuk ndryshuan kohën, statusin ose 1 vendin e lirë.
- **Autorizimi:** profili tjetër mori listë bosh dhe HTTP 404 kur provoi leximin e njoftimit `4`; edhe shoferi mori 404. Anonimi mori 401. Origjina e huaj mori 403. Njoftimi dhe kërkesa kontrollohen nga serveri; ID/URL alternative të klientit nuk përdoren për zgjedhjen e kërkesës.
- **Rezultati real: PASS.**

### Prova 3: Rasti 3 · Rilidhja pa njoftime të dyfishta

- **Hapat:** u krijua kërkesa pending `19` për udhëtimin e dytë. Vetëm context-i i udhëtarit u vendos offline me `browserContext.setOffline(true)`; shoferi mbeti online dhe pranoi. Udhëtari u rilidh pa Refresh. U kryen të paktën dy lexime të tjera dhe më pas edhe një ndërprerje/rilidhje tjetër.
- **Pritshmëria:** offline ruhet historia e fundit dhe bllokohen veprimet me rrjet. Rilidhja lexon Neon automatikisht, sjell një njoftim dhe vetëm një toast për ID-në e re; polling-u nuk krijon kopje.
- **Vëzhgimi:** offline shfaqej “Pa lidhje · pamja e fundit”; historia e njoftimit `4` mbeti dhe butoni i hapjes ishte disabled. Udhëtimi mbeti vizualisht pending me 2 vende te udhëtari, ndërsa shoferi ruajti pranimin. Pas rilidhjes u shfaq automatikisht njoftimi `5` për kërkesën `19`, numri 1 dhe accepted/1 vend. U vëzhguan 4 GET-e shtesë të suksesshme; Neon mbajti saktësisht një rekord për përgjigjen. MutationObserver në browser numëroi vetëm një shfaqje toast-i. Rilidhja tjetër nuk shtoi toast.
- **Rezultati real: PASS.**

## Prova me një hyrje tjetër

**NOT VERIFIED:** nuk u krye demonstrim me një koleg ose demonstrim personal nga studenti. Provat e mësipërme u ekzekutuan nga Codex me profile fiktive dhe Neon real. Nuk pretendohet provë fizike në telefon.

## Ku gjendet kodi dhe çfarë mbetet

- `aplikacioni/schema-java11.sql`: migrim minimal, **i aplikuar në Neon**. Tabela `njoftimet` ka ID bigint identity, `request_id` → `kerkesat(id)`, `recipient_id` → `profilet(github_id)`, type accepted, created_at dhe read_at. `UNIQUE(request_id, type)` dhe `ON CONFLICT DO NOTHING` pengojnë kopjet. Indeksi sipas marrësit mbështet leximin personal.
- Funksioni ekzistues `prano_kerkesen` ruan kontrollet e pronarit/rolit, kyçet dhe idempotencën e Javës 10. UPDATE i kërkesës, ulja e vendeve dhe INSERT i njoftimit kryhen në të njëjtin statement/transaksion PostgreSQL. Marrësi merret nga kërkesa në databazë. Pranimi ekzistues kthehet pa shkrim tjetër. Nuk krijohen njoftime nga GET dhe nuk u bë backfill i pranimeve të vjetra.
- `aplikacioni/src/lib/njoftimet.ts`: SELECT i parametrizuar vetëm për marrësin aktual dhe numërim server-side i paleximeve në të njëjtin SELECT. Hapja përdor UPDATE me JOIN te kërkesa dhe kontrollon si marrësin, ashtu edhe udhëtarin. `COALESCE(read_at, NOW())` ruan kohën origjinale. Leximi nuk ndryshon kërkesën ose vendet.
- `aplikacioni/src/app/api/njoftimet/route.ts`: GET personal dhe POST për hapjen; identitet vetëm nga sesioni, kontroll origjine dhe ID-je, pa URL arbitrare. Përgjigjet janë `private, no-store` me `Vary: Cookie` (Next.js shton edhe vlera të veta Vary). Gabimet nuk zbulojnë të dhëna të databazës.
- `aplikacioni/src/components/Njoftimet.tsx`: zilja/lista/detaji në layout-in ekzistues; polling, anulim i leximit para shkrimit, timeout 10 sekonda dhe pastrim në unmount. Numri/statusi ndryshojnë pas përgjigjes së suksesshme. ID-të e parë mbahen në memorien e sesionit të ekranit; ngarkimi i parë/Refresh vendos historinë si bazë pa toast. Offline ruan pamjen dhe rilidhja provon menjëherë leximin.
- `aplikacioni/src/lib/polling.ts` dhe ndryshimi i vogël në `Sinkronizimi.tsx`: një helper i përbashkët për ciklin ekzistues 5000 ms dhe ngjarjet online/offline. Nuk u krijua mekanizëm push.
- `aplikacioni/src/app/layout.tsx` dhe `globals.css`: integrim dhe hapësirë minimale, duke ripërdorur butonat/kartat ekzistuese.
- `aplikacioni/src/app/api/njoftimet/route.test.ts`: autentikimi, privatësia, marrësi i huaj, input-et e pavlefshme, CSRF, konfirmimi dhe dështimi i ruajtjes.

### Kontrollet reale

- `npm test`: **42/42 PASS**, 10 skedarë; përfshihen testet ekzistuese të Javëve të mëparshme.
- `npm run lint`: **PASS**.
- `npm run build`: **PASS**, TypeScript dhe endpoint-i dinamik `/api/njoftimet`.
- Rollback atomik shtesë: në një transaksion Neon u thirr pranimi i kërkesës `20`, pastaj u shkaktua një gabim SQL prove. Transaksioni u anulua: kërkesa mbeti pending, vendet 2 dhe zero njoftime. Nuk u ndryshua skema për këtë provë.
- Udhëtimet që ekzistonin para ekzekutimit përfundimtar u krahasuan para/pas dhe mbetën identike. U shtuan vetëm fixture fiktive. Tentativat përgatitore të skriptit lanë gjithashtu vetëm fixture fiktive; u korrigjuan selektori i panelit, krahasimi i header-it Vary dhe krahasimi i objekteve Date në test, pastaj ekzekutimi i plotë kaloi.
- Browser-i: pa page errors; pa overflow horizontal në 320/390/768/1440 px. Pamjet e paleximit, leximit, offline, rilidhjes dhe desktop-it u hapën e u inspektuan.
- Evidencat lokale jashtë Git: `%TEMP%/rideshare-week11/verify.cjs`, `results.json`, `migrate.cjs`, `lan.cjs` dhe pamjet PNG. Service workers u bllokuan vetëm në contexts e provave për izolimin e rrjetit. SW ekzistues nuk cache-on endpoint-et personale dhe nuk u ndryshua.
- Rishikimi i kodit ishte lokal, **jo i pavarur**. Nuk u përdorën subagents ose workflows të personalizuara.

### Qasja nga laptopi dhe telefoni

Serveri u nis nga `aplikacioni/` me `npm run dev -- -H 0.0.0.0 -p 3000` dhe mbetet në proces të veçantë. Listener-i i verifikuar: `0.0.0.0:3000`.

- Laptop: **http://localhost:3000** — HTTP 200.
- Telefon në të njëjtin Wi-Fi: **http://10.63.6.106:3000** — IP reale e adapterit Wi-Fi, HTTP 200 nga laptopi. Edhe hapja e autentikuar e listës dhe e kërkesës `18` përmes kësaj IP-je kaloi në browser-in e laptopit.
- Prova fizike nga telefoni: **NOT VERIFIED**. IP-ja mund të ndryshojë; firewall/client isolation dhe hyrja OAuth nga telefoni mbeten për provë manuale. Nuk u krijua tunnel dhe nuk u ekspozua qëllimisht serveri në internet.

### Kufizimet

Pamja personale e fundit ruhet në memorien e ekranit tashmë të hapur. Hapja nga zero ose Refresh plotësisht offline nuk garanton ngarkimin e historisë personale; nuk u shtua cache i përbashkët, localStorage ose ruajtje personale në SW. Polling-u ka vonesën normale deri në 5 sekonda plus rrjetin. Nëse serveri ruan leximin por përgjigjja humbet, ndërfaqja pret konfirmimin; leximi pas rilidhjes pasqyron gjendjen reale të Neon-it. Mbeten OAuth interaktiv me llogari reale, telefoni fizik, kolegu dhe feedback-u zyrtar.

## Zgjerime opsionale

Web Push nuk është implementuar sepse është opsional. Nuk u shtuan VAPID, Service Worker i ri ose refuzim kërkese; projekti ekzistues mbështet pranimin. Funksionet PWA të javëve të mëparshme u ruajtën.

## Ndihma nga AI (Artificial Intelligence — inteligjencë artificiale)

Codex bëri inspektimin, kodin minimal, migrimin real, testet, automatizimin e browser-it dhe raportin. Vëzhgimet janë nga ekzekutimet reale, jo demonstrim personal i studentit. Udhëzimet e mjedisit kërkuan leximin e rregullave bazë të cilësisë/sigurisë së kodit dhe komenteve shqip; nuk u përdor workflow i personalizuar ose delegim.

## Pas dorëzimit të parë — përditëso më vonë

Feedback-u i GitHub-it është **ende i pamarrë**, deri në dorëzimin manual. Nuk u krijua Issue te profesori dhe nuk pretendohet rezultat 2/2 apo kontroll i botit. Java 11 është për feedback/progres, pa pikë shtesë laboratori.

Dorëzimi manual: https://github.com/arbenl/arbenl-mobile-assignments-2026-2027/issues/new?template=mobile-submission.yml&week=Java%2011
