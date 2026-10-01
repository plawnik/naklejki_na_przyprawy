# Naklejki na przyprawy

Statyczna aplikacja do układania okrągłych etykiet na wielostronicowych arkuszach A4 i pobierania gotowego pliku PDF. Wszystko działa lokalnie w przeglądarce — obrazy użytkownika nie są wysyłane na serwer.

## Co jest gotowe

- 38 etykiet z kategorii „Sole, mieszanki solne i wzmacniacze smaku”;
- osobny plik PNG dla każdej etykiety: 945×945 px, 300 dpi, projektowany dla średnicy 80 mm;
- wybór średnicy 22, 30, 40, 50, 60 i 80 mm albo własnego rozmiaru 15–80 mm;
- kilka stron A4, stałe i widoczne pola, edycja lub usuwanie po kliknięciu;
- licznik `×N` przy wzorze, jeśli znajduje się już na arkuszach;
- import własnego obrazu z przesuwaniem kadru kołowego i skalowaniem;
- generowanie wielostronicowego PDF A4 w rozdzielczości 300 dpi.

Własne grafiki oraz bieżący układ arkuszy są przechowywane tylko w otwartej karcie. Odświeżenie strony rozpoczyna nowy projekt.

## Uruchomienie lokalne

W katalogu repozytorium uruchom prosty serwer HTTP:

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080`.

## GitHub Pages

Workflow `.github/workflows/pages.yml` jest celowo uruchamiany ręcznie. Aby opublikować stronę:

1. W `Settings → Pages` wybierz źródło `GitHub Actions`.
2. W `Actions` uruchom workflow `Deploy to GitHub Pages` przyciskiem `Run workflow`.

Repozytorium może pozostać prywatne, ale standardowa strona GitHub Pages utworzona z prywatnego repozytorium nie jest automatycznie prywatna. Dlatego samo dodanie plików do repozytorium nie uruchamia publikacji.

## Dodawanie kolejnych etykiet

1. Przygotuj końcowy PNG zgodnie z [STYLE_GUIDE.md](STYLE_GUIDE.md).
2. Dodaj go do `assets/labels/` i miniaturę WebP do `assets/thumbs/`.
3. Dopisz pozycję do `data/labels.js`.

Skrypt `scripts/compose-label.sh` nakłada kontrolowany tekst, maskę kołową i metadane 300 dpi na gotową ilustrację bez napisu.
