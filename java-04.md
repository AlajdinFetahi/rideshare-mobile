# RideShare — Java 4 · Neon dhe PostgreSQL

## Çfarë ndërtova
Lista, detajet dhe faqja e kërkesës tani përdorin funksione asinkrone në server. `getSql` lexon `DATABASE_URL` vetëm në server dhe krijon klientin Neon, ndërsa `lexoUdhetimet` dhe `gjejUdhetimin` ekzekutojnë pyetje të parametrizuara PostgreSQL. Faqet paraqesin veçmas listën bosh, udhëtimin që mungon dhe gabimin e lidhjes.

## Provat që bëra

### Prova 1: Ndryshimi në databazë shfaqet në aplikacion
Kjo provë nuk u ekzekutua kundër Neon sepse në kompjuter nuk kishte `DATABASE_URL` dhe nuk kishte sesion të autentifikuar në Neon/Vercel. `schema.sql` përmban tri udhëtimet dhe komandat e aplikacionit janë gati; ora e ID 2 mbetet `08:15` në skemë.

### Prova 2: Lista bosh dhe rikthimi
Testi automatik simuloi një rezultat SQL bosh dhe faqja shfaqi “Nuk ka udhëtime për momentin.”. Një rezultat me udhëtim riktheu kartën përkatëse. Ndryshimi i përkohshëm `WHERE false` në databazën reale mbetet për t’u provuar pasi të konfigurohet Neon.

### Prova 3: Lidhja mungon, rikthimi dhe siguria
Testet automatike verifikuan se mungesa e `DATABASE_URL` prodhon gabimin “Databaza nuk është konfiguruar.” dhe se faqet shfaqin mesazhin e sigurt “Nuk u lidhëm me databazën. Provo përsëri.”. `.env.local` nuk ekzistonte, ndërsa `.gitignore` përjashton `.env*`; u shtua vetëm `.env.example` me vlerë shembull. Rikthimi i lidhjes reale mbetet për t’u provuar pasi të vendoset kredenciali privat.

## Ku gjendet puna
Skema është në `aplikacioni/schema.sql`. Lidhja dhe pyetjet janë në `aplikacioni/src/lib/db.ts` dhe `aplikacioni/src/lib/udhetimet.ts`; faqet e ndryshuara janë lista, detajet dhe kërkesa nën `aplikacioni/src/app/`. Repository: https://github.com/AlajdinFetahi/rideshare-mobile

## Çfarë mbetet për përmirësim
Duhet krijuar/lidhur databaza Neon, ekzekutuar `schema.sql`, vendosur `DATABASE_URL` privatisht në `.env.local` dhe Vercel, pastaj duhen përfunduar tri provat manuale në 375 px. Kërkesa “Në pritje” mbetet simulim; nuk ka rezervim real.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI ndihmoi me implementimin, testet automatike dhe kontrollet e kodit. Rezultatet e raportuara u morën vetëm nga komandat e ekzekutuara; prova me databazë reale nuk u deklarua si e kryer.
