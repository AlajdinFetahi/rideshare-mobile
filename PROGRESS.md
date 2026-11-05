# Progresi — Java 4

## Kërkesat

- [x] Instalimi i `@neondatabase/serverless` dhe `server-only`.
- [x] Skema idempotente PostgreSQL me tri udhëtime.
- [x] Lidhja private e serverit me `DATABASE_URL`.
- [x] Lista, detajet dhe kërkesa lexojnë në mënyrë asinkrone.
- [x] Gjendjet për listë bosh, gabim lidhjeje, ID që mungon dhe zero vende.
- [x] Testet e njësive dhe komponentëve të serverit.
- [x] Lidhja reale e Neon dhe Vercel.
- [x] Tri provat praktike kundër databazës reale/lokale.
- [x] Verifikimi responsive në gjerësi 375 px.
- [x] Commit/push final dhe Issue i dorëzimit.

## Konfigurimi real

- Neon: projekti ekzistues `rideshare-mobile`, rajoni `aws-eu-central-1`, branch-i primar `production`, databaza `neondb`.
- Vercel: projekti `rideshare-mobile`, GitHub `AlajdinFetahi/rideshare-mobile`, production branch `main`, framework Next.js, Root Directory `aplikacioni`, function region `fra1`.
- Production: https://rideshare-mobile-sage.vercel.app
- `DATABASE_URL`: konfiguruar privatisht për Production dhe Development; jo për Preview.
- `.env.local`, `.vercel`, `.next` dhe `node_modules`: të injoruara nga Git.

## Vendimet

- U ripërdor projekti ekzistues Neon në vend që të krijohej një projekt i dyfishtë.
- I njëjti branch `production` i Neon përdoret lokalisht dhe në production; database branching automatik nuk u aktivizua.
- Sekreti ruhet vetëm si `DATABASE_URL` dhe nuk dërgohet në client bundle.
- Pyetja sipas ID-së përdor parametrizimin e klientit Neon.
- Faqet janë `force-dynamic` që ndryshimet në databazë të lexohen në çdo kërkesë.
- Kërkesa për vend mbetet simulim, jo rezervim real.

## Komandat dhe rezultatet

- `schema.sql` u kontrollua për veprime destruktive dhe u ekzekutua dy herë — 3 rreshta, pa dublikate.
- SELECT real — ID 1 `08:00`/2 vende; ID 2 `08:15`/1 vend; ID 3 `07:45`/0 vende.
- Prova 1 — `08:15 → 08:25 → 08:15` u verifikua në listë dhe detaje; ID 3 pa vende; ID 99 HTTP 404: **PASS**.
- Prova 2 — `WHERE false` shfaqi listën bosh; rikthimi shfaqi tri kartat: **PASS**.
- Prova 3 — mungesa lokale e `DATABASE_URL` shfaqi gabim të sigurt; rikthimi shfaqi tri kartat: **PASS**.
- Browser automation në `375 × 844` — 9/9 gjendje u kapën dhe u inspektuan, pa overflow horizontal: **PASS**.
- `npm test` — 5 skedarë, 13/13 teste kaluan.
- `npm run lint` — kaloi pa gabime.
- `npm run build` — kaloi; lista, detajet dhe kërkesa janë rrugë dinamike.
- `npm audit --omit=dev` — 0 dobësi.
- `npm audit` — 5 dobësi `high`, vetëm në zinxhirin e mjeteve të lint-it; rregullimi i propozuar kërkon downgrade të papajtueshëm të `eslint-config-next`.
- Vercel deployment `dpl_FyVA9nVd6nJfvWw6WNdLGmZ8eEeg` — `Ready`, target `production`, funksionet në `fra1`.
- `git push origin main` — commit-i final `a6347ab` u dërgua dhe nisi deployment-in production nga integrimi GitHub.
- Issue i dorëzimit: https://github.com/arbenl/arbenl-mobile-assignments-2025/issues/433 — kontrolli automatik: **5/5**.

## Rreziqet dhe hapi i ardhshëm

- Rreziku i mbetur është vetëm auditimi i varësive të zhvillimit; prodhimi ka zero dobësi të raportuara.
- Nuk ka hap të detyrueshëm të pambyllur për dorëzimin e Javës 4.

## Rishikimi final

- U krye rishikim adversarial lokal, jo i pavarur, mbi korrektësinë, sigurinë, integritetin e të dhënave, regresionet dhe testet.
- Nuk u konfirmua problem bllokues në kodin e ndryshuar.
- Evidenca: SELECT real, tri provat praktike, 13/13 teste, lint, build, audit prodhimi, deployment production dhe 9/9 kontrolle browser në 375 px.

## Java 8 — 2026-11-05

### Kërkesat dhe pranimi

- Komponent i vetëm klient për vendtakimin te detajet reale dhe `/java-08-test`; dy gjendje të ndara për shkrimin dhe konfirmimin.
- `trim()`, gabim për tekst bosh, ruajtje e zgjedhjes së mëparshme dhe konfirmim i Parkingu.
- Geolocation vetëm me klikim, timeout 10000 ms, gjashtë gjendjet e kontratës, saktësia në metra dhe alternativa manuale në çdo rast.
- Shtatë `data-testid` unike, elementet e mesazheve gjithmonë në DOM, test publik pa Neon/API/login dhe manifest në rrënjë.
- Qasje nga LAN, raport sipas modelit zyrtar, kontroll privatësie dhe commit/push në main.

