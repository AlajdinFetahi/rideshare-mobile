# Java 5 – RideShare

U implementua autentikimi GitHub me `next-auth@4.24.15`, sesioni JWT me jetëgjatësi 2 orë dhe GitHub ID numerik në sesion. Paneli `/panel` mundëson hyrjen, daljen, shfaqjen e emrit/rolit/ID dhe ndryshimin e orës së udhëtimit 2 për shoferin. Faqja kryesore ka lidhjen “Hyr / Paneli im”. Kartat dhe faqet ekzistuese të Javës 4 u ruajtën.

OAuth App përdor Homepage `http://localhost:3000` dhe Callback `http://localhost:3000/api/auth/callback/github`. Variablat `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET` dhe `NEXTAUTH_URL` ruhen në `.env.local` të përjashtuar nga Git. `NEXTAUTH_SECRET` u gjenerua automatikisht; `DATABASE_URL` ekzistuese u ruajt.

Skema `aplikacioni/schema-java05.sql` u ekzekutua në Neon ekzistues. Tabela `profilet` përdor `github_id` si çelës primar, emrin dhe rolin e kufizuar në `udhetar`/`shofer`, me parazgjedhje `udhetar`. Kolona `udhetimet.shofer_id` ka foreign key. ID 1 i përket `DEMO-SHOFER-2`. Pas hyrjes reale u verifikua ID numerik `189488131` i Alajdin Fetahit; administrativisht u caktua si shofer dhe pronar i ID 2. Hyrjet pasuese ruajnë rolin ekzistues, ndërsa përdoruesit e rinj regjistrohen si udhëtarë.

Server action merr identitetin nga `getServerSession`. UPDATE i parametrizuar kontrollon njëkohësisht pronarin dhe rolin në databazë. Input-i përcakton vetëm udhëtimin dhe orën, jo identitetin apo pronësinë. Pa sesion refuzohet ndryshimi; udhëtari dhe shoferi jopronar nuk mund të ndryshojnë orën. Pranohet vetëm HH:mm nga 00:00 deri në 23:59. Paneli shfaq mesazhe për sukses, refuzim, sesion të munguar, format të pavlefshëm dhe gabim databaze. Pas suksesit rifreskohen lista, detajet dhe paneli.

## Rezultatet reale – 28 tetor 2026

### Prova 1 – Sesioni

Hapat: Në Chrome u hap `/panel`, u krye hyrja reale me GitHub, u rifreskua faqja me F5 dhe u përdor butoni “Dil”.

Rezultati real: **PASS.** Përdoruesi i ri u shfaq fillimisht `udhetar`, me GitHub ID `189488131`; pas caktimit administrativ u shfaq `shofer`. Rifreskimi ruajti sesionin. Dalja e largoi sesionin dhe paneli shfaqi “Mungon sesioni. Hyr me GitHub.”.

### Prova 2 – Ndryshimi i autorizuar

Hapat: Shoferi pronar ndryshoi orën e ID 2 në `08:25` nga formulari real i panelit. U kontrolluan Neon, lista `/` dhe detajet `/udhetimi/2`; pastaj ora u rikthye në `08:15` përmes server action.

Rezultati real: **PASS.** Paneli shfaqi mesazhin e suksesit. SELECT në Neon konfirmoi `08:25`; lista dhe detajet kthyen HTTP 200 dhe përmbanin `08:25`. Pas rikthimit, Neon, lista dhe detajet konfirmuan `08:15`.

### Prova 3 – Ndryshimi i paautorizuar

Hapat: U dërgua POST direkt te server action për ndryshimin e ID 1 në `08:25`, me një JWT kontrolli të nënshkruar lokalisht për identitetin e shoferit të ID 2, `189488131` (jo cookie e nxjerrë nga Chrome). Më pas u kontrollua ora e ID 1 me SELECT në Neon.

Rezultati real: **PASS.** Serveri e refuzoi ndryshimin me HTTP 303 drejt `/panel?rezultati=refuzim`. Ora e ID 1 mbeti `08:00` në Neon.

Kontrollet minimale shtesë: `npx tsc --noEmit`, `npm run build` dhe `npm run lint` përfunduan pa gabime. Lista, detajet 1/2 dhe paneli kthyen HTTP 200. Neon ruan tri udhëtimet: ID 1 `08:00`, ID 2 `08:15`, ID 3 `07:45`. Nuk u krijua framework testimi dhe nuk u implementuan sfida opsionale.

## Gjendja përfundimtare

Gjatë kontrollit të shfletuesit një dalje e mjetit shfaqi pa dashje Client Secret. Ai nuk u shtua në Git. Përdoruesi gjeneroi një sekret të ri; ai u ruajt nga clipboard-i vetëm në `.env.local`, u konfirmua që ndryshon nga sekreti i mëparshëm dhe u verifikua hyrja reale me të: paneli shfaqi sërish shoferin me GitHub ID `189488131`. Përdoruesi konfirmoi fshirjen e sekretit të vjetër në GitHub. Nuk mbeten pengesa të njohura për dorëzimin e Javës 5. Nuk janë kryer deployment shtesë ose krijim i GitHub Issue.
