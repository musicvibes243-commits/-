# Фотографии работ

Галерея на сайте показывает файлы из этой папки. Имена в `index.html`
прописаны явно, поэтому файл должен называться ровно так, как в таблице.
Если файла нет — снимок молча пропускается, сайт не ломается.

| Файл | Подпись на сайте |
| --- | --- |
| `septik-montazh-01.jpg` | Станция идёт в котлован |
| `septik-topol-eko-01.jpg` | Привезли на объект |
| `septik-optima-01.jpg` | Вертикальный корпус |
| `septik-akva-01.jpg` | Подбор под бюджет |
| `kotlovan-01.jpg` | Песчаная подушка |
| `opalubka-yama-01.jpg` | Крепление стенок |
| `septik-ustanovka-01.jpg` | Засыпка песком |
| `septik-lyuki-otsypka-01.jpg` | Убрали за собой |
| `septik-lyuk-01.jpg` | Горловина с люком |
| `kesson-skvazhina-01.jpg` | Кессон над скважиной |
| `kesson-oborudovanie-01.jpg` | Автоматика в кессоне |
| `vodosnabzhenie-uzel-01.jpg` | Вода от скважины в доме |
| `septik-lyuk-02.jpg` | Чугунный люк |
| `drenazh-truba-01.jpg` | Труба в геотекстиле |
| `drenazh-geotekstil-01.jpg` | Траншея под дренаж |
| `transhea-01.jpg` | Уклон бьём нивелиром |
| `shcheben-frakciya-01.jpg` | Щебень смотрим на месте |
| `uchastok-rabota-01.jpg` | Своя бригада |
| `septik-bytovka-01.jpg` | Работаем и зимой |
| `kotlovan-vruchnuyu-01.jpg` | Копаем вручную |
| `kotlovan-razmer-01.jpg` | Дно выбрали в размер |

### Фотографии для страниц услуг

Эти снимки стоят на отдельных страницах направлений. Часть из них
показывается ещё и на главной — так и помечено в таблице: одна и та же
работа уместна и там, и там.

| Файл | Где стоит | Подпись |
| --- | --- | --- |
| `drenazh-geotekstil-01.jpg` | `drenazh.html` + главная | Траншея под дренаж |
| `transhea-01.jpg` | `drenazh.html` + главная | Уклон бьём нивелиром |
| `drenazh-truba-01.jpg` | `drenazh.html` + главная | Труба в геотекстиле |
| `shcheben-frakciya-01.jpg` | `drenazh.html` + главная | Щебень смотрим на месте |
| `kesson-skvazhina-01.jpg` | `vodosnabzhenie.html` + главная | Кессон над скважиной |
| `kesson-oborudovanie-01.jpg` | `vodosnabzhenie.html` + главная | Автоматика в кессоне |
| `vodosnabzhenie-uzel-01.jpg` | `vodosnabzhenie.html` + главная | Узел ввода в доме |
| `vodosnabzhenie-gidroak-01.jpg` | `vodosnabzhenie.html` | Гидроаккумулятор и бойлер |
| `kotelnaya-obshchiy-01.jpg` | `otoplenie.html` | Котельная целиком |
| `kotelnaya-elektrokotel-01.jpg` | `otoplenie.html` | Электрокотёл с обвязкой |
| `kollektor-rashodomery-01.jpg` | `otoplenie.html` | Коллектор тёплого пола |
| `tepliy-pol-kontury-01.jpg` | `otoplenie.html` | Контуры тёплого пола |
| `shchit-avtomaty-01.jpg` | `elektrika.html` | Щит в готовом доме |
| `shchit-uzo-01.jpg` | `elektrika.html` | Защита на каждую группу |
| `razvodka-komnata-01.jpg` | `elektrika.html` | Всё разведено до стяжки |
| `konvektor-v-polu-01.jpg` | `otoplenie.html` | Конвектор в полу |
| `radiator-montazh-02.jpg` | `otoplenie.html` | Радиатор с подводкой из пола |
| `razvodka-karkas-01.jpg` | `otoplenie.html` + `vodosnabzhenie.html` | Разводка по каркасу |
| `boiler-ariston-01.jpg` | `otoplenie.html` + `vodosnabzhenie.html` | Водонагреватель с обвязкой |
| `razvodka-sanuzel-01.jpg` | `otoplenie.html` + `vodosnabzhenie.html` | Разводка в санузле |
| `avtopoliv-uchastok-01.jpg` | `avtopoliv.html` | Участок целиком |
| `avtopoliv-forsunka-01.jpg` | `avtopoliv.html` | Форсунка в газоне |
| `avtopoliv-nasosnaya-01.jpg` | `avtopoliv.html` | Насосная станция полива |
| `avtopoliv-teplica-01.jpg` | `avtopoliv.html` | Своя ветка на теплицу |
| `avtopoliv-pult-01.jpg` | `avtopoliv.html` | Пульт в закрытом боксе |
| `avtopoliv-klapany-boks-01.jpg` | `avtopoliv.html` | Клапаны в лючке |

Подписи и список задаются не в самой странице, а в `tools/make-pages.py`,
в поле `photos` у нужного направления. Если снимков по направлению нет —
блока с фотографиями нет вовсе: пустая галерея выглядит хуже, чем её
отсутствие. Если снимок ровно один, он показывается по центру и шире, а заголовок
становится «Снимок с объекта». Если ровно три — последний растягивается
на обе колонки, чтобы внизу не висела одинокая половинка.

## Как заменить или добавить фото

Через браузер, без программ: репозиторий → папка `docs/assets/photos` →
**Add file** → **Upload files** → перетащить → **Commit changes**.

Чтобы добавить новый снимок, скопируйте в `docs/index.html` любой блок
`<li class="shot">…</li>` в разделе `<!-- РАБОТЫ -->` и поменяйте в нём
имя файла, `alt` (описание для незрячих и поисковиков) и подпись.

## Требования

- Формат **.jpg**, ширина около 720 px, вес до ~150 КБ на снимок.
  Фото с телефона весит 3–5 МБ — обязательно сожмите (например, squoosh.app),
  иначе галерея будет долго открываться с мобильного интернета.
- **Снимайте горизонтально.** В галерее каждый снимок обрезается до 4:3,
  то есть чуть шире, чем высоко. У вертикального кадра с телефона срежется
  верх и низ — иногда вместе с тем, ради чего снимали.
- Только собственные снимки. Чужие фото из интернета — это претензии
  по авторским правам и потеря доверия.
