# RideShare — Java 9

## Çfarë ndërtova

Shtova ruajtjen personale të udhëtimit te të preferuarat në faqen ekzistuese `/udhetimi/[id]`. Përdora NextAuth/GitHub, klientin ekzistues Neon dhe një Server Action, pa biblioteka të reja ose ndryshime në funksionet e Javëve 1–8.

Tabela `preferimet` lidhet me `profilet(github_id)` dhe `udhetimet(id)`. Migrimi `aplikacioni/schema-java09.sql` u aplikua në databazën e konfiguruar Neon; foreign keys dhe `UNIQUE(user_id, ride_id)` u kontrolluan në katalogun PostgreSQL. `INSERT ... ON CONFLICT DO NOTHING` e bën ruajtjen idempotente edhe me kërkesa të njëkohshme. Identiteti merret vetëm nga sesioni në server; ID-ja e udhëtimit validohet dhe kontrollohet në databazë. Query-t janë të parametrizuara dhe gabimet nuk ekspozojnë hollësi sensitive.

Komponenti React mbush menjëherë yllin dhe rrit numrin, por shfaq “Po ruhet...” deri në konfirmimin e serverit. Gjatë pritjes butoni çaktivizohet dhe një `useRef` bllokon thirrjet e përsëritura. Gabimi rikthen gjendjen e mëparshme dhe lejon “Provo përsëri”. Suksesi përdor numrin real të kthyer nga Neon. Faqja dinamike lexon preferimet e përdoruesit në server në çdo hapje/rifreskim; nuk përdoret localStorage ose sessionStorage. Gabimi i leximit shfaq mesazh gabimi, jo një numër të sajuar 0.

## Provat që bëra

Provat funksionale u kryen me Chromium të izoluar dhe Neon real. U përdor profili ekzistues i llogarisë së autorizuar, i verifikuar kundrejt llogarisë aktive GitHub CLI, me një JWT testimi të nënshkruar lokalisht me konfigurimin ekzistues NextAuth. Ky është sesion testimi; provat nuk përfshinë hyrjen interaktive OAuth nga fillimi. Asnjë token ose identitet personal i testimit nuk është shtuar në skedarët e rinj publikë. Provat nuk u kryen me kolegun ose nga një telefon fizik.

### Prova 1: Ruajtja e suksesshme mbetet pas rifreskimit.

- **Hapat:** Kontrollova udhëtimet reale dhe mungesën e preferimeve. Hapa udhëtimin `1`, klikova ruajtjen, mbajta kërkesën përkohësisht në pritje në automatizim dhe pastaj lejova komunikimin me serverin. Rifreskova dhe mbylla/hapa faqen përsëri.
- **Pritshmëria:** Yll i mbushur dhe numër +1 gjatë pritjes; “I ruajtur” vetëm pas konfirmimit; preferimi mbetet në server dhe pas rifreskimit.
- **Vëzhgimi:** Gjatë pritjes u shfaqën “★ Po ruhet...”, butoni disabled dhe numri 1. Serveri konfirmoi; Neon kishte një rresht për çiftin. Rifreskimi dhe rihapja ruajtën “★ I ruajtur” dhe numrin real 1.
- **Rezultati:** **PASS për rrjedhën me sesion testimi dhe Neon real.** Hyrja interaktive OAuth dhe dalja/hyrja reale përsëri mbeten për provë manuale; këto nuk deklarohen të verifikuara nga automatizimi.

### Prova 2: Gabimi i serverit nuk lë një sukses të rremë në ekran.

- **Hapat:** Hapa udhëtimin real `2`, fillimisht të paruajtur. Vetëm gjatë provës lokale shtova një refuzim të përkohshëm në Server Action, pas kontrollit të sesionit dhe para thirrjes që kryen INSERT, të kufizuar në development. Kontrollova pritjen, përgjigjen dhe Neon-in. Hoqa refuzimin dhe klikova “Provo përsëri” në të njëjtën faqe.
- **Pritshmëria:** Ylli dhe numri ndryshojnë gjatë pritjes, pastaj rikthehen; mesazhi shfaq gabim, butoni aktivizohet dhe databaza nuk merr rresht. Retry pa simulim ruan normalisht.
- **Vëzhgimi:** Numri kaloi përkohësisht 1 → 2 dhe u kthye 1; ylli u kthye bosh, u shfaq “☆ Provo përsëri” dhe “Nuk u ruajt. Provo përsëri.”. Pas refuzimit Neon kishte zero rreshta për këtë çift. Pas heqjes së simulimit, retry dha sukses dhe saktësisht një rresht. Kodi përfundimtar nuk përmban mekanizmin e simulimit ose endpoint prove.
- **Rezultati:** **PASS me refuzim real të përkohshëm në serverin lokal dhe verifikim në Neon.**

### Prova 3: Klikimet e përsëritura nuk krijojnë kopje.

