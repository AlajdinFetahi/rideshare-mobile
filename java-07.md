# RideShare · Java 7

## Rasti im
GitHub: AlajdinFetahi
Kodi: P7-378
Skenari i zgjedhur (numri dhe titulli, nga Rastet 1–5): Rasti 3 · Klikim apo rezervim.
ID i udhëtimit në projektin tim: 1.

Të dhënat fiktive të rastit: Gjeneratori zyrtar për AlajdinFetahi dha Prizren → AAB, 08:00, 1 vend; ora alternative 08:05. U përdor funksioni personalCase nga moduli publik week-07-model.mjs i profesorit. Këto janë vlerat personale P7 dhe nuk janë aplikuar në Neon ose në një fixture lokal. Provat përdorin udhëtime ekzistuese nga aplikacioni, pa krijuar të dhëna të tjera ose infrastrukturë testimi.

Të dhënat reale për ID 1: Prishtinë → AAB, 08:00, 2 vende, Stacioni i autobusëve. Prova me hyrje tjetër përdor ID 3: Lipjan → AAB, 07:45, 0 vende, Qendra e qytetit. Nuk është ndryshuar databaza.

Udhëzimet: https://arbenl.github.io/lendet/2026-2027/mobile/java-07/ushtrimet.html
Modeli: https://arbenl.github.io/lendet/2026-2027/mobile/java-07/java-07-model.md

## Parashikimi
**Draft i asistuar nga AI, i shkruar para korrigjimit të kodit; nuk është parashikim origjinal i studentit. Studenti duhet ta rishikojë dhe ta shpjegojë vetë përpara dorëzimit.**

Pres që lista të hapë detajet e të njëjtit udhëtim ID 1, me Prishtinë → AAB, orën 08:00 dhe 2 vende. Veprimi demonstrativ duhet të tregojë se është vetëm simulim, pa rezervim real dhe pa njoftim të shoferit. Numri i vendeve duhet të mbetet i njëjtë pas hapjes së simulimit.

Ky draft u ruajt në commit-in Para, përpara ndryshimit të kodit, por pasi ishte inspektuar sjellja fillestare. Nuk pretendohet parashikim i studentit ose parashikim i pavarur nga vëzhgimi. Rishikimi i mëvonshëm nga studenti nuk e ndryshon këtë fakt historik.

## Dy probleme
1. **Paqartësi para klikimit.** Në gjendjen Para, GET /udhetimi/1 ktheu HTTP 200 me etiketën “Kërko vend”, pa shënim për simulimin pranë veprimit. Përsëritja: hap listën /, ndiq href /udhetimi/1 dhe lexo etiketën. Vetëm /udhetimi/1/kerkesa e shpjegonte simulimin. U korrigjua ky problem.
2. **Paqartësi pas veprimit.** GET /udhetimi/1/kerkesa ktheu HTTP 200 me titullin “Simulim: Në pritje”, ndërsa paragrafi thoshte “Kërkesa për Prishtinë nuk është dërguar te shoferi.” Fjalët “Në pritje” mund të krijojnë pritje për një proces real. Shënimi “Simulim” dhe sqarimi ekzistonin tashmë; kjo është paqartësi e tekstit, jo provë e një rezervimi real ose e një gabimi në databazë. Ky problem mbetet i pakorrigjuar për të kufizuar ndryshimin në një korrigjim.

Vëzhgimet fillestare janë nga përgjigjet reale HTTP të aplikacionit lokal dhe API-së së lidhur me Neon; nuk pretendohet se studenti i riprodhoi me klikime.

## Korrigjimi
Skedari: aplikacioni/src/app/udhetimi/[id]/page.tsx

Ky skedar lexon udhëtimin dhe paraqet detajet. U ndryshua vetëm etiketa “Kërko vend” në **“Kërko vend · simulim, pa rezervim real”**. Përdoruesi informohet për kufizimin para hapjes së veprimit. Ndryshimi i kodit është një rresht në një skedar ekzistues. Rruga e lidhjes, kushti vende > 0, leximi i databazës, arkitektura, autentikimi dhe kontrollet e pronësisë mbetën të njëjta. Nuk u shtuan biblioteka ose teste në repository.

