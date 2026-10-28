# Java 6 – RideShare PWA / Offline Reader

## Përmbledhja

Java 6 shton një lexues publik PWA vetëm për lexim offline mbi aplikacionin ekzistues Next.js në `aplikacioni/`. Tri udhëtimet, Neon, GitHub OAuth, JWT, paneli dhe autorizimi i Javës 5 ruhen. Nuk u shtuan varësi, rezervime offline ose radhë kërkesash POST.

## Manifesti dhe ikonat

`aplikacioni/src/app/manifest.ts` shërben `/manifest.webmanifest`: emri `RideShare AAB`, emri i shkurtër `RideShare`, përshkrimi “Udhëtime drejt AAB; listë publike për lexim offline.”, `start_url` dhe `scope` `/`, `display: standalone`, sfondi `#0b101b` dhe tema `#be3455`. Ikonat PNG `public/icons/icon-192.png` dhe `icon-512.png` u krijuan lokalisht, pa biblioteka të reja; përmasat reale u kontrolluan si 192×192 dhe 512×512.

## Public Trips API

`GET /api/udhetimet` përdor `lexoUdhetimet()` ekzistues dhe kthen `{ "trips": [...] }`. Çdo element përmban vetëm `id`, `nisja`, `destinacioni`, `ora`, `vendtakimi`, `vende`. Përgjigjet kanë `Cache-Control: no-store`; gabimi i databazës kthen HTTP 503 me mesazh të përgjithshëm. Nuk ekspozohen profile, role, email, GitHub ID ose sekrete.

## Service Worker

`public/sw.js` regjistrohet me scope `/` nga `src/components/Pwa.tsx`, i shtuar para `{children}` në layout pa zëvendësuar CSS ose metadata. Pas kontrollit të faqes kryhet një kërkesë për mbushjen fillestare të kopjes.

Cache-i `rideshare-public-v1` përmban vetëm `/offline.html`, dy ikonat dhe `/api/udhetimet`. Instalimi ruan tre asetet statike; aktivizimi fshin vetëm cache-t e vjetra me prefiksin `rideshare-public-`. API-ja përdor network-first: JSON-i verifikohet, ruhen vetëm gjashtë fushat publike dhe shtohen `x-rideshare-saved-at` dhe `x-rideshare-source: network`. Në dështim përdoret kopja me burim `cache`; pa kopje kthehet 503. Kërkesa publike kryhet me `credentials: omit` dhe përgjigjja e ruajtur ndërtohet me header-a publikë të zgjedhur.

Navigimi real ose refresh i `/` pa rrjet merr dokumentin e ruajtur offline. Worker-i nuk ruan HTML-në e aplikacionit, `/panel`, `/api/auth`, OAuth callbacks, profile, cookie sesioni, POST ose Server Actions. Në DevTools u verifikuan saktësisht katër hyrjet publike në cache.

## Offline Reader

`public/offline.html` është HTML standalone me CSS dhe JavaScript pa Next.js runtime. Shfaq kartat, orën, vendet, vendtakimin, burimin dhe kohën e ruajtjes. Të dhënat dinamike vendosen me `textContent`. Ka paralajmërim për vjetërsinë e kopjes, lidhje kthimi dhe butonin “Rifresko listën”. Çdo “Kërko vend” është disabled; asnjë rezervim nuk kryhet ose pretendohet.

## Tri provat

### Prova 1

PWA online.

Hapat: U kontrolluan HTTP `/manifest.webmanifest`, `/api/udhetimet`, `/offline.html`, `/sw.js` dhe përmasat binare PNG. Në Chrome u hap aplikacioni, pastaj lexuesi; në DevTools → Application u kontrolluan Service workers dhe Cache storage.

Pritja: Manifest i saktë, ikona 192×192/512×512, worker aktiv, tri udhëtime publike, kopja në `rideshare-public-v1`, tri karta dhe timestamp.

Rezultati real: PASS. Rrugët kthyen HTTP 200. API-ja ktheu tri udhëtime, vetëm gjashtë fushat e kërkuara dhe `Cache-Control: no-store`. PNG-të kishin përmasat e kërkuara. DevTools shfaqi `/sw.js` si “activated and is running”; cache-i përmbante saktësisht katër hyrjet e lartpërmendura. Lexuesi shfaqi tri kartat me burim `network` dhe ruajtjen e fundit `28 tetor 2026, 12:12:13` sipas orës së shfaqur në Chrome.

### Prova 2

Offline pas refresh.

Hapat: Pas mbushjes së cache-it, në Chrome DevTools → Network u zgjodh `Offline`. U hap adresa `http://localhost:3000/` dhe u krye refresh real me F5.

Pritja: `/` shfaq lexuesin standalone me tri karta nga cache, timestamp-in, paralajmërimin dhe rezervime të çaktivizuara.

Rezultati real: PASS. Edhe pas F5, `/` shfaqi dokumentin “RideShare AAB – Lexim offline”, burimin `cache`, të njëjtën kohë ruajtjeje `12:12:13` dhe orët `08:00`, `08:15`, `07:45`. Tri kartat ishin të pranishme dhe tre butonat “Kërko vend” disabled. Paralajmërimi për të dhëna të vjetra ishte i dukshëm. Network tregoi kërkesat reale të rrjetit të dështuara dhe përgjigjet e dokumentit/API-së të shërbyera nga ServiceWorker.

### Prova 3

Rikthimi online.

Hapat: Ndërsa Chrome ishte Offline, në Neon u ekzekutua `UPDATE udhetimet SET ora = '08:25' WHERE id = '2' RETURNING id, ora`. U kontrollua që kopja offline ende tregonte `08:15`. Network u rikthye në `No throttling` dhe u klikua “Rifresko listën”. Pastaj në Neon u ekzekutua `UPDATE udhetimet SET ora = '08:15' WHERE id = '2' RETURNING id, ora` dhe lista u rifreskua sërish.

Pritja: Kopja offline mbetet e pandryshuar; rifreskimi online sjell `08:25` me burim `network` dhe timestamp të ri. Në fund Neon dhe kopja lokale rikthehen në `08:15`.

Rezultati real: PASS. Neon konfirmoi përkohësisht `08:25`, ndërsa lexuesi offline ruajti `08:15` dhe timestamp-in fillestar. Pas rikthimit të rrjetit dhe klikimit, lexuesi shfaqi `08:25`, burimin `network` dhe timestamp `12:15:08`. SQL-ja e rikthimit konfirmoi `08:15`; rifreskimi final shfaqi `08:15`, burimin `network` dhe timestamp `12:15:28`. Cache Storage konfirmoi hyrjen e API-së të përditësuar në `12:15:28`. Nuk u ndryshuan rreshta ose fusha të tjera në Neon.

## Përfundimi

Tri provat e kërkuara u ekzekutuan realisht në Chrome dhe kaluan. `npx tsc --noEmit`, kontrolli sintaksor i `sw.js` dhe `npm run build` përfunduan me sukses; nuk u ekzekutuan test suites ose Playwright. Burimet e leximit Neon dhe të autentikimit/autorizimit të Javës 5 mbetën të pandryshuara. Paneli ekzistues shfaqi sesionin e shoferit gjatë kontrollit; nuk u përsëritën provat e ndryshimit të orës të Javës 5. Offline funksionon pas një vizite fillestare online që instalon worker-in dhe mbush kopjen; pa kopje të mëparshme nuk pretendohet listë offline. Nuk u krijua GitHub Issue ose deployment shtesë.