- **Hapat:** Hapa udhëtimin real `3`, fillimisht të paruajtur. Dërgova 15 klikime të shpejta gjatë pritjes dhe më pas 5 përsëritje të njëkohshme të së njëjtës kërkesë Server Action të autentikuar. Rifreskova dhe kontrollova databazën e constraint-in.
- **Pritshmëria:** Një kërkesë nga klikimet gjatë pending, numri rritet vetëm një herë dhe në databazë mbetet një rresht për çiftin.
- **Vëzhgimi:** Butoni ishte disabled; 15 klikimet prodhuan një kërkesë. Pesë përsëritjet morën sukses pa shtuar kopje. Neon kishte vetëm një rresht për këtë çift dhe zero çifte të duplikuara në tabelë. Pas rifreskimit numri real ishte 3; `UNIQUE(user_id, ride_id)` u verifikua. Udhëtimi pa vende të lira mund të preferohet pa u rezervuar.
- **Rezultati:** **PASS në UI dhe në kërkesat e njëkohshme drejt serverit/Neon-it.**

Kontrolle shtesë: kërkesa pa sesion u refuzua; vizitori anonim nuk mori preferime personale. Build-i production lokal shfaqi 3 preferime për llogarinë e testimit dhe 0 për profilin tjetër ekzistues. Krahasimi i të gjitha kolonave të `udhetimet` para/pas provave konfirmoi se nuk ndryshuan udhëtimet, orët, shoferët ose vendet. Provat shtuan vetëm tre preferimet e përshkruara.

## Ku gjendet puna

Repository: https://github.com/AlajdinFetahi/rideshare-mobile

- `aplikacioni/schema-java09.sql`: migrimi i aplikuar në Neon.
- `aplikacioni/src/lib/preferimet.ts`: leximi personal, kontrolli i udhëtimit dhe INSERT idempotent.
- `aplikacioni/src/app/udhetimi/[id]/actions.ts`: sesioni real në server, validimi dhe rezultati i sigurt.
- `aplikacioni/src/components/Preferimi.tsx`: gjendjet unsaved/pending/saved/error, rollback, retry dhe mbrojtja nga klikimet.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx`: gjendja fillestare nga Neon dhe integrimi me faqen ekzistuese.
- `aplikacioni/src/lib/preferimet.test.ts`, `aplikacioni/src/app/udhetimi/[id]/actions.test.ts`, `aplikacioni/src/app/udhetimi/[id]/page.test.tsx`: testet e reja dhe të zgjeruara.

| Kontrolli real | Rezultati |
| --- | --- |
| `npm test` në `aplikacioni/` | PASS, 30/30 teste në 8 skedarë |
| `npm run lint` | PASS |
| `npx --no-install tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Tri provat Java 9 me sesion testimi dhe Neon | PASS sipas kufijve të përshkruar më sipër |
| Dhjetë skenarët funksionalë ekzistues Java 8 | PASS me simulim geolocation |
| Production lokal: lista, detajet, Java 8, API e udhëtimeve dhe GitHub provider | HTTP 200 |
| Production lokal: sesionet NextAuth dhe izolimi i dy profileve | PASS |
| Pamjet 320/390/768/1440 px | Pa overflow horizontal; pamjet u hapën dhe u inspektuan |
| Laptop: localhost dhe IPv4 real i Wi-Fi | HTTP 200; serveri në `0.0.0.0:3000` |

Evidencat lokale të automatizimit ruhen jashtë Git në `%TEMP%/rideshare-week09/`: `browser-tests.cjs`, `browser-results.json`, `production-results.json`, pamjet dhe `regression-java08/browser-results.json`. Nuk janë rezultate të botit të profesorit.

Nisja nga `aplikacioni/`: `npm run dev -- -H 0.0.0.0 -p 3000`. Laptop: http://localhost:3000. Telefoni në të njëjtin rrjet përdor IPv4 aktual të Wi-Fi-t që raportohet në fund të sesionit; DHCP mund ta ndryshojë. Qasja nga telefoni fizik mbetet manuale. Nuk u krye publikim i ri në Vercel si pjesë e kësaj detyre.

## Çfarë mbetet për përmirësim

Heqja e preferimit nuk është implementuar, sipas fushës së detyrës. Mbeten demonstrimi me kolegun, prova në telefon fizik dhe kalimi i plotë interaktiv i hyrjes/daljes OAuth; automatizimi provoi sesionet NextAuth të nënshkruara, serverin dhe Neon-in. Serveri lokal u verifikua nga laptopi edhe me IP LAN; kjo nuk provon lidhjen fizike të telefonit ose lejen GPS. Nuk u ndryshuan firewall-i apo siguria e Windows.

Dorëzimi kryhet manualisht nga studenti. Nuk u krijua Issue te profesori dhe nuk është marrë koment i ri i botit; nuk pretendohet rezultat zyrtar 2/2.

## Ndihma nga AI

Codex lexoi udhëzimet dhe modelin zyrtar, inspektoi projektin ekzistues, shkroi kodin minimal dhe migrimin, aplikoi migrimin në Neon dhe kreu testet e raportuara. Provat e browser-it u kryen nga automatizimi i Codex me sesion testimi; nuk pretendohet hyrje OAuth nga përdoruesi, provë me kolegun ose provë në telefon fizik. Rishikimi ishte lokal, jo i pavarur. Codex përgatiti raportin dhe commit/push-in e kërkuar; studenti kryen dorëzimin manual dhe shpjegimin e zgjidhjes.