## Versionet
Para: https://github.com/AlajdinFetahi/rideshare-mobile/commit/c980ddc68fdfc515208c6f0f1ce413e3c2599d21
Pas: https://github.com/AlajdinFetahi/rideshare-mobile/commit/ad5c75532c7295104a906bbf6dc8a7683ec0361a

Para ruan raportin fillestar dhe kodin e pandryshuar. Pas ndryshon vetëm etiketën në skedarin e mësipërm dhe ka Para si prind. Raporti përfundimtar ruhet në commit pas tyre.

## Provat që bëra
Provat u ekzekutuan më 02.11.2026 kundër http://localhost:3000, me serverin ekzistues Next.js dhe konfigurimin lokal të Neon. U përdor Node.js fetch dhe node:assert/strict në terminal, pa instaluar varësi dhe pa krijuar skedar testimi. U kontrollua HTML-ja reale brenda main, pasi u hoqën vetëm komentet ndarëse të React. Lidhjet u ndoqën si kërkesa HTTP GET; këto nuk janë prova klikimesh, hidratimi ose pamjeje në shfletues.

### Prova 1
Hapat: U lexua GET /api/udhetimet. U hap GET / dhe u kontrollua karta me href /udhetimi/1. U hap /udhetimi/1, pastaj href /udhetimi/1/kerkesa. U rilexua /api/udhetimet dhe u krahasua e gjithë lista publike me përgjigjen fillestare.

Pritshmëria: Lista dhe detajet të tregojnë Prishtinë → AAB, 08:00, 2 vende, me ID 1 në lidhje. Veprimi të tregojë simulimin dhe të mos ndryshojë të dhënat publike.

Vëzhgimi: **PASS (HTTP dhe HTML serveri).** Të gjitha përgjigjet kthyen HTTP 200. Karta lidhej me /udhetimi/1. Detajet shfaqën Prishtinë – AAB, Ora: 08:00, Vende të lira: 2 dhe Stacioni i autobusëve. Veprimi shfaqi “Simulim: Në pritje” dhe “Kërkesa për Prishtinë nuk është dërguar te shoferi.” Lista publike pas veprimit ishte identike me atë fillestare; ID 1 mbeti me 2 vende. **Ndërveprimi në UI: NOT VERIFIED**, sepse u punua vetëm me terminal dhe nuk u kryen klikime në shfletues.

### Prova 2
Hapat: U përsëritën hapat e problemit 1 duke hapur /udhetimi/1 dhe duke kontrolluar tekstin e lidhjes për /udhetimi/1/kerkesa. U hap përsëri ajo rrugë dhe u rilexua API-ja publike.

Pritshmëria: Lidhja të thotë “Kërko vend · simulim, pa rezervim real” përpara veprimit. Destinacioni i saj të mbetet i njëjtë dhe përgjigjja të sqarojë se kërkesa nuk u dërgua.

Vëzhgimi: **PASS (HTTP dhe HTML serveri).** Të dyja faqet kthyen HTTP 200. Kontrolli me assert gjeti etiketën e plotë të re brenda lidhjes; href mbeti /udhetimi/1/kerkesa. Faqja pasuese ruajti titullin e simulimit dhe sqarimin “nuk është dërguar te shoferi”. Të tri udhëtimet publike ishin identike para dhe pas. **Ndërveprimi në UI: NOT VERIFIED**, sepse nuk u përdor shfletues. Nuk u verifikuan tabela private, njoftime ose gjendje tjetër jashtë API-së publike.

### Prova 3
Hapat: Pa ndryshuar Neon, u ndryshua vetëm hyrja ID në të njëjtën rrjedhë nga 1 në 3. U konfirmua lidhja /udhetimi/3 në listë, u hapën /udhetimi/3 dhe, veçmas me GET direkt, /udhetimi/3/kerkesa. U rilexua API-ja publike.

Pritshmëria: Për ID 3 ekzistues, Lipjan → AAB, 07:45, 0 vende, detajet të shfaqin mungesën e vendeve dhe buton disabled, pa lidhje aktive për kërkesë. Hapja direkte e rrugës së kërkesës të mos shfaqë simulimin në pritje.

