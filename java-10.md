# RideShare — Java 10

## Çfarë ndërtova

Kërkesa për vend ruhet realisht në Neon. Shoferi pronar dhe udhëtari lexojnë të njëjtin udhëtim çdo 5 sekonda; pranimi ndryshon statusin dhe vendet atomikisht. Krahasuar me Javën 9, preferimet personale vazhdojnë të punojnë, ndërsa simulimi i kërkesës është zëvendësuar me kërkesë reale dhe rilidhje automatike. Dizajni, autentikimi GitHub/NextAuth, PWA dhe vendtakimi ekzistues janë ruajtur. Nuk u shtuan dependenca.

Burimet: [udhëzimet zyrtare](https://arbenl.github.io/lendet/2026-2027/mobile/java-10/) dhe [modeli i raportit](https://arbenl.github.io/lendet/2026-2027/mobile/java-10/java-10-model.md).

## Përgatitja e provës

Provat u ekzekutuan lokalisht më 25.11.2026, kundër Neon-it ekzistues të projektit, me Edge headless dhe browser contexts të izoluara. U krijuan profile vetëm fiktive: shofer, udhëtar dhe një udhëtar tjetër për autorizimin/konkurrencën. Sesionet e testimit u nënshkruan lokalisht me mekanizmin ekzistues NextAuth; serveri i lexoi përmes `getServerSession`. Nuk u shtua hyrje testimi ose anashkalim autentikimi në aplikacion. Hyrja interaktive OAuth me dy llogari GitHub reale: **NOT VERIFIED**. Asnjë token ose sekret nuk përfshihet në raport/Git.

- Udhëtimi i provave 1–2: `J10-1795628256007-1`, fillimisht 2 vende, nisje fiktive, ora 08:30.
- Udhëtimi i provës 3: `J10-1795628256007-2`, fillimisht 2 vende, ora 08:30.
- Prova konkurruese: `J10-1795628256007-race`, fillimisht 2 vende; u vendos 1 vend para garës për vendin e fundit.

## Provat që bëra

### Prova 1: Rasti 1 · Kërkesa mbërrin te shoferi

- Hapat: hapa detajet te shoferi dhe faqen `/kerkesa` te udhëtari; udhëtari shtypi “Kërko një vend”. Pas konfirmimit u rifreskua vetëm udhëtari për të kontrolluar qëndrueshmërinë. U përsërit kërkesa për të njëjtin udhëtim.
- Pritshmëria: ruajtje `pending`, shfaqje automatike te shoferi dhe 2 vende në të dy ekranet.
- Vëzhgimi real: **PASS**. Shoferi pa “Në pritje” pa Refresh; udhëtari pa “Kërkesa u dërgua”. Të dy treguan 2 vende. Pas rifreskimit fillestar kërkesa mbeti pending. Përsëritja la vetëm një rresht.
- Ruajtja u verifikua me SELECT të drejtpërdrejtë në Neon dhe GET-in e autentikuar të gjendjes.

### Prova 2: Rasti 2 · Pranimi përditëson të dy ekranet

- Hapat: shoferi shtypi “Prano kërkesën”; u prit përditësimi automatik i udhëtarit. Pastaj u dërguan 8 pranime identike paralelisht.
- Pritshmëria: `accepted`, 2 → 1 vende vetëm një herë; përsëritjet pa zbritje tjetër.
- Vëzhgimi real: **PASS**. Shoferi pa “Pranimi u ruajt”; udhëtari “U pranua · Vendi u konfirmua”; të dy panë 1 vend pa Refresh. Tetë përsëritjet kthyen HTTP 200 dhe lanë 1 vend.
- Prova me 0 vende: u krijua kërkesë tjetër fiktive pending, pastaj vetëm udhëtimi fiktiv u vendos në 0 vende me SQL. Pranimi u refuzua HTTP 409; vendet mbetën 0 dhe kërkesa pending. Ky është shkaku pse udhëtimi i parë në përfundim ka 0 vende.
- Autorizimi: udhëtari tjetër provoi pranimin dhe leximin `?driver=1`: HTTP 403. GET-i i tij normal përmbante vetëm kërkesën e vet. Vizitori anonim: HTTP 401.
- Konkurrenca: dy kërkesa të ndryshme garuan për vendin e fundit te udhëtimi `-race`: një HTTP 200, një HTTP 409, vetëm një accepted dhe 0 vende; asnjë numër negativ.
- Përgjigjja e vjetër: një GET me 2 vende u mbajt pezull në browser gjatë mutation-it të shoferit. Pas pranimit/rikthimit të përgjigjes së vjetër, ekrani mbeti në 1 vend.

### Prova 3: Rasti 3 · Ndërprerja dhe rilidhja

- Hapat: përdora `J10-1795628256007-2` me 2 vende dhe kërkesë pending. Vetëm context-i i udhëtarit u vendos offline me `browserContext.setOffline(true)`; shoferi mbeti online dhe pranoi. Pastaj context-i i udhëtarit u rilidh.
- Pritshmëria: udhëtari ruan gjendjen e fundit dhe paralajmëron; pas rilidhjes merr accepted/1 automatikisht.
- Vëzhgimi real: **PASS**. Shoferi tregoi 1 vend dhe pranimin e ruajtur. Udhëtari offline mbajti 2 vende dhe “Në pritje”, me “Po rilidhemi · të dhënat mund të jenë të vjetra”. Pas rilidhjes, pa Refresh, shfaqi accepted/1 dhe “Gjendja u lexua nga serveri”; paralajmërimi u hoq.

## Ku gjendet puna

- `aplikacioni/schema-java10.sql`: migrim minimal, i aplikuar në Neon-in e autorizuar. Tabela `kerkesat` ka ID, `ride_id`, `passenger_id`, statusin pending/accepted, foreign keys dhe `UNIQUE(ride_id, passenger_id)`. Tabelat/të dhënat ekzistuese u ruajtën.
- Funksioni PostgreSQL `prano_kerkesen`: kyç udhëtimin me `FOR UPDATE`, kontrollon pronarin/rolin, kyç kërkesën, kthen pranimin ekzistues pa zbritje dhe refuzon kur mungojnë vendet. Dy UPDATE-t kryhen brenda të njëjtit statement/transaksion; një gabim i anulon të dy.
- `aplikacioni/src/lib/kerkesat.ts`: lexim SELECT pa shkrime, kërkesa idempotente pa ndryshim vendesh dhe thirrja e pranimit atomik. Pyetjet janë të parametrizuara.
- `aplikacioni/src/app/api/udhetimet/[id]/gjendja/route.ts`: GET/POST me identitet vetëm nga sesioni server-side. Pronari lexon kërkesat e udhëtimit të vet; udhëtari vetëm të vetën. POST kontrollon origjinën. Përgjigjet kanë `Cache-Control: private, no-store` dhe `Vary: Cookie`.
- `aplikacioni/src/components/Sinkronizimi.tsx`: përdoret në detaje dhe `/kerkesa`; polling çdo 5000 ms, vetëm një lexim aktiv, anulim i leximit para mutation-it dhe injorim përgjigjesh të vjetra. Butonat çaktivizohen gjatë veprimit/ndërprerjes; sukses vetëm pas përgjigjes së serverit. Timeout 10 sekonda; timer-at, listener-at dhe kërkesat pastrohen gjatë largimit. Ngjarja `online` provon menjëherë leximin. Gabimet ruajnë gjendjen e fundit.
- Faqet `src/app/udhetimi/[id]/page.tsx` dhe `kerkesa/page.tsx` integrojnë komponentin. Testi ekzistues i simulimit u përshtat; `route.test.ts` mbulon sesionin, privatësinë, origjinën, identitetin e falsifikuar dhe refuzimet.

### Kontrollet dhe laptopi/telefoni

- `npm test`: **36/36 PASS**, 9 skedarë.
- `npm run lint`: **PASS**.
- `npm run build`: **PASS**, përfshirë rrugën dinamike të gjendjes dhe TypeScript.
- Pamjet e offline/rilidhjes dhe shoferit u hapën e u inspektuan. Gjerësitë 320/390/768/1440 px: pa overflow horizontal në provën e browser-it.
- Pas largimit nga faqja nuk u vëzhgua GET tjetër i gjendjes gjatë 5.5 sekondave. Rreshtat ekzistues të udhëtimeve u krahasuan para/pas provës dhe mbetën të pandryshuar; ndryshuan vetëm fixture-t fiktive të kësaj detyre.
- Evidencat lokale jashtë Git: `%TEMP%/rideshare-week10/verify.cjs`, `results.json`, `passenger-offline.png`, `passenger-reconnected.png`, `driver-desktop.png`. Provat përdorën service workers të bllokuara për izolim të rrjetit; kodi ekzistues SW nuk cache-on endpoint-in personal të gjendjes.
- Next.js mbetet aktiv në proces të veçantë, nga `aplikacioni`, me `npm run dev -- -H 0.0.0.0 -p 3000`.
- Laptop: **http://localhost:3000**. Telefon në të njëjtin Wi-Fi: **http://10.54.4.74:3000**. IP-ja u lexua nga adapteri real Wi-Fi; të dy adresat kthyen HTTP 200 nga laptopi. Prova fizike nga telefoni: **NOT VERIFIED**. Profili aktual Windows është Public; firewall-i dhe profili i rrjetit nuk u ndryshuan. Qasja reale nga telefoni/client isolation mbetet për kontroll manual. IP-ja mund të ndryshojë.

## Prova me kolegun

**NOT VERIFIED**: nuk u krye demonstrim me një koleg ose demonstrim personal nga studenti. Provat e mësipërme janë automatizime reale lokale me browser dhe Neon, të kryera nga Codex.

## Çfarë mbetet për përmirësim

Mbeten hyrja OAuth nga fillimi me dy llogari reale, prova fizike në telefon, demonstrimi me kolegun dhe dorëzimi manual. Në një hapje të re pa rrjet nuk premtohet ruajtje e gjendjes personale: gjendja e fundit ruhet në memorien e ekranit të hapur. Nuk u shtua cache personal ose localStorage. Sinkronizimi ka vonesën normale deri në ciklin e ardhshëm 5-sekondësh plus kohën e rrjetit.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

U përdor Codex për inspektimin, migrimin SQL, implementimin minimal, testet, browser automation dhe raportin. Rezultatet u morën nga ekzekutimet reale; nuk pretendohet provë personale e studentit. Rishikimi i kodit ishte lokal, jo i pavarur. Nuk u përdorën subagents ose workflows të personalizuara.

## Pas dorëzimit të parë — përditëso më vonë

Feedback-u i GitHub-it ende nuk është marrë dhe do të plotësohet pas dorëzimit manual. Nuk u krijua Issue te profesori. Nuk pretendohet rezultat 2/2 ose vlerësim i profesorit/botit.