### Zbulimi dhe ndryshimet

- Gjendja fillestare e Git ishte e pastër; main në `5133166`, remote zyrtar i saktë. `package.json` dhe lockfile janë në `aplikacioni/`. Next.js App Router, React 19, Vitest dhe ESLint ekzistonin.
- U lexuan faqja e Javës 8, kontrata automatike, demonstrimi dhe modeli zyrtar. Demonstrimi u kap dhe u hap si imazh; u ruajt stili ekzistues i RideShare.
- U shtua `MeetingPoint.tsx`, faqja dhe testi `java-08-test`, `mobile-week08.json` dhe `java-08.md`. U ndryshuan vetëm integrimi/testi i detajeve, CSS-i i formularit, përjashtimi PWA për testin dhe konfigurimi LAN.
- Efekti PWA nuk nis lexim të `/api/udhetimet` në faqen e testit. Në faqet e tjera funksionet e Javës 7 ruhen.
- Nuk u ndryshuan databaza, autentikimi, autorizimi, varësitë ose lockfile. Komponenti nuk ruan/dërgon koordinata ose vendtakime.

### Komandat dhe rezultatet

- `npm ci --ignore-scripts`: PASS. Instalimi raportoi 12 dobësi ekzistuese; nuk u bënë përditësime jashtë objektivit.
- Testi i integrimit u provua fillimisht pa komponent: dështoi për mungesën e `meeting-input`. Pas implementimit `npm test`: 6 skedarë, 14 teste kaluan.
- `npm run lint`, `npx --no-install tsc --noEmit`, `npm run build`: PASS. Rruga `/java-08-test` gjenerohet statikisht.
- Chromium lokal: 10 skenarë funksionalë kaluan, përfshirë secilin nga tetë rastet e profesorit, gabimin e menjëhershëm të API-së, Enter/trim/rifreskim dhe riprovimin. Gjithashtu kaluan tri kontrolle responsive dhe rrjedha reale listë/detaje. Këto janë prova lokale, jo rezultatet e GitHub Actions.
- Evidenca jashtë Git: `%TEMP%/rideshare-week08/browser-tests.cjs`, `browser-results.json` dhe 12 pamjet e listuara në atë JSON. Gjerësitë 320/375/768/1440; pamjet u hapën dhe u inspektuan lokalisht. Gjendjet idle/loading/success/denied/timeout/unavailable dhe gabimi manual u kontrolluan. Nuk u konfirmua overflow horizontal ose problem pamjeje bllokues.
- Prova LAN zbuloi bllokimin e HMR nga Next.js. U riprodhua: faqja hapej por formulari nuk konfirmonte. U shtua `allowedDevOrigins` vetëm nga IPv4 i adapterit `Wi-Fi`; prova pas ndryshimit konfirmoi Biblioteka përmes IP-së LAN.
- Wi-Fi ndryshoi gjatë punës; u rizbulua IP-ja reale dhe u rinis konfigurimi. HTTP 200 në localhost, IP LAN dhe faqen e testit. Listener `0.0.0.0:3000`; `npm run dev -- -H 0.0.0.0 -p 3000` në proces të veçantë të fshehur, log-et në TEMP.
- `isSecureContext`: true në localhost; false në HTTP LAN. Nuk u krijua certifikatë/tunnel i ri dhe nuk u ndryshuan parametrat e sigurisë së browser-it.
- Firewall-i ekzistues kishte të tri profilet Disabled; nuk u ndryshua. Rruga e vetme default ishte Wi-Fi; nuk u gjet lidhje aktive VPN. Client isolation nuk mund të provohet nga laptopi i vetëm.

### Rishikimi dhe kufijtë

- Rishikim lokal, jo i pavarur: korrektësia, integrimi, privatësia, sjellja manuale dhe gabimet e geolocation. Nuk u konfirmua bllokues në ndryshimet përfundimtare. U përdorën udhëzimet code-quality, albanian-comments, testing, ui-styling/ui-ux-pro-max, secure-coding, systematic-debugging, visual-verification dhe adversarial-review për kontrollet përkatëse; pa delegim ose workflows të personalizuara.
- Përdoruesi konfirmoi nga telefoni hapjen në LAN dhe konfirmimin manual. GPS-i nuk punoi në HTTP LAN (`isSecureContext=false`); mbetet prova reale me HTTPS. “1 issue” në development u gjurmua te atributet `__gcruniqueid` të shtuara jashtë komponentit në formë/input; nuk u shtua kod për fshehjen e paralajmërimit.
- Production në portën e përkohshme 3001 me `DATABASE_URL` të pavlefshëm dhe pa konfigurim auth: `/java-08-test` HTTP 200 me formularin. Procesi i kësaj prove u mbyll; serveri LAN në 3000 mbetet aktiv.
- Mbeten GPS-i real, demonstrimi me kolegun dhe raportet zyrtare pas dorëzimit manual. Nuk pretendohet rezultat zyrtar 6/6 ose 8/8.
- Hapi i ardhshëm: kontrolli final i skedarëve të përzgjedhur, commit/push i kërkuar dhe verifikimi i remote-it e publikimit ekzistues HTTPS.
