'use strict';

const LABELS = window.LABELS || [];
const I18N = window.I18N;
const tr = (source,values) => I18N.text(source,values);
let presetData = null;
const FONTS = [
  { id:'roman', name:'Nimbus Roman Bold', family:'Label Roman', weight:700 },
  { id:'palatino', name:'Palatino — P052 Bold', family:'Label Palatino', weight:700 },
  { id:'bookman', name:'Bookman Demi', family:'Label Bookman', weight:700 },
  { id:'sans', name:'Nimbus Sans Bold', family:'Label Sans', weight:700 },
  { id:'italic', name:'Nimbus Roman Italic', family:'Label Italic', weight:400 }
];
const STYLES = [
  { id:'classic', name:'Klasyczny bordowy', fontId:'roman', color:'#651b18', uppercase:true },
  { id:'botanical', name:'Botaniczny zielony', fontId:'palatino', color:'#35543c', uppercase:false },
  { id:'vintage', name:'Vintage brązowy', fontId:'bookman', color:'#6b4025', uppercase:true },
  { id:'modern', name:'Prosty grafitowy', fontId:'sans', color:'#292e31', uppercase:false },
  { id:'elegant', name:'Elegancki winny', fontId:'italic', color:'#782b44', uppercase:false }
];
const STYLE_KEY = 'naklejki.defaultStyle.v4';
const A4 = { width:210, height:297, margin:10, gap:3 };
const fontMap = new Map(FONTS.map(font => [font.id, font]));
const labelMap = new Map(LABELS.map(label => [label.id, label]));
const imageCache = new Map();
const textLayoutCache = new Map();
const measureContext = document.createElement('canvas').getContext('2d');
const state = {
  size:30, pages:[], activeTarget:null, editingTarget:null, editDraft:null,
  search:'', category:'Wszystkie', orientation:'portrait', previewZoom:100,
  defaultStyle:readDefaultStyle(), returnFocus:null, exporting:false
};
const cropState = { image:null, objectUrl:null, zoom:1, offsetX:0, offsetY:0, dragStart:null };
const els = Object.fromEntries([
  'catalog','catalogSummary','pages','sizePreset','customSize','customSizeField','layoutInfoField','layoutInfo',
  'searchInput','categoryFilter','addPageBtn','exportBtn','workspaceStats','targetNote',
  'orientation','previewZoom','previewZoomValue','fitPreviewBtn','defaultStyle','defaultStyleSample',
  'editModal','closeModalBtn','modalPreview','modalTitle','modalPosition','replaceBtn','removeBtn',
  'labelText','labelFont','labelColor','labelCase','stylePresets','makeDefaultStyle','saveEditBtn','cancelEditBtn',
  'importImageBtn','imageFileInput','importModal','closeImportBtn','cancelImportBtn','confirmImportBtn',
  'customLabelName','customTextOverlay','cropStage','cropCanvas','cropZoom','cropZoomValue','toast',
  'languageSelect','presetSize','addPresetBtn'
].map(id => [id, document.getElementById(id)]));

function styleFields(style) {
  return { fontId:fontMap.has(style.fontId) ? style.fontId : 'roman',
    color:/^#[0-9a-f]{6}$/i.test(style.color) ? style.color.toLowerCase() : '#651b18',
    uppercase:typeof style.uppercase === 'boolean' ? style.uppercase : true };
}
function readDefaultStyle() {
  try {
    const saved = JSON.parse(localStorage.getItem(STYLE_KEY));
    if (saved && typeof saved === 'object') return styleFields(saved);
  } catch (_) { /* Storage can be unavailable in a private session. */ }
  return styleFields(STYLES[0]);
}
function sameStyle(a,b) { return a.fontId === b.fontId && a.color === b.color && a.uppercase === b.uppercase; }
function setDefaultStyle(style) {
  state.defaultStyle = styleFields(style);
  try { localStorage.setItem(STYLE_KEY,JSON.stringify(state.defaultStyle)); } catch (_) {}
  renderDefaultStyle();
  renderCatalog();
}
function renderDefaultStyle() {
  const selected = STYLES.find(style => sameStyle(style,state.defaultStyle));
  els.defaultStyle.innerHTML = STYLES.map(style => `<option value="${style.id}">${escapeHtml(tr(style.name))}</option>`).join('') + (selected ? '' : `<option value="custom">${escapeHtml(tr('Własny zapisany styl'))}</option>`);
  els.defaultStyle.value = selected?.id || 'custom';
  const font = fontMap.get(state.defaultStyle.fontId);
  Object.assign(els.defaultStyleSample.style,{fontFamily:`'${font.family}'`,fontWeight:font.weight,color:state.defaultStyle.color});
  const sample = I18N.name({name:'Sól ziołowa',translationKey:'01/sol-ziolowa'});
  els.defaultStyleSample.textContent = state.defaultStyle.uppercase ? sample.toLocaleUpperCase(I18N.language) : sample;
}
function newSticker(labelId) {
  const label = labelMap.get(labelId);
  return { labelId, text:label.textOverlay === false ? '' : I18N.name(label),
    autoText:label.textOverlay !== false && !label.custom, ...state.defaultStyle };
}
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[char]); }

