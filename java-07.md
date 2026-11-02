# RideShare · Java 7

## Rasti im
GitHub: AlajdinFetahi
Kodi: P7-378
Skenari i zgjedhur (numri dhe titulli, nga Rastet 1–5): Rasti 3 · Klikim apo rezervim.
ID i udhëtimit në projektin tim: 1.
Të dhënat fiktive të rastit: Gjeneratori zyrtar për AlajdinFetahi dha Prizren → AAB, 08:00, 1 vend; ora alternative 08:05. Këto janë vlerat personale P7 dhe nuk janë aplikuar në Neon. Të dhënat reale të lexuara për ID 1 janë Prishtinë → AAB, 08:00, 2 vende, Stacioni i autobusëve. Nuk ndryshohet databaza.

## Parashikimi
**Draft i asistuar nga AI, i shkruar para korrigjimit të kodit; nuk është parashikim origjinal i studentit. Studenti duhet ta rishikojë dhe ta shpjegojë vetë përpara dorëzimit.**

Pres që lista të hapë detajet e të njëjtit udhëtim ID 1, me Prishtinë → AAB, orën 08:00 dhe 2 vende. Veprimi demonstrativ duhet të tregojë se është vetëm simulim, pa rezervim real dhe pa njoftim të shoferit. Numri i vendeve duhet të mbetet i njëjtë pas hapjes së simulimit. Ky draft u hartua pasi ishte inspektuar sjellja fillestare; nuk pretendohet parashikim i pavarur nga vëzhgimi.

## Dy probleme
1. Paqartësi para klikimit: GET /udhetimi/1 ktheu HTTP 200 me etiketën “Kërko vend”, pa shënim për simulimin pranë veprimit. Përsëritja: lista / → lidhja /udhetimi/1 → lexo etiketën. Vetëm /udhetimi/1/kerkesa e shpjegon simulimin. Ky është problemi i zgjedhur për korrigjim.
2. Paqartësi pas veprimit: GET /udhetimi/1/kerkesa ktheu HTTP 200 dhe titullin “Simulim: Në pritje”, ndërsa paragrafi thotë “Kërkesa për Prishtinë nuk është dërguar te shoferi.” Fjalët “Në pritje” mund të krijojnë pritje për një proces real. Shënimi “Simulim” dhe sqarimi ekzistojnë tashmë; kjo raportohet si paqartësi, jo si rezervim real ose defekt i provuar në databazë. Nuk do të korrigjohet në këtë detyrë.

Vëzhgimet fillestare janë nga përgjigjet reale HTTP të aplikacionit lokal dhe API-së Neon; klikimet në shfletues nuk janë verifikuar.

## Korrigjimi
Skedari: aplikacioni/src/app/udhetimi/[id]/page.tsx
Ky skedar lexon udhëtimin dhe paraqet detajet. Planifikohet vetëm ndryshimi i etiketës “Kërko vend” në “Kërko vend · simulim, pa rezervim real”. Rruga, kushti i vendeve, leximi i databazës dhe kontrollet ekzistuese mbeten të njëjta. Në këtë version fillestar kodi ende nuk është ndryshuar.

## Versionet
Para: URL-ja do të regjistrohet pasi të krijohet ky commit fillestar.
Pas: Korrigjimi ende nuk është krijuar; URL-ja do të regjistrohet pas commit-it të tij.

## Provat që bëra
### Prova 1
Hapat: Pas korrigjimit do të ndiqen lidhjet reale / → /udhetimi/1 → /udhetimi/1/kerkesa dhe do të rilexohet API-ja.
Pritshmëria: I njëjti ID, të dhëna të njëjta dhe simulim pa rezervim real.
Vëzhgimi: Prova pas korrigjimit ende nuk është ekzekutuar. Ndërveprimi në UI: NOT VERIFIED.

### Prova 2
Hapat: Do të përsëritet hapja e detajeve ID 1 dhe e veprimit demonstrativ.
Pritshmëria: Etiketa ta shpjegojë simulimin përpara veprimit.
Vëzhgimi: Ende nuk është ekzekutuar pas korrigjimit. Ndërveprimi në UI: NOT VERIFIED.

### Prova 3
Hapat: Do të ndryshohet vetëm ID-ja e kërkuar nga 1 në një ID tjetër ekzistuese; pa ndryshuar Neon.
Pritshmëria: Të ndiqet gjendja reale e udhëtimit të zgjedhur dhe të mos premtohet rezervim.
Vëzhgimi: Ende nuk është ekzekutuar. Varianti P7 nuk është vendosur në databazë. Ndërveprimi në UI: NOT VERIFIED.

## Ndryshimi i ri
Planifikohet ndryshimi vetëm i ID-së së kërkesës, pa ndryshuar rreshta në Neon. Demonstrimi personal para kolegut nuk është kryer. Rezultatet do të plotësohen pas provave reale.

## Ndihma nga AI
Codex u përdor për analizën e kodit, kontrollin e udhëzimeve dhe gjeneratorit zyrtar, draftin e parashikimit dhe planifikimin e korrigjimit minimal e të provave. Studentit nuk i atribuohen vëzhgime manuale që nuk i ka kryer. Në gjendjen fillestare npm test kaloi realisht: 5 skedarë, 13/13 teste. Kontrollet përfundimtare ende nuk janë ekzekutuar.
