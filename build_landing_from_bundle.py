#!/usr/bin/env python3
"""One-off builder: merge Claude Design bundle with BehördenKlar cookie/GA/i18n."""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = "/Users/yusufcoban/Desktop/BehordenKlar Landing Page-2.html"
OUT = os.path.join(ROOT, "landingpage.html")

SEO_TITLE = "BehördenKlar – Behördenbrief verstehen & übersetzen in 27 Sprachen"
SEO_DESCRIPTION = "Behördenbrief bekommen? BehördenKlar übersetzt und erklärt jeden deutschen Behördenbrief in deiner Sprache. Kostenlos, ohne Anmeldung. Jobcenter, Finanzamt, Ausländerbehörde und mehr."
SEO_KEYWORDS = "Behördenbrief übersetzen, Behördenbrief verstehen, Jobcenter Brief, Finanzamt Brief, Ausländerbehörde, Brief auf Türkisch, Brief auf Arabisch, Migranten Deutschland, Behördenpost verstehen"
SEO_URL = "https://www.behördenklar.de"
SEO_HREFLANGS = [
    ("de", SEO_URL + "/"),
    ("en", SEO_URL + "/?lang=en"),
    ("tr", SEO_URL + "/?lang=tr"),
    ("ar", SEO_URL + "/?lang=ar"),
    ("ru", SEO_URL + "/?lang=ru"),
    ("uk", SEO_URL + "/?lang=uk"),
    ("ro", SEO_URL + "/?lang=ro"),
    ("pl", SEO_URL + "/?lang=pl"),
    ("fa", SEO_URL + "/?lang=fa"),
    ("bg", SEO_URL + "/?lang=bg"),
    ("ka", SEO_URL + "/?lang=ka"),
    ("es", SEO_URL + "/?lang=es"),
    ("pt", SEO_URL + "/?lang=pt"),
    ("fr", SEO_URL + "/?lang=fr"),
    ("it", SEO_URL + "/?lang=it"),
    ("el", SEO_URL + "/?lang=el"),
    ("sq", SEO_URL + "/?lang=sq"),
    ("bs", SEO_URL + "/?lang=bs"),
    ("sr", SEO_URL + "/?lang=sr"),
    ("hr", SEO_URL + "/?lang=hr"),
    ("zh-Hans", SEO_URL + "/?lang=zh"),
    ("vi", SEO_URL + "/?lang=vi"),
    ("so", SEO_URL + "/?lang=so"),
    ("ti", SEO_URL + "/?lang=ti"),
    ("lt", SEO_URL + "/?lang=lt"),
    ("ar-EG", SEO_URL + "/?lang=ar-eg"),
    ("x-default", SEO_URL + "/"),
]
SEO_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BehördenKlar",
    "description": SEO_DESCRIPTION,
    "url": SEO_URL,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web",
    "inLanguage": "de",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "kostenlos",
    },
}
SEO_EXTRA = (
    f'<meta name="description" content="{SEO_DESCRIPTION}" />\n'
    f'<meta name="keywords" content="{SEO_KEYWORDS}" />\n'
    f'<link rel="canonical" href="{SEO_URL}" />\n'
    f'<meta property="og:title" content="{SEO_TITLE}" />\n'
    f'<meta property="og:description" content="{SEO_DESCRIPTION}" />\n'
    f'<meta property="og:url" content="{SEO_URL}" />\n'
    '<meta property="og:type" content="website" />\n'
    '<meta property="og:locale" content="de_DE" />\n'
    '<meta name="twitter:card" content="summary_large_image" />\n'
    f'<meta name="twitter:title" content="{SEO_TITLE}" />\n'
    f'<meta name="twitter:description" content="{SEO_DESCRIPTION}" />\n'
    + "".join(
        f'<link rel="alternate" hreflang="{lang}" href="{href}" />\n'
        for lang, href in SEO_HREFLANGS
    )
    + '<script type="application/ld+json">\n'
    + json.dumps(SEO_SCHEMA, ensure_ascii=False, indent=2)
    + '\n</script>\n'
)

with open(SRC, "r", encoding="utf-8") as f:
    data = f.read()

m = re.search(r'<script type="__bundler/template">\s*\n', data)
if not m:
    raise SystemExit("missing __bundler/template")
start = m.end()
dec = json.JSONDecoder()
tpl, end_tpl = dec.raw_decode(data, start)

# Viewport
tpl = tpl.replace(
    '<meta name="viewport" content="width=1440">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
)

# Head: PWA + icon + shared styles for cookie + language modal
with open(os.path.join(ROOT, "_lp_bk_inject.css"), "r", encoding="utf-8") as cf:
    css = cf.read()
HEAD_EXTRA = (
    '<link rel="manifest" href="manifest.json" />\n'
    '<link rel="icon" type="image/svg+xml" href="icon-blue.svg" />\n'
    '<meta name="theme-color" content="#1a73e8" />\n'
    '<style id="bk-lp-cookie-lang">\n'
    + css
    + "\n</style>\n"
)
tpl = re.sub(r"<title>.*?</title>", f"<title>{SEO_TITLE}</title>", tpl, count=1, flags=re.S)
if "</title>" in tpl:
    tpl = tpl.replace("</title>", "</title>\n" + SEO_EXTRA + "\n" + HEAD_EXTRA, 1)