// One normalized layout is shared by the SVG preview and the PDF canvas.
// Line widths follow the inner circle so long names stay inside the rings.
function fitText(sticker) {
  const displayed = (sticker.uppercase ? sticker.text.toLocaleUpperCase(I18N.language) : sticker.text).trim();
  if (!displayed) return { fontSize:0, lines:[] };
  const key = JSON.stringify([displayed,sticker.fontId]);
  if (textLayoutCache.has(key)) return textLayoutCache.get(key);
  const font = fontMap.get(sticker.fontId) || FONTS[0];
  const groups = displayed.split(/\n+/).map(line => line.trim().split(/\s+/)).filter(words => words[0]);
  const words = [], hardBreaks = new Set();
  groups.forEach((group,index) => { if(index) hardBreaks.add(words.length); words.push(...group); });
  const maxLines = Math.max(Math.min(4,words.length),groups.length);
  function atSize(size) {
    measureContext.font = `${font.weight} ${size}px '${font.family}'`;
    const sample = measureContext.measureText('ĄĆĘŁŃÓŚŹŻgy');
    const ascent = sample.actualBoundingBoxAscent || size*.8;
    const descent = sample.actualBoundingBoxDescent || size*.2;
    const leading = size*1.03;
    const widths = new Map();
    const widthOf = text => {
      if(!widths.has(text)) {
        const metric = measureContext.measureText(text);
        widths.set(text,Math.max(metric.width,metric.actualBoundingBoxLeft+metric.actualBoundingBoxRight)+size*.06);
      }
      return widths.get(text);
    };
    for(let count = Math.max(1,groups.length); count <= maxLines; count++) {
      const blockHeight = ascent+descent+(count-1)*leading;
      if(blockHeight > 272) continue;
      const top = 246-blockHeight/2;
      const lineSpecs = Array.from({length:count},(_,row) => {
        const lineTop = top+row*leading, bottom = lineTop+ascent+descent;
        const dy = Math.max(Math.abs(lineTop-500),Math.abs(bottom-500));
        return { y:lineTop+ascent, width:Math.min(820,2*Math.sqrt(Math.max(0,446*446-dy*dy))) };
      });
      const memo = new Map();
      function wrap(row,start) {
        if(row===count) return start===words.length ? {score:0,lines:[]} : null;
        if(words.length-start < count-row) return null;
        const id = row+':'+start;
        if(memo.has(id)) return memo.get(id);
        let best=null;
        for(let end=start+1;end<=words.length-(count-row-1);end++) {
          if(end>start+1 && hardBreaks.has(end-1)) break;
          const text=words.slice(start,end).join(' '), width=widthOf(text);
          if(width>lineSpecs[row].width) break;
          const next=wrap(row+1,end);
          if(!next) continue;
          const score=(1-width/lineSpecs[row].width)**2+next.score;
          if(!best || score<best.score) best={score,lines:[{text,x:500,y:lineSpecs[row].y,width},...next.lines]};
        }
        memo.set(id,best);return best;
      }
      const wrapped=wrap(0,0);
      if(wrapped) return {fontSize:size,lines:wrapped.lines};
    }
    return null;
  }
  let low=1,high=224,best=atSize(1);
  while(low<=high) {
    const middle=Math.floor((low+high)/2),candidate=atSize(middle);
    if(candidate) { best=candidate;low=middle+1; } else high=middle-1;
  }
  const result=best || {fontSize:0,lines:[]};
  textLayoutCache.set(key,result);return result;
}
function stickerMarkup(sticker,thumbnail=false) {
  const label=labelMap.get(sticker.labelId),font=fontMap.get(sticker.fontId)||FONTS[0];
  const layout=fitText(sticker);
  const useThumb=thumbnail&&Boolean(label.thumb);
  const source=useThumb?label.thumb:label.src;
  const width=useThumb?label.thumbWidth:label.width,height=useThumb?label.thumbHeight:(label.height||label.width);
  return `<img src="${escapeHtml(source)}" alt="" ${thumbnail?'loading="lazy"':''} decoding="async" width="${width}" height="${height}"><svg viewBox="0 0 1000 1000" aria-hidden="true"><g fill="${sticker.color}" font-family="${font.family}" font-weight="${font.weight}" font-size="${layout.fontSize}" text-anchor="middle">${layout.lines.map(line=>`<text x="${line.x}" y="${line.y}">${escapeHtml(line.text)}</text>`).join('')}</g></svg>`;
}
function calculateLayout(size=state.size) {
  const columns=Math.max(1,Math.floor((A4.width-2*A4.margin+A4.gap)/(size+A4.gap)));
  const rows=Math.max(1,Math.floor((A4.height-2*A4.margin+A4.gap)/(size+A4.gap)));
  return {columns,rows,capacity:columns*rows,startX:(A4.width-columns*size-(columns-1)*A4.gap)/2,startY:(A4.height-rows*size-(rows-1)*A4.gap)/2};
}
function emptyPage() { return {slots:Array(calculateLayout().capacity).fill(null)}; }
function allPlacedStickers() { return state.pages.flatMap(page=>page.slots).filter(Boolean); }
function placedCounts() {
  return allPlacedStickers().reduce((counts,sticker)=>counts.set(sticker.labelId,(counts.get(sticker.labelId)||0)+1),new Map());
}
function repackPages() {
  const used=allPlacedStickers(),capacity=calculateLayout().capacity;
  state.pages=Array.from({length:Math.max(1,Math.ceil(used.length/capacity))},(_,pageIndex)=>({slots:Array.from({length:capacity},(_,slotIndex)=>used[pageIndex*capacity+slotIndex]||null)}));
  state.activeTarget=null;render();
}
function setSize(value) {
  state.size=Math.round(Math.min(80,Math.max(15,Number(value)||30))*2)/2;
  els.customSize.value=state.size;repackPages();
}
function setOrientation(value) {
  state.orientation=value==='portrait'?'portrait':'landscape';
  Object.assign(A4,state.orientation==='portrait'?{width:210,height:297}:{width:297,height:210});
  repackPages();
}
function renderCatalog() {
  const searchText=text=>text.toLocaleLowerCase(I18N.language).replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const query=searchText(state.search.trim()),counts=placedCounts();
  const items=LABELS.filter(label=>(!query||[I18N.name(label),label.name,I18N.name(label,'en')].some(name=>searchText(name).includes(query)))&&(state.category==='Wszystkie'||label.category===state.category));
  els.catalog.innerHTML=items.map(label=>{
    const count=counts.get(label.id)||0,name=I18N.name(label);
    const usage=count?tr('. W arkuszu: {count}',{count}):'';
    return `<button type="button" class="label-card" data-label-id="${escapeHtml(label.id)}" aria-label="${escapeHtml(tr('Dodaj etykietę: {name}{usage}',{name,usage}))}"><span class="sticker">${stickerMarkup(newSticker(label.id),true)}</span><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(tr(state.activeTarget?'Wstaw w wybrane pole':'Dodaj do arkusza'))}</small></span>${count?`<span class="usage-badge">×${count}</span>`:''}</button>`;
  }).join('')||`<p class="catalog-empty">${escapeHtml(tr('Nie znaleziono takiej etykiety.'))}</p>`;
}
function slotPosition(index,layout) { return {x:layout.startX+(index%layout.columns)*(state.size+A4.gap),y:layout.startY+Math.floor(index/layout.columns)*(state.size+A4.gap)}; }
function renderPages() {
  const layout=calculateLayout();
  els.pages.style.setProperty('--paper-ratio',`${A4.width} / ${A4.height}`);
  els.pages.innerHTML=state.pages.map((page,pageIndex)=>{
    const occupied=page.slots.filter(Boolean),names=occupied.map(sticker=>sticker.text||I18N.name(labelMap.get(sticker.labelId)));
    return `<article class="page-card"><div class="page-header"><div><h3>${escapeHtml(tr('Strona {number}',{number:pageIndex+1}))}</h3><span>${escapeHtml(tr('{used} z {capacity} pól · A4 {orientation}',{used:occupied.length,capacity:layout.capacity,orientation:tr(state.orientation==='landscape'?'poziomo':'pionowo')}))}</span></div><button class="icon-btn delete-page" type="button" data-page="${pageIndex}" aria-label="${escapeHtml(tr('Usuń stronę {number}',{number:pageIndex+1}))}" title="${escapeHtml(tr('Usuń stronę'))}">×</button></div><div class="paper-wrap"><div class="paper" data-page="${pageIndex}">${page.slots.map((sticker,slotIndex)=>{
      const position=slotPosition(slotIndex,layout),active=state.activeTarget?.pageIndex===pageIndex&&state.activeTarget?.slotIndex===slotIndex;
      const name=sticker?(sticker.text||I18N.name(labelMap.get(sticker.labelId))):'';
      return `<button type="button" class="slot ${sticker?'filled':''} ${active?'active':''}" data-page="${pageIndex}" data-slot="${slotIndex}" style="left:${position.x/A4.width*100}%;top:${position.y/A4.height*100}%;width:${state.size/A4.width*100}%;height:${state.size/A4.height*100}%" aria-label="${escapeHtml(tr(sticker?'Edytuj pole {number}: {name}':'Puste pole {number}. Wybierz etykietę.',{number:slotIndex+1,name}))}" title="${escapeHtml(tr(sticker?'Edytuj napis i styl':'Wybierz etykietę'))}">${sticker?`<span class="sticker">${stickerMarkup(sticker)}</span>`:`<span class="slot-number"><span class="slot-plus">+</span>${slotIndex+1}</span>`}</button>`;
    }).join('')}</div></div><details class="page-summary"><summary>${escapeHtml(tr(names.length?'Etykiety na tej stronie ({count})':'Etykiety na tej stronie',{count:names.length}))}</summary><p>${names.length?names.map(escapeHtml).join(' · '):escapeHtml(tr('Strona jest pusta.'))}</p></details></article>`;
  }).join('');
}
function renderStatus() {
  const layout=calculateLayout(),count=allPlacedStickers().length;
  els.layoutInfo.textContent=tr('{columns} × {rows} · {capacity} pól',layout);
  els.workspaceStats.textContent=I18N.count('pagesCount',state.pages.length)+' · '+I18N.count('labelsCount',count);
  els.targetNote.hidden=!state.activeTarget;
  if(state.activeTarget) els.targetNote.innerHTML=`${escapeHtml(tr('Wybierz wzór dla strony {page}, pola {slot}.',{page:state.activeTarget.pageIndex+1,slot:state.activeTarget.slotIndex+1}))}<br><button type="button" class="btn small" id="cancelTargetBtn">${escapeHtml(tr('Anuluj wybór pola'))}</button>`;
}
function render() { renderCatalog();renderPages();renderStatus(); }
function addLabel(labelId) {
  if(state.exporting||!labelMap.has(labelId)) return;
  const sticker=newSticker(labelId);
  if(state.activeTarget) {
    const {pageIndex,slotIndex}=state.activeTarget;state.pages[pageIndex].slots[slotIndex]=sticker;state.activeTarget=null;
  } else {
    let page=state.pages.find(page=>page.slots.includes(null));
    if(!page) { page=emptyPage();state.pages.push(page); }
    page.slots[page.slots.indexOf(null)]=sticker;
  }
  render();showToast('Dodano naklejkę. Kliknij ją na kartce, aby zmienić napis.');
}
function chooseSlot(pageIndex,slotIndex) {
  const sticker=state.pages[pageIndex].slots[slotIndex];
  if(!sticker) {
    state.activeTarget={pageIndex,slotIndex};render();els.searchInput.focus();
    if(matchMedia('(max-width:800px)').matches) els.searchInput.scrollIntoView({block:'center',behavior:'smooth'});
    return;
  }
  state.editingTarget={pageIndex,slotIndex};state.editDraft={...sticker};state.returnFocus=document.activeElement;
  els.modalTitle.textContent=tr('Edytuj naklejkę');
  els.modalPosition.textContent=tr('{name} · strona {page}, pole {slot}',{name:I18N.name(labelMap.get(sticker.labelId)),page:pageIndex+1,slot:slotIndex+1});
  els.makeDefaultStyle.checked=false;fillEditorFields();updateEditorPreview();
  els.editModal.hidden=false;document.body.classList.add('modal-open');els.labelText.focus();
}
function fillEditorFields() {
  const draft=state.editDraft;els.labelText.value=draft.text;els.labelFont.value=draft.fontId;els.labelColor.value=draft.color;els.labelCase.value=draft.uppercase?'upper':'original';
}
function updateEditorPreview() {
  if(!state.editDraft) return;
  els.modalPreview.innerHTML=stickerMarkup(state.editDraft);
  els.stylePresets.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(sameStyle(STYLES.find(style=>style.id===button.dataset.style),state.editDraft))));
}
function readEditorFields() {
  if(!state.editDraft) return;
  const text=els.labelText.value.slice(0,120);
  // Style edits keep automatic translation; typing a personal name opts this copy out.
  if(text!==state.editDraft.text) state.editDraft.autoText=false;
  Object.assign(state.editDraft,{text,fontId:els.labelFont.value,color:els.labelColor.value,uppercase:els.labelCase.value==='upper'});updateEditorPreview();
}
function closeModal() {
  els.editModal.hidden=true;document.body.classList.remove('modal-open');state.editingTarget=null;state.editDraft=null;
  if(state.returnFocus?.isConnected) state.returnFocus.focus();state.returnFocus=null;
}
function saveEditor() {
  if(!state.editingTarget) return;
  readEditorFields();const {pageIndex,slotIndex}=state.editingTarget;
  state.pages[pageIndex].slots[slotIndex]={...state.editDraft};
  if(els.makeDefaultStyle.checked) setDefaultStyle(state.editDraft);
  closeModal();render();showToast('Zapisano napis i styl tej naklejki.');
  els.pages.querySelector(`[data-page="${pageIndex}"][data-slot="${slotIndex}"]`)?.focus();
}
function initializeCategories() {
  const categories=['Wszystkie',...new Set(LABELS.map(label=>label.category||'Pozostałe'))];
  els.categoryFilter.innerHTML=categories.map(category=>{
    const label=LABELS.find(label=>label.category===category);
    const number=label?.categoryKey||label?.src.match(/^assets\/labels\/(\d{2})-/)?.[1];
    return `<option value="${escapeHtml(category)}">${escapeHtml(I18N.categoryName(category,number))}</option>`;
  }).join('');
  if(!categories.includes(state.category)) state.category='Wszystkie';
  els.categoryFilter.value=state.category;
  const count=categories.length-1;
  els.catalogSummary.textContent=I18N.count('designsCount',LABELS.length)+' · '+I18N.count('categoriesCount',count);
}
function deletePage(pageIndex) {
  if(state.pages[pageIndex].slots.some(Boolean)&&!confirm(tr('Usunąć stronę {number} wraz z naklejkami?',{number:pageIndex+1}))) return;
  state.pages.splice(pageIndex,1);if(!state.pages.length)state.pages.push(emptyPage());state.activeTarget=null;render();
}
let toastTimer;
function showToast(message) { els.toast.textContent=tr(message);els.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>els.toast.classList.remove('show'),2600); }
function loadImage(src) {
  if(!imageCache.has(src)) {
    const promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Nie udało się odczytać grafiki.'));image.src=src;});
    imageCache.set(src,promise);promise.catch(()=>imageCache.delete(src));
  }
  return imageCache.get(src);
}
function drawSticker(context,image,sticker,x,y,width,height) {
  // Supplied squares are drawn whole: no circular mask and no cropped rings.
  context.drawImage(image,x,y,width,height);
  const font=fontMap.get(sticker.fontId)||FONTS[0],layout=fitText(sticker);
  context.save();context.translate(x,y);context.scale(width/1000,height/1000);
  context.fillStyle=sticker.color;context.font=`${font.weight} ${layout.fontSize}px '${font.family}'`;context.textAlign='center';context.textBaseline='alphabetic';
  layout.lines.forEach(line=>context.fillText(line.text,line.x,line.y));context.restore();
}

