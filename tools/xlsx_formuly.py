"""Дописывает к формулам в .xlsx уже посчитанный ответ.

Зачем. Книга, собранная openpyxl, содержит только текст формулы:
`<f>SUM(F22:F33)</f>` — и ничего больше. Настоящий Excel при открытии
считает её сам, поэтому на компьютере всё выглядит правильно.

А быстрый просмотр файла — на айфоне, в почте, в мессенджере — ничего
не считает. Он показывает то, что записано в файле, и столбец «Сумма»
выходит пустым, то есть нулями. 1 октября 2026 владелица открыла
docs/kp.xlsx на телефоне и увидела «ИТОГО 0,00 ₽». Отправь она такой
файл заказчику — заказчик увидел бы то же самое.

Поэтому после сборки книги сюда передаётся словарь {адрес: ответ},
и рядом с каждой формулой в файл кладётся её результат — ровно так,
как это делает сам Excel. Формулы при этом остаются живыми: поправили
цену в Excel — всё пересчиталось.

Чтобы ответ не остался устаревшим, книге дополнительно ставится флаг
«пересчитать всё при открытии» (wb.calculation.fullCalcOnLoad).
"""

import re
import zipfile

LIST = "xl/worksheets/sheet1.xml"

# Ячейка с формулой. openpyxl пишет её так:
#   <c r="F22" s="11"><f>IF(…)</f><v /></c>
# Пустой <v /> в конце — и есть то, из-за чего просмотр показывает ноль:
# место под ответ отведено, а ответа нет. Его и заменяем.
YACHEYKA = re.compile(
    r'<c r="(?P<ref>[A-Z]+[0-9]+)"(?P<atr>[^>]*)>'
    r'(?P<f><f[^>]*>.*?</f>)'
    r'(?:<v\s*/>|<v>.*?</v>)?</c>',
    re.DOTALL,
)


def ekran(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def chislo(v):
    f = float(v)
    return str(int(f)) if f.is_integer() else repr(f)


def perepisat(xml, znacheniya):
    naydeno = []

    def zamena(m):
        ref = m.group("ref")
        if ref not in znacheniya:
            return m.group(0)
        naydeno.append(ref)
        znach = znacheniya[ref]
        atr = re.sub(r'\s+t="[^"]*"', "", m.group("atr"))
        if isinstance(znach, str):
            # Текстовый результат формулы Excel помечает t="str".
            atr += ' t="str"'
            telo = ekran(znach)
        else:
            telo = chislo(znach)
        return f'<c r="{ref}"{atr}>{m.group("f")}<v>{telo}</v></c>'

    return YACHEYKA.sub(zamena, xml), naydeno


def dopisat_rezultaty(put, znacheniya):
    """Кладёт посчитанные ответы рядом с формулами в готовом файле.

    Возвращает список адресов, которые удалось найти, — вызывающий
    скрипт сверяет его со своим словарём и ругается, если что-то
    не совпало: молча отдать файл с нулями хуже, чем упасть.
    """
    with zipfile.ZipFile(put) as src:
        spisok = src.infolist()
        soderzhimoe = {i.filename: src.read(i.filename) for i in spisok}

    if LIST not in soderzhimoe:
        raise RuntimeError(f"в {put} нет {LIST}")

    novyy, naydeno = perepisat(soderzhimoe[LIST].decode("utf-8"), znacheniya)
    soderzhimoe[LIST] = novyy.encode("utf-8")

    with zipfile.ZipFile(put, "w", zipfile.ZIP_DEFLATED) as z:
        for i in spisok:
            z.writestr(i, soderzhimoe[i.filename])

    propushcheno = sorted(set(znacheniya) - set(naydeno))
    if propushcheno:
        raise RuntimeError(
            "не нашлись формулы в ячейках: " + ", ".join(propushcheno)
        )
    return naydeno
