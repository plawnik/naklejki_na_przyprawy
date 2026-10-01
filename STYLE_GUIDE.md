# Wzorzec etykiet

Ten dokument utrwala styl użyty w pierwszej testowej kategorii.

## Format

- końcowy plik: PNG z przezroczystymi narożnikami;
- wymiary: **945×945 px**;
- gęstość: **300 dpi** (`118,11 px/cm`);
- rozmiar docelowy: koło o średnicy **80 mm**;
- nazwa pliku: trzycyfrowy numer i prosty slug, np. `024-sol-cytrynowa.png`.

Obliczenie: `80 mm ÷ 25,4 × 300 dpi = 944,88 px`, po zaokrągleniu 945 px.

## Wygląd

- ciepłe, kremowe tło papieru;
- cienki zewnętrzny pierścień bordowy i wewnętrzny pierścień ochrowy;
- frontowy, symetryczny układ;
- górne ok. 40% pozostawione czyste pod nazwę;
- na dole ręcznie malowana, botaniczna ilustracja składnika: miseczka lub naczynie, łyżeczka, kilka rozsypanych ziaren i oszczędne zielone gałązki;
- bez cieni poza etykietą, logotypów, znaków wodnych i generowanego tekstu.

## Typografia

- napis jest dodawany dopiero po wygenerowaniu ilustracji;
- krój: `Nimbus Roman Bold` lub podobny klasyczny, kontrastowy krój szeryfowy;
- wersaliki, kolor `#651b18`, wyrównanie centralne;
- 1–3 wiersze, zwykle 54–112 px zależnie od długości nazwy;
- blok tekstu: ok. 790×245 px, pozycja od 105 px od górnej krawędzi.

Programowe dodawanie tekstu zapobiega literówkom, pseudo-literom oraz różnicom w polskich znakach.

## Szablon promptu dla ilustracji

> Kwadratowa etykieta spiżarniana w stylu vintage: ciepły kremowy papier w kole, cienki bordowy pierścień zewnętrzny i ochrowy pierścień wewnętrzny, szczegółowa ręcznie malowana europejska ilustracja kulinarna. Górne 40% czyste i puste pod późniejszą typografię. W dolnej połowie: [SKŁADNIK I REKWIZYTY], oszczędne symetryczne zielone gałązki. Widok na wprost, wszystkie elementy wewnątrz obwódki. Bez tekstu, liter, cyfr, symboli, pseudo-pisma, logo i znaku wodnego.

Ilustrację generujemy bez napisu. Następnie `scripts/compose-label.sh` skaluje ją, dodaje poprawną nazwę, maskuje koło i ustawia 300 dpi.
