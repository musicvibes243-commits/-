# Студия йоги «Аникор» — демо-сайт

Одностраничный сайт студии: статический HTML + CSS + ванильный JS, без сборки.

```bash
npm run dev     # http://localhost:8080
```

## Структура

| Файл | Что внутри |
| --- | --- |
| `index.html` | вся страница: шапка, герой, о студии, практики, прайс, расписание, FAQ, контакты |
| `assets/css/styles.css` | токены светлой и тёмной темы, все компоненты, адаптив |
| `assets/js/main.js` | тема, меню, вкладки расписания, анимации, валидация формы |
| `assets/img/` | фотографии студии |
| `assets/video/` | ролик для первого экрана (см. README внутри) |
| `design-system/anikor/MASTER.md` | палитра, шрифты, ритм, правила движения |

## Видео на первом экране

Фоном героя может быть ролик вместо фотографии. Положите файл
в `assets/video/hero.mp4` и укажите путь в `assets/js/main.js`:

```js
var HERO_VIDEO = 'assets/video/hero.mp4';
```

Фото зала работает постером и остаётся запасным вариантом, если браузер
не проиграет видео. При `prefers-reduced-motion: reduce` видео не подключается.

Текст и кнопки первого экрана появляются каскадом (`fadeSlideUp`, задержки
0.15–1.2 с), мобильное меню разворачивается на весь экран, иконка бургера
перетекает в крестик.

## Отдельная демка `foldcraft/`

Точная сборка по промту от моушен-дизайнера: React + Vite + Tailwind +
lucide-react, шрифт Geist, видеофон и та же анимация `fadeSlideUp`.

```bash
cd foldcraft && npm install && npm run dev
```

Живёт отдельно от сайта студии и ни на что в нём не влияет.

## Данные студии

- Адрес: ул. Дзержинского, 4А ([Яндекс Карты](https://yandex.ru/maps/-/CTh0a2li))
- Телефон: +7 (916) 030-44-36, он же WhatsApp и Telegram
- Прайс: хатха-йога 800 ₽, йогатерапия 1 000 ₽, гвоздестояние 3 000 ₽,
  поющие тибетские чаши 2 500 ₽, аромадиагностика 3 500 ₽, мероприятия от 2 000 ₽
- Раздел «Мероприятия» (`#events`) — девичники, дни рождения, корпоративы,
  с двумя фотографиями реальных праздников в студии

## Что в демо-версии условно

- **Расписание** — пример недельной сетки, нужно заменить на реальное.
- **Форма записи** — работает валидация, но заявка никуда не отправляется
  (нет бэкенда). Реальная запись идёт через WhatsApp / Telegram / звонок.
- Тексты о студии написаны по фотографиям и описаниям услуг — стоит вычитать
  вместе с владельцем.

## Что осталось сделать

- Подключить отправку формы (почта, Telegram-бот или CRM).
- Заменить демо-расписание на актуальное.
- Добавить блок отзывов (на Яндекс Картах их 22) и, при желании,
  карту-виджет вместо ссылки.

---

# UI/UX Pro Max — installed skill

This repository has the [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
design-intelligence skill installed into `.claude/skills/`, so it loads
automatically for any Claude Code session opened on this repo.

## What is installed

| Skill | Purpose |
| --- | --- |
| `ui-ux-pro-max` | Core design intelligence: searchable styles, palettes, typography, UX guidelines, charts, per-stack rules |
| `design` | Brand identity, design tokens, logo / icon / CIP generation |
| `design-system` | Token architecture (primitive → semantic → component), component specs, slide generation |
| `ui-styling` | shadcn/ui + Tailwind implementation guidance |
| `brand` | Brand voice, messaging frameworks, asset consistency |
| `banner-design` | Social, ad, hero and print banner art direction |
| `slides` | Strategic HTML presentations with Chart.js and design tokens |

Installed with the official CLI:

```bash
npx ui-ux-pro-max-cli@latest init --ai claude
```

## Usage

The skill activates on its own for UI/UX work — just ask, e.g.
"Build a landing page for a SaaS product".

The local database can also be queried directly (Python 3 required, standard
library only — no network access):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "saas landing page" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system --stack nextjs
```

Domains: `style`, `color`, `chart`, `landing`, `product`, `ux`, `typography`,
`icons`, `gsap`, `react`, `web`, `google-fonts`.

## Updating

```bash
npx ui-ux-pro-max-cli@latest init --ai claude --force
```

Upstream project: MIT licensed, https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

---

# 21st.dev CLI

The [21st.dev](https://21st.dev) CLI is pinned as a devDependency, so CI and
contributors get the same version without a global install.

```bash
npm install          # installs @21st-dev/cli locally
npx 21st help
```

## Authentication

Three ways, in the order the CLI checks them:

| Context | How |
| --- | --- |
| Local dev | `21st login` — opens a browser, saves the token locally |
| CI / scripts | env var `API_KEY_21ST` (or `TWENTYFIRST_TOKEN`) |
| One-off | `21st <cmd> --api-key $API_KEY_21ST` |

Get a key at https://21st.dev/mcp. Copy `.env.example` to `.env` and fill in
`API_KEY_21ST`; `.env` is gitignored — never commit the key.

```bash
# CI: no browser, no login step
export API_KEY_21ST="21st_sk_..."
npx 21st search "pricing table" --limit 5 --json
npx 21st add someuser/some-component
```

## MCP server

`.mcp.json` declares the 21st HTTP MCP server for Claude Code, with the key
read from the environment rather than hard-coded:

```json
{ "mcpServers": { "21st": { "type": "http", "url": "https://21st.dev/api/mcp",
  "headers": { "x-api-key": "${API_KEY_21ST}" } } } }
```

Set `API_KEY_21ST` in your environment, then restart Claude Code.
Regenerate with `21st init --client claude --write` (also supports
`cursor`, `codex`, `vscode`, `devin`).

## Scripts

```bash
npm run 21st:review     # local deterministic UI review (works offline)
npm run 21st:context    # check the .21st design context
npm run 21st -- search "hero section"
```

## Network requirement

Everything except `21st review` needs outbound HTTPS to `21st.dev`. In
sandboxed environments (including Claude Code on the web) that host must be
allowed by the egress policy, otherwise commands fail with `HTTP 403`.