Vëzhgimi: **PASS (HTTP dhe HTML serveri).** Të dyja faqet kthyen HTTP 200. Detajet treguan Lipjan – AAB dhe Vende të lira: 0, me butonin disabled “Nuk ka vende të lira”; nuk kishte href për /udhetimi/3/kerkesa. GET direkt në atë rrugë shfaqi titullin “Nuk ka vende të lira.” dhe nuk përmbante “Simulim: Në pritje”. Lista publike mbeti identike. U ndryshua vetëm ID-ja e kërkuar; dallimet e qytetit, orës dhe vendeve vijnë nga rreshti ekzistues. **Ndërveprimi në UI: NOT VERIFIED**, sepse nuk u kryen klikime. Nuk u pretendua provë me të dhënat P7 të vendosura në databazë.

## Ndryshimi i ri
Hyrja ndryshoi nga ID 1 në ID 3; nuk u ndryshuan të dhëna në Neon. Pritshmëria e asistuar nga AI ishte që rreshti ekzistues me 0 vende ta bllokonte veprimin. HTML-ja reale konfirmoi butonin disabled dhe mesazhin e mungesës së vendeve edhe në rrugën direkte të kërkesës. Rezultati rrjedh nga kushti ekzistues vende > 0, i cili nuk u ndryshua.

**Demonstrimi personal para kolegut nuk është kryer.** Studenti duhet të rishikojë draftin e parashikimit, ta shpjegojë personalisht ndryshimin dhe t'i përsërisë provat me ndërveprim në UI përpara dorëzimit manual. Varianti personal P7-378 është dokumentuar saktë, por nuk është ekzekutuar si fixture lokal ose si rresht në Neon. Nuk pretendohet përputhje e plotë me kërkesën e parashikimit personal pa AI.

## Ndihma nga AI
Codex u përdor për analizën e kodit, leximin e udhëzimeve dhe modelit zyrtar, marrjen e P7-378 nga gjeneratori zyrtar, draftin e parashikimit, mbështetjen në implementimin e korrigjimit, ekzekutimin e provave dhe kontrolleve teknike, shkrimin e raportit dhe komandat Git. Nuk pretendohet punë tërësisht manuale ose verifikim personal nga studenti.

Kontrollet reale pas korrigjimit:
- npm test: **PASS**, 5 skedarë, 13/13 teste. Edhe gjendja fillestare kishte kaluar 13/13; nuk u shtuan teste të reja në repository.
- npm run lint: **PASS**, exit code 0, pa diagnostikime.
- npm run build: **PASS**, exit code 0; kompilimi dhe TypeScript përfunduan me sukses. Lista, API-ja, detajet dhe kërkesa figurojnë si rrugë dinamike.
- Tri provat HTTP më sipër: **PASS**. Ato nuk zëvendësohen nga build-i ose testet e njësive.
- UI, demonstrimi para kolegut dhe parashikimi personal: **NEEDS MANUAL VERIFICATION**.

U ndryshuan vetëm ky raport dhe një rresht në skedarin e korrigjimit. Nuk u krye SQL shkrimi, deployment manual ose krijim Issue në repository-n e profesorit. Push-et ruhen në main; verifikimi final i GitHub kryhet pas commit-it të këtij raporti. Vlerat e sekreteve nuk përfshihen në raport. Kontrolli i emrave të skedarëve dhe modeleve të zakonshme të sekreteve nuk është garanci absolute për mungesën e çdo sekreti historik.

Kontrolli lokal i publikimit: git ls-files tregoi vetëm aplikacioni/.env.example si model konfigurimi. DATABASE_URL në atë model përmban USER, PASSWORD dhe HOST si vlera shembull; fushat e sekreteve GitHub dhe NextAuth janë bosh. aplikacioni/.env.local është i injoruar dhe nuk është i gjurmuar. Kontrolli për modele të zakonshme token-ësh dhe çelësash privatë nuk gjeti kredenciale reale në skedarët e gjurmuar; përputhja e vetme ishte URL-ja shembull e databazës. Para dhe Pas u dërguan me sukses me git push origin main. Nuk pretendohet auditim i plotë i historikut për çdo lloj sekreti.
