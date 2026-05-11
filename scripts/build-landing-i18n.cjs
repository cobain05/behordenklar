/**
 * Reads index.html uiTranslations, merges landing-page LP strings, writes ../landing-i18n-runtime.js
 * Run from repo: node behördenklar/scripts/build-landing-i18n.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "landing-i18n-runtime.js");

const indexHtml = fs.readFileSync(indexPath, "utf8");
const marker = "const uiTranslations = ";
const start = indexHtml.indexOf(marker);
if (start < 0) throw new Error("uiTranslations start not found");
const braceStart = indexHtml.indexOf("{", start);
let i = braceStart;
let depth = 0;
let end = -1;
for (; i < indexHtml.length; i++) {
  const c = indexHtml[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
if (end < 0) throw new Error("uiTranslations brace mismatch");
const objSrc = indexHtml.slice(braceStart, end);
const uiTranslations = vm.runInNewContext("(" + objSrc + ")");

const LP_EN = {
  lpBrandAria: "BehördenKlar – Home",
  lpUiLangTrigger: "🌐 Choose language ▼",
  lpNavCta: "Try it free now",
  lpHeroTitle: "Understand official letters – in your language",
  lpHeroLead:
    "Upload your notice or paste the text – BehördenKlar translates, explains in plain language, and shows you what to do next. No legalese – clear and structured.",
  lpFlagsCaption: "Many languages – one clear answer",
  lpStepsHeading: "How it works",
  lpStepsIntro: "In four simple steps from an official letter to orientation – right in your browser.",
  lpStep1Num: "Step 1",
  lpStep1Title: "Upload",
  lpStep1Body: "Paste text or upload a photo/PDF – fast and without complicated software.",
  lpStep2Num: "Step 2",
  lpStep2Title: "Translate",
  lpStep2Body: "Choose your language – the content is rendered clearly and completely.",
  lpStep3Num: "Step 3",
  lpStep3Title: "Understand",
  lpStep3Body: "A short explanation of what the letter means for you – without jargon.",
  lpStep4Num: "Step 4",
  lpStep4Title: "Take action",
  lpStep4Body: "Concrete next steps and, if needed, a template for your reply to the authority.",
  lpFeaturesHeading: "What we can do",
  lpFeaturesIntro: "Everything you need to make sense of decisions and letters – at a glance.",
  lpFeat1Title: "Translation",
  lpFeat1Body: "The authority’s text in the language you understand best – including key terms and deadlines.",
  lpFeat2Title: "Explanation",
  lpFeat2Body: "What the letter says and the core message – summarised in simple words.",
  lpFeat3Title: "Steps",
  lpFeat3Body: "Numbered to-dos: what to do, by when, and what to watch out for.",
  lpFeat4Title: "Letterhead template",
  lpFeat4Body: "If you need to reply: a structured draft with placeholders for your details and the file reference.",
  lpContactHeading: "Questions or need help?",
  lpContactText: "We’re here for you – just send us an email.",
  lpContactBtn: "✉️ Get in touch",
  lpNavImpressum: "Legal notice",
  lpNavAgb: "Terms",
  lpNavDatenschutz: "Privacy",
  lpFooterOwnerLabel: "Owner: Yusuf Coban",
};

const LP_DE = {
  lpBrandAria: "BehördenKlar – Startseite",
  lpUiLangTrigger: "🌐 Sprache wählen ▼",
  lpNavCta: "Jetzt kostenlos testen",
  lpHeroTitle: "Behördenbriefe verstehen – in deiner Sprache",
  lpHeroLead:
    "Lade deinen Bescheid hoch oder füge den Text ein – BehördenKlar übersetzt, erklärt verständlich und zeigt dir, was du als Nächstes tun kannst. Ohne Juristendeutsch, dafür klar und strukturiert.",
  lpFlagsCaption: "Viele Sprachen – eine klare Antwort",
  lpStepsHeading: "So funktioniert es",
  lpStepsIntro: "In vier einfachen Schritten vom Behördenbrief zur Orientierung – direkt im Browser.",
  lpStep1Num: "Schritt 1",
  lpStep1Title: "Hochladen",
  lpStep1Body: "Text einfügen oder Foto/PDF hochladen – schnell und ohne komplizierte Software.",
  lpStep2Num: "Schritt 2",
  lpStep2Title: "Übersetzen",
  lpStep2Body: "Wähle deine Sprache – der Inhalt wird verständlich und vollständig wiedergegeben.",
  lpStep3Num: "Schritt 3",
  lpStep3Title: "Verstehen",
  lpStep3Body: "Kurze Erklärung, was der Brief für dich bedeutet – ohne Fachchinesisch.",
  lpStep4Num: "Schritt 4",
  lpStep4Title: "Handeln",
  lpStep4Body: "Konkrete nächste Schritte und bei Bedarf eine Vorlage für deine Antwort an die Behörde.",
  lpFeaturesHeading: "Das können wir",
  lpFeaturesIntro: "Alles, was du brauchst, um Bescheide und Schreiben einzuordnen – auf einen Blick.",
  lpFeat1Title: "Übersetzung",
  lpFeat1Body: "Der Behördentext in der Sprache, die du am besten verstehst – inklusive wichtiger Begriffe und Fristen.",
  lpFeat2Title: "Erklärung",
  lpFeat2Body: "Was steht im Brief, was ist die Kernaussage – in einfachen Worten zusammengefasst.",
  lpFeat3Title: "Schritte",
  lpFeat3Body: "Nummerierte To-dos: Was ist zu erledigen, bis wann, und worauf du achten solltest.",
  lpFeat4Title: "Briefkopf-Vorlage",
  lpFeat4Body: "Wenn eine Antwort nötig ist: strukturierter Entwurf mit Platzhaltern für deine Daten und das Aktenzeichen.",
  lpContactHeading: "Hast du Fragen oder brauchst du Hilfe?",
  lpContactText: "Wir sind für dich da – schreib uns einfach eine E-Mail.",
  lpContactBtn: "✉️ Kontakt aufnehmen",
  lpNavImpressum: "Impressum",
  lpNavAgb: "AGB",
  lpNavDatenschutz: "Datenschutz",
  lpFooterOwnerLabel: "Inhaber: Yusuf Coban",
};

const LP_TR = {
  lpBrandAria: "BehördenKlar – Ana sayfa",
  lpUiLangTrigger: "🌐 Dil seçin ▼",
  lpNavCta: "Ücretsiz dene",
  lpHeroTitle: "Resmi yazıları anlayın – kendi dilinizde",
  lpHeroLead:
    "Kararınızı yükleyin veya metni yapıştırın – BehördenKlar çevirir, sade bir dille açıklar ve sıradaki adımları gösterir. Hukuk jargonu yok; net ve düzenli.",
  lpFlagsCaption: "Birçok dil – tek net yanıt",
  lpStepsHeading: "Nasıl çalışır",
  lpStepsIntro: "Resmi yazıdan yönelime dört basit adımda – doğrudan tarayıcıda.",
  lpStep1Num: "Adım 1",
  lpStep1Title: "Yükle",
  lpStep1Body: "Metin yapıştırın veya fotoğraf/PDF yükleyin – hızlı ve karmaşık yazılım olmadan.",
  lpStep2Num: "Adım 2",
  lpStep2Title: "Çevir",
  lpStep2Body: "Dilinizi seçin – içerik anlaşılır ve eksiksiz sunulur.",
  lpStep3Num: "Adım 3",
  lpStep3Title: "Anla",
  lpStep3Body: "Mektubun sizin için ne anlama geldiğine dair kısa açıklama – jargon yok.",
  lpStep4Num: "Adım 4",
  lpStep4Title: "Harekete geç",
  lpStep4Body: "Somut sonraki adımlar ve gerekirse kuruma yanıtınız için şablon.",
  lpFeaturesHeading: "Neler yapıyoruz",
  lpFeaturesIntro: "Karar ve yazıları anlamak için ihtiyacınız olan her şey – bir bakışta.",
  lpFeat1Title: "Çeviri",
  lpFeat1Body: "Kurum metni en iyi anladığınız dilde – önemli terimler ve süreler dahil.",
  lpFeat2Title: "Açıklama",
  lpFeat2Body: "Mektupta ne var, öz mesaj ne – sade kelimelerle özet.",
  lpFeat3Title: "Adımlar",
  lpFeat3Body: "Numaralı yapılacaklar: ne, ne zamana kadar, nelere dikkat.",
  lpFeat4Title: "Antet şablonu",
  lpFeat4Body: "Yanıt gerekiyorsa: verileriniz ve dosya numarası için yer tutuculu taslak.",
  lpContactHeading: "Sorularınız mı var veya yardıma mı ihtiyacınız var?",
  lpContactText: "Buradayız – bize e-posta gönderin.",
  lpContactBtn: "✉️ İletişime geç",
  lpNavImpressum: "Künye",
  lpNavAgb: "Şartlar",
  lpNavDatenschutz: "Gizlilik",
  lpFooterOwnerLabel: "İşleten: Yusuf Coban",
};

const LP_AR = {
  lpBrandAria: "BehördenKlar – الصفحة الرئيسية",
  lpUiLangTrigger: "🌐 اختر اللغة ▼",
  lpNavCta: "جرّب مجانًا",
  lpHeroTitle: "افهم الخطابات الرسمية – بلغتك",
  lpHeroLead:
    "ارفع قرارك أو الصق النص – يترجم BehördenKlar ويوضح بلغة بسيطة ويعرض ما يجب فعله لاحقًا. دون لغة قانونية معقدة؛ بوضوح وتنظيم.",
  lpFlagsCaption: "لغات عديدة – إجابة واحدة واضحة",
  lpStepsHeading: "كيف يعمل",
  lpStepsIntro: "في أربع خطوات بسيطة من الخطاب الرسمي إلى التوجه – مباشرة في المتصفح.",
  lpStep1Num: "الخطوة 1",
  lpStep1Title: "رفع",
  lpStep1Body: "الصق النص أو ارفع صورة/PDF – بسرعة وبدون برامج معقدة.",
  lpStep2Num: "الخطوة 2",
  lpStep2Title: "ترجمة",
  lpStep2Body: "اختر لغتك – يُعرض المحتوى بوضوح وكاملًا.",
  lpStep3Num: "الخطوة 3",
  lpStep3Title: "فهم",
  lpStep3Body: "شرح موجز لما يعنيه الخطاب لك – دون مصطلحات صعبة.",
  lpStep4Num: "الخطوة 4",
  lpStep4Title: "التصرف",
  lpStep4Body: "خطوات تالية ملموسة وعند الحاجة قالب للرد على الجهة.",
  lpFeaturesHeading: "ماذا نستطيع أن نفعل",
  lpFeaturesIntro: "كل ما تحتاجه لفهم القرارات والرسائل – في لمحة.",
  lpFeat1Title: "ترجمة",
  lpFeat1Body: "نص الجهة باللغة التي تفهمها أفضل – بما في ذلك المصطلحات والمواعيد المهمة.",
  lpFeat2Title: "شرح",
  lpFeat2Body: "ماذا يقول الخطاب وما الجوهر – بكلمات بسيطة.",
  lpFeat3Title: "خطوات",
  lpFeat3Body: "مهام مرقمة: ماذا تفعل، متى، وما الذي يجب الانتباه إليه.",
  lpFeat4Title: "قالب ترويسة",
  lpFeat4Body: "إذا احتجت للرد: مسودة منظمة مع عناصر نائبة لبياناتك ورقم الملف.",
  lpContactHeading: "هل لديك أسئلة أو تحتاج مساعدة؟",
  lpContactText: "نحن هنا من أجلك – راسلنا عبر البريد الإلكتروني.",
  lpContactBtn: "✉️ تواصل معنا",
  lpNavImpressum: "بيانات النشر",
  lpNavAgb: "الشروط",
  lpNavDatenschutz: "الخصوصية",
  lpFooterOwnerLabel: "المُدير: Yusuf Coban",
};

const LP_RU = {
  lpBrandAria: "BehördenKlar – Главная",
  lpUiLangTrigger: "🌐 Выберите язык ▼",
  lpNavCta: "Попробовать бесплатно",
  lpHeroTitle: "Понимайте официальные письма – на вашем языке",
  lpHeroLead:
    "Загрузите решение или вставьте текст – BehördenKlar переводит, объясняет простым языком и показывает, что делать дальше. Без канцелярита – ясно и структурированно.",
  lpFlagsCaption: "Много языков – один понятный ответ",
  lpStepsHeading: "Как это работает",
  lpStepsIntro: "В четыре простых шага от официального письма к ориентации – прямо в браузере.",
  lpStep1Num: "Шаг 1",
  lpStep1Title: "Загрузка",
  lpStep1Body: "Вставьте текст или загрузите фото/PDF – быстро и без сложных программ.",
  lpStep2Num: "Шаг 2",
  lpStep2Title: "Перевод",
  lpStep2Body: "Выберите язык – содержание передаётся понятно и полностью.",
  lpStep3Num: "Шаг 3",
  lpStep3Title: "Понимание",
  lpStep3Body: "Кратко, что письмо значит для вас – без жаргона.",
  lpStep4Num: "Шаг 4",
  lpStep4Title: "Действия",
  lpStep4Body: "Конкретные следующие шаги и при необходимости шаблон ответа ведомству.",
  lpFeaturesHeading: "Что мы умеем",
  lpFeaturesIntro: "Всё, чтобы разобраться в решениях и письмах – с первого взгляда.",
  lpFeat1Title: "Перевод",
  lpFeat1Body: "Текст ведомства на языке, который вы лучше всего понимаете – с важными терминами и сроками.",
  lpFeat2Title: "Объяснение",
  lpFeat2Body: "Что в письме и главная мысль – простыми словами.",
  lpFeat3Title: "Шаги",
  lpFeat3Body: "Нумерованные задачи: что сделать, до какого срока, на что обратить внимание.",
  lpFeat4Title: "Шаблон шапки письма",
  lpFeat4Body: "Если нужен ответ: структурированный черновик с полями для ваших данных и номера дела.",
  lpContactHeading: "Вопросы или нужна помощь?",
  lpContactText: "Мы рядом – напишите нам на электронную почту.",
  lpContactBtn: "✉️ Связаться",
  lpNavImpressum: "Выходные данные",
  lpNavAgb: "Условия",
  lpNavDatenschutz: "Конфиденциальность",
  lpFooterOwnerLabel: "Владелец: Yusuf Coban",
};

const LANG_ORDER = [
  "Deutsch",
  "Englisch",
  "Türkisch",
  "Arabisch",
  "Russisch",
  "Ukrainisch",
  "Rumänisch",
  "Polnisch",
  "Dari",
  "Bulgarisch",
  "Georgisch",
  "Spanisch",
  "Portugiesisch",
  "Französisch",
  "Italienisch",
  "Griechisch",
  "Albanisch",
  "Bosnisch",
  "Serbisch",
  "Kroatisch",
  "Chinesisch",
  "Vietnamesisch",
  "Persisch",
  "Somali",
  "Tigrinya",
  "Litauisch",
  "Arabisch (Ägyptisch)",
];

const LP_OVERRIDES = {
  Deutsch: LP_DE,
  Englisch: LP_EN,
  Türkisch: LP_TR,
  Arabisch: LP_AR,
  Russisch: LP_RU,
};

const bootSnippet = `
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  var uiLangModal = $("uiLangModal");
  var uiLangModalClose = $("uiLangModalClose");
  var uiLangMobileTrigger = $("uiLangMobileTrigger");
  var uiLangMobileTriggerText = $("uiLangMobileTriggerText");
  var uiLangModalTitle = $("uiLangModalTitle");

  var LOCALE_FOR_UI_LANG = {
    Deutsch: "de", Englisch: "en", Türkisch: "tr", Arabisch: "ar", Russisch: "ru",
    Ukrainisch: "uk", Rumänisch: "ro", Polnisch: "pl", Dari: "fa-AF", Bulgarisch: "bg",
    Georgisch: "ka", Spanisch: "es", Portugiesisch: "pt", Französisch: "fr",
    Italienisch: "it", Griechisch: "el", Albanisch: "sq", Bosnisch: "bs", Serbisch: "sr",
    Kroatisch: "hr", Chinesisch: "zh-Hans", Vietnamesisch: "vi", Persisch: "fa",
    Somali: "so", Tigrinya: "ti", Litauisch: "lt", "Arabisch (Ägyptisch)": "ar-EG"
  };

  var LANG_ISO_BY_UI_KEY = {
    Deutsch: "de", Englisch: "en", Türkisch: "tr", Arabisch: "ar", Russisch: "ru",
    Ukrainisch: "uk", Rumänisch: "ro", Polnisch: "pl", Dari: "fa-AF", Bulgarisch: "bg",
    Georgisch: "ka", Spanisch: "es", Portugiesisch: "pt", Französisch: "fr",
    Italienisch: "it", Griechisch: "el", Albanisch: "sq", Bosnisch: "bs", Serbisch: "sr",
    Kroatisch: "hr", Chinesisch: "zh-Hans", Vietnamesisch: "vi", Persisch: "fa",
    Somali: "so", Tigrinya: "ti", Litauisch: "lt", "Arabisch (Ägyptisch)": "ar-EG"
  };

  var UI_LANG_DE_LABEL = {
    Deutsch: "Deutsch", Englisch: "Englisch", Türkisch: "Türkisch", Arabisch: "Arabisch",
    Russisch: "Russisch", Ukrainisch: "Ukrainisch", Rumänisch: "Rumänisch", Polnisch: "Polnisch",
    Dari: "Dari", Bulgarisch: "Bulgarisch", Georgisch: "Georgisch", Spanisch: "Spanisch",
    Portugiesisch: "Portugiesisch", Französisch: "Französisch", Italienisch: "Italienisch",
    Griechisch: "Griechisch", Albanisch: "Albanisch", Bosnisch: "Bosnisch", Serbisch: "Serbisch",
    Kroatisch: "Kroatisch", Chinesisch: "Chinesisch", Vietnamesisch: "Vietnamesisch",
    Persisch: "Persisch", Somali: "Somali", Tigrinya: "Tigrinya", Litauisch: "Litauisch",
    "Arabisch (Ägyptisch)": "Arabisch (Ägyptisch)"
  };

  function getUiLangEmoji(lang) {
    var map = {
      Deutsch: "🇩🇪", Englisch: "🇬🇧", Türkisch: "🇹🇷", Arabisch: "🇸🇦", Russisch: "🇷🇺",
      Ukrainisch: "🇺🇦", Rumänisch: "🇷🇴", Polnisch: "🇵🇱", Dari: "🇦🇫", Bulgarisch: "🇧🇬",
      Georgisch: "🇬🇪", Spanisch: "🇪🇸", Portugiesisch: "🇵🇹", Französisch: "🇫🇷",
      Italienisch: "🇮🇹", Griechisch: "🇬🇷", Albanisch: "🇦🇱", Bosnisch: "🇧🇦",
      Serbisch: "🇷🇸", Kroatisch: "🇭🇷", Chinesisch: "🇨🇳", Vietnamesisch: "🇻🇳",
      Persisch: "🇮🇷", Somali: "🇸🇴", Tigrinya: "🇪🇷", Litauisch: "🇱🇹",
      "Arabisch (Ägyptisch)": "🇪🇬"
    };
    return map[lang] || "🌐";
  }

  function localizedLanguageLabel(uiLangKey, isoCode, fallback) {
    var loc = LOCALE_FOR_UI_LANG[uiLangKey] || "de";
    if (typeof Intl !== "undefined" && Intl.DisplayNames) {
      try {
        var dn = new Intl.DisplayNames([loc], { type: "language" });
        var s = dn.of(isoCode);
        if (s) return s;
      } catch (e) {}
    }
    return fallback || isoCode;
  }

  function langButtonSortKey(btn) {
    var clone = btn.cloneNode(true);
    var span = clone.querySelector("span[aria-hidden='true']");
    if (span) span.remove();
    return clone.textContent.replace(/\\s+/g, " ").trim();
  }

  function sortLangButtonContainer(containerEl, childSelector, uiLangKey) {
    if (!containerEl) return;
    var locale = LOCALE_FOR_UI_LANG[uiLangKey] || "de";
    var buttons = Array.prototype.slice.call(containerEl.querySelectorAll(":scope > " + childSelector));
    if (!buttons.length) return;
    buttons.sort(function (a, b) {
      var ka = langButtonSortKey(a);
      var kb = langButtonSortKey(b);
      try {
        return ka.localeCompare(kb, locale, { sensitivity: "base", numeric: true });
      } catch (e) {
        return ka.localeCompare(kb, undefined, { sensitivity: "base", numeric: true });
      }
    });
    buttons.forEach(function (btn) { containerEl.appendChild(btn); });
  }

  function setUiLangButtonLabels(uiLangKey) {
    function setOne(btn) {
      var key = btn.getAttribute("data-ui-lang");
      if (!key) return;
      var iso = LANG_ISO_BY_UI_KEY[key];
      var fallback = UI_LANG_DE_LABEL[key] || key;
      var name = localizedLanguageLabel(uiLangKey, iso, fallback);
      var emoji = getUiLangEmoji(key);
      btn.replaceChildren();
      var sp = document.createElement("span");
      sp.setAttribute("aria-hidden", "true");
      sp.textContent = emoji;
      btn.appendChild(sp);
      btn.appendChild(document.createTextNode(" "));
      btn.appendChild(document.createTextNode(name));
    }
    document.querySelectorAll(".ui-modal-lang-btn").forEach(setOne);
  }

  function syncLpFlagsFromModal() {
    var wrap = $("lpFlagsWrap");
    var grid = $("uiLangModalGrid");
    if (!wrap || !grid) return;
    wrap.replaceChildren();
    grid.querySelectorAll(".ui-modal-lang-btn").forEach(function (btn) {
      var langKey = btn.getAttribute("data-ui-lang");
      var span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      span.textContent = getUiLangEmoji(langKey);
      wrap.appendChild(span);
    });
  }

  function refreshLanguageGridsAfterUiLangChange(uiLangKey) {
    setUiLangButtonLabels(uiLangKey);
    sortLangButtonContainer($("uiLangModalGrid"), "button.ui-modal-lang-btn", uiLangKey);
    syncLpFlagsFromModal();
  }

  function updateUiLangTrigger(lang) {
    var t = uiTranslations[lang] || uiTranslations["Deutsch"];
    if (t.lpUiLangTrigger) {
      uiLangMobileTriggerText.textContent = t.lpUiLangTrigger;
    } else {
      var shortUi = (t.uiLangLabel || "").replace(/^🌐\\s*/, "").replace(/:\\s*$/, "").trim();
      uiLangMobileTriggerText.textContent = "🌐 " + getUiLangEmoji(lang) + " " + shortUi + " ▼";
    }
  }

  function syncActiveUiLangButtons(lang) {
    document.querySelectorAll(".ui-modal-lang-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-ui-lang") === lang);
    });
  }

  function getUiLang() {
    var m = document.querySelector(".ui-modal-lang-btn.is-active");
    return m ? m.getAttribute("data-ui-lang") : "Deutsch";
  }

  function applyLandingLanguage(lang) {
    var t = uiTranslations[lang] || uiTranslations["Deutsch"];
    var iso = LOCALE_FOR_UI_LANG[lang] || "de";
    document.documentElement.setAttribute("lang", iso.split("-")[0]);

    if (uiLangModalTitle) {
      uiLangModalTitle.textContent =
        (t.uiLangLabel || "").replace(/^🌐\\s*/, "").replace(/:\\s*$/, "").trim() || "Sprache wählen";
    }
    updateUiLangTrigger(lang);
    syncActiveUiLangButtons(lang);
    refreshLanguageGridsAfterUiLangChange(lang);

    var brand = $("lpBrandLink") || document.querySelector(".brand");
    if (brand) {
      brand.setAttribute("aria-label", t.lpBrandAria || "BehördenKlar");
    }

    var heroCta = $("lpHeroCta");
    if (heroCta) heroCta.textContent = t.lpNavCta;
    $("hero-heading").textContent = t.lpHeroTitle;
    $("lpHeroLead").textContent = t.lpHeroLead;
    $("lpFlagsCaption").textContent = t.lpFlagsCaption;
    $("steps-heading").textContent = t.lpStepsHeading;
    $("lpStepsIntro").textContent = t.lpStepsIntro;
    $("lpStep1Num").textContent = t.lpStep1Num;
    $("lpStep1Title").textContent = t.lpStep1Title;
    $("lpStep1Body").textContent = t.lpStep1Body;
    $("lpStep2Num").textContent = t.lpStep2Num;
    $("lpStep2Title").textContent = t.lpStep2Title;
    $("lpStep2Body").textContent = t.lpStep2Body;
    $("lpStep3Num").textContent = t.lpStep3Num;
    $("lpStep3Title").textContent = t.lpStep3Title;
    $("lpStep3Body").textContent = t.lpStep3Body;
    $("lpStep4Num").textContent = t.lpStep4Num;
    $("lpStep4Title").textContent = t.lpStep4Title;
    $("lpStep4Body").textContent = t.lpStep4Body;
    $("features-heading").textContent = t.lpFeaturesHeading;
    $("lpFeaturesIntro").textContent = t.lpFeaturesIntro;
    $("lpFeat1Title").textContent = t.lpFeat1Title;
    $("lpFeat1Body").textContent = t.lpFeat1Body;
    $("lpFeat2Title").textContent = t.lpFeat2Title;
    $("lpFeat2Body").textContent = t.lpFeat2Body;
    $("lpFeat3Title").textContent = t.lpFeat3Title;
    $("lpFeat3Body").textContent = t.lpFeat3Body;
    $("lpFeat4Title").textContent = t.lpFeat4Title;
    $("lpFeat4Body").textContent = t.lpFeat4Body;
    $("contact-heading").textContent = t.lpContactHeading;
    $("lpContactText").textContent = t.lpContactText;
    $("lpContactBtn").textContent = t.lpContactBtn;
    var ft = $("lpFooterTagline");
    if (ft) ft.innerHTML = t.footerTagline || "";
    $("lpNavImpressum").textContent = t.lpNavImpressum;
    $("lpNavAgb").textContent = t.lpNavAgb;
    $("lpNavDatenschutz").textContent = t.lpNavDatenschutz;
    $("lpFooterOwnerLabel").textContent = t.lpFooterOwnerLabel;

    try {
      localStorage.setItem("behordenklar-ui-lang", lang);
    } catch (e) {}
  }

  function openUiLangModal() {
    uiLangModal.classList.add("visible");
    uiLangModal.setAttribute("aria-hidden", "false");
    uiLangMobileTrigger.setAttribute("aria-expanded", "true");
  }

  function closeUiLangModal() {
    uiLangModal.classList.remove("visible");
    uiLangModal.setAttribute("aria-hidden", "true");
    uiLangMobileTrigger.setAttribute("aria-expanded", "false");
  }

  document.querySelectorAll(".ui-modal-lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLandingLanguage(btn.getAttribute("data-ui-lang"));
      closeUiLangModal();
    });
  });

  uiLangMobileTrigger.addEventListener("click", function () {
    openUiLangModal();
  });

  uiLangModalClose.addEventListener("click", function () {
    closeUiLangModal();
  });

  uiLangModal.addEventListener("click", function (e) {
    if (e.target === uiLangModal) closeUiLangModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (uiLangModal.classList.contains("visible")) {
      closeUiLangModal();
      e.preventDefault();
    }
  });

  var saved = null;
  try {
    saved = localStorage.getItem("behordenklar-ui-lang");
  } catch (e) {}
  if (saved && uiTranslations[saved]) {
    applyLandingLanguage(saved);
  } else {
    applyLandingLanguage("Deutsch");
  }
})();
`;

for (const lang of LANG_ORDER) {
  if (!uiTranslations[lang]) continue;
  const base = Object.assign({}, LP_EN);
  if (LP_OVERRIDES[lang]) Object.assign(base, LP_OVERRIDES[lang]);
  Object.assign(uiTranslations[lang], base);
}

const serialized = JSON.stringify(uiTranslations);
const out =
  "/* Auto-generated by scripts/build-landing-i18n.cjs – do not edit by hand */\n" +
  "const uiTranslations = " +
  serialized +
  ";\n" +
  bootSnippet;

fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath, "(" + out.length + " bytes)");
