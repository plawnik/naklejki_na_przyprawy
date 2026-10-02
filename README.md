# Etykiety na przyprawy

Strona do projektowania naklejek na słoiki i pojemniki kuchenne. Wybierz ilustrację, wpisz własny napis i ułóż etykiety na arkuszach A4, a następnie pobierz gotowy PDF do wydruku.

**Adres strony: [plawnik.github.io/naklejki_na_przyprawy](https://plawnik.github.io/naklejki_na_przyprawy/)**

## Co można zrobić

- Wybrać spośród 38 ilustracji z pierwszej grupy: sole, mieszanki solne i wzmacniacze smaku.
- Kliknąć naklejkę na kartce i zmienić jej tekst, czcionkę, kolor oraz wielkość liter. Każda kopia ma własne ustawienia.
- Skorzystać z pięciu gotowych stylów. Pierwszy zachowuje wcześniejszy krój Nimbus Roman Bold i bordowy kolor `#651b18`.
- Ustawić domyślny styl nowych naklejek na stronie głównej albo zapisać własny styl z edytora. Wybór zostaje zapamiętany w tej przeglądarce.
- Automatycznie dopasować wielkość napisu i podział na wiersze do miejsca nad ilustracją. Można też wprowadzić własne podziały wierszy.
- Wybrać średnicę 22, 30, 40, 50, 60 lub 80 mm, albo własny rozmiar od 15 do 80 mm.
- Układać naklejki na wielu stronach A4, wybierać konkretne pola, zamieniać grafiki i usuwać etykiety.
- Oglądać duży podgląd A4 poziomo lub pionowo, zmieniać powiększenie i dopasować kartkę do szerokości ekranu. Powiększenie podglądu nie zmienia rozmiaru wydruku.
- Dodać własną grafikę z pliku, ustawić jej kadr oraz opcjonalnie nałożyć napis.
- Pobrać wielostronicowy PDF A4 w rozdzielczości 300 dpi, z własnymi napisami, czcionkami i kolorami.
- Pobrać [pełną listę etykiet kuchennych](data/pelna_lista_etykiet_kuchennych.txt), uzupełnioną o przyprawę tzatziki. Pozostałe grupy są na razie listą nazw.

Grafiki są zapisane jako oryginalne PNG **1254 × 1254 px**, bez napisów, pod nazwami przypraw. Tekst jest nakładany przez przeglądarkę. Oryginały nie są skalowane, konwertowane ani przycinane; pełne kwadratowe obrazy trafiają również do PDF. „Sól w płatkach” i „Sól w piramidkach” mają osobne ilustracje.

## Jak przygotować wydruk

1. Ustaw średnicę naklejki, orientację A4 i domyślny styl.
2. Klikaj wzory w katalogu, aby dodawać je do arkusza. Aby wskazać miejsce, najpierw kliknij puste pole.
3. Kliknij umieszczoną naklejkę, zmień napis lub styl i wybierz **Zapisz zmiany**.
4. Wybierz **Pobierz PDF**. Puste strony i oznaczenia pustych pól nie trafiają do wydruku.
5. Drukuj PDF w skali **100% / Rozmiar rzeczywisty**, aby zachować średnice w milimetrach.

Projekt arkuszy i własne grafiki pozostają w otwartej karcie. Odświeżenie strony rozpoczyna nowy projekt; zapisany domyślny styl pozostaje. Obróbka grafik i generowanie PDF odbywają się w przeglądarce.

## Pliki projektu

- `assets/labels/` — oryginalne ilustracje bez napisów, nazwane według przypraw.
- `data/labels.js` — katalog aktualnej grupy.
- `data/assets-manifest.json` — przyporządkowanie oryginałów do przypraw oraz sumy SHA-256.
- `assets/fonts/` — dołączone kroje pisma i ich licencja; strona nie pobiera czcionek z zewnętrznych usług.
- [STYLE_GUIDE.md](STYLE_GUIDE.md) — opis grafiki i pięciu stylów.

Publikację strony po zmianach na gałęzi `main` obsługuje workflow GitHub Pages w repozytorium.
