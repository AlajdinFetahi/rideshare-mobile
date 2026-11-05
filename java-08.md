# RideShare — Java 8

## Çfarë ndërtova
Tema: Sensorët dhe Device APIs. Qëllimi është zgjedhja lokale e vendtakimit në RideShare, me lejen e përdoruesit.

Komponenti klient `MeetingPoint` përdoret te detajet reale të udhëtimit dhe te `/java-08-test`. Detajet vazhdojnë të lexohen në server nga Neon; nuk ndryshova databazën, autentikimin ose autorizimin.

Dy gjendje `useState`, `draft` dhe `confirmed`, ndajnë tekstin gjatë shkrimit nga vendtakimi i konfirmuar. Formulari përdor `trim()`; vetëm hapësirat shfaqin gabim dhe nuk ndryshojnë zgjedhjen e mëparshme. Konfirmimi nuk bën kërkesë rrjeti dhe nuk ruhet në databazë, localStorage ose te shoferi.

`navigator.geolocation.getCurrentPosition()` thirret vetëm nga klikimi i butonit. Përdor `timeout: 10000` dhe gjendjet `idle`, `loading`, `success`, `denied`, `timeout`, `unavailable`. Kodi 1 jep refuzim, kodi 3 skadim kohe dhe kodi 2 pozicion të padisponueshëm. Kontrollohet edhe mungesa e API-së dhe gabimi i menjëhershëm. Pas rezultatit mund të provohet përsëri; formulari manual mbetet aktiv edhe gjatë pritjes. Nga përgjigjja lexohet vetëm saktësia në metra; koordinatat nuk lexohen, ruhen, afishohen ose dërgohen. Emri i vendtakimit shkruhet manualisht.

## Provat që bëra
### Prova 1: Leja nuk kërkohet sapo hapet faqja.
- **Hapat:** Në Chromium me simulim të geolocation hapa faqen pa login, kontrollova numrin e thirrjeve dhe pastaj klikova butonin. Pranova pozicionin fiktiv me saktësi 37 m. Kontrollova edhe butonin për riprovim.
- **Pritshmëria:** Hapja nuk kërkon vendndodhjen; vetëm klikimi nis pritjen. Pranimi shfaq sukses dhe saktësinë; nuk mbush automatikisht emrin e vendtakimit.
- **Vëzhgimi:** Para klikimit kishte zero thirrje dhe `data-state="idle"`. Klikimi dha `loading`, opsionin 10000 ms dhe buton përkohësisht të çaktivizuar. Suksesi dha `success`, “Pozicioni u mor”, “Saktësia: 37 m” dhe butonin aktiv. Biblioteka e konfirmuar nuk humbi. Riprovimi pastroi saktësinë e vjetër. **PASS në simulim lokal.**
- **Kufiri i provës:** Pranimi real i GPS-it në telefon nuk është kryer nga Codex dhe nuk deklarohet i verifikuar.

### Prova 2: Refuzimi i lejes nuk e bllokon përdoruesin.
- **Hapat:** Konfirmova Biblioteka, klikova vendndodhjen dhe simulova gabimin 1. Përsërita me gabimin 3 për timeout dhe me gabimin 2. Provova edhe browser pa `navigator.geolocation` dhe API që hedh gabim. Pas gabimeve shkrova dhe konfirmova Parkingu.
- **Pritshmëria:** Refuzimi dhe timeout përfundojnë pritjen, shfaqin udhëzime në shqip, ruajnë Biblioteka dhe lejojnë alternativën manuale e riprovimin.
- **Vëzhgimi:** Refuzimi dha `denied`, timeout dha `timeout`, ndërsa kodi 2 dhe mungesa e mbështetjes dhanë `unavailable`. U shfaqën mesazhet përkatëse. Butoni u aktivizua, Biblioteka mbeti deri në konfirmimin e Parkingu dhe formulari funksionoi edhe gjatë pritjes. **PASS në simulim lokal.** Timeout u provua me callback fiktiv kodi 3 dhe verifikim të opsionit 10000 ms, jo me GPS real.