// PDF writer and image-import helpers follow below.

    function cropGeometry() {
      const size = els.cropCanvas.width;
      const radius = size * 0.44;
      const diameter = radius * 2;
      const baseScale = cropState.image
        ? Math.max(diameter / cropState.image.naturalWidth, diameter / cropState.image.naturalHeight)
        : 1;
      return { size, radius, diameter, center: size / 2, baseScale };
    }

    function clampCropOffsets() {
      if (!cropState.image) return;
      const { diameter, baseScale } = cropGeometry();
      const scale = baseScale * cropState.zoom;
      const maxX = Math.max(0, (cropState.image.naturalWidth * scale - diameter) / 2);
      const maxY = Math.max(0, (cropState.image.naturalHeight * scale - diameter) / 2);
      cropState.offsetX = Math.max(-maxX, Math.min(maxX, cropState.offsetX));
      cropState.offsetY = Math.max(-maxY, Math.min(maxY, cropState.offsetY));
    }

    function drawCropPreview() {
      if (!cropState.image) return;
      clampCropOffsets();
      const canvas = els.cropCanvas;
      const context = canvas.getContext('2d');
      const { size, radius, center, baseScale } = cropGeometry();
      const scale = baseScale * cropState.zoom;
      const width = cropState.image.naturalWidth * scale;
      const height = cropState.image.naturalHeight * scale;
      const x = center - width / 2 + cropState.offsetX;
      const y = center - height / 2 + cropState.offsetY;

      context.clearRect(0, 0, size, size);
      context.fillStyle = '#cfc7bd';
      context.fillRect(0, 0, size, size);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(cropState.image, x, y, width, height);
      context.save();
      context.fillStyle = 'rgba(29, 20, 16, .62)';
      context.beginPath();
      context.rect(0, 0, size, size);
      context.arc(center, center, radius, 0, Math.PI * 2, true);
      context.fill('evenodd');
      context.restore();
      context.beginPath();
      context.arc(center, center, radius, 0, Math.PI * 2);
      context.lineWidth = 8;
      context.strokeStyle = '#fff';
      context.stroke();
      context.lineWidth = 3;
      context.strokeStyle = '#7b2f20';
      context.stroke();
    }

    function closeImportModal() {
      els.importModal.hidden = true;
      els.imageFileInput.value = '';
      cropState.image = null;
      cropState.dragStart = null;
      if (cropState.objectUrl) URL.revokeObjectURL(cropState.objectUrl);
      cropState.objectUrl = null;
      els.cropStage.classList.remove('dragging');
      document.body.classList.remove('modal-open');
      els.importImageBtn.focus();
    }

    function openImportModal(file) {
      if (!file || !file.type.startsWith('image/')) {
        showToast('Wybierz plik graficzny.');
        return;
      }
      if (cropState.objectUrl) URL.revokeObjectURL(cropState.objectUrl);
      cropState.objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        cropState.image = image;
        cropState.zoom = 1;
        cropState.offsetX = 0;
        cropState.offsetY = 0;
        els.cropZoom.value = '1';
        els.cropZoomValue.textContent = '100%';
        els.customLabelName.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        els.importModal.hidden = false;
        document.body.classList.add('modal-open');
        els.customTextOverlay.checked = false;
        drawCropPreview();
        els.customLabelName.focus();
      };
      image.onerror = () => {
        closeImportModal();
        showToast('Nie udało się odczytać obrazu.');
      };
      image.src = cropState.objectUrl;
    }

    function croppedImageDataUrl(size=945,type='image/png') {
      const output = document.createElement('canvas');
      output.width = size;
      output.height = size;
      const context = output.getContext('2d');
      const { diameter, baseScale } = cropGeometry();
      const previewToOutput = output.width / diameter;
      const imageScale = baseScale * cropState.zoom * previewToOutput;
      const width = cropState.image.naturalWidth * imageScale;
      const height = cropState.image.naturalHeight * imageScale;
      const x = output.width / 2 - width / 2 + cropState.offsetX * previewToOutput;
      const y = output.height / 2 - height / 2 + cropState.offsetY * previewToOutput;

      context.clearRect(0, 0, output.width, output.height);
      context.save();
      context.beginPath();
      context.arc(output.width / 2, output.height / 2, output.width / 2, 0, Math.PI * 2);
      context.clip();
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(cropState.image, x, y, width, height);
      context.restore();
      return output.toDataURL(type,.8);
    }


    function dataUrlToBytes(dataUrl) {
      const binary = atob(dataUrl.split(',')[1]);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
      return bytes;
    }

    function asciiBytes(text) {
      return new TextEncoder().encode(text);
    }

    function buildPdf(jpegs, width, height) {
      const objects = new Map();
      const pageRefs = [];
      const pageWidth = A4.width / 25.4 * 72;
      const pageHeight = A4.height / 25.4 * 72;
      objects.set(1, { text: '<< /Type /Catalog /Pages 2 0 R >>' });
      jpegs.forEach((jpeg, index) => {
        const pageObject = 3 + index * 3;
        const contentObject = pageObject + 1;
        const imageObject = pageObject + 2;
        pageRefs.push(`${pageObject} 0 R`);
        objects.set(pageObject, { text: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>` });
        const drawing = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
        objects.set(contentObject, { stream: asciiBytes(drawing), dictionary: '' });
        objects.set(imageObject, {
          stream: jpeg,
          dictionary: `/Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`
        });
      });
      objects.set(2, { text: `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${jpegs.length} >>` });

      const chunks = [new Uint8Array([37,80,68,70,45,49,46,52,10,37,255,255,255,255,10])];
      const offsets = [0];
      let byteLength = chunks[0].length;
      const objectCount = 2 + jpegs.length * 3;
      for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
        offsets[objectNumber] = byteLength;
        const object = objects.get(objectNumber);
        const header = asciiBytes(`${objectNumber} 0 obj\n`);
        chunks.push(header); byteLength += header.length;
        if (object.stream) {
          const prefix = asciiBytes(`<< ${object.dictionary} /Length ${object.stream.length} >>\nstream\n`);
          const suffix = asciiBytes('\nendstream\nendobj\n');
          chunks.push(prefix, object.stream, suffix);
          byteLength += prefix.length + object.stream.length + suffix.length;
        } else {
          const body = asciiBytes(`${object.text}\nendobj\n`);
          chunks.push(body); byteLength += body.length;
        }
      }
      const xrefOffset = byteLength;
      let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
      for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
        xref += `${String(offsets[objectNumber]).padStart(10, '0')} 00000 n \n`;
      }
      xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
      chunks.push(asciiBytes(xref));
      return new Blob(chunks, { type: 'application/pdf' });
    }

async function exportPdf() {
  if(state.exporting) return;
  const printablePages=state.pages.filter(page=>page.slots.some(Boolean)).map(page=>({slots:page.slots.map(sticker=>sticker?{...sticker}:null)}));
  if(!printablePages.length) { showToast('Dodaj przynajmniej jedną naklejkę.');return; }
  state.exporting=true;els.exportBtn.disabled=true;
  const main=document.querySelector('.app-shell'),originalText=els.exportBtn.textContent;
  main.inert=true;els.exportBtn.textContent=tr('Tworzenie PDF…');
  try {
    await fontsReady;
    const canvasWidth=Math.round(A4.width/25.4*300),canvasHeight=Math.round(A4.height/25.4*300);
    const scaleX=canvasWidth/A4.width,scaleY=canvasHeight/A4.height,layout=calculateLayout(),jpegs=[];
    const canvas=document.createElement('canvas');canvas.width=canvasWidth;canvas.height=canvasHeight;
    const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    for(let pageIndex=0;pageIndex<printablePages.length;pageIndex++) {
      els.exportBtn.textContent=tr('Tworzenie PDF {page}/{total}…',{page:pageIndex+1,total:printablePages.length});
      context.fillStyle='#fff';context.fillRect(0,0,canvasWidth,canvasHeight);
      const page=printablePages[pageIndex];
      for(let slotIndex=0;slotIndex<page.slots.length;slotIndex++) {
        const sticker=page.slots[slotIndex];if(!sticker)continue;
        const image=await loadImage(labelMap.get(sticker.labelId).src),position=slotPosition(slotIndex,layout);
        drawSticker(context,image,sticker,position.x*scaleX,position.y*scaleY,state.size*scaleX,state.size*scaleY);
      }
      jpegs.push(dataUrlToBytes(canvas.toDataURL('image/jpeg',.98)));
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    const pdf=buildPdf(jpegs,canvasWidth,canvasHeight),link=document.createElement('a');
    link.href=URL.createObjectURL(pdf);link.download=`etykiety-przyprawy-${String(state.size).replace('.','_')}mm-${state.orientation==='landscape'?'poziomo':'pionowo'}-${printablePages.length}str.pdf`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),10000);showToast('PDF gotowy. Drukuj w skali 100%.');
  } catch(error) { console.error(error);showToast('Nie udało się utworzyć PDF. Sprawdź, czy grafiki i czcionki się wczytały.'); }
  finally { main.inert=false;state.exporting=false;els.exportBtn.disabled=false;els.exportBtn.textContent=originalText;els.exportBtn.focus(); }
}
function confirmCustomLabel() {
  if(!cropState.image)return;
  const label={id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:els.customLabelName.value.trim()||tr('Własna etykieta'),category:'Własne',src:croppedImageDataUrl(),thumb:croppedImageDataUrl(320,'image/webp'),thumbWidth:320,thumbHeight:320,width:945,height:945,textOverlay:els.customTextOverlay.checked,custom:true};
  LABELS.unshift(label);labelMap.set(label.id,label);state.category='Wszystkie';closeImportModal();initializeCategories();addLabel(label.id);
}
function cropPointerPosition(event) {
  const bounds=els.cropCanvas.getBoundingClientRect();
  return {x:(event.clientX-bounds.left)*els.cropCanvas.width/bounds.width,y:(event.clientY-bounds.top)*els.cropCanvas.height/bounds.height};
}
function applyPreviewZoom(value) {
  state.previewZoom=Math.min(200,Math.max(75,Number(value)||100));
  els.previewZoom.value=state.previewZoom;els.previewZoomValue.textContent=`${state.previewZoom}%`;
  els.pages.style.setProperty('--preview-zoom',`${state.previewZoom}%`);
}
function initializeStyles() {
  els.labelFont.innerHTML=FONTS.map(font=>`<option value="${font.id}">${font.name}</option>`).join('');
  els.stylePresets.innerHTML=STYLES.map((style,index)=>{
    const font=fontMap.get(style.fontId);
    const sample=I18N.name({name:'Sól',translationKey:'01/sol'});
    return `<button type="button" class="style-preset" data-style="${style.id}" aria-pressed="false" title="${escapeHtml(tr(style.name))}"><span style="font-family:'${font.family}';font-weight:${font.weight};color:${style.color}">${escapeHtml(style.uppercase?sample.toLocaleUpperCase(I18N.language):sample)}</span><small>${index+1}. ${escapeHtml(tr(style.name))}</small></button>`;
  }).join('');renderDefaultStyle();
}

els.catalog.addEventListener('click',event=>{const card=event.target.closest('.label-card');if(card)addLabel(card.dataset.labelId);});
els.pages.addEventListener('click',event=>{
  const slot=event.target.closest('.slot');if(slot)chooseSlot(Number(slot.dataset.page),Number(slot.dataset.slot));
  const button=event.target.closest('.delete-page');if(button)deletePage(Number(button.dataset.page));
});
els.searchInput.addEventListener('input',()=>{state.search=els.searchInput.value;renderCatalog();});
els.categoryFilter.addEventListener('change',()=>{state.category=els.categoryFilter.value;renderCatalog();});
els.defaultStyle.addEventListener('change',()=>{const style=STYLES.find(style=>style.id===els.defaultStyle.value);if(style)setDefaultStyle(style);});
els.targetNote.addEventListener('click',event=>{if(event.target.closest('#cancelTargetBtn')){state.activeTarget=null;render();}});
els.sizePreset.addEventListener('change',()=>{
  const custom=els.sizePreset.value==='custom';els.customSizeField.hidden=!custom;els.layoutInfoField.style.gridColumn=custom?'1 / -1':'auto';
  setSize(custom?els.customSize.value:els.sizePreset.value);if(custom)els.customSize.focus();
});
els.customSize.addEventListener('change',()=>setSize(els.customSize.value));
els.orientation.addEventListener('change',()=>setOrientation(els.orientation.value));
els.previewZoom.addEventListener('input',()=>applyPreviewZoom(els.previewZoom.value));
els.fitPreviewBtn.addEventListener('click',()=>applyPreviewZoom(100));
els.addPageBtn.addEventListener('click',()=>{state.pages.push(emptyPage());render();});
els.exportBtn.addEventListener('click',exportPdf);
for(const input of [els.labelText,els.labelFont,els.labelColor,els.labelCase])input.addEventListener('input',readEditorFields);
els.stylePresets.addEventListener('click',event=>{
  const button=event.target.closest('[data-style]');if(!button||!state.editDraft)return;
  Object.assign(state.editDraft,styleFields(STYLES.find(style=>style.id===button.dataset.style)));fillEditorFields();updateEditorPreview();
});
els.saveEditBtn.addEventListener('click',saveEditor);
els.closeModalBtn.addEventListener('click',closeModal);els.cancelEditBtn.addEventListener('click',closeModal);
els.editModal.addEventListener('click',event=>{if(event.target===els.editModal)closeModal();});
els.replaceBtn.addEventListener('click',()=>{
  if(!state.editingTarget)return;state.activeTarget={...state.editingTarget};closeModal();render();els.searchInput.focus();
  els.searchInput.scrollIntoView({block:'center',behavior:'smooth'});
});
els.removeBtn.addEventListener('click',()=>{
  if(!state.editingTarget)return;const {pageIndex,slotIndex}=state.editingTarget;state.pages[pageIndex].slots[slotIndex]=null;
  closeModal();render();showToast('Usunięto naklejkę z pola.');els.pages.querySelector(`[data-page="${pageIndex}"][data-slot="${slotIndex}"]`)?.focus();
});
els.importImageBtn.addEventListener('click',()=>els.imageFileInput.click());
els.imageFileInput.addEventListener('change',()=>openImportModal(els.imageFileInput.files[0]));
els.closeImportBtn.addEventListener('click',closeImportModal);els.cancelImportBtn.addEventListener('click',closeImportModal);
els.confirmImportBtn.addEventListener('click',confirmCustomLabel);
els.importModal.addEventListener('click',event=>{if(event.target===els.importModal)closeImportModal();});
els.cropZoom.addEventListener('input',()=>{cropState.zoom=Number(els.cropZoom.value);els.cropZoomValue.textContent=`${Math.round(cropState.zoom*100)}%`;drawCropPreview();});
els.cropCanvas.addEventListener('pointerdown',event=>{
  if(!cropState.image)return;const point=cropPointerPosition(event);
  cropState.dragStart={pointerId:event.pointerId,x:point.x,y:point.y,offsetX:cropState.offsetX,offsetY:cropState.offsetY};els.cropCanvas.setPointerCapture(event.pointerId);els.cropStage.classList.add('dragging');
});
els.cropCanvas.addEventListener('pointermove',event=>{
  if(!cropState.dragStart||cropState.dragStart.pointerId!==event.pointerId)return;const point=cropPointerPosition(event);
  cropState.offsetX=cropState.dragStart.offsetX+point.x-cropState.dragStart.x;cropState.offsetY=cropState.dragStart.offsetY+point.y-cropState.dragStart.y;drawCropPreview();
});
function finishCropDrag(event) {
  if(!cropState.dragStart||cropState.dragStart.pointerId!==event.pointerId)return;cropState.dragStart=null;els.cropStage.classList.remove('dragging');
  if(els.cropCanvas.hasPointerCapture(event.pointerId))els.cropCanvas.releasePointerCapture(event.pointerId);
}
els.cropCanvas.addEventListener('pointerup',finishCropDrag);els.cropCanvas.addEventListener('pointercancel',finishCropDrag);
document.addEventListener('keydown',event=>{
  const modal=!els.importModal.hidden?els.importModal:(!els.editModal.hidden?els.editModal:null);
  if(event.key==='Escape') { if(modal===els.importModal)closeImportModal();else if(modal)closeModal();else if(state.activeTarget){state.activeTarget=null;render();} }
  if(event.key==='Tab'&&modal) {
    const elements=[...modal.querySelectorAll('button,input,select,textarea')].filter(element=>!element.disabled&&!element.hidden);
    const first=elements[0],last=elements.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});


function presetLabels(size) {
  const byKey=new Map();
  for(const label of LABELS) {
    const key=I18N.key(label);
    if(key&&!byKey.has(key)) byKey.set(key,label);
  }
  return (presetData?.order||[]).slice(0,size).map(key=>byKey.get(key)).filter(Boolean);
}
function updatePresetChoices() {
  if(!presetData) { els.addPresetBtn.disabled=true;return; }
  const chosen=Number(els.presetSize.value)||20;
  els.presetSize.innerHTML=presetData.sizes.map(size=>{
    const available=presetLabels(size).length;
    const source=available===size?'{count} pozycji':'{count} pozycji ({available} dostępnych)';
    return `<option value="${size}">${escapeHtml(tr(source,{count:size,available}))}</option>`;
  }).join('');
  els.presetSize.value=String(presetData.sizes.includes(chosen)?chosen:presetData.sizes[0]);
  els.presetSize.disabled=false;
  els.addPresetBtn.disabled=presetLabels(Number(els.presetSize.value)).length===0;
}
function addPreset() {
  if(state.exporting||!presetData) return;
  const size=Number(els.presetSize.value);
  if(!presetData.sizes.includes(size)) return;
  const selected=presetLabels(size);
  const placedKeys=new Set(allPlacedStickers().map(sticker=>I18N.key(labelMap.get(sticker.labelId))));
  let added=0;
  for(const label of selected) {
    const key=I18N.key(label);
    if(placedKeys.has(key)) continue;
    let page=state.pages.find(page=>page.slots.includes(null));
    if(!page) { page=emptyPage();state.pages.push(page); }
    page.slots[page.slots.indexOf(null)]=newSticker(label.id);
    placedKeys.add(key);added++;
  }
  state.activeTarget=null;render();
  const message=added?tr('Dodano: {labels}. Zestaw: {size}.',{labels:I18N.count('labelsCount',added),size}):tr('Zestaw jest już na arkuszach.');
  const missing=size-selected.length;
  showToast(message+(missing?' '+tr('Brakujące grafiki: {missing}.',{missing}):''));
}
function updateAutomaticNames() {
  const stickers=allPlacedStickers();
  if(state.editDraft) stickers.push(state.editDraft);
  for(const sticker of stickers) if(sticker.autoText) {
    sticker.text=I18N.name(labelMap.get(sticker.labelId));
  }
}
function changeLanguage(code) {
  I18N.setLanguage(code);els.languageSelect.value=I18N.language;
  updateAutomaticNames();textLayoutCache.clear();
  I18N.translateInterface();initializeStyles();initializeCategories();updatePresetChoices();render();
  if(state.editDraft) {
    fillEditorFields();updateEditorPreview();
    const {pageIndex,slotIndex}=state.editingTarget;
    els.modalTitle.textContent=tr('Edytuj naklejkę');
    els.modalPosition.textContent=tr('{name} · strona {page}, pole {slot}',{name:I18N.name(labelMap.get(state.editDraft.labelId)),page:pageIndex+1,slot:slotIndex+1});
  }
}
els.languageSelect.addEventListener('change',event=>changeLanguage(event.target.value));
els.presetSize.addEventListener('change',()=>updatePresetChoices());
els.addPresetBtn.addEventListener('click',addPreset);

I18N.captureInterface();
state.pages=[emptyPage()];
const fontsReady=Promise.all(FONTS.map(font=>document.fonts.load(`${font.weight} 100px '${font.family}'`))).then(()=>{
  textLayoutCache.clear();
  if(state.pages.length) { renderDefaultStyle();render();if(state.editDraft)updateEditorPreview(); }
});
fontsReady.catch(error=>{console.error(error);showToast('Nie udało się wczytać czcionek. Odśwież stronę.');});
async function initializeApp() {
  await I18N.ready;
  els.languageSelect.innerHTML=I18N.languages().map(item=>`<option value="${escapeHtml(item.code)}">${escapeHtml(item.name)}</option>`).join('');
  els.languageSelect.disabled=false;
  changeLanguage(I18N.language);
  try {
    const response=await fetch('data/presets.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('Could not load presets');
    presetData=await response.json();updatePresetChoices();
  } catch(error) { console.error(error);showToast('Nie udało się wczytać zestawów.'); }
}
initializeApp();