# Hero H1 i18n hook
tpl = tpl.replace('<h1 class="hero-h1">', '<h1 class="hero-h1" id="hero-heading">', 1)

# Logo
tpl = tpl.replace(
    '<a class="logo" href="#">',
    '<a class="logo" href="landingpage.html" id="lpBrandLink">',
    1,
)

# Primary CTA → /index.html + label span (keeps SVG)
tpl = tpl.replace(
    '<a class="btn btn-primary" href="#">\n'
    "          Jetzt kostenlos testen\n"
    '          <svg class="arr"',
    '<a class="btn btn-primary" href="/index.html" id="lpHeroCta">\n'
    '          <span id="lpHeroCtaLabel">Jetzt kostenlos testen</span>\n'
    '          <svg class="arr"',
    1,
)

# Nav + footer Produkt: remove separate "Sprachen" links (section #sprachen may remain on page)
tpl = tpl.replace(
    '      <a href="#sprachen">Sprachen</a>\n',
    '',
    1,
)
tpl = tpl.replace(
    '          <li><a href="#sprachen">Sprachen</a></li>\n',
    '',
    1,
)

# Language trigger — single globe via styled span (lpUiLangTrigger is "🌐 …"; no extra emoji span)
tpl = tpl.replace(
    '<button class="lang-btn" type="button">\n'
    "        <span>🌐</span>\n"
    "        Sprache wählen\n"
    '        <svg viewBox="0 0 12 12"',
    '<button class="lang-btn" type="button" id="uiLangMobileTrigger" '
    'aria-haspopup="dialog" aria-controls="uiLangModal" aria-expanded="false">\n'
    '        <span id="uiLangMobileTriggerText">🌐 Sprache wählen</span>\n'
    '        <svg viewBox="0 0 12 12"',
    1,
)

# Footer brand blurb (i18n)
tpl = tpl.replace(
    "<p>Dokumente verstehen, einfach gemacht. Behördenpost auf Deutsch — sofort verständlich in deiner Sprache.</p>",
    '<p id="lpFooterTagline">Dokumente verstehen, einfach gemacht. Behördenpost auf Deutsch — sofort verständlich in deiner Sprache.</p>',
    1,
)

# Footer logo link
foot_logo = '<div class="foot-brand">\n        <a class="logo" href="#">'
if foot_logo in tpl:
    tpl = tpl.replace(
        foot_logo,
        '<div class="foot-brand">\n        <a class="logo" href="landingpage.html">',
        1,
    )

# Footer legal links
tpl = tpl.replace(
    '<li><a href="#">Impressum</a></li>\n'
    '          <li><a href="#">AGB</a></li>\n'
    '          <li><a href="#">Datenschutz</a></li>\n'
    '          <li><a href="#">Cookie-Einstellungen</a></li>',
    '<li><a id="lpNavImpressum" href="impressum.html">Impressum</a></li>\n'
    '          <li><a id="lpNavAgb" href="agb.html">AGB</a></li>\n'
    '          <li><a id="lpNavDatenschutz" href="datenschutz.html">Datenschutz</a></li>\n'
    '          <li><a href="#" id="lpFooterCookieSettings" role="button" '
    'aria-haspopup="dialog" aria-controls="cookieSettingsModal">Cookie-Einstellungen</a></li>',
    1,
)

# UI language modal (after first header)
with open(os.path.join(ROOT, "_lp_uilang_modal_fragment.html"), "r", encoding="utf-8") as mf:
    modal_html = mf.read().strip() + "\n\n"
header_end = tpl.find("</header>")
if header_end == -1:
    raise SystemExit("no </header> in template")
insert_at = header_end + len("</header>")
tpl = tpl[:insert_at] + "\n\n" + modal_html + tpl[insert_at:]

# Cookie bar + scripts before </body> in template
with open(os.path.join(ROOT, "_lp_cookie_modal_fragment.html"), "r", encoding="utf-8") as cf:
    cookie_html = cf.read().rstrip() + "\n\n"
with open(os.path.join(ROOT, "_lp_scripts_fragment.html"), "r", encoding="utf-8") as sf:
    scripts_html = sf.read().rstrip() + "\n"

body_close = tpl.rfind("</body>")
if body_close == -1:
    raise SystemExit("no </body> in template")
tpl = tpl[:body_close] + cookie_html + scripts_html + tpl[body_close:]

# Serialize template back into file (JSON string).
# HTML parsers terminate <script> at a literal </script> even inside the JSON string —
# break the token so the outer script tag is not closed early (JSON allows \/ for /).
new_json = json.dumps(tpl)
new_json = new_json.replace("</script>", r"<\/script>")
new_data = data[:start] + new_json + data[end_tpl:]

with open(OUT, "w", encoding="utf-8") as f:
    f.write(new_data)

print("Wrote", OUT, "template len", len(tpl))
