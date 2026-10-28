# Java 5 – RideShare

U implementua autentikimi GitHub me `next-auth@4.24.15`, sesioni JWT me jetëgjatësi 2 orë dhe GitHub ID numerik në sesion. Paneli `/panel` mundëson hyrjen, daljen, shfaqjen e emrit/rolit/ID dhe ndryshimin e orës së udhëtimit 2 për shoferin. Faqja kryesore ka lidhjen “Hyr / Paneli im”. Kartat dhe faqet ekzistuese të Javës 4 u ruajtën.

OAuth App përdor Homepage `http://localhost:3000` dhe Callback `http://localhost:3000/api/auth/callback/github`. Variablat `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET` dhe `NEXTAUTH_URL` ruhen në `.env.local` të përjashtuar nga Git. `NEXTAUTH_SECRET` u gjenerua automatikisht; `DATABASE_URL` ekzistuese u ruajt.

Skema `aplikacioni/schema-java05.sql` u ekzekutua në Neon ekzistues. Tabela `profilet` përdor `github_id` si çelës primar, emrin dhe rolin e kufizuar në `udhetar`/`shofer`, me parazgjedhje `udhetar`. Kolona `udhetimet.shofer_id` ka foreign key. ID 1 i përket `DEMO-SHOFER-2`. Pas hyrjes reale u verifikua ID numerik `189488131` i Alajdin Fetahit; administrativisht u caktua si shofer dhe pronar i ID 2. Hyrjet pasuese ruajnë rolin ekzistues, ndërsa përdoruesit e rinj regjistrohen si udhëtarë.

Server action merr identitetin nga `getServerSession`. UPDATE i parametrizuar kontrollon njëkohësisht pronarin dhe rolin në databazë. Input-i përcakton vetëm udhëtimin dhe orën, jo identitetin apo pronësinë. Pa sesion refuzohet ndryshimi; udhëtari dhe shoferi jopronar nuk mund të ndryshojnë orën. Pranohet vetëm HH:mm nga 00:00 deri në 23:59. Paneli shfaq mesazhe për sukses, refuzim, sesion të munguar, format të pavlefshëm dhe gabim databaze. Pas suksesit rifreskohen lista, detajet dhe paneli.

## Rezultatet reale – 28 tetor 2026

1. **Session: PASS.** Hyrje reale me GitHub në Chrome; përdoruesi i ri u shfaq fillimisht `udhetar`, me ID `189488131`. Pas caktimit administrativ u shfaq `shofer`. Refresh me F5 ruajti sesionin. “Dil” e largoi sesionin dhe paneli shfaqi “Mungon sesioni. Hyr me GitHub.”.
2. **Authorized update: PASS.** Formulari real i panelit ndryshoi ID 2 në `08:25`; u shfaq mesazhi i suksesit. SELECT në Neon konfirmoi `08:25`; GET `/` dhe `/udhetimi/2` kthyen HTTP 200 dhe përmbanin `08:25`. Më pas server action riktheu `08:15`; Neon, lista dhe detajet konfirmuan rikthimin.
3. **Unauthorized update: PASS.** U dërgua POST direkt te server action për ID 1 me `08:25`, duke përdorur një JWT kontrolli të nënshkruar lokalisht për identitetin e shoferit real `189488131` (jo cookie e nxjerrë nga Chrome). Përgjigjja ishte HTTP 303 drejt `/panel?rezultati=refuzim`. SELECT në Neon konfirmoi që ID 1 mbeti `08:00`.

Kontrollet minimale shtesë: `npx tsc --noEmit`, `npm run build` dhe `npm run lint` përfunduan pa gabime. Lista, detajet 1/2 dhe paneli kthyen HTTP 200. Neon ruan tri udhëtimet: ID 1 `08:00`, ID 2 `08:15`, ID 3 `07:45`. Nuk u krijua framework testimi dhe nuk u implementuan sfida opsionale.

## Kufizimi i mbetur

OAuth funksionoi me kredencialet lokale. Gjatë kontrollit të shfletuesit një dalje e mjetit shfaqi pa dashje Client Secret. Nuk u shtua në Git; është kërkuar zëvendësimi i tij në GitHub dhe ruajtja lokale e sekretit të ri përpara dorëzimit. Nuk janë kryer deployment shtesë ose krijim i GitHub Issue.
