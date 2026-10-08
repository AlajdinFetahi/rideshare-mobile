# RideShare — Java 4 · Neon dhe PostgreSQL

## Çfarë ndërtova

Lista, detajet dhe faqja e kërkesës përdorin funksione asinkrone në server. `getSql` lexon `DATABASE_URL` vetëm në server dhe krijon klientin Neon, ndërsa `lexoUdhetimet` dhe `gjejUdhetimin` ekzekutojnë pyetje PostgreSQL; kërkimi sipas ID-së është i parametrizuar. Faqet janë dinamike dhe paraqesin veçmas listën bosh, udhëtimin që mungon, udhëtimin pa vende dhe gabimin e sigurt të lidhjes.

Databaza ekzistuese e projektit `rideshare-mobile` u ripërdor në Neon, në rajonin `aws-eu-central-1`, me databazën `neondb` dhe branch-in primar `production`. Projekti Vercel `rideshare-mobile` u lidh me repository-n, branch-in `main`, framework-un Next.js dhe Root Directory `aplikacioni`. `DATABASE_URL` u konfigurua privatisht për Production dhe Development; Preview nuk u konfigurua sepse nuk nevojitej për këtë detyrë.

Production: https://rideshare-mobile-sage.vercel.app

## Provat që bëra

### Prova 1: Ndryshimi real në databazë

Në Neon ndryshova përkohësisht orën e udhëtimit me ID 2 nga `08:15` në `08:25`. Pas rifreskimit, si lista ashtu edhe faqja e detajeve në production shfaqën `08:25`. Pastaj ora u rikthye në `08:15` brenda pastrimit të garantuar dhe të dyja faqet e shfaqën përsëri vlerën fillestare. Gjithashtu u verifikua se ID 3 ka zero vende dhe se `/udhetimi/99` kthen statusin HTTP 404 me faqen “Udhëtimi nuk u gjet”. Rezultati: **PASS**.

### Prova 2: Lista bosh dhe rikthimi

Pyetja e listës u ndryshua përkohësisht me `WHERE false`, pa fshirë rreshta. Faqja lokale shfaqi “Nuk ka udhëtime për momentin.” dhe zero karta. Pyetja origjinale u rikthye menjëherë; pas rifreskimit u shfaqën sërish tri kartat me ID 1–3 dhe ora `08:15` për ID 2. Rezultati: **PASS**.

### Prova 3: Mungesa e `DATABASE_URL`

Vetëm në ambientin lokal, emri i variablës u ndryshua përkohësisht dhe serveri u rinis. Faqja ktheu statusin HTTP 200 me mesazhin e sigurt “Nuk u lidhëm me databazën. Provo përsëri.”, pa shfaqur emrin ose vlerën e sekretit dhe pa karta udhëtimesh. Variabla u rikthye, serveri u rinis dhe tri kartat u shfaqën përsëri. Sekretet e production nuk u ndryshuan. Rezultati: **PASS**.

### Prova responsive në 375 px

U ekzekutuan në browser nëntë pamje/gjendje me viewport `375 × 844`: lista, kalimi te detajet, Not Found, detajet, kalimi te kërkesa, simulimi i kërkesës dhe gjendja pa vende. Të gjitha kontrollet kaluan; nuk pati overflow horizontal, butoni pa vende ishte i çaktivizuar dhe veprimet kryesore kishin lartësi së paku 44 px. Çdo screenshot u hap dhe u kontrollua vizualisht. Rezultati: **PASS** (rishikim lokal, jo i pavarur).

## Verifikimi i databazës dhe cilësisë

`schema.sql` u ekzekutua dy herë pa krijuar dublikate. SELECT-i real ktheu:

1. ID 1 — Prishtinë → AAB, `08:00`, 2 vende.
2. ID 2 — Fushë Kosovë → AAB, `08:15`, 1 vend.
3. ID 3 — Lipjan → AAB, `07:45`, 0 vende.

Rezultatet finale: 13/13 teste kaluan, ESLint kaloi dhe build-i production i Next.js kaloi. `npm audit --omit=dev` raportoi zero dobësi prodhimi. Auditimi i plotë raportoi pesë dobësi `high` vetëm në zinxhirin e mjeteve të zhvillimit të `eslint-config-next`; rregullimi automatik i propozuar kërkon downgrade të papajtueshëm dhe nuk u aplikua.

## Ku gjendet puna

Skema është në `aplikacioni/schema.sql`. Lidhja dhe pyetjet janë në `aplikacioni/src/lib/db.ts` dhe `aplikacioni/src/lib/udhetimet.ts`; faqet janë nën `aplikacioni/src/app/`. `.env.local` dhe `.vercel` janë të përjashtuara nga Git. Repository: https://github.com/AlajdinFetahi/rideshare-mobile

## Çfarë mbetet për përmirësim

Kërkesa “Në pritje” mbetet qëllimisht simulim sipas detyrës; nuk krijon rezervim real. Pesë dobësitë e mjeteve të lint-it duhen rivlerësuar kur të ketë një përditësim kompatibil të varësive.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

AI ndihmoi me implementimin, testet, konfigurimin e integrimeve dhe verifikimin. Në raport janë shënuar vetëm prova të ekzekutuara realisht; asnjë credential ose connection string nuk është ruajtur në dokumentim apo Git.