### Prova 3: Dëshmitë në GitHub nuk tregojnë adresën time reale.
- **Hapat:** Kontrollova ndryshimet e Git, skedarët publikë dhe komponentin. Provova faqen e testit me të dhëna fiktive dhe monitorova kërkesat `/api/` në browser. Kontrollova veçimin e kodit server nga komponenti klient.
- **Pritshmëria:** Asnjë koordinatë reale, adresë personale, token ose `.env` në dorëzim; faqja e testit nuk varet nga Neon ose API të jashtme.
- **Vëzhgimi:** Testet përdorën vetëm të dhëna fiktive. Komponenti lexon vetëm `coords.accuracy`, pa latitude/longitude ose log. Në faqen e testit nuk pati kërkesa `/api/`; efekti ekzistues PWA anashkalohet vetëm për këtë rrugë. Nuk u ndryshuan skedarët në `public/`. `.env.local`, `.next` dhe `node_modules` mbeten të injoruara; `package-lock.json` ekziston pranë `package.json`. **PASS për kontrollin lokal të ndryshimeve.**

## Ku gjendet puna
- Repository: https://github.com/AlajdinFetahi/rideshare-mobile
- `aplikacioni/src/components/MeetingPoint.tsx`: formulari dhe geolocation.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx`: përdorimi real brenda Server Component.
- `aplikacioni/src/app/java-08-test/page.tsx`: udhëtimi fiktiv i Dritonit, pa login dhe pa databazë.
- `mobile-week08.json`: kontrata zyrtare, versioni 1, rruga `/java-08-test`.
- `aplikacioni/src/app/globals.css`: stili i formularit sipas RideShare ekzistues.
- Sipas kërkesës shtesë të përdoruesit, butonat përdorin të gjelbrën `#15803d`, hover `#166534` dhe tekst të bardhë; pamjet 375/1440 px u rikapën dhe u inspektuan, lint/build kaluan sërish.
- `aplikacioni/src/components/Pwa.tsx`: ndalimi i leximit automatik të listës vetëm në faqen e testit.
- `aplikacioni/next.config.ts`: lejimi i IPv4 aktual të adapterit Windows `Wi-Fi` për burimet e zhvillimit, pa wildcard dhe pa IP personale të shkruar në kod. Nëse ndryshon rrjeti, riniset serveri.
- `aplikacioni/src/app/java-08-test/page.test.tsx` dhe testi ekzistues i detajeve: kontrata unike e DOM-it dhe integrimi.

**Rezultatet reale lokale:**

| Kontrolli | Rezultati |
| --- | --- |
| `npm ci --ignore-scripts` në `aplikacioni/` | PASS; pa shtuar biblioteka |
| `npm test` | 14 teste kaluan në 6 skedarë |
| `npm run lint` | PASS |
| `npx --no-install tsc --noEmit` | PASS |
| `npm run build` | PASS; `/java-08-test` gjenerohet statikisht |
| Production `/java-08-test` me `DATABASE_URL` të pavlefshëm dhe pa konfigurim auth | HTTP 200; formulari dhe Dritoni në HTML |
| Tetë sjelljet e dokumentuara nga profesori | Secila kaloi në Chromium lokal me simulim, jo raport GitHub Actions |
| API që hedh gabim, Enter, trim dhe rifreskim | PASS |
| Lista dhe detajet reale, pa ndryshuar të dhënat | PASS; Biblioteka u konfirmua në komponentin real |
| Pamjet 320, 375, 768 dhe 1440 px | U kapën dhe u inspektuan; pa overflow horizontal |
| HTTP localhost dhe IP-ja aktuale LAN | HTTP 200; serveri dëgjon në `0.0.0.0:3000` |
| `window.isSecureContext` | `true` në localhost; `false` në HTTP LAN |

Testet e browser-it u ekzekutuan me Playwright/Chromium ekzistues të mjedisit, pa shtuar varësi në projekt. Evidencat lokale të provës ruhen jashtë repository-t në `%TEMP%/rideshare-week08/`, përfshirë `browser-results.json` dhe pamjet. Këto nuk janë raporte të GitHub Actions dhe nuk provojnë GPS real.

Nisja nga `aplikacioni/`: `npm run dev -- -H 0.0.0.0 -p 3000`. Nga telefoni përdoret IPv4 aktual i Wi-Fi-t i raportuar në fund të sesionit, sepse DHCP mund ta ndryshojë. Serveri u la në proces të veçantë. Firewall-i rezultoi tashmë i çaktivizuar nga konfigurimi ekzistues; nuk e ndryshova. Nuk u gjet rrugë aktive VPN; izolimi ndërmjet klientëve Wi-Fi kërkon provën nga telefoni.

