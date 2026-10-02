# Grafiki i style etykiet

## Oryginalne ilustracje

- Obecna grupa: 38 etykiet soli, mieszanek solnych i wzmacniaczy smaku.
- Oryginalny format: PNG, RGB, **1254 × 1254 px**.
- Pliki są kopiowane bez zmiany zawartości, rozdzielczości, kompresji lub metadanych. Zmieniona jest wyłącznie nazwa pliku.
- Nazwa odpowiada przyprawie, np. `sol-cytrynowa.png` i `sol-w-piramidkach.png`.
- Ciepłe kremowe tło, bordowa i ochrowa obwódka, ilustracja w dolnej części i puste miejsce na tekst u góry.
- Oryginały zachowują kwadratowe tło i pełną obwódkę. Podgląd oraz eksport nie stosują do nich maski kołowej.
- „Sól w płatkach” używa ilustracji płatków, a „Sól w piramidkach” ilustracji kryształków w kształcie piramidek.

Przyporządkowanie oryginalnych nazw oraz kontrolne sumy SHA-256 zawiera `data/assets-manifest.json`.

## Typografia

Napisy są niezależną warstwą, edytowaną dla każdej naklejki. Edytor dobiera rozmiar pisma i podział tekstu na wiersze do wolnego obszaru nad ilustracją, uwzględniając krzywiznę wewnętrznej obwódki. Ręczne podziały wierszy są respektowane. Ten sam układ tekstu jest stosowany w podglądzie i PDF.

| Styl | Krój | Kolor | Domyślne litery |
| --- | --- | --- | --- |
| 1. Klasyczny bordowy | Nimbus Roman Bold | `#651b18` | Wersaliki |
| 2. Botaniczny zielony | P052 Bold (Palatino) | `#35543c` | Jak wpisano |
| 3. Vintage brązowy | URW Bookman Demi | `#6b4025` | Wersaliki |
| 4. Prosty grafitowy | Nimbus Sans Bold | `#292e31` | Jak wpisano |
| 5. Elegancki winny | Nimbus Roman Italic | `#782b44` | Jak wpisano |

Każdy styl można zmodyfikować: wpisać własny tekst, wybrać inny krój, dowolny kolor i sposób zapisu liter. Edytor pozwala zapamiętać takie ustawienia jako domyślne dla następnych etykiet. Nie zmienia to stylu już dodanych naklejek.

Pliki czcionek URW Base 35 są dołączone w `assets/fonts/` wraz z ich licencją i wyjątkiem dotyczącym osadzania w dokumentach.

## Arkusze

- Domyślna orientacja: A4 poziomo, **297 × 210 mm**; dostępne także A4 pionowo.
- Średnica naklejki: 15–80 mm, odstęp między polami: 3 mm, margines: co najmniej 10 mm.
- Podgląd wykorzystuje szerokość obszaru roboczego. Powiększenie 75–200% dotyczy tylko ekranu.
- PDF: A4, 300 dpi, pełne grafiki i nałożone napisy. Puste strony i pomocnicze pola są pomijane.
- Drukowanie: skala 100%, bez dopasowywania do strony.
