/* Shared names for catalogue, SVG labels, editor and PDF; editable data lives in JSON. */
'use strict';
window.I18N = (() => {
  let data = {languages:[{code:'pl',name:'Polski',enabled:true}],ui:{},labels:{},categories:{}};
  let language = 'pl', requestedLanguage = 'pl';
  const staticText = [], staticAttributes = [];
  const titleSource = document.title;
  try { requestedLanguage = localStorage.getItem('naklejki.language') || 'pl'; } catch (_) {}
  const slug = text => String(text).toLowerCase().replace(/ł/g,'l').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const interpolate = (text, values={}) => String(text).replace(/\{(\w+)\}/g, (match,key) =>
    Object.hasOwn(values,key) ? String(values[key]) : match);
  const translated = (entry, fallback, locale=language) =>
    entry?.[locale] || entry?.en || entry?.pl || fallback;
  const languages = () => data.languages.filter(item => item.enabled);
  function setLanguage(code) {
    language = languages().some(item => item.code === code) ? code : 'pl';
    try { localStorage.setItem('naklejki.language',language); } catch (_) {}
    document.documentElement.lang = language;
  }
  function key(label) {
    if (label.custom) return null;
    if (label.translationKey) return label.translationKey;
    const parts = label.src.split('/');
    const number = label.categoryKey || parts[2]?.match(/^\d{2}/)?.[0];
    if (!number) return null;
    const byFile = number+'/'+slug(parts.at(-1).replace(/\.[^.]+$/,''));
    const byName = number+'/'+slug(label.name);
    // Early filenames (e.g. drozdze-nieaktywne-b12.png) differ from the full-list names.
    return Object.hasOwn(data.labels,byFile) ? byFile : byName;
  }
  function name(label, locale=language) {
    return label.custom ? label.name : translated(data.labels[key(label)],label.name,locale);
  }
  function text(source, values={}) {
    return interpolate(translated(data.ui[source],source),values);
  }
  function count(source, number) {
    const entry = data.ui[source];
    const forms = translated(entry,{});
    const locale = entry?.[language] ? language : entry?.en ? 'en' : 'pl';
    const rule = new Intl.PluralRules(locale).select(number);
    return interpolate(forms[rule] || forms.other || String(number),{count:number});
  }
  function categoryName(category, number) {
    return number ? translated(data.categories[number],category) : text(category);
  }
  function captureInterface() {
    // Capture static UI once, before the catalogue/editor create user and product text.
    // No observer or word replacement ever touches a custom label or rendered SVG.
    const skip = 'script,style,svg,textarea,.sticker,#languageSelect,#catalog,#pages,#defaultStyleSample,#stylePresets,#defaultStyle,#categoryFilter,#presetSize,#catalogSummary,#workspaceStats,#modalPosition,#targetNote';
    const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;
    while ((node=walker.nextNode())) {
      if (!node.parentElement.closest(skip) && node.nodeValue.trim()) {
        staticText.push({node,source:node.nodeValue});
      }
    }
    document.querySelectorAll('[placeholder],[aria-label],[title],meta[name="description"]').forEach(element => {
      if (element.closest('script,style,svg,.sticker,#languageSelect,#catalog,#pages,#stylePresets')) return;
      for (const attribute of ['placeholder','aria-label','title','content']) {
        if (element.hasAttribute(attribute)) staticAttributes.push({element,attribute,source:element.getAttribute(attribute)});
      }
    });
  }
  function translateInterface() {
    document.documentElement.lang = language;
    for (const {node,source} of staticText) if (node.isConnected) {
      const trimmed=source.trim();node.nodeValue=source.replace(trimmed,text(trimmed));
    }
    for (const {element,attribute,source} of staticAttributes) if (element.isConnected) {
      element.setAttribute(attribute,text(source));
    }
    document.title=text(titleSource);
  }
  const ready = fetch('data/translations.json',{cache:'no-cache'}).then(response => {
    if (!response.ok) throw new Error('Could not load translations');
    return response.json();
  }).then(payload => {
    data=payload;setLanguage(requestedLanguage);
  }).catch(error => {
    console.error(error);setLanguage('pl');
  });
  return {ready,languages,setLanguage,key,name,text,count,categoryName,captureInterface,translateInterface,
    get language() { return language; }};
})();