## Çfarë mbetet për përmirësim
Vendtakimi është vetëm gjendje e komponentit: humbet pas rifreskimit ose largimit nga faqja dhe nuk i dërgohet shoferit. Nuk ka ruajtje në backend, harta ose përkthim koordinatash në emër vendi.

HTTP me IP LAN hap UI-në, por nuk është secure context për GPS. Nuk u krijuan certifikata të pabesueshme ose flamuj që çaktivizojnë sigurinë. Ekziston publikimi HTTPS i projektit në https://rideshare-mobile-sage.vercel.app; versioni i Javës 8 duhet të verifikohet pas publikimit automatik nga push-i. Për GPS real, hape publikimin HTTPS në telefon, kliko butonin dhe provo lejen; mos publiko koordinata.

Demonstrimi me kolegun nuk është kryer. Përdoruesi konfirmoi gjatë sesionit se faqja hapet në telefon në të njëjtin Wi-Fi dhe vendtakimi konfirmohet. Ai raportoi se butoni i vendndodhjes nuk merr GPS në HTTP LAN; `isSecureContext=false` e shpjegon kufizimin. GPS-i real mbetet i paverifikuar dhe duhet provuar përmes HTTPS.

Përdoruesi raportoi edhe “1 issue” në development. Logu tregon mospërputhje hydration vetëm për atributet `__gcruniqueid` të shtuara në formë/input jashtë kodit të komponentit. Browser-i i pastër i testeve nuk e riprodhoi këtë paralajmërim. Nuk u fsheh gabimi me `suppressHydrationWarning` dhe nuk u ndryshua funksionaliteti për atribute të browser-it.

Raportet e dokumentimit dhe funksionimit të profesorit nuk janë marrë; nuk deklarohen rezultate 6/6 ose 8/8 nga GitHub Actions. Dorëzimi manual dhe prova në klasë bëhen nga studenti.

Instalimi raportoi 12 dobësi në varësitë ekzistuese (10 moderate, 1 high, 1 critical). Nuk u bënë përditësime jashtë fushës së Javës 8; kjo nuk përbën auditim të plotë sigurie.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
U përdor Codex për leximin e kërkesave, implementimin minimal, testet, kontrollin e LAN-it, raportin dhe komandat Git. Codex ekzekutoi testet lokale dhe inspektoi pamjet e browser-it. Rishikimi i kodit dhe pamjeve është lokal, jo i pavarur. Studenti duhet të shpjegojë `draft` kundrejt `confirmed`, `trim()` dhe lejen pas klikimit, si dhe të kryejë provën fizike e dorëzimin manual. Nuk pretendohet demonstrim me kolegun ose GPS real nga AI.

## Prova me një hyrje të re
Prova u ekzekutua lokalisht me browser automation; nuk u krye me kolegun.

- Hyrja që provova: konfirmova Biblioteka, pastaj shkrova Parkingu pa konfirmuar. Provova edhe vetëm hapësira dhe në fund konfirmova Parkingu.
- Parashikimi im para klikimit: Biblioteka mbetet gjatë shkrimit dhe pas hapësirave; Parkingu shfaqet vetëm pas konfirmimit të vlefshëm.
- Çfarë pashë realisht: rezultati mbeti Biblioteka gjatë shkrimit; hapësirat dhanë gabim dhe ruajtën Biblioteka; konfirmimi i Parkingu e përditësoi rezultatin. PASS në provën lokale.
- Skedari dhe funksioni që e shpjegojnë: `aplikacioni/src/components/MeetingPoint.tsx`, `confirmMeeting`; `onChange` përditëson vetëm `draft`.
- Çfarë kuptova ose korrigjova: vlera e fushës nuk është automatikisht vendimi i konfirmuar. `trim()` kontrollon vlefshmërinë para `setConfirmed`; geolocation nuk prek vendtakimin e konfirmuar.

Këtë pjesë e shpjegoj në klasë. Kontrolli automatik nuk verifikon vërtetësinë e provës.
