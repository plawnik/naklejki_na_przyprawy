# Etykiety na przyprawy

Strona do projektowania naklejek na słoiki i pojemniki kuchenne. Wybierz ilustrację, wpisz własny napis i ułóż etykiety na arkuszach A4, a następnie pobierz gotowy PDF do wydruku.

**Adres strony: [plawnik.github.io/naklejki_na_przyprawy](https://plawnik.github.io/naklejki_na_przyprawy/)**

## Co można zrobić

- Wybrać ilustrację z dostępnych kategorii. Kolejne grafiki pojawiają się automatycznie po dodaniu ich do folderów kategorii i publikacji strony.
- Dodać popularny zestaw kuchenny: 20, 40, 60, 80, 100 lub 120 pozycji. Większy zestaw zawiera mniejszy; przycisk dodaje tylko brakujące etykiety, zachowuje istniejące naklejki i w razie potrzeby tworzy kolejne strony A4.
- Przełączyć język PL/EN. Zmieniają się nazwy w katalogu, filtr kategorii, automatyczne napisy na naklejkach i w PDF. Wpisane ręcznie napisy i nazwy własnych grafik pozostają bez zmian. Wyszukiwarka rozpoznaje nazwy polskie i angielskie, także bez znaków diakrytycznych.
- Kliknąć naklejkę na kartce i zmienić jej tekst, czcionkę, kolor oraz wielkość liter. Każda kopia ma własne ustawienia.
- Skorzystać z pięciu gotowych stylów. Pierwszy zachowuje wcześniejszy krój Nimbus Roman Bold i bordowy kolor `#651b18`.
- Ustawić domyślny styl nowych naklejek na stronie głównej albo zapisać własny styl z edytora. Wybór zostaje zapamiętany w tej przeglądarce.
- Automatycznie dopasować wielkość napisu i podział na wiersze do miejsca nad ilustracją. Można też wprowadzić własne podziały wierszy.
- Wybrać średnicę 22, 30, 40, 50, 60 lub 80 mm, albo własny rozmiar od 15 do 80 mm.
- Układać naklejki na wielu stronach A4, wybierać konkretne pola, zamieniać grafiki i usuwać etykiety.
- Oglądać duży podgląd A4 poziomo lub pionowo, zmieniać powiększenie i dopasować kartkę do szerokości ekranu. Powiększenie podglądu nie zmienia rozmiaru wydruku.
- Dodać własną grafikę z pliku, ustawić jej kadr oraz opcjonalnie nałożyć napis.
- Pobrać wielostronicowy PDF A4 w rozdzielczości 300 dpi, z własnymi napisami, czcionkami i kolorami.
- Pobrać [pełną listę etykiet kuchennych](data/pelna_lista_etykiet_kuchennych.txt), uzupełnioną o przyprawę tzatziki. Katalog pokazuje te pozycje, które mają już ilustracje.

Grafiki są zapisane jako oryginalne PNG **1254 × 1254 px**, bez napisów, pod nazwami przypraw. Tekst jest nakładany przez przeglądarkę. Oryginały nie są skalowane, konwertowane ani przycinane; pełne kwadratowe obrazy trafiają również do PDF. „Sól w płatkach” i „Sól w piramidkach” mają osobne ilustracje.

Lista wyboru korzysta z lekkich miniaturek **WebP, do 320 × 320 px**, ładowanych w miarę przewijania. Miniatury są osobnymi plikami; podgląd na arkuszu, edytor i PDF korzystają z pełnych oryginałów. Publikacja strony automatycznie tworzy miniatury także dla nowo dodanych grafik.

## Jak przygotować wydruk

1. Ustaw średnicę naklejki, orientację A4 i domyślny styl.
2. Klikaj wzory w katalogu, aby dodawać je do arkusza. Aby wskazać miejsce, najpierw kliknij puste pole.
3. Kliknij umieszczoną naklejkę, zmień napis lub styl i wybierz **Zapisz zmiany**.
4. Wybierz **Pobierz PDF**. Puste strony i oznaczenia pustych pól nie trafiają do wydruku.
5. Drukuj PDF w skali **100% / Rozmiar rzeczywisty**, aby zachować średnice w milimetrach.

Projekt arkuszy i własne grafiki pozostają w otwartej karcie. Odświeżenie strony rozpoczyna nowy projekt; zapisany domyślny styl pozostaje. Obróbka grafik i generowanie PDF odbywają się w przeglądarce.

## Pliki projektu

- `assets/labels/` — 22 foldery kategorii zgodnych z pełną listą etykiet; oryginalne ilustracje bez napisów, nazwane według przypraw. Puste kategorie zawierają `.gitkeep`.
- `assets/thumbs/` — lekkie miniatury WebP do listy wyboru, w takim samym układzie kategorii.
- `data/labels.js` — katalog wszystkich dostępnych grafik, automatycznie tworzony z folderów kategorii podczas publikacji.
- `data/translations.json` — edytowalny słownik PL/EN dla całej listy 1416 pozycji, nazw kategorii i interfejsu. Zawiera również pola dla języków ukraińskiego, rosyjskiego, francuskiego, hiszpańskiego i czeskiego.
- `data/presets.json` — kolejność 120 pozycji popularnego zestawu oraz dostępne rozmiary zestawów. Można zmienić wybór i kolejność bez edycji kodu strony.
- `assets/i18n.js` — wspólne pobieranie tłumaczeń dla katalogu, naklejek, edytora i PDF oraz zapamiętywanie wybranego języka.
- `scripts/generate-catalog.py` — skanowanie folderów, przyporządkowanie nazw oraz kategorii do grafik i automatyczne tworzenie miniaturek.
- `data/assets-manifest.json` — przyporządkowanie oryginałów do przypraw oraz sumy SHA-256.
- `assets/fonts/` — dołączone kroje pisma na licencji AGPL-3.0 z wyjątkiem dla PDF i PostScript; [licencja i źródła czcionek](assets/fonts/README.md). Strona nie pobiera czcionek z zewnętrznych usług.
- [STYLE_GUIDE.md](STYLE_GUIDE.md) — opis grafiki i pięciu stylów.

Publikację strony po zmianach na gałęzi `main` obsługuje workflow GitHub Pages w repozytorium.

## Dodawanie kolejnych grafik

Wgraj oryginalny plik PNG, JPG, WebP lub GIF do odpowiedniej kategorii w `assets/labels/`, np. `assets/labels/02-pieprze-papryki-i-ostre-chili/pieprz-czarny.png`. Nazwij plik według produktu. Przy publikacji GitHub Pages skanuje wszystkie foldery, rozpoznaje nazwy z pełnej listy, tworzy miniatury i aktualizuje katalog oraz filtr kategorii. Nie trzeba ręcznie zmieniać `data/labels.js` ani kodu strony. Oryginalne pliki zachowują swój format i rozdzielczość.

## Tłumaczenia i nowe nazwy

Słownik [data/translations.json](data/translations.json) obejmuje również pozycje z pełnej listy, dla których grafiki powstaną później. Klucz ma postać `numer-kategorii/nazwa-pliku-bez-rozszerzenia`, np. `04/czosnek-granulowany`. Dla kilku starszych nazw plików katalog rozpoznaje klucz na podstawie polskiej nazwy produktu.

Aby dodać produkt spoza obecnej listy, wgraj np. `assets/labels/04-przyprawy-jednoskladnikowe-korzenie-nasiona-i-kwiaty/moja-mieszanka.png` i dopisz w obiekcie `labels`:

```json
"04/moja-mieszanka": {
  "pl": "Moja mieszanka",
  "en": "My spice blend",
  "uk": "",
  "ru": "",
  "fr": "",
  "es": "",
  "cs": ""
}
```

Pamiętaj o przecinku między wpisami. Przy publikacji nazwa `pl` staje się nazwą produktu w katalogu, a klucz pliku pozostaje stały. Nie zmieniaj wygenerowanego `data/labels.js`. Możesz również dopisać polską nazwę do pełnej listy, aby ustalić jej miejsce w kategorii. Gdy nowy obraz nie ma jeszcze wpisu w słowniku, strona użyje jego polskiej nazwy.

Obecnie aktywne są **PL i EN**. Dla **uk, ru, fr, es i cs** przygotowane są miejsca na tłumaczenia, lecz ich treści nie są jeszcze uzupełnione. Aby uruchomić kolejną wersję językową, uzupełnij odpowiednie pola w `labels`, `categories` i `ui`, a w `languages` ustaw dla danego kodu `enabled` na `true`. Język pojawi się w wyborze automatycznie. Wpisy interfejsu `pagesCount`, `labelsCount`, `designsCount` i `categoriesCount` przyjmują obiekt z formami liczby mnogiej, np. angielski `{ "one": "{count} label", "other": "{count} labels" }`. Nie zmieniaj znaczników takich jak `{count}` czy `{name}`. Puste tłumaczenia korzystają z angielskiej, a następnie polskiej nazwy.

## Własny dobór popularnego zestawu

W [data/presets.json](data/presets.json) pierwsze 20 kluczy tworzy zestaw 20 pozycji, pierwsze 40 zestaw 40 itd. Wpisy powinny być unikalne i odnosić się do dostępnych grafik. Po usunięciu grafiki strona pomija brakującą pozycję i podaje liczbę niedostępnych ilustracji. Powtórne dodanie zestawu nie tworzy duplikatów; dodaje ponownie tylko pozycje, które usunięto z arkuszy.

## Licznik odwiedzin

U góry strony, obok wyboru języka, jest wspólny licznik **wyświetleń strony** obsługiwany przez [Hits](https://github.com/silentsoft/hits). Kliknięcie licznika otwiera publiczne statystyki. Zliczane są pobrania licznika podczas otwierania lub odświeżania strony; wynik nie oznacza liczby unikalnych osób.

Licznik wczytuje się raz przy otwarciu opublikowanej strony GitHub Pages. Zmiana języka, wyszukiwanie i edycja naklejek nie pobierają go ponownie. Lokalne kopie strony nie zwiększają wyniku. Nazwa i opisy licznika zmieniają się wraz z PL/EN, a wynik jest wspólny dla obu języków.

Wynik przechowuje zewnętrzna usługa, więc jest wspólny dla różnych przeglądarek i komputerów. Do strony nie jest dodawany zewnętrzny skrypt; pobierany jest tylko obraz SVG licznika z `hits.sh`. Jeśli usługa jest niedostępna, zamiast uszkodzonego obrazka pojawia się „—”, a edytor działa dalej. Adres strony przekazywany licznikowi jest stały, bez parametrów wyszukiwania i fragmentów adresu.
