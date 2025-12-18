// ===============================
// Neapolitan Dream (script.js) - FIXED & CLEANED
// ===============================

/* -------------------------------
  0) CONSTANTS
--------------------------------*/
const TRUST_MIN = -100;
const TRUST_MAX = 100;

const TAG_LABEL = {
  calm: "침착함",
  paranoid: "편집증",
  apathetic: "무심한",
  logical: "이성적",

  impulsive: "충동적",
  bold: "대담함",
  curious: "호기심",
  reckless: "무모함",

  leader: "리더",
  kind: "다정함",
  social: "사교적",
  dependent: "의존적",

  selfish: "이기적",
  liar: "거짓말쟁이",
  obsessive: "집착",
  coward: "겁쟁이",
};
const BODY_TEMPLATE = {
  leftfinger: 5,
  rightfinger : 5,
  leftHand: true,
  rightHand: true,
  leftWrist: true,
  rightWrist: true,

  leftEar: true,
  rightEar: true,
  teeth: true,
  eyelid: true,

  leftFoot: true,
  rightFoot: true,
  leftAnkle: true,
  rightAnkle: true,

  tongue: true,
  leftEye: true,
  rightEye: true,
  ribs: 24
};


const BODY_LABEL = {
  leftfinger: "왼손가락",
  rightfinger : "오른손가락",
  leftHand: "왼손",
  rightHand: "오른손",
  leftWrist: "왼쪽 손목",
  rightWrist: "오른쪽 손목",

  leftEar: "왼쪽귀",
  rightEar: "오른쪽귀",
  teeth: "치아",
  eyelid: "눈꺼풀",

  leftFoot: "왼발",
  rightFoot: "오른발",
  leftAnkle: "왼쪽 발목",
  rightAnkle: "오른쪽 발목",

  tongue: "혀",
  leftEye: "왼쪽눈",
  rightEye : "오른쪽 눈",
  ribs : "갈비뼈"
};

const SOCIAL_EVENTS = {
  lightArgue: [
    ["{a}: 너 아까 말 좀 심했어.", "{b}: …그냥 신경이 날카로웠어."],
    ["{a}: 왜 그렇게 쳐다봐?", "{b}: 쳐다본 거 아니거든."],
    ["{a}: 너 또 혼자 나가려 했지?", "{b}: …아니야."],
  ],
  hardArgue: [
    ["{a}: 넌 처음부터 수상했어.", "{b}: 그 말… 취소해."],
    ["{a}: 너 때문에 누가 사라졌잖아!", "{b}: 증거도 없으면서."],
    ["{a}: 다들 너한테 속고 있어.", "{b}: …내가 뭘 했는데?"],
  ],
  loverComfort: [
    ["{a}: 괜찮아. 나 여기 있어.", "{b}: …고마워. 진짜."],
    ["{a}: 네가 무너지면 나도 끝이야.", "{b}: 그러니까… 나 좀 잡아줘."],
    ["{a}: 걱정하지 마. 힘들면 안겨도 돼.", "{b}: 지금은 어려울까..?"],
  ],
  
  familyComfort: [
    ["{a}: 괜찮아. 우리 버텨야지.", "{b}: …응. 너까지 사라지면 안 돼."],
    ["{a}: 숨 쉬어. 지금은 그거면 돼.", "{b}: …알겠어. 같이 가자."],
  ],
};

const TAG_KEYS = Object.keys(TAG_LABEL);

const TAG_EFFECT = {
  calm: { sanityLossMult: 0.85, rumorDetect: 0.08 },
  paranoid: { sanityLossMult: 1.25, rumorBelieve: 0.18 },
  apathetic: { trustChangeMult: 0.6 },
  logical: { rumorDetect: 0.18 },

  impulsive: { impulseUp: 0.18 },
  bold: { impulseUp: 0.10 },
  curious: { impulseUp: 0.22 },
  reckless: { impulseUp: 0.35, sanityLossMult: 1.15 },

  leader: { trustAura: 5 },
  kind: { sanityHealBonus: 6 },
  social: { trustGainMult: 1.2 },
  dependent: { breakupSanityLoss: 1.3 },

  selfish: { trustLossMult: 1.25 },
  liar: { rumorSuccess: 0.20, sanityLossMult: 1.08 },
  obsessive: { conflictSanityLoss: 1.25 },
  coward: { panicVote: 0.22 },
};

const REL_OPTIONS = [
  { key: "unknown", label: "모름", base: 0 },
  { key: "friend", label: "친구", base: 10 },
  { key: "enemy", label: "원수", base: -30 },
  { key: "lover", label: "연인", base: 20 },
  { key: "ex", label: "전 애인", base: -10 },
  { key: "couple", label: "부부", base: 25 },
  { key: "crush", label: "짝사랑", base: 5 },
  { key: "family", label: "가족", base: 25 },
  
];

const ROOMS = [
  { key: "4f_roof", floor: "4F", label: "옥상", cap: 8 },
  { key: "3f_play", floor: "3F", label: "놀이방", cap: 6 },
  { key: "3f_med", floor: "3F", label: "보건실", cap: 4 },
  { key: "3f_admin", floor: "3F", label: "관리자방", cap: 2, special: true },

  { key: "2f_living", floor: "2F", label: "거실", cap: 10 },

  { key: "1f_class", floor: "1F", label: "교실", cap: 10 },
  { key: "1f_rest", floor: "1F", label: "휴식실", cap: 6 },
  { key: "1f_grass", floor: "1F", label: "잔디밭", cap: 10 },

  { key: "outside", floor: "OUT", label: "외부", cap: 99, dangerous: true },
];

const GLITCH_CHARS = ["#", "&", "%", "@", "*", "!", "?", "▮", "░", "▒", "█", "¤", "±", "÷", "≠", "⌁"];

const SUNDAY_DIALOGUE = {
  leader: [
    "{me}: 다들 정리하자. 오늘은 {pick}로 가는 게 맞아.",
    "{me}: 솔직히 더 의심간 건 {sus}야. 근거는 충분해.",
    "{me}: 감정 빼고 판단하자. {cand0}, {cand1}, {cand2} 중 하나야.",
    "{me}: 난 {pick}을 고르겠어. 그리고 끝내자.",
    "{me}: 오늘 밤은 살아남아야 해. {pick}.",
  ],
  kind: [
    "{me}: …난 {pick}을 고르기 싫어. 근데 어쩔 수 없지.",
    "{me}: {sus}가 무섭긴 했어. 그래도 확신은 없어.",
    "{me}: 우리 너무 잔인해지고 있어… {pick} 말고는 없을까?",
    "{me}: 난 {pick}. 미안해… 진짜 미안해.",
    "{me}: 제발… 다음 주는 이런 거 안 했으면 좋겠어.",
  ],
  paranoid: [
    "{me}: 다 알고 있어. 다들 이미 {pick}으로 몰고 가고 있잖아.",
    "{me}: {sus}가 날 봤어. 그 눈빛이… 진짜였어.",
    "{me}: {cand0}, {cand1}, {cand2}. 다 거짓말쟁이야.",
    "{me}: 난 {pick}. 내 뒤통수 치기 전에 내가 먼저 칠 거야.",
    "{me}: 오늘 밤은… 누가 사라질지 이미 정해졌어.",
  ],
  liar: [
    "{me}: 흠… 난 {pick}이 제일 ‘합리적’이라고 봐.",
    "{me}: {sus} 말이 너무 자연스러워서 오히려 거짓말 같아.",
    "{me}: {cand0}는 표정이 안 변해. 그게 제일 수상해.",
    "{me}: 난 {pick}. 그리고… 이유는 말 안 할래.",
    "{me}: 어차피 다들 믿는 척만 하잖아?",
  ],
  coward: [
    "{me}: 나… 난 모르겠어. 그냥 {pick}… 미안.",
    "{me}: {sus}가 무서워. 진짜로 무서워.",
    "{me}: 오늘 밤엔 제발… 나 아니었으면 좋겠어.",
    "{me}: 난 {pick}. 제발 나한테 뭐라 하지 마.",
    "{me}: …끝났어. 다 끝났어.",
  ],
  apathetic: [
    "{me}: 난 {pick}.",
    "{me}: {sus}. 그냥 그래 보여.",
    "{me}: 셋 중에 {pick}이 제일 불필요해.",
    "{me}: 뭐… {pick}.",
    "{me}: 빨리 끝내.",
  ],
};
const SUNDAY_DIALOGUE_DEFAULT = [
  "{me}: 난 {pick}을 고르겠어.",
  "{me}: 솔직히 더 의심간 건 {sus}야.",
  "{me}: 오늘 밤은… {pick}이 맞는 선택이야.",
  "{me}: 셋 중 하나는 사라져야 해. {pick}.",
  "{me}: 난 {pick}. 이유는 없어.",
];

const LAST_WORDS = {
  leader: ["…내가 대신 갈게.", "다들 살아. 그게 명령이야."],
  kind: ["미안해… 진짜 미안해.", "다치지 말아줘… 부탁이야."],
  paranoid: ["결국… 너희가 했지.", "처음부터 정해져 있었어."],
  liar: ["하하… 재미없네.", "이번엔 너희가 거짓말 치는거지?"],
  coward: ["싫어… 싫어…!", "나 안 먹히고 싶어…"],
  apathetic: ["그래.", "잘 살아라."],
  bold: ["좋아. 어디 한번 해봐.", "내가 진짜 무서운 게 뭔지 알아?"],
  calm: ["…괜찮아.", "결국 이렇게 되는군."],
  selfish: ["흥, 살 놈은 사는 거야.", "너희도 곧 따라와."],
  obsessive: ["그 사람은… 날 잊지 못할 거야.", "끝까지… 내 거였어."],
  social: ["다들… 재밌었어.", "이걸로 끝? 아쉽네."],
  dependent: ["혼자 두지 마…", "나 없이… 괜찮아?"],
  logical: ["확률적으로… 이 선택이 최적이었겠지.", "결론은 하나였어."],
  curious: ["문 너머가… 궁금했는데.", "내가 보기엔… 이건 시작이야."],
  reckless: ["하하! 더 세게 해봐!", "이 정도면… 웃기네."],
};
const COLOC_DIALOGUE = [
  ["{a}: 뭔가 느낌이 이상해..", "{b}: 조용히 해, 나도 알고 있으니까"],
  ["{a}: 오늘은 누가 사라질까?", "{b}: 너 그 말 책임질 수 있어?"],
  ["{a}: 오늘도 이상한 소리가 들렸어.", "{b}: ..나도."],
  ["{a}: 정말 걔를 믿어도 될까..?", "{b}: 믿는 척이라도 해야 살지."],
  ["{a}: 언제쯤 이곳에서 나갈 수 있을까..?", "{b}: 관리자가 말했잖아. 버티다 보면, 금방 지날거야"],
  ["{a}: 이젠 모르겠어.", "{b}: 정신차려, 너 이렇게 약한 사람 아니잖아"],
  ["{a}: 무서워", "{b}: 둘이 있으면 안전할거야."],
  ["{a}: 그 규칙이라는게 뭐야? 전혀 모르겠어", "{b}: 뭐든..행동을 조심하자."],
  ["{a}: 하지만 난 궁금한 곳이 많은 걸", "{b}: ..저걸 누가 말려.."],
];


/* -------------------------------
  1) STATE
--------------------------------*/
const state = {
  draftChars: [],
  relations: {},

  chars: [],
  dayIndex: 0,
  totalWeeks: 4,
  raining: false,

  executionCandidates: [],
  started: false,
};

/* -------------------------------
  2) HELPERS
--------------------------------*/
const $ = (sel) => document.querySelector(sel);
function applyBodyCascade(b, removedKey) {
  if (!b) return;

  const setFalse = (k) => { if (k && k !== "ribs") b[k] = false; };

  if (removedKey === "leftHand")  { setFalse("leftWrist"); b.leftfinger = 0; }
  if (removedKey === "rightHand") { setFalse("rightWrist"); b.rightfinger = 0; }

  if (removedKey === "leftWrist")  { setFalse("leftHand");  b.leftfinger = 0; }
  if (removedKey === "rightWrist") { setFalse("rightHand"); b.rightfinger = 0; }

  if (removedKey === "leftFoot")  setFalse("leftAnkle");
  if (removedKey === "rightFoot") setFalse("rightAnkle");
  if (removedKey === "leftAnkle") setFalse("leftFoot");
  if (removedKey === "rightAnkle") setFalse("rightFoot");
  if (removedKey === "leftEye" || removedKey === "rightEye") setFalse("eyelid");
}


function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function aliveChars() { return state.chars.filter(c => c.alive); }

function cryptoId() {
  try { return crypto.randomUUID(); }
  catch { return "id_" + Math.random().toString(16).slice(2) + Date.now().toString(16); }
}

/* -------------------------------
  3) SCREEN NAV (SINGLE)
--------------------------------*/
function showScreen(sel) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.querySelector(sel);
  if (el) el.classList.add("active");
}

/* -------------------------------
  4) CONSOLE LOG
--------------------------------*/
function resetConsole() {
  const logBox = $("#console-log");
  if (!logBox) return;
  logBox.innerHTML = `
    <p class="log system" style="animation-delay:0s">>> [SYSTEM] 콘솔 재설정 완료.</p>
    <div class="log-cursor">_</div>
  `;
}

function logLine(text, type = "system") {
  const logBox = $("#console-log");
  if (!logBox) return;
  const cursor = logBox.querySelector(".log-cursor");

  const p = document.createElement("p");
  p.className = `log ${type}`;
  p.textContent = text;

  if (cursor) logBox.insertBefore(p, cursor);
  else logBox.appendChild(p);

  logBox.scrollTop = logBox.scrollHeight;
}

function glitchText(text, intensity = 0.12) {
  let out = "";
  for (const ch of text) {
    if (ch === " ") { out += ch; continue; }
    out += (Math.random() < intensity) ? rand(GLITCH_CHARS) : ch;
  }
  return out;
}

async function logGlitchLine(prefix, text, css = "warning", intensity = 0.18) {
  logLine(`${prefix} ${glitchText(text, intensity)}`, css);
  await sleep(90);
}

function showConsoleActionButton(label, onClick) {
  const logBox = document.querySelector("#console-log");
  if (!logBox) return;

  const old = document.getElementById("console-action-btn");
  if (old) old.remove();
  const oldGroup = logBox.querySelector(".console_action_group, .console-action-group");
  if (oldGroup) oldGroup.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "console-choice-group console-action-group";
  wrapper.style.justifyContent = "center";

  const btn = document.createElement("button");
  btn.id = "console-action-btn";
  btn.className = "console-btn";
  btn.style.width = "100%";
  btn.style.textAlign = "center";
  btn.style.border = "1px solid #bb0a1e";
  btn.style.color = "#bb0a1e";
  btn.style.padding = "10px";
  btn.textContent = label;

  btn.addEventListener("click", () => {
    wrapper.remove();
    onClick?.();
  });

  wrapper.appendChild(btn);

  const cursor = logBox.querySelector(".log-cursor");
  if (cursor) logBox.insertBefore(wrapper, cursor);
  else logBox.appendChild(wrapper);

  logBox.scrollTop = logBox.scrollHeight;
}


/* -------------------------------
  5) IN-CONSOLE CHOICE
--------------------------------*/
function askChoice({ title = "[CHOICE]", body, options }) {
  const logBox = document.querySelector("#console-log");
  if (!logBox) return Promise.resolve(options[0].value); 


  logLine(`--------------------------------`, "system");
  logLine(title, "warning"); 
  
  const lines = body.split("\n");
  lines.forEach(line => logLine(line, "system"));

  const btnGroup = document.createElement("div");
  btnGroup.className = "console-choice-group";

  logBox.appendChild(btnGroup);
  logBox.scrollTop = logBox.scrollHeight;

  return new Promise((resolve) => {
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = `[ ${opt.label} ]`;
      btn.className = "console-btn";
      
      btn.addEventListener("click", () => {

        btnGroup.remove();
        logLine(`>> [USER DECISION] ${opt.label}`, "user-action");
        resolve(opt.value);
      });

      btnGroup.appendChild(btn);
    });
    
    logBox.scrollTop = logBox.scrollHeight;
  });
}

/* -------------------------------
  6) CREATION UI (MODIFIED: RESISTANCE)
--------------------------------*/

function openBodyModal(c){
  const modal = document.getElementById("body-modal");
  const title = document.getElementById("body-modal-title");
  const content = document.getElementById("body-modal-content");
  if(!modal || !title || !content) return;

  title.textContent = `${c.name} — 신체 상태`;
  content.textContent = formatBodyStatus(c);

  modal.classList.remove("hidden");
}

function closeBodyModal(){
  const modal = document.getElementById("body-modal");
  modal?.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("body-modal");
  document.getElementById("body-modal-close")?.addEventListener("click", closeBodyModal);
  document.getElementById("body-modal-ok")?.addEventListener("click", closeBodyModal);

  modal?.addEventListener("click", (e) => {
    if(e.target === modal) closeBodyModal();
  });
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeBodyModal();
  });
});


function buildTagButtons() {
  const group = document.querySelector("#screen-creation .tag-group");
  if (!group) return;
  group.innerHTML = "";

  TAG_KEYS.forEach((key, idx) => {
    const btn = document.createElement("button");
    btn.className = "tag-btn";
    btn.dataset.val = key;
    btn.type = "button";
    btn.textContent = TAG_LABEL[key] || key;
    if (idx === 0) btn.classList.add("selected");
    group.appendChild(btn);
  });
}

function getSelectedTagKey() {
  const sel = document.querySelector(".tag-group .tag-btn.selected");
  return sel ? sel.dataset.val : "calm";
}

function rollLuck() {
  const n = 1 + Math.floor(Math.random() * 100);
  let letter = "F";
  if (n >= 90) letter = "A";
  else if (n >= 75) letter = "B";
  else if (n >= 60) letter = "C";
  else if (n >= 45) letter = "D";
  else if (n >= 30) letter = "E";
  return { score: n, letter };
}

function setupCreationUI() {
  buildTagButtons();

  // INT slider
  const intSlider = $("#input-int");
  const intOut = $("#display-int");
  if (intSlider && intOut) {
    intOut.textContent = intSlider.value;
    intSlider.addEventListener("input", () => intOut.textContent = intSlider.value);
  }

  // RESISTANCE slider (formerly sanity)
  const sanSlider = $("#input-sanity"); 
  const sanOut = $("#display-sanity");
  if (sanSlider && sanOut) {
    sanOut.textContent = sanSlider.value;
    sanSlider.addEventListener("input", () => sanOut.textContent = sanSlider.value);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-btn");
    if (!btn) return;
    const group = btn.closest(".tag-group");
    if (!group) return;
    group.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });

  $("#btn-add-char")?.addEventListener("click", addDraftChar);

  $("#btn-to-relation")?.addEventListener("click", () => {
    if (state.draftChars.length < 2) {
      alert("최소 2명은 등록해야 합니다.");
      return;
    }
    buildRelationMatrix();
    showScreen("#screen-relation");
  });

  $("#btn-start-game")?.addEventListener("click", startGameFromDraft);

  $("#btn-export")?.addEventListener("click", exportDraft);
  $("#btn-import")?.addEventListener("click", () => $("#file-input")?.click());
  $("#file-input")?.addEventListener("change", importDraft);

  renderDraftList();
}

function addDraftChar() {
  const name = ($("#input-name")?.value || "").trim();
  if (!name) return alert("이름을 입력하세요.");
  if (state.draftChars.some(c => c.name === name)) return alert("동일한 이름이 이미 존재합니다.");

  const intVal = parseInt($("#input-int")?.value ?? "5", 10);

  // ✅ RES(저항/버팀수치) 슬라이더 값
  const resVal = parseInt($("#input-sanity")?.value ?? "5", 10);

  const tagKey = getSelectedTagKey();
  const luck = rollLuck();

  state.draftChars.push({
    id: cryptoId(),
    name,
    int: clamp(intVal, 1, 10),

    san: 100,

    resistance: clamp(resVal, 1, 10),

    sanityWeight: clamp(resVal, 1, 10),

    tagKey,
    luckScore: luck.score,
    luckLetter: luck.letter,
  });

  $("#input-name").value = "";
  renderDraftList();
}



function renderDraftList() {
  const grid = document.querySelector(".char-list-grid");
  if (!grid) return;
  grid.innerHTML = "";

  state.draftChars.forEach((c) => {
    const card = document.createElement("div");
    card.className = "mini-card";
    card.innerHTML = `
      <div class="mc-header">
        <span class="mc-name">${esc(c.name)}</span>
        <span class="mc-tag">${esc(TAG_LABEL[c.tagKey] || c.tagKey)}</span>
      </div>
      <div class="mc-stats">
        <span>INT: ${c.int}</span>
        <span>RES: ${c.resistance}</span> <!-- 표시 변경 -->
        <span>LUCK: ${esc(c.luckLetter)}</span>
      </div>
      <button class="btn-delete" title="삭제">×</button>
    `;
    card.querySelector(".btn-delete")?.addEventListener("click", () => {
      state.draftChars = state.draftChars.filter(x => x.id !== c.id);
      renderDraftList();
    });
    grid.appendChild(card);
  });
}

function exportDraft() {
  const data = { version: 1, draftChars: state.draftChars };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Neapolitan_Dream.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importDraft(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.draftChars)) throw new Error("invalid");

      state.draftChars = data.draftChars.map(c => ({
        id: c.id || cryptoId(),
        name: String(c.name || "UNKNOWN"),
        int: clamp(parseInt(c.int ?? 5, 10), 1, 10),

        san: 100,

        resistance: clamp(parseInt(c.resistance ?? c.sanityWeight ?? 5, 10), 1, 10),
        sanityWeight: clamp(parseInt(c.sanityWeight ?? c.resistance ?? 5, 10), 1, 10),

        tagKey: TAG_LABEL[c.tagKey] ? c.tagKey : "calm",
        luckScore: clamp(parseInt(c.luckScore ?? 50, 10), 1, 100),
        luckLetter: String(c.luckLetter || "C"),
      }));


      renderDraftList();
      alert("불러오기 성공");
    } catch {
      alert("불러오기 실패: JSON 형식이 올바르지 않습니다.");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
}

/* -------------------------------
  7) RELATION MATRIX
--------------------------------*/
function buildRelationMatrix() {
  const table = document.querySelector(".relation-table");
  if (!table) return;
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  if (!thead || !tbody) return;

  const chars = state.draftChars;
  state.relations = {};

  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>주체 \\ 대상</th>`;
  chars.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c.name;
    headRow.appendChild(th);
  });
  thead.innerHTML = "";
  thead.appendChild(headRow);

  tbody.innerHTML = "";
  const selectMap = {};
  const SYMMETRIC_RELS = new Set(["unknown","friend","enemy","lover","ex","couple","family"]);
  chars.forEach((a) => {
    const tr = document.createElement("tr");
    const fixed = document.createElement("td");
    fixed.className = "fixed-col";
    fixed.textContent = a.name;
    tr.appendChild(fixed);

    chars.forEach((b) => {
      const td = document.createElement("td");
      if (a.id === b.id) {
        td.className = "disabled";
        td.textContent = "-";
      } else {
        const sel = document.createElement("select");
        const keyAB = `${a.id}:${b.id}`;
        const keyBA = `${b.id}:${a.id}`;
        selectMap[keyAB] = sel;

        // 저장된 값 있으면 반영
        if (state.relations[keyAB]) sel.value = state.relations[keyAB];

        REL_OPTIONS.forEach(opt => {
          const o = document.createElement("option");
          o.value = opt.key;
          o.textContent = opt.label;
          sel.appendChild(o);
        });



selectMap[keyAB] = sel;

if (state.relations[keyAB]) sel.value = state.relations[keyAB];

sel.addEventListener("change", () => {
  const v = sel.value;


  state.relations[keyAB] = v;

 
  if (!SYMMETRIC_RELS.has(v)) return;

  state.relations[keyBA] = v;
  const other = selectMap[keyBA];
  if (other && other.value !== v) other.value = v;
});


        td.appendChild(sel);
       
        const other = selectMap[keyBA];
        if (other) {
          
          const saved = state.relations[keyAB] || state.relations[keyBA];
          const v = saved || sel.value;

          sel.value = v;
          other.value = v;

          state.relations[keyAB] = v;
          state.relations[keyBA] = v;
        }

      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* -------------------------------
  8) GAME START
--------------------------------*/
async function startGameFromDraft() {
  state.chars = state.draftChars.map(c => ({
    ...c,
    hp: 100,
    san: 100,
    sanityWeight: clamp(c.sanityWeight ?? 5, 1, 10),
    trust: 0,
    body: cloneBody(),
    alive: true,
    deathType: null,
    loc: "1f_class",
    afterOutsideDays: 0,
    roomFlags: {}

  }));

  
  for (const a of state.chars) {
    for (const b of state.chars) {
      if (a.id === b.id) continue;
      const relKey = state.relations[`${a.id}:${b.id}`] || "unknown";
      const rel = REL_OPTIONS.find(x => x.key === relKey) || REL_OPTIONS[0];
      a.trust = clamp(a.trust + rel.base, TRUST_MIN, TRUST_MAX);
    }
  }


  const leaders = state.chars.filter(c => c.tagKey === "leader");
  if (leaders.length) {
    const aura = TAG_EFFECT.leader.trustAura ?? 0;
    state.chars.forEach(c => {
      if (c.tagKey !== "leader") {
        c.trust = clamp(c.trust + Math.min(8, aura * leaders.length), TRUST_MIN, TRUST_MAX);
      }
    });
  }

  state.dayIndex = 0;
  state.started = true;

  const N = state.chars.length;
  state.initialCount = N;
  state.totalWeeks = (N <= 10) ? 4 : (N <= 20) ? 8 : Math.ceil(N * 0.4);

  showScreen("#screen-game");
  resetConsole();
  await playAdminIntro();

  renderDayHeader();
  renderCards();
  renderLocationTerminal();

  rollWeatherForToday(true);
  logLine(`>> [SYSTEM] DAY 1 시작.`, "system");

  state.dynamicRel = {}; 
  for (const a of state.chars) {
    for (const b of state.chars) {
      if (a.id === b.id) continue;
      const rk = getRelKey(a.id, b.id);
      if (rk === "lover" || rk === "couple" || rk === "family") {
        state.dynamicRel[`${a.id}:${b.id}`] = rk;
      }
    }
  }
}
/* -------------------------------
  9) ADMIN INTRO
--------------------------------*/
async function playAdminIntro() {
  const N = state.chars.length;
  const weeks = state.totalWeeks;

  const lines = [
    `[ADMIN] 환영합니다, 이곳은 &▮░@!▒░!█ 공간입니다.`,
    `[ADMIN] 해당 시설에선 무엇이든 자유롭게 하셔도 괜찮습니다. 몇가지 규칙만 잘 지키신다면요.`,
    `[ADMIN] 규칙은 발설이 금지되어 있으니, 행동을 조심하시는게 좋을 것입니다. 아, 단 한가지 말씀드리자면...`,
    `[ADMIN] 매주 일요일 밤, 이곳의 지배인을 위해 한명이 희생해야 한다는 것입니다.`,
    `[ADMIN] 그래도 너무 걱정하지 마세요, 여러분은 ${N}명이니, ${weeks}주만 이곳에서 지내시면 됩니다.`,
    `[ADMIN] 그럼, 문제가 발생하면 언제든지 편히 문의주시길.`,
  ];

  for (const s of lines) {
    logLine(s, "system");
    await sleep(100);
  }
}

/* -------------------------------
  10) DAY / WEEK
--------------------------------*/
const DAYS_KO = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

function getWeekNumber() { return Math.floor(state.dayIndex / 7) + 1; }
function getDayOfWeekIndex() { return state.dayIndex % 7; }
function isSunday() { return getDayOfWeekIndex() === 6; }

function renderDayHeader() {
  const dayEl = $("#game-day");
  if (!dayEl) return;
  const dayNum = state.dayIndex + 1;
  const wk = getWeekNumber();
  const dow = DAYS_KO[getDayOfWeekIndex()];
  dayEl.textContent = `DAY ${dayNum} : ${dow} (${wk}주차)`;
}

/* -------------------------------
  11) WEATHER
--------------------------------*/
function rollWeatherForToday(isFirst = false) {
  const p = isFirst ? 0.40 : 0.38;
  state.raining = chance(p);
  if (state.raining) logLine(`>> 밖을 바라보니 비가 강하게 내리고 있습니다.`, "system");
  else logLine(`>> 금일, 밖은 맑아보입니다.`, "system");
}

/* -------------------------------
  12) RENDER: CARDS
--------------------------------*/
function roomLabel(locKey) {
  const r = ROOMS.find(x => x.key === locKey);
  return r ? `${r.floor} ${r.label}` : locKey;
}

function renderCards() {
  const wrap = document.querySelector("#view-cards .card-grid");
  if (!wrap) return;
  wrap.innerHTML = "";

  const sorted = [...state.chars].sort((a, b) => {
    const aa = a.alive ? 0 : 1;
    const bb = b.alive ? 0 : 1;
    if (aa !== bb) return aa - bb;
    return b.trust - a.trust;
  });

  sorted.forEach((c) => {
    const card = document.createElement("div");
    card.className = "char-card" + (c.alive ? "" : " status-dead");

    const badge = c.alive
      ? (TAG_LABEL[c.tagKey] || c.tagKey)
      : (c.deathType === "execution" ? "DEAD" : "MISSING");

    const hpPct = clamp(c.hp ?? 0, 0, 100);
    const sanPct = clamp(c.san ?? 0, 0, 100);
    const trustCls = (c.trust ?? 0) >= 0 ? "positive" : "negative";

    const bodyText = formatBodyStatus(c);

    if (!c.alive) {
      card.innerHTML = `
        <div class="card-top">
          <span class="name">${esc(c.name)}</span>
          <span class="badge">${esc(badge)}</span>
        </div>

        <div class="card-stats-area">
          <div class="dead-msg">${c.deathType === "execution" ? "SIGNAL TERMINATED" : "SIGNAL LOST"}</div>

          <div class="more-area" style="margin-top:10px;">
            <button class="btn-primary body-toggle" style="width:100%; font-size:0.8rem;">신체 상태</button>
            <pre class="body-status" style="display:none; margin-top:8px; padding:10px; background:#0b0b0b; border:1px solid #333; color:#aaa; white-space:pre-wrap; font-family:var(--font-mono); font-size:0.78rem;">${esc(bodyText)}</pre>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="card-top">
          <span class="name">${esc(c.name)}</span>
          <span class="badge">${esc(badge)}</span>
        </div>

        <div class="card-stats-area">
          <div class="stat-row">
            <div class="stat-label">HP</div>
            <div class="gauge-bg"><div class="gauge hp" style="width:${hpPct}%"></div></div>
            <div class="stat-val">${c.hp}</div>
          </div>

          <div class="stat-row">
            <div class="stat-label">SAN</div>
            <div class="gauge-bg"><div class="gauge sanity" style="width:${sanPct}%"></div></div>
            <div class="stat-val">${c.san}</div>
          </div>

          <div class="trust-row">
            <span class="stat-label">TRUST</span>
            <span class="trust-val ${trustCls}">${(c.trust ?? 0) >= 0 ? "+" + c.trust : c.trust}</span>
          </div>

          <div style="margin-top:8px; font-size:0.75rem; color:#666;">
            INT: ${c.int} / RES: ${c.resistance} / LOC: ${roomLabel(c.loc)}
          </div>

          <div class="more-area" style="margin-top:10px;">
            <button class="btn-primary body-toggle" style="width:100%; font-size:0.8rem;">신체 상태</button>
            <pre class="body-status" style="display:none; margin-top:8px; padding:10px; background:#0b0b0b; border:1px solid #333; color:#aaa; white-space:pre-wrap; font-family:var(--font-mono); font-size:0.78rem;">${esc(bodyText)}</pre>
          </div>
        </div>
      `;
    }

    card.querySelector(".body-toggle")?.addEventListener("click", () => openBodyModal(c));


    wrap.appendChild(card);
  });
}



/* -------------------------------
  13) RENDER: LOCATION TERMINAL
--------------------------------*/
function ensureLocationTerminalContainer() {
  let term = document.querySelector("#view-loc .location-terminal");
  if (!term) {
    const view = $("#view-loc");
    if (!view) return null;
    term = document.createElement("div");
    term.className = "location-terminal";
    view.appendChild(term);
  }
  return term;
}

function renderLocationTerminal() {
  const term = ensureLocationTerminalContainer();
  if (!term) return;

  const alive = aliveChars();
  const byRoom = {};
  ROOMS.forEach(r => byRoom[r.key] = []);
  alive.forEach(c => {
    if (!byRoom[c.loc]) byRoom[c.loc] = [];
    byRoom[c.loc].push(c);
  });

  const floors = ["4F", "3F", "2F", "1F", "OUT"];
  const floorRooms = (floor) => ROOMS.filter(r => r.floor === floor);

  let html = "";
  for (const f of floors) {
    const title = `${f} -------------------------------`;
    html += `<div class="floor-group">`;
    html += `<div class="floor-title">${esc(title)}</div>`;

    const rooms = floorRooms(f);
    for (const r of rooms) {
      const names = (byRoom[r.key] || [])
        .map(x => `<span class="char-icon">[${esc(x.name)}]</span>`).join("");
      const empty = `<span class="empty-spot">. . .</span>`;
      const warningCls = r.key === "outside" ? " warning" : "";
      html += `
        <div class="room-line">
          <span class="room-name${warningCls}">(${esc(r.label)})</span>
          <span class="room-path">~~~~~~~~</span>
          ${names || empty}
        </div>
      `;
    }
    html += `</div>`;
  }

  term.innerHTML = html;
}

/* -------------------------------
  14) VIEW SWITCH
--------------------------------*/
window.switchView = function(which) {
  const btns = document.querySelectorAll(".toggle-btn");
  btns.forEach(b => b.classList.remove("active"));

  const viewCards = $("#view-cards");
  const viewLoc = $("#view-loc");

  if (which === "cards") {
    btns[0]?.classList.add("active");
    if (viewCards) { viewCards.classList.add("active"); viewCards.style.display = "block"; }
    if (viewLoc) { viewLoc.classList.remove("active"); viewLoc.style.display = "none"; }
  } else {
    btns[1]?.classList.add("active");
    if (viewCards) { viewCards.classList.remove("active"); viewCards.style.display = "none"; }
    if (viewLoc) { viewLoc.classList.add("active"); viewLoc.style.display = "block"; }
  }
};

/* -------------------------------
  15) APPLY HELPERS (MODIFIED)
--------------------------------*/
function applyTrust(c, delta) {
  if (!c.alive) return;
  const mult = (TAG_EFFECT[c.tagKey]?.trustChangeMult ?? 1);
  const d = Math.round(delta * mult);
  c.trust = clamp(c.trust + d, TRUST_MIN, TRUST_MAX);
}

function applySanLoss(c, amount) {
  if (!c.alive) return;

  const tagMult = (TAG_EFFECT[c.tagKey]?.sanityLossMult ?? 1);

  const w = clamp((c.sanityWeight ?? 5)/ 10, 0.1, 1);
  const rawLoss = amount * tagMult * (w+0.5);

  const loss = Math.max(10, Math.round(rawLoss));

  c.san = clamp(c.san - loss, 0, 100);
}



function applySanHeal(c, amount) {
  if (!c.alive) return;
  const bonus = (TAG_EFFECT[c.tagKey]?.sanityHealBonus ?? 0);
  c.san = clamp(c.san + amount + bonus, 0, 100);
}
function getRelKey(aId, bId) {
  return state.relations?.[`${aId}:${bId}`] || "unknown";
}

function getPartnersOf(a) {
  const out = [];
  for (const b of state.chars) {
    if (b.id === a.id) continue;
    const rk = getRelKey(a.id, b.id);
    if (rk === "lover" || rk === "couple" || rk === "family") out.push(b.id);
  }
  return out;
}
function getDynamicRel(aId, bId) {
  return state.dynamicRel?.[`${aId}:${bId}`] || getRelKey(aId, bId);
}

function setDynamicRelBoth(aId, bId, rk) {
  state.dynamicRel[`${aId}:${bId}`] = rk;
  state.dynamicRel[`${bId}:${aId}`] = rk;
}

async function tickBreakups() {
  const alive = aliveChars();
  if (alive.length < 2) return;
  if (!chance(0.35)) return;

  const pairs = [];
  for (const a of alive) {
    for (const b of alive) {
      if (a.id >= b.id) continue;
      const rk = getDynamicRel(a.id, b.id);
      if (rk === "lover" || rk === "couple") pairs.push([a, b, rk]);
    }
  }
  if (!pairs.length) return;

  const [a, b] = rand(pairs);

  const lowTrust = (a.trust <= -30 || b.trust <= -30);

  const veryLowSan = (a.san <= 20 || b.san <= 20);

  if (!lowTrust && !veryLowSan) return;

  if (veryLowSan && chance(0.55)) {
   
    const leaver = a.san <= 20 ? a : b;
    const other = leaver.id === a.id ? b : a;
    logLine(`${leaver.name}: "당신 뭐야, 나를 어떻게 아는 거야? 너도 한패지?"`, "event");
    logLine(`${other.name}: "뭐? 지금 그게 무슨—"`, "event");
    await sleep(120);
    logLine(`>> [SYSTEM] 관계 데이터가 붕괴합니다.(일방적 관계 단절)`, "warning");

    setDynamicRelBoth(leaver.id, other.id, "ex");
    applySanLoss(other, 25);
    applyTrust(other, -10);
    applyTrust(leaver, -5);
    return;
  }


  logLine(`${a.name}: "우리… 그만하자."`, "event");
  logLine(`${b.name}: "…그래. 여기선 다 의미 없지."`, "event");
  logLine(`>> [SYSTEM] 두 사람 사이의 관계가 파열되었습니다.`, "warning");

  setDynamicRelBoth(a.id, b.id, "ex");
  applySanLoss(a, 20);
  applySanLoss(b, 20);
  applyTrust(a, -8);
  applyTrust(b, -8);
  if (b.san <= 0) {
      b.san = 0;
      b.alive = false;
      b.deathType = "missing";
      logLine(`>> [SYSTEM] ${b.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
  if (a.san <= 0) {
      a.san = 0;
      a.alive = false;
      a.deathType = "missing";
      logLine(`>> [SYSTEM] ${a.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
}


/* -------------------------------
  16) CORE TICKS
--------------------------------*/
function isLoverRel(rk) { return rk === "lover" || rk === "couple"; }
function isFamilyRel(rk) { return rk === "family"; }

function tickAfterOutside() {
  for (const c of aliveChars()) {
    if (c.afterOutsideDays > 0) {
      c.afterOutsideDays--;
      if (c.afterOutsideDays === 0) {
        logLine(`${c.name}: …(알 수 없는 말을 중얼거린다)`, "warning");
        applySanLoss(c, 18);
        if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
      }
    }
  }
}
function cloneBody() {
  return JSON.parse(JSON.stringify(BODY_TEMPLATE));
}

function isImmobile(c) {

  return (c.body?.leftFoot === false) && (c.body?.rightFoot === false);
}
function getRemovableParts(c) {
  const b = c.body;
  if (!b) return [];

  const parts = [];


  if ((b.leftfinger ?? 0) > 0) parts.push("leftfinger");
  if ((b.rightfinger ?? 0) > 0) parts.push("rightfinger");

  for (const k of Object.keys(BODY_LABEL)) {
    if (k === "ribs" || k === "leftfinger" || k === "rightfinger") continue;
    if (b[k] === true) parts.push(k);
  }

  if ((b.ribs ?? 0) > 0) parts.push("ribs");
  return parts;
}


async function removeBodyPart(c, partKey, { hpDmg = 20, sanAmt = 10, reason = "소멸" } = {}) {
  if (!c?.alive) return;

  const b = c.body ?? (c.body = cloneBody());

  if (partKey === "ribs") {
    b.ribs = Math.max(0, (b.ribs ?? 0) - 1);
  } else if (partKey === "leftfinger" || partKey === "rightfinger") {
    b[partKey] = Math.max(0, (b[partKey] ?? 0) - 1);
    } else {
    b[partKey] = false;
  }
  applyBodyCascade(b, partKey);
  c.hp = clamp(c.hp - hpDmg, 0, 100);
  applySanLoss(c, sanAmt);
  if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
  

  const label = BODY_LABEL[partKey] || partKey;
  await logGlitchLine(">>", `${c.name}의 ${label} 이/가 ${reason}되었습니다`, "warning", 0.32);
  logLine(`>> [SYSTEM] (HP -${hpDmg})`, "warning");

  if (c.body?.leftFoot === false && c.body?.rightFoot === false) {
    await logGlitchLine(">>", `${c.name}: "${glitchText("나, 더는 움직일 수 없어..", 0.35)}"`, "warning", 0.35);
    logLine(`>> [SYSTEM] ${c.name}은(는) 이동 불가 상태가 되었습니다.`, "warning");
  }

  if (c.hp <= 0) {
    c.alive = false;
    c.deathType = "missing";
    await logGlitchLine(">>", `${c.name} : ████ ░░░░ ▮▮▮ 0%`, "warning", 0.45);
    logLine(`>> [ADMIN] ${c.name}씨는 제가 데려가겠습니다. (실종)`, "warning");
  }
  else if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
    }

  renderCards();
  renderLocationTerminal();
  endIfAllDead();
}

async function removeRandomBodyPart(c, opts = {}) {
  const pool = getRemovableParts(c);
  if (!pool.length) return;
  const part = rand(pool);
  await removeBodyPart(c, part, opts);
}


function formatBodyStatus(c) {
  const b = c.body || {};
  const mark = (v) => (v ? "O" : "X");

  const lf = clamp(b.leftfinger ?? 0, 0, 5);
  const rf = clamp(b.rightfinger ?? 0, 0, 5);

  const lines = [
    `${BODY_LABEL.leftfinger} (${lf}/5)`,
    `${BODY_LABEL.rightfinger} (${rf}/5)`,

    `${BODY_LABEL.leftHand} - ${mark(b.leftHand)}`,
    `${BODY_LABEL.rightHand} - ${mark(b.rightHand)}`,
    `${BODY_LABEL.leftEar} - ${mark(b.leftEar)}`,
    `${BODY_LABEL.rightEar} - ${mark(b.rightEar)}`,
    `${BODY_LABEL.teeth} - ${mark(b.teeth)}`,
    `${BODY_LABEL.eyelid} - ${mark(b.eyelid)}`,

    `${BODY_LABEL.leftFoot} - ${mark(b.leftFoot)}`,
    `${BODY_LABEL.rightFoot} - ${mark(b.rightFoot)}`,
    `${BODY_LABEL.tongue} - ${mark(b.tongue)}`,
    `${BODY_LABEL.leftEye} - ${mark(b.leftEye)}`,
    `${BODY_LABEL.rightEye} - ${mark(b.rightEye)}`,

    `${BODY_LABEL.ribs} (${b.ribs ?? 0}/24)`,
  ];

  return lines.join("\n");
}

async function eventRumor() {
  const alive = aliveChars();
  if (alive.length < 3) return;
  if (!chance(0.84)) return;

  const markMissingIfBroken = (c) => {
    if (!c?.alive) return true;          // 이미 죽었으면 더 진행 X
    if ((c.san ?? 0) > 0) return false;  // 아직 버팀
    c.san = 0;
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
    return true;
  }
  const liars = alive.filter(c => c.tagKey === "liar");
  const spreader = liars.length ? rand(liars) : rand(alive);

  const targets = alive.filter(c => c.id !== spreader.id);
  const target = rand(targets);

  const base = 0.35;
  const bonus = (TAG_EFFECT[spreader.tagKey]?.rumorSuccess ?? 0);
  const luck = ((spreader.luckScore ?? 50) / 100) * 0.15;
  const successP = clamp(base + bonus + luck, 0.05, 0.9);

  logLine(`${spreader.name}: "...${target.name}에 대한 얘기 들었어?"`, "event");

  const success = chance(successP);

  const detectors = alive.filter(x => (TAG_EFFECT[x.tagKey]?.rumorDetect ?? 0) > 0);
  const detectP = clamp(
    0.10 + detectors.reduce((s, x) => s + (TAG_EFFECT[x.tagKey]?.rumorDetect ?? 0), 0),
    0,
    0.65
  );
  const detected = chance(detectP);

  if (success && !detected) {
    const loss = 6 + Math.floor(Math.random() * 8); // 6~13
    applyTrust(target, -loss);
    applySanLoss(target, 6);

    if (markMissingIfBroken(target)) return;

    logLine(`>> [SYSTEM] ${target.name}에 대한 소문이 퍼졌다. (TRUST -${loss})`, "warning");
    applyTrust(spreader, +2);
    return;
  }

  if (detected) {
    const penalty = 8 + Math.floor(Math.random() * 8); // 8~15
    applyTrust(spreader, -penalty);
    applySanLoss(spreader, 6);

    logLine(`>> [SYSTEM] 거짓말이 들켰다. ${spreader.name}의 신뢰가 무너진다. (TRUST -${penalty})`, "warning");

    if (markMissingIfBroken(spreader)) return;

    applyTrust(target, +3);
    return;
  }

  logLine(`>> [SYSTEM] 소문은 퍼지지 않았다. 하지만 찝찝함은 남는다.`, "system");
  applySanLoss(spreader, 4);

  if (markMissingIfBroken(spreader)) return;
}

function tickSanityStages() {
  for (const c of aliveChars()) {
    if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
    }
  }
}

function checkSoloRule() {
  const alive = aliveChars();
  if (alive.length === 1) {
    const c = alive[0];
    c.alive = false;
    c.deathType = "missing";
    logLine(`[ADMIN] "혼자는… 안 됩니다."`, "warning");
    logLine(`>> [SYSTEM] ${c.name}은(는) 관리자에게 끌려가 더는 돌아오지 않았습니다`, "warning");
  }
}

/* -------------------------------
  17) DAILY EVENTS
--------------------------------*/
async function enter_3f_med(c) {
  if (!oncePerDayPerRoom(c, "3f_med", "nurse")) return;
  await eventNurseOn3FMed(c);
}

async function enter_1f_rest(c) {
  if (!oncePerDayPerRoom(c, "1f_rest", "sleepingBags")) return;
  await eventRestRoomSleepingBags(c);
}

function oncePerDayPerRoom(c, roomKey, eventKey) {
  const k = `${state.dayIndex}:${roomKey}:${eventKey}`;
  if (c.roomFlags?.[k]) return false;
  (c.roomFlags ??= {})[k] = true;
  return true;
}
async function enter_1f_class(c) {
  if (!oncePerDayPerRoom(c, "1f_class", "chalk")) return;
  await eventClassChalk(c);
}
async function enter_3f_play(c) {
  if (!oncePerDayPerRoom(c, "3f_play", "girl")) return;
  await eventPlayroomGirl(c);
}
async function enter_4f_roof(c) {
  if (!oncePerDayPerRoom(c, "4f_roof", "blackDoor")) return;
  await eventBlackDoorOnRoof(c); 
}

async function enter_any_1f(c) {
  if (!oncePerDayPerRoom(c, "1f_any", "caretaker")) return;

  if (!chance(0.14)) return;

  logLine(`>> [SYSTEM] 1층 복도 끝에 '관리인'이 서 있다.`, "warning");

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `그에게 말을 걸겠습니까?`,
    options: [
      { label: "말을 건다", value: "talk" },
      { label: "피한다", value: "avoid" },
    ],
  });

  if (ans === "talk") {
   
    if (chance(0.55 + (c.luckScore/100)*0.20)) {
      const healHp = 10 + Math.floor(Math.random()*10);
      const healSan = 8 + Math.floor(Math.random()*8);
      c.hp = clamp(c.hp + healHp, 0, 100);
      applySanHeal(c, healSan);
      logLine(`>> [SYSTEM] 치료 성공 (HP +${healHp}, SAN +${healSan})`, "event");
    } else {
      logLine(`>> [SYSTEM] 관리인이 ${c.name}의 손목을 잡았다.`, "warning");
      
      const wrist = chance(0.5) ? "leftWrist" : "rightWrist";
      await removeBodyPart(c, wrist, { hpDmg: 22, sanAmt: 14, reason: "절단" });
    }
  } else {
    applySanLoss(c, 6);
    logLine(`>> [SYSTEM] ${c.name}은(는) 시선을 피했다.`, "system");
    if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
  }
}


async function onEnterRoom(c, from, to) {
  if (!c?.alive) return;
  if (from === to) return;

  if (to === "2f_living") await enter_2f_living(c);
  if (to === "1f_class")  await enter_1f_class(c);
  if (to === "3f_play")   await enter_3f_play(c);
  if (to === "3f_med")    await enter_3f_med(c);
  if (to === "1f_rest")   await enter_1f_rest(c);
  if (to === "4f_roof")   await enter_4f_roof(c);

  if (to.startsWith("1f_")) await enter_any_1f(c);
  renderCards();
  renderLocationTerminal();
  endIfAllDead();
}

async function removeMassParts(c, count = 6, opts = {}) {
  for (let i = 0; i < count; i++) {
    if (!c.alive) break;
    await removeRandomBodyPart(c, opts);
    await sleep(80);
  }
}
async function enter_2f_living(c) {
  if (!oncePerDayPerRoom(c, "2f_living", "sky_whiteDoor")) return;
  await eventLivingRoomSky(c);
  await eventFakeCaretakerOn2F(c);
  await eventWhiteDoorOn2F(c);
}


async function eventBlackDoorOnRoof(c) {
  if (!c?.alive) return;
  if (c.loc !== "4f_roof") return;

  if (!chance(0.10)) return;

  await logGlitchLine(">>", `옥상에 '검은 문'이 나타났다.`, "warning", 0.55);

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `검은 문으로 들어가겠습니까?`,
    options: [
      { label: "들어간다", value: "enter" },
      { label: "무시한다", value: "ignore" },
    ],
  });

  if (ans === "ignore") {
    applySanLoss(c, 10);
    applyTrust(c, -3);
    logLine(`>> [SYSTEM] ${c.name}은(는) 문에서 시선을 떼었다.`, "warning");
    if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    return;
  }

  await logGlitchLine(">>", `문 안쪽은 텅 비어 있다. 보이는 것은 무엇도 없다`, "warning", 0.75);
  await logGlitchLine(">>", `${glitchText("당신은 무엇입니까?", 0.85)}`, "warning", 0.85);

  const partsToLose = 5 + Math.floor(Math.random() * 4); // 5~8개
  await removeMassParts(c, partsToLose, { hpDmg: 18, sanAmt: 16, reason: "소멸" });

  if (c.alive) {
    c.alive = false;
    c.deathType = "missing";
    await logGlitchLine(">>", `${c.name} : ████ ░░░░ ▮▮▮ 0%`, "warning", 0.90);
    logLine(`>> [SYSTEM] ${c.name}은(는) 더 이상 '개체'로 분류되지 않습니다. `, "warning");
    renderCards(); renderLocationTerminal(); endIfAllDead();
  }
}

async function eventLivingRoomSky(c) {
  if (!c?.alive) return;
  if (c.loc !== "2f_living") return;
  if (!chance(0.45)) return; 

 
  if (chance(0.5)) {
    logLine(`>> [SYSTEM] ${c.name}의 시야 끝에서 '그림자'가 먼저 움직였다.`, "warning");

    const ans = await askChoice({
      title: "[WARNING]",
      body: `뒤돌아 확인하겠습니까?`,
      options: [
        { label: "무시한다", value: "ignore" },
        { label: "확인한다", value: "check" },
      ],
    });

    if (ans === "check") {
      logLine(`>> [SYSTEM] ${c.name}은(는) 확인해버렸습니다.`, "warning");
      const part = pickExistingPart(c, ["leftAnkle","rightAnkle","leftWrist","rightWrist","ribs"]);
      if (part) await removeBodyPart(c, part, { hpDmg: 18, sanAmt: 14, reason: "소멸" });
      applySanLoss(c, 90);
      applyTrust(c, -8);
      if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }

    } else {
      applySanLoss(c, 2);
      applyTrust(c, 0);
      if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    }
    return;
  }


  logLine(`>> [SYSTEM] 2층 거실의 하늘(천장)이 푸르게 펼쳐져 있다.`, "warning");

  const ans2 = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 천장을 더 바라보고 싶은 충동을 느낍니다.`,
    options: [
      { label: "고개를 돌린다", value: "away" },
      { label: "계속 바라본다", value: "stare" },
    ],
  });

  if (ans2 === "away") {
    logLine(`${c.name}: "…안 봐."`, "system");
    applySanLoss(c, 6);
    if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    return;
  }

 
  logLine(`>> [SYSTEM] '말'이 걸려온다.`, "warning");

  const who = chance(0.55) ? "white" : "black"; 
  if (who === "white") {
    logLine(`>> [SYSTEM] 흰 옷을 입은 누군가가 ${c.name}에게 말을 건다.`, "warning");
    const ans3 = await askChoice({
      title: "[WARNING]",
      body: `그녀의 말을 듣겠습니까?`,
      options: [
        { label: "무시한다", value: "ignore" },
        { label: "듣는다", value: "listen" },
      ],
    });

    if (ans3 === "listen") {
      await logGlitchLine("??? : ", `알고 있어? 너는 사실 가짜고, 네 존재는 고작 데이터에 불과하다는 거.`, "system", 0.80);
      await logGlitchLine("??? : ", `누군가가 만들어낸 거짓말이야.`, "system", 0.80);
      await logGlitchLine("??? : ", `그래, 너도 사실은 알고 있잖아?`, "system", 0.80);
      await logGlitchLine("??? : ", `무너질거야. 계속, 또 계속`, "system", 0.80);
      logLine(`>> [SYSTEM] ${c.name}의 정신력은 그것을 감당하지 못합니다.`, "warning");
      applySanLoss(c, 40);
      if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
      applyTrust(c, -10);
    } else {
      applySanLoss(c, 12);
      if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    }
  } else {
    logLine(`>> [SYSTEM] 검은 옷을 입은 누군가가 ${c.name}에게 말을 건다.`, "event");
    await logGlitchLine(" ", `??? : 별 말은 아니야, 그냥 그냥..`, "system", 0.80);
    const ans4 = await askChoice({
      title: "[CHOICE]",
      body: `그녀의 말에 공감해주겠습니까?`,
      options: [
        { label: "대충 넘긴다", value: "meh" },
        { label: "깊게 공감한다", value: "empathize" },
      ],
    });

    if (ans4 === "empathize") {
      await logGlitchLine("??? : ", `??? : 세상엔 행복한 일들이 가득이야. 너도, 나도.`, "system", 0.80);
      await logGlitchLine("??? : ", `??? : 별 이야기는 더 하지 않을게. 그냥 말할 상대가 필요했어.`, "system", 0.80);
      await logGlitchLine("??? : ", `??? : 네가 영원히 깨닫지 않았으면 좋겠네.`, "system", 0.80);
      logLine(`>> [SYSTEM] ${c.name}는 어째선지 기분이 좋아졌습니다.`, "event");
      applySanHeal(c, 18);
      applyTrust(c, +6);
    } else {
      applySanLoss(c, 8);
      if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    }
  }
}
async function tickViolenceBySan() {
  const alive = aliveChars();
  if (alive.length < 2) return;
  const c = rand(alive);

  if (c.san > 25) return;
  if (!chance(0.25)) return;

  const others = alive.filter(x => x.id !== c.id);
  const v = rand(others);

  logLine(`>> [SYSTEM] ${c.name}는 알 수 없는 분노가 자신을 가득 채웁니다`, "warning");
  logLine(`${c.name}: "시끄러워."`, "event");

  const dmg = 10 + Math.floor(Math.random() * 16); // 10~25
  v.hp = clamp(v.hp - dmg, 0, 100);
  applyTrust(v, -8);
  applyTrust(c, -5);

  logLine(`>> [SYSTEM] 폭력 발생: ${v.name} (HP -${dmg})`, "warning");

  if (v.hp <= 0) {
    v.alive = false;
    v.deathType = "missing";
    logLine(`>> [ADMIN] 이런, ${v.name}씨는 제가 데려가겠습니다.`, "warning");
  }
}

state.flags ??= {};
state.flags.restRoomSafe = false;

function pickExistingPart(c, keys) {
  const b = c.body ?? (c.body = cloneBody());
  const pool = keys.filter(k => {
    if (k === "ribs") return (b.ribs ?? 0) > 0;
    if (k === "leftfinger" || k === "rightfinger") return (b[k] ?? 0) > 0;
    return b[k] === true;
  });
  return pool.length ? rand(pool) : null;
}


async function eventCaretakerOn1F(c) {
  if (!c?.alive) return;
  if (!String(c.loc).startsWith("1f_")) return;
  if (!chance(0.14)) return;

  logLine(`>> [SYSTEM] 1층에 '관리인'으로 보이는 형체가 나타났다.`, "warning");

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 관리인에게 말을 걸겠습니까?`,
    options: [
      { label: "말을 건다", value: "talk" },
      { label: "피한다", value: "avoid" },
    ],
  });

  if (ans === "avoid") {
    applySanLoss(c, 8);
    applyTrust(c, -2);
    logLine(`>> [SYSTEM] ${c.name}은(는) 시선을 피했다.`, "system");
    if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
      return;
    }
    return;
  }

  logLine(`${c.name}: "저기, 안녕하세요 관리인씨?"`, "event");

  const good = chance(0.45 + ((c.luckScore ?? 50) / 100) * 0.25);
  if (good) {
    const healHp = 10 + Math.floor(Math.random() * 12);
    const healSan = 8 + Math.floor(Math.random() * 10);
    c.hp = clamp(c.hp + healHp, 0, 100);
    applySanHeal(c, healSan);
    applyTrust(c, +4);
    await logGlitchLine("관리인: ", `상태가 많이 좋지 않으시군요, 도와드리겠습니다`, "event", 0.35);
    logLine(`>> [SYSTEM] ${c.name} 상태 회복 (HP +${healHp}, SAN +${healSan})`, "event");
    return;
  }

  const wrist = pickExistingPart(c, ["leftWrist", "rightWrist"]);
  if (!wrist) {
    await logGlitchLine("관리인: ", `그저 안타까울 뿐입니다.`, "warning", 0.55);
    applySanLoss(c, 18);
    applyTrust(c, -8);
    return;
  }

  await logGlitchLine("관리인: ", `손을, 내밀어.`, "warning", 0.45);
  await removeBodyPart(c, wrist, { hpDmg: 25, sanAmt: 16, reason: "절단" });
  applyTrust(c, -10);
}

async function eventSundayNoSleep() {
  const alive = aliveChars();
  if (!alive.length) return;
  if (!chance(0.35)) return;

  const c = rand(alive);
  logLine(`>> [SYSTEM] ${c.name}의 눈이 감긴다. 일요일 밤이다.`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `${c.name}을(를) 깨우겠습니까?`,
    options: [
      { label: "깨운다", value: "wake" },
      { label: "내버려둔다", value: "sleep" },
    ],
  });

  if (ans === "wake") {
    logLine(`>> [SYSTEM] ${c.name}은(는) 가까스로 정신을 붙잡았다.`, "system");
    applySanLoss(c, 6);
    return;
  }

  await logGlitchLine(">>", `${c.name}은(는) 지배인의 '간식'으로 인식되었습니다.`, "warning", 0.55);
  await removeRandomBodyPart(c, { hpDmg: 22, sanAmt: 14, reason: "뜯김" });
}

async function eventWhiteDoorOn2F(c) {
  if (!c?.alive) return;
  if (c.loc !== "2f_living") return;
  if (!chance(0.12)) return;

  logLine(`>> [SYSTEM] 2층 거실에 '흰색 문'이 열렸다.`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `흰 문으로 들어가겠습니까?`,
    options: [
      { label: "들어간다", value: "in" },
      { label: "가지 않는다", value: "run" },
    ],
  });

  if (ans === "run") {
    
    applySanLoss(c, 18);
    applyTrust(c, -6);
    logLine(`>> [SYSTEM] ${c.name}은(는) 인기척을 느끼곤 고개를 돌렸다.`, "warning");
    await logGlitchLine("??? : ", `이미 늦었어 꼬마친구.`, "system", 0.35);
    c.alive = false; c.deathType = "missing";
    return;
  }

  await logGlitchLine(">>", `문 안쪽은, 지나치게 하얗다.`, "system", 0.35);

  const wait = await askChoice({
    title: "[CHOICE]",
    body: `안에서 몇 초를 세고 나오겠습니까?`,
    options: [
      { label: "2초", value: 2 },
      { label: "4초", value: 4 },
      { label: "8초", value: 8 },
      { label: "10초", value: 10 },
    ],
  });

  if (wait !== 10) {
    await logGlitchLine(">>", `잘못 셌다.`, "warning", 0.70);
    await logGlitchLine(">>", `검은 물체가 '발견'했다.`, "warning", 0.75);

    const part = pickExistingPart(c, ["leftEye", "rightEye", "tongue", "leftAnkle", "rightAnkle", "ribs"]);
    if (part) {
      await removeBodyPart(c, part, { hpDmg: 28, sanAmt: 22, reason: "소멸" });
    } else {
      c.alive = false; c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 빛 속에서 사라졌다. (실종)`, "warning");
    }
    return;
  }

  logLine(`>> [SYSTEM] 10초. 문이 닫혔다.`, "system");
  applySanHeal(c, 10);
  applyTrust(c, +3);
}

async function eventRestRoomSleepingBags(c) {
  if (!c?.alive) return;
  if (c.loc !== "1f_rest") return;
  if (state.flags.restRoomSafe) return;
  if (!chance(0.16)) return;

  const count = 1 + Math.floor(Math.random() * 4);

  if (count <= 2) {
    logLine(`>> [SYSTEM] 휴식실 침낭은 ${count}개다`, "system");
    return;
  }

  logLine(`>> [SYSTEM] 휴식실 침낭은 ${count}개다`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `어떻게 하시겠습니까?`,
    options: [
      { label: "나간다", value: "leave" },
      { label: "관리자에게 보고", value: "report" },
      { label: "그냥 잔다", value: "sleep" },
    ],
  });

    if (ans === "leave") {
      const from = c.loc;
      c.loc = "1f_grass";
      await onEnterRoom(c,from,"1f_grass");
      logLine(`>> [SYSTEM] ${c.name} 이동: ${roomLabel("1f_grass")}`, "event");
      applySanLoss(c, 10);
      return;
  }

  if (ans === "report") {
    logLine(`${c.name}: "[ADMIN] 휴식실 침낭이 이상합니다."`, "system");
    await logGlitchLine("[ADMIN] ", `확인하겠습니다.`, "system", 0.28);
    state.flags.restRoomSafe = true;
    applyTrust(c, +4);
    applySanHeal(c, 6);
    return;
  }

  await logGlitchLine(">>", `${c.name}은(는) 침낭 속 '무언가'와 눈이 마주쳤다.`, "warning", 0.70);

  const part = pickExistingPart(c, ["leftAnkle","rightAnkle","leftWrist","rightWrist","ribs","teeth"]);
  if (part) {
    await removeBodyPart(c, part, { hpDmg: 26, sanAmt: 18, reason: "뜯김" });
  } else {
    c.alive = false; c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 침낭 속으로 사라졌다. (실종)`, "warning");
  }
}
async function eventNurseOn3FMed(c) {
  if (!c?.alive) return;
  if (c.loc !== "3f_med") return;
  if (!chance(0.18)) return;

  logLine(`>> [SYSTEM] 보건실에 '간호사'로 보이는 여성이 있다.`, "warning");

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `그녀에게 어떻게 말하겠습니까?`,
    options: [
      { label: "치료를 부탁한다", value: "heal" },
      { label: "절단을 부탁한다", value: "cut" },
      { label: "아무 말도 하지 않는다", value: "silent" },
    ],
  });

  if (ans === "silent") {
    await logGlitchLine("간호사: ", `오늘은 달콤한 디저트구나?`, "warning", 0.85);
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 인식되는 순간 사라졌다. (실종)`, "warning");
    return;
  }

  if (ans === "heal") {
    await logGlitchLine("간호사: ", `치료? 좋아. 대신...`, "warning", 0.65);
    const part = pickExistingPart(c, ["tongue","leftEye","rightEye","ribs","teeth","leftfinger", "rightfinger"]);
    if (part) await removeBodyPart(c, part, { hpDmg: 18, sanAmt: 14, reason: "채취" });
   
    c.hp = clamp(c.hp + 8, 0, 100);
    applySanHeal(c, 4);
    applyTrust(c, -6);
    logLine(`>> [SYSTEM] '치료'는 끝났다. 하지만 뭔가 사라졌다.`, "warning");
    return;
  }

  await logGlitchLine("간호사: ", `착한 아이네.`, "event", 0.40);
  const healHp = 14 + Math.floor(Math.random() * 12);
  const healSan = 12 + Math.floor(Math.random() * 10);
  c.hp = clamp(c.hp + healHp, 0, 100);
  applySanHeal(c, healSan);
  applyTrust(c, +5);
  logLine(`>> [SYSTEM] ${c.name} 회복 (HP +${healHp}, SAN +${healSan})`, "event");
}

async function eventSuddenAnxiety(c) {
  if (!c?.alive) return;
  if (!chance(0.10)) return;

  logLine(`>> [SYSTEM] ${c.name}의 가슴이 미친 듯이 뛰기 시작한다.`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `대처 방식을 선택하십시오.`,
    options: [
      { label: "귀를 막고 눈을 감는다", value: "cover" },
      { label: "주변 사람에게 알린다", value: "tell" },
    ],
  });

  if (ans === "cover") {
    await logGlitchLine(">>", `소리가 멀어진다.`, "system", 0.25);
    applySanLoss(c, 8);
    return;
  }

  await logGlitchLine(">>", `발언 감지.`, "warning", 0.60);
  applySanLoss(c, 28);
  applyTrust(c, -12);

  if (chance(0.55)) {
    const part = pickExistingPart(c, ["leftAnkle","rightAnkle","leftWrist","rightWrist","ribs"]);
    if (part) await removeBodyPart(c, part, { hpDmg: 18, sanAmt: 14, reason: "소멸" });
  }
}

async function eventNausea(c) {
  if (!c?.alive) return;
  if (!chance(0.09)) return;

  logLine(`>> [SYSTEM] ${c.name}은(는) 갑작스런 멀미를 느낀다.`, "warning");

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `어떻게 하시겠습니까?`,
    options: [
      { label: "가장 좋아하는 무언가를 상기한다", value: "recall" },
      { label: "주변인에게 도움을 청한다", value: "help" },
      { label: "간호사에게 간다", value: "nurse" },
    ],
  });

  if (ans === "recall") {
    logLine(`>> [SYSTEM] ${c.name}은(는) 간신히 균형을 되찾았다.`, "system");
    applySanHeal(c, 6);
    return;
  }

  if (ans === "nurse") {
    await logGlitchLine(">>", `축하드립니다. ${c.name}은/는 먹이가 되었습니다.`, "warning", 0.85);
    c.alive = false; c.deathType = "missing";
    return;
  }

  await logGlitchLine(">>", `${c.name}: "${glitchText("도와줘…", 0.85)}"`, "warning", 0.75);
  applySanLoss(c, 34);
  applyTrust(c, -10);
}

async function eventPhoneImpulse(c) {
  if (!c?.alive) return;
  if (!chance(0.08)) return;

  logLine(`>> [SYSTEM] ${c.name}은(는) 핸드폰을 쓰고 싶은 충동에 휩싸인다.`, "warning");

  const canCutHand = !!pickExistingPart(c, ["leftHand","rightHand"]);
  const ans = await askChoice({
    title: "[WARNING]",
    body: `충동을 어떻게 처리하시겠습니까?`,
    options: [
      { label: "손을 절단한다", value: "cut" },
      { label: "참는다", value: "resist" },
      { label: "핸드폰을 만진다", value: "touch" },
    ],
  });

  if (ans === "cut") {
    if (!canCutHand) {
      await logGlitchLine(">>", `이미 손이 없다. 충동만 남는다.`, "warning", 0.55);
      applySanLoss(c, 18);
      return;
    }
    const hand = pickExistingPart(c, ["leftHand","rightHand"]);
    await removeBodyPart(c, hand, { hpDmg: 24, sanAmt: 18, reason: "절단" });
    applyTrust(c, -6);
    return;
  }

  if (ans === "touch") {
    await logGlitchLine(">>", `밝은 빛.`, "warning", 0.90);
    await logGlitchLine(">>", `검은 물체가 ${c.name}을(를) 산산조각냈다.`, "warning", 0.90);
    c.alive = false;
    c.deathType = "missing";
    renderCards(); renderLocationTerminal(); endIfAllDead();
    return;
  }

  await logGlitchLine(">>", `가만히 있어도 충동은 사라지지 않는다.`, "warning", 0.60);
  if (canCutHand && chance(0.65)) {
 
    await logGlitchLine(">>", `손이 움직였다.`, "warning", 0.75);
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 빛에 찢겨 사라졌다. (실종)`, "warning");
    renderCards(); renderLocationTerminal(); endIfAllDead();
  } else {
    applySanLoss(c, 22);
  }
}

function tickAnkleTheft() {
  const alive = aliveChars();
  if (!alive.length) return;
  if (!chance(0.10)) return;

  const c = rand(alive);
  const part = pickExistingPart(c, ["leftAnkle","rightAnkle"]);
  if (!part) return;

  c.body[part] = false;
  applySanLoss(c, 10);
  logLine(`>> [SYSTEM] ${c.name}의 ${BODY_LABEL[part]}이/가 사라졌다`, "warning");

  renderCards();
  renderLocationTerminal();
  endIfAllDead();
}


async function eventCheckLegs(c) {
  if (!c?.alive) return;
  if (!chance(0.12)) return;

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 문득 다리를 확인하고 싶어집니다.\n확인하시겠습니까?`,
    options: [
      { label: "확인한다", value: "check" },
      { label: "무시한다", value: "ignore" },
    ],
  });

  if (ans === "ignore") return;

  const b = c.body ?? (c.body = cloneBody());
  const missing =
    (b.leftAnkle === false ? ["왼쪽 발목"] : [])
    .concat(b.rightAnkle === false ? ["오른쪽 발목"] : []);

  if (!missing.length) {
    logLine(`>> [SYSTEM] 이상 없음. (${c.name})`, "system");
    applySanHeal(c, 2);
    return;
  }

  await logGlitchLine(">>", `${c.name}: "${glitchText("…없어.", 0.55)}"`, "warning", 0.55);
  logLine(`>> [SYSTEM] ${c.name}의 ${missing.join(", ")}이/가 사라져 있습니다.`, "warning");
  c.hp = clamp(c.hp - 12, 0, 100);
  applySanLoss(c, 18);

  if (isImmobile(c)) {
    logLine(`>> [SYSTEM] ${c.name} 이동 불가 상태.`, "warning");
  }
}

async function eventPostMoveUnease(group, target) {
  const aliveGroup = group.filter(x => x?.alive);
  if (!aliveGroup.length) return;

  
  if (!chance(0.35)) return;

  const speaker = rand(aliveGroup);

  
  if (chance(0.6)) {
    logLine(`>> [SYSTEM] 발소리가… 하나 더 들린다.`, "warning");
    applySanLoss(speaker, 12);
    applyTrust(speaker, -3);
    return;
  }


  logLine(`>> [SYSTEM] ${roomLabel(target)}에 도착했는데… 인원이 맞지 않는 기분이 든다.`, "warning");
  const ans = await askChoice({
    title: "[WARNING]",
    body: `누가 없어진 건지 떠올리겠습니까?`,
    options: [
      { label: "떠올리지 않는다", value: "no" },
      { label: "떠올린다", value: "yes" },
    ],
  });

  if (ans === "yes") {
    await logGlitchLine(">>", `그것은 당신의 착각이야. 모든 말을 믿지 마.`, "system", 0.80);
      
    applySanLoss(speaker, 22);
    applyTrust(speaker, -6);
  } else {
    applySanLoss(speaker, 10);
  }
}
async function eventCoLocatedChat() {
  if (!chance(0.35)) return;

  const alive = aliveChars();
  const byRoom = {};
  for (const c of alive) {
    (byRoom[c.loc] ??= []).push(c);
  }

  const rooms = Object.keys(byRoom).filter(k => byRoom[k].length >= 2);
  if (!rooms.length) return;

  const roomKey = rand(rooms);
  const group = shuffle([...byRoom[roomKey]]);
  const a = group[0], b = group[1];
  const [l1, l2] = rand(COLOC_DIALOGUE);
  logLine(l1.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");
  await sleep(120);
  logLine(l2.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");

  applyTrust(a, +1);
  applyTrust(b, +1);
}
function findLeaderAlive() {
  return aliveChars().find(x => x.tagKey === "leader") || null;
}

async function tryLeaderMediation(leader, a, b, severity = "light") {
  if (!leader) return false;
  // 리더가 중재할 확률: 심한 말다툼일수록 더 자주 개입
  const p = (severity === "hard") ? 0.55 : 0.35;
  if (!chance(p)) return false;

  await logGlitchLine(">>", `${leader.name}: "${glitchText("그만. 여기선 싸우면 다 죽어.", 0.18)}"`, "event", 0.18);

  // 중재 효과: 당사자들의 신뢰/산치 약간 회복(또는 손실 감소)
  applyTrust(a, +2);
  applyTrust(b, +2);
  applySanHeal(a, 2);
  applySanHeal(b, 2);
  applyTrust(leader, +1);

  return true;
}

async function eventSocialTalks() {
  if (!chance(0.55)) return;

  const alive = aliveChars();
  if (alive.length < 2) return;

  const pairs = [];
  for (const a of alive) {
    for (const b of alive) {
      if (a.id >= b.id) continue;
      const rk = getDynamicRel(a.id, b.id);
      if (isLoverRel(rk) || isFamilyRel(rk)) pairs.push([a, b, rk]);
    }
  }

  if (pairs.length && chance(0.48)) {
    const [a, b, rk] = rand(pairs);

    if (isLoverRel(rk)) {
      const [l1, l2] = rand(SOCIAL_EVENTS.loverComfort);
      logLine(l1.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");
      await sleep(120);
      logLine(l2.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");

      applySanHeal(a, 6);
      applySanHeal(b, 6);
      applyTrust(a, +2);
      applyTrust(b, +2);
      return;
    }

    if (isFamilyRel(rk)) {
      const [l1, l2] = rand(SOCIAL_EVENTS.familyComfort);
      logLine(l1.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");
      await sleep(120);
      logLine(l2.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");

      applySanHeal(a, 5);
      applySanHeal(b, 5);
      applyTrust(a, +1);
      applyTrust(b, +1);
      return;
    }
  }

  const a = rand(alive);
  const b = rand(alive.filter(x => x.id !== a.id));

  const hard = chance(0.35); 
  const pack = hard ? SOCIAL_EVENTS.hardArgue : SOCIAL_EVENTS.lightArgue;
  const [l1, l2] = rand(pack);

  logLine(l1.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");
  await sleep(120);

  const leader = findLeaderAlive();
  const mediated = await tryLeaderMediation(leader, a, b, hard ? "hard" : "light");

  if (!mediated) {
    logLine(l2.replaceAll("{a}", a.name).replaceAll("{b}", b.name), "event");

    const trustLoss = hard ? (8 + Math.floor(Math.random() * 6)) : (3 + Math.floor(Math.random() * 4));
    applyTrust(a, -trustLoss);
    applyTrust(b, -trustLoss);
    applySanLoss(a, hard ? 10 : 4);
    applySanLoss(b, hard ? 10 : 4);
  }
}


async function eventClassChalk(c) {
  if (!c?.alive) return;
  if (c.loc !== "1f_class") return;
  if (!chance(0.18)) return;

  logLine(`>> [SYSTEM] 칠판에 낙서가… 있다.`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `${c.name}는 그것을 지우겠습니까?`,
    options: [
      { label: "지우지 않고 나간다", value: "leave" },
      { label: "지운다", value: "erase" },
    ],
  });

  if (ans === "erase") {
  logLine(`>> [SYSTEM] ${c.name}의 손끝에서 분필가루가 흘러 내립니다`, "warning");
  c.alive = false;
  c.deathType = "missing";
  logLine(`>> [SYSTEM] 그자리에 있던 ${c.name}의 모습은 보이지 않고, 흰 가루만이 남아있었습니다 (실종)`, "warning");

  renderCards();
  renderLocationTerminal();
  endIfAllDead();
  return;
}
 else {
    applySanLoss(c, 8);
    
    applyTrust(c, +2);
  }
}

async function eventFakeCaretakerOn2F(c) {
  if (!c?.alive) return;
  if (c.loc !== "2f_living") return;
  if (!chance(0.22)) return;

  logLine(`>> [SYSTEM] 2층에 '관리인'이 있다.`, "warning");

  const ans = await askChoice({
    title: "[WARNING]",
    body: `${c.name}은/는 어떻게 하시겠습니까?`,
    options: [
      { label: "1층 잔디밭으로 돌아간다", value: "run" },
      { label: "말을 건다", value: "look" },
    ],
  });

  if (ans === "look") {
    applySanLoss(c, 26);
    applyTrust(c, -8);
    logLine(`>> [SYSTEM] …그것은 ${c.name}을/를 인식했다.`, "warning");
    c.alive = false;
    c.deathType = "missing";
    await logLine(`>> [SYSTEM] ${c.name}는 아무말도, 아무런 표현도 불가했다. 더는 아무말도 들리지 않는다.`, "warning");
    return;
  }

  const from = c.loc;
  c.loc = "1f_grass";
  await onEnterRoom(c, from, "1f_grass");

  logLine(`>> [SYSTEM] ${c.name} 이동: ${roomLabel("1f_grass")}`, "event");
  applySanLoss(c, 10);
}
async function eventDontSayDream(c) {
  if (!c?.alive) return { killed:false };
  if (!chance(0.12)) return { killed:false };

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 문득 이곳이 꿈처럼 느껴집니다.\n이곳이 꿈이라고 주장하시겠습니까?`,
    options: [
      { label: "말하지 않는다", value: "no" },
      { label: "말한다", value: "yes" },
    ],
  });

  if (ans === "yes") {
    logLine(`>> [SYSTEM] 발언 감지.`, "warning");
    c.alive = false;
    c.deathType = "missing"; 
    logLine(`>> [SYSTEM] ${c.name}은(는) 말이 끝나기도 전에 신호가 끊겼습니다. (실종)`, "warning");

    renderCards();
    renderLocationTerminal();
    endIfAllDead();

    return { killed:true }; 
  }

  applySanLoss(c, 6);
  return { killed:false };
}

async function eventPlayroomGirl(c) {
  if (!c?.alive) return;
  if (c.loc !== "3f_play") return;
  if (!chance(0.16)) return;

  logLine(`>> [SYSTEM] 놀이방에 꼬마 여자아이가 돌아다닌다.`, "warning");

  const ans = await askChoice({
    title: "[CHOICE]",
    body: `그녀는 당신을 바라보고 있습니다.`,
    options: [
      { label: "모른 척한다", value: "ignore" },
      { label: "맞춰준다", value: "please" },
    ],
  });

  if (ans === "ignore") {
    await logGlitchLine("??? : ", `재미없고, 시시해`, "system", 0.30);
    applySanLoss(c, 12);
    applyTrust(c, -3);
    return;
  }

  await logGlitchLine("??? : ", `고마워, 근데 그거 알아? 너는 나를 볼 수 없어.`, "system", 0.30);
      
  logLine(`>> [SYSTEM] 그녀가 웃는다. 너무… 기쁘게.`, "event");
  aliveChars().forEach(x => applyTrust(x, +6));
  applySanLoss(c, 8); 
}


async function randomPhenomenonEvent() {
  const alive = aliveChars();
  if (!alive.length) return;

  if (!chance(0.05)) return;

  const c = rand(alive);
  const lines = [
    `>> [SYSTEM] 복도 끝에 검은 형체가… 있었다.`,
    `>> [SYSTEM] 창문 너머로 흰 형체가 스치듯 지나갔다.`,
    `>> [SYSTEM] 누군가의 발소리… 그런데 인원은 늘 그대로다.`,
    `>> [SYSTEM] 벽에서 '긁는 소리'가 난다. 멈추지 않는다.`,
  ];

  logLine(rand(lines), "warning");
  applySanLoss(c, 8);
  applyTrust(c, -2);

  
  await logGlitchLine(">>", "신호 간섭 감지…", "warning", 0.22);
}

async function runOneChoiceEvent(c) {

  const r = await eventDontSayDream(c);
  if (r?.killed) return;
  const commonEvents = [choiceMoveGroup, choiceOutside];
  if (chance(0.15)) commonEvents.push(choiceSleep); 

  let pool = [...commonEvents];
  
  if (c.loc === "3f_admin") pool.push(choiceKnock);
  if (c.loc === "3f_play") pool.push(choicePlayroom);
  if (c.loc === "4f_roof") pool.push(choiceRoofPlant);
  
  const eventFn = rand(pool);
  await eventFn(c);
}

async function choiceOutside(c) {
  if (isImmobile(c)) {
  await logGlitchLine("", `${c.name}는, ${glitchText("나가고 싶은 충동을 느꼈지만, 그럴 수 없었습니다.",0.35)}`, "system", 0.35);
  applySanLoss(c, 8);
  return;
}
  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 밖으로 나가고 싶다는 충동을 느낍니다.`,
    options: [
      { label: "나가기", value: "go" },
      { label: "머물기", value: "stay" },
    ],
  });

  if (ans === "stay") {
    logLine(`${c.name}: …여긴 안 나가.`, "system");
    applySanHeal(c, 2);
    return;
  }

  logLine(`>> [SYSTEM] ${c.name}이(가) 외부로 향합니다.`, "warning");

  if (state.raining) {
    logLine(`>> [SYSTEM] ${c.name}은(는) 더는 이곳에 돌아오지 못했습니다`, "warning");
    c.alive = false;
    c.deathType = "missing";
    return;
  }

  const back = chance(0.35 + (c.luckScore / 100) * 0.15);
  if (!back) {
    logLine(`>> [SYSTEM] ${c.name}은(는) 검은 형체를 본 뒤 사라졌습니다.`, "warning");
    c.alive = false;
    c.deathType = "missing";
    return;
  }
  c.outsideSurvivor = true;
  await logGlitchLine(" ", `${c.name}: "…검은 물체를 봤어.`, "system", 0.30);
  applySanLoss(c, 25);
  applyTrust(c, -8);
  c.afterOutsideDays = 3;
}

async function choiceSleep(c) {
  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 극심하게 몰려오는 피로로 인해, 잠을 청하고 싶어합니다.`,
    options: [
      { label: "관리자에게 미리 언질한다", value: "tell" },
      { label: "그저 잠을 청한다", value: "steal" },
      { label: "버틴다", value: "nosleep" },
    ],
  });

  if (ans === "nosleep") {
    logLine(`${c.name}: "…난 안 잘래."`, "system");
    return;
  }

  if (ans === "tell") {
    logLine(`${c.name}: "[ADMIN] …저 잠 좀 자겠습니다."`, "system");
    applySanHeal(c, 14);
    logLine(`>> [SYSTEM] ${c.name}의 정신력이 회복되었습니다. (SAN +14)`, "event");
    return;
  }

  logLine(`${c.name}: (말 없이 잠에 든다)`, "warning");
  applySanHeal(c, 10);
  applyTrust(c, -6);
  applySanLoss(c, 60);
  logLine(`>> [SYSTEM] 안타깝습니다. (TRUST -6, SAN -60)`, "warning");
   if (c.san <= 0) {
      c.san = 0;
      c.alive = false;
      c.deathType = "missing";
      logLine(`>> [SYSTEM] ${c.name}은(는) 더 버티지 못하고 밖으로 걸어 나갔습니다. (실종)`, "warning");
    }
}


async function choiceMoveGroup() {
  const alive = aliveChars();
  if (!alive.length) return;

  const moveTargets = [
    "1f_class","1f_rest","1f_grass",
    "2f_living",
    "3f_play","3f_admin","3f_med",
    "4f_roof",
  ];

  const k = Math.min(alive.length, 1 + Math.floor(Math.random() * 3));
  const group = shuffle([...alive]).slice(0, k);
  const movable = group.filter(x => !isImmobile(x));
  const stuck = group.filter(x => isImmobile(x));

  if (!movable.length) {
    stuck.forEach(s => logLine(`${s.name}: "미안, 가고 싶어도 움직이질 않네."`, "warning"));
    return;
  }

  const currentAny = movable[0].loc;
  const targets = moveTargets.filter(x => x !== currentAny);
  const target = rand(targets);

  const names = movable.map(c => c.name).join(", ");

  const ans = await askChoice({
    title: "[CHOICE]",
    body:
      `이동 요청이 감지되었습니다.\n` +
      `- 대상: ${names}\n` +
      `- 목적지: ${roomLabel(target)}\n\n` +
      `허용합니까?`,
    options: [
      { label: "허용", value: "go" },
      { label: "거부", value: "stay" },
    ],
  });

  if (ans === "stay") {
    logLine(`>> [SYSTEM] 이동이 거부되었습니다.`, "system");
    movable.forEach(c => applyTrust(c, -1));
    return;
  }


   for (const p of movable) {
    const from = p.loc;
    p.loc = target;
    await onEnterRoom(p, from, target);
    if (!p.alive) break;
  }
  logLine(`>> [SYSTEM] ${names} 이동: ${roomLabel(target)}`, "event");
  await sleep(250);
  await eventPostMoveUnease(movable, target);


  if (movable.length === 1 && target !== "1f_class" && target !=="1f_rest" && target !=="1f_grass") {
    const solo = movable[0];
    solo.alive = false;
    solo.deathType = "missing";
    logLine(`>> [SYSTEM] ${solo.name}은(는)\n이동하던 중 신호가 끊겼습니다. (실종)`, "warning");
  } else {
 
    logLine(`>> [SYSTEM] 해당 장소에 도착했습니다.`, "system");

 
    movable.forEach(c => applyTrust(c, +1));
  }

  renderCards();
  renderLocationTerminal();
  vanishSoloUpstairs();
  renderCards();
  renderLocationTerminal();
  
}

function vanishSoloUpstairs() {
  
  const non1FRooms = ROOMS.filter(r => (r.floor === "2F" || r.floor === "3F") && r.key !== "outside").map(r => r.key);

  for (const roomKey of non1FRooms) {
    const here = aliveChars().filter(c => c.loc === roomKey);
    if (here.length === 1) {
      const solo = here[0];
      solo.alive = false;
      solo.deathType = "missing";
      logLine(`>> [SYSTEM] ${solo.name}은(는) ${roomLabel(roomKey)}에 혼자 남겨진 순간, 신호가 끊겼습니다. (실종)`, "warning");
    }
  }
}



async function choiceKnock(c) {
  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 관리자 방 앞에 섰습니다.\n몇 번 노크합니까?`,
    options: [
      { label: "0번", value: 0 },
      { label: "1번", value: 1 },
      { label: "2번", value: 2 },
      { label: "3번", value: 3 },
      { label: "4번", value: 4 },
      { label: "가지 않는다", value: "leave" },
    ],
  });

  if (ans === "leave") {
    logLine(`${c.name}: "아니야, 돌아갈래"`, "system");
    return;
  }

  if (ans === 3) {
    logLine(`[ADMIN] "…들어오세요."`, "system");
    const good = chance(0.55 + (c.luckScore / 100) * 0.2);

    if (good) {
      const healHp = 12 + Math.floor(Math.random() * 10);
      const healSan = 10 + Math.floor(Math.random() * 8);
      c.hp = clamp(c.hp + healHp, 0, 100);
      applySanHeal(c, healSan);
      logLine(`>> [SYSTEM] ${c.name} 상태 회복. (HP +${healHp}, SAN +${healSan})`, "event");
    } else {
      logLine(`[ADMIN] "오늘은 운이 좋지 않으십니다."`, "warning");
      const dmg = 20;
      c.hp = clamp(c.hp - dmg, 0, 100);
      applySanLoss(c, 10);
      const parts = ["손가락", "손목", "귀", "어금니", "눈꺼풀", "발뒤꿈치", "혀끝", "갈비뼈 한 조각"];
      const part = rand(parts);
      await logGlitchLine(">>", `${c.name}의 ${part}이/가 소멸되었습니다`, "warning", 0.10);
      logLine(`>> [SYSTEM] (HP -${dmg})`, "warning");

      if (c.san <= 0) {
        c.alive = false;
        c.deathType = "missing";
        logLine(`>> [SYSTEM] ${c.name}은(는) 버티지 못하고 밖으로 뛰쳐 나갔습니다. (실종)`, "warning");
        renderCards(); renderLocationTerminal(); endIfAllDead();
      }
      else if (c.hp <= 0) {
        c.alive = false;
        c.deathType = "missing";
        logLine(`>> [SYSTEM] ${c.name}은(는) 더이상 움직일 수 있는 상태가 아닙니다. (사망)`, "warning");
        renderCards(); renderLocationTerminal(); endIfAllDead();
      }
    }
    return;
  }

  if (ans === 1) {
    logLine(`>> [SYSTEM] 문 너머에서 '무언가'가 닿았다.`, "warning");
    logLine(`[ADMIN] "앞으론 예의를 갖추시길 바랍니다."`, "warning");
    await removeRandomBodyPart(c, { hpDmg: 20, sanAmt: 10, reason: "절단" });
    return;
  }

  if (ans === 0 || ans === 2 || ans === 4) {
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 방에 들어간 이후, 더는 모습을 볼 수 없었습니다. (실종)`, "warning");
    renderCards();
    renderLocationTerminal();
    endIfAllDead();
    return;
  }
}


async function choicePlayroom(c) {
  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 3층 놀이방에서 아이의 웃음소리를 들었습니다.\n반응합니까?`,
    options: [
      { label: "무시한다", value: "ignore" },
      { label: "반응한다", value: "react" },
    ],
  });

  if (ans === "ignore") {
    logLine(`${c.name}: (아무 일도 없던 척한다)`, "system");
    return;
  }

  logLine(`${c.name}: "누구야?"`, "warning");
  const dmg = 8 + Math.floor(Math.random() * 20);
  await logGlitchLine(">>", `??? : 있지, 나랑 놀지 않을래? 나랑 숨바꼭질도 하고 춤도 추고 하루종일 놀자!`, "warning", 0.70);
  c.hp = clamp(c.hp - dmg, 0, 100);
  applySanLoss(c, 8);
  logLine(`>> [SYSTEM] ${c.name}의 체력이 소모되었습니다. (HP -${dmg})`, "warning");

  if (c.hp <= 0) {
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 아이의 소중한 장난감이 되었습니다.`, "warning");
  }
}

async function choiceRoofPlant(c) {
  const ans = await askChoice({
    title: "[CHOICE]",
    body: `${c.name}은(는) 옥상에 있는 식물에 손을 뻗으려 합니다.\n말립니까?`,
    options: [
      { label: "말린다", value: "stop" },
      { label: "만지게 둔다", value: "touch" },
    ],
  });

  if (ans === "stop") {
    logLine(`${c.name}: "…안 만져."`, "system");
    applyTrust(c, +1);
    return;
  }

  logLine(`>> [SYSTEM] ${c.name}이(가) 식물에 닿았습니다.`, "warning");

  if (chance(0.95)) {
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}은(는) 식물 아래로 끌려가 사라졌습니다. (실종)`, "warning");
    return;
  }

  const dmg = 18 + Math.floor(Math.random() * 15);
  c.hp = clamp(c.hp - dmg, 0, 100);
  applySanLoss(c, 12);
  logLine(`>> [SYSTEM] ${c.name} 부상. (HP -${dmg})`, "warning");

  if (c.hp <= 0) {
    c.alive = false;
    c.deathType = "missing";
    logLine(`>> [SYSTEM] ${c.name}의 모습은 더이상 볼 수 없었습니다.`, "warning");
  }
}

async function runDailyChoices() {
  const alive = aliveChars();
  if (!alive.length) return;
  await randomPhenomenonEvent();

  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const live = aliveChars();
    if (!live.length) return;

    const c = rand(live);
    await runOneChoiceEvent(c);

    renderCards();
    renderLocationTerminal();

    if (endIfAllDead()) return;
  }
}

/* -------------------------------
  18) SUNDAY FLOW & EXECUTION (FIXED)
--------------------------------*/
async function nextDay() {
  if (!state.started) return;

  const btn = $("#btn-next-day");
  if (btn) btn.disabled = true;

  try {
    state.dayIndex++;

    if (state.dayIndex >= state.totalWeeks * 7) {
      endSimulation();
      return;
    }

    renderDayHeader();

    if (isSunday()) {
      await runSundayMeeting();
      return; 
    }
 
    rollWeatherForToday(false);

    tickAfterOutside();
    tickSanityStages();
    checkSoloRule();
    await eventRumor();
    await tickBreakups();
    await tickViolenceBySan();



    await runDailyChoices();
    await eventCoLocatedChat();
    await eventSocialTalks();

    renderCards();
    renderLocationTerminal();

    if (endIfAllDead()) return;

  } catch (err) {
    console.error(err);
    logLine(">> [SYSTEM ERROR] 진행 중 오류 발생", "warning");
  } 
  
  finally {
    if (!isSunday() && btn) btn.disabled = false;
  }
}


async function runSundayMeeting() {
  logLine(`=== SUNDAY NIGHT ===`, "warning");
  await sleep(250);

  const alive = aliveChars();
  if (!alive.length) return;

  const cand = [...alive].sort((a, b) => a.trust - b.trust).slice(0, Math.min(3, alive.length));
  state.executionCandidates = cand.map(x => x.id);
  const candNames = cand.map(x => x.name);

  const talkers = shuffle([...alive]).slice(0, Math.min(alive.length, 8));
  for (const speaker of talkers) {
    let pool = [...cand]; 
    if (speaker.outsideSurvivor && chance(0.35)) {
     await logGlitchLine(">>", `${speaker.name}: "${glitchText("그래, 사실 우리를 이곳은 저들은 천국이고 존중 위해 우리는 그저. 존재해", 0.75)}"`, "warning", 0.35);
    }   

    if (speaker.tagKey !== "leader") {
      const partnerIds = new Set(getPartnersOf(speaker));
      pool = pool.filter(x => x.id !== speaker.id && !partnerIds.has(x.id));
    }
    if (!pool.length) pool = [...cand]; 

    const pickName = rand(pool).name;
    const susName = rand(pool).name;


    const lines = (SUNDAY_DIALOGUE[speaker.tagKey] || SUNDAY_DIALOGUE_DEFAULT);
    const tpl = rand(lines);

    const line = tpl
      .replaceAll("{me}", speaker.name)
      .replaceAll("{pick}", pickName)
      .replaceAll("{sus}", susName)
      .replaceAll("{cand0}", candNames[0] ?? pickName)
      .replaceAll("{cand1}", candNames[1] ?? pickName)
      .replaceAll("{cand2}", candNames[2] ?? pickName);

    logLine(line, "event");
    await sleep(140);
  }

  logLine(`>> [SYSTEM] 후보: ${candNames.join(", ")}`, "warning");
  await sleep(500);


  showConsoleActionButton(">> 처형 집행장으로 이동", () => {
    prepareExecutionScreen();
  });
}

function prepareExecutionScreen() {
  showScreen("#screen-execution");

  const wrap = document.querySelector("#screen-execution .exec-content");
  if (!wrap) return;

  const ids = state.executionCandidates ?? [];
  const cand = ids.map(id => state.chars.find(c => c.id === id)).filter(Boolean);
  
  const soft = (state.initialCount ?? aliveChars().length) <= 5; 


  wrap.innerHTML = `
    <h1 class="blood-title">JUDGMENT DAY</h1>
    <p>세 명의 이름이 거론되었습니다. 누구를 제거하시겠습니까?</p>
    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin:18px 0;">
      ${cand.map(c => `<button class="btn-primary exec-pick" data-id="${c.id}">${esc(c.name)}</button>`).join("")}
      <button class="btn-primary exec-pick" data-id="random">RANDOM</button>
    </div>
    <div class="target-display"><span class="target-name">...</span></div>
    <p>
      ${soft
        ? `지배인님께서 마침 배부르신 상태라, 신체 일부만 소멸될 것이니 너무 걱정하지 않으셔도 됩니다.`
        : `세 명의 이름이 거론되었습니다. 누구를 선택하시겠습니까?`}
    </p>

  `;

  wrap.querySelectorAll(".exec-pick").forEach(btn => {
    btn.addEventListener("click", async () => {
      let id = btn.dataset.id;
      if (id === "random") id = cand[Math.floor(Math.random() * cand.length)]?.id;
      if (!id) return;
      await doExecution(id);
    });
  });
}

function pickLastWords(c) {
  const arr = LAST_WORDS[c.tagKey] || ["…"];
  return `${c.name}: "${rand(arr)}"`;
}

function getSacrificeCandidatesFor(target) {
  const alive = aliveChars().filter(x => x.id !== target.id);

  const leaders = alive.filter(x => x.tagKey === "leader");

  const bonded = alive.filter(x => {
    const rk = getDynamicRel(x.id, target.id);
    return (rk === "lover" || rk === "couple" || rk === "family");
  });

  return { leaders, bonded };
}
async function maybeSwapExecutionTarget(target) {
  const { leaders, bonded } = getSacrificeCandidatesFor(target);

  const pBonded = 0.22; 
  const pLeader  = 0.12;

  if (bonded.length && chance(pBonded)) {
    const sub = rand(bonded);
    logLine(`${sub.name}이(가) 앞으로 걸어 나옵니다.`, "system");
    await logGlitchLine(">>", `${sub.name}: "${glitchText("넌 꼭 끝까지 남아야 한다? 알겠지?", 0.22)}"`, "warning", 0.22);
    logLine(`>> [SYSTEM] 대상이 변경되었습니다: ${target.name} → ${sub.name}`, "warning");
    return sub;
  }
  if (leaders.length && chance(pLeader)) {
    const sub = rand(leaders);
    await logLine(`${sub.name} : 잠깐만.`, "warning");
    await logGlitchLine(">>", `${sub.name}: "${glitchText("많이 무섭지? 걱정 마. 리더는 이러라고 있는 거야.", 0.18)}"`, "event", 0.18);
    logLine(`>> [SYSTEM] 대상이 변경되었습니다: ${target.name} → ${sub.name}`, "warning");
    return sub;
  }

  return target;
}


async function doExecution(id) {
  let target = state.chars.find(c => c.id === id);
  if (!target || !target.alive) return;

  target = await maybeSwapExecutionTarget(target);

  const nameEl = document.querySelector("#screen-execution .target-name");
  if (nameEl) nameEl.textContent = target.name;

  const soft = (state.initialCount ?? aliveChars().length) <= 5;

  logLine(`>> [SYSTEM] 처형(또는 소멸) 집행 직전…`, "warning");
  await sleep(250);

  if (soft) {
    logLine(`[ADMIN] "걱정하지 마십시오, 당신의 신체 일부만 소멸됩니다."`, "warning");
    await removeRandomBodyPart(target, { hpDmg: 20, sanAmt: 10, reason: "절단" });
 
  } else {
    logLine(pickLastWords(target), "event");
    await sleep(1000);

    target.alive = false;
    target.deathType = "execution";
    logLine(`>> [SYSTEM] ${target.name}의 모습은 더이상 볼 수 없었습니다.`, "warning");
  }
  state.dayIndex++;

  if (state.dayIndex >= state.totalWeeks * 7) {
    const alive = aliveChars();
    showEnding(alive.length > 0);
    return;
  }

  showScreen("#screen-game");

  const btn = $("#btn-next-day");
  if (btn) btn.disabled = false;

  renderDayHeader();
  rollWeatherForToday(false);

  tickAfterOutside();
  tickSanityStages();
  checkSoloRule();

  renderCards();
  renderLocationTerminal();

  endIfAllDead();
}

/* -------------------------------
  19) ENDING & INIT
--------------------------------*/
function endIfAllDead() {
  const alive = aliveChars();
  if (alive.length > 0) return false;
  showEnding(false);
  return true;
}

function endSimulation() {
  const alive = aliveChars();
  const success = alive.length > 0;
  showEnding(success);
}

function showEnding(success) {
  showScreen("#screen-ending");

  const box = $("#screen-ending .ending-box");
  if (!box) return;

  if (success) {
    const survivors = aliveChars(); 
    const listHtml = survivors.length
      ? `<ul class="survivor-list">
          ${survivors.map(c => `
            <li>
              <b>${esc(c.name)}</b>
              <span class="meta">(${esc(TAG_LABEL[c.tagKey] || c.tagKey)} / TRUST ${c.trust >= 0 ? "+"+c.trust : c.trust} / SAN ${c.san})</span>
            </li>
          `).join("")}
        </ul>`
      : `<p class="muted">생존자가 더이상 확인되지 않습니다.</p>`;

    box.innerHTML = `
      <h1>ESCAPE SUCCESS</h1>
      <p>눈을 떠보니, 무사히 원래 집으로 돌아왔다.</p>

      <div class="survivor-box">
        <h3>탈출 성공 명단</h3>
        ${listHtml}
      </div>

      <button class="btn-restart btn-primary">재시작</button>
    `;
  } else {
    box.innerHTML = `
      <h1>BAD ENDING</h1>
      <p>세상밖에 다시 도달한 자는 없었다. 마치 현실같고 꿈같던 것. 무엇의 경계였까.</p>
      <button class="btn-restart btn-primary">재시작</button>
    `;
  }


  $("#screen-ending .btn-restart")?.addEventListener("click", restartAll);
}

function restartAll() {
  state.draftChars = [];
  state.relations = {};
  state.chars = [];
  state.dayIndex = 0;
  state.totalWeeks = 4;
  state.raining = false;
  state.executionCandidates = [];
  state.started = false;

  resetConsole();
  renderDraftList();
  buildTagButtons();

  showScreen("#screen-intro");
}

function setupIntro() {
  $("#btn-start")?.addEventListener("click", () => {
    showScreen("#screen-creation");
  });
}

function setupGameButtons() {
  $("#btn-next-day")?.addEventListener("click", async () => {
    const gameActive = $("#screen-game")?.classList.contains("active");
    if (!gameActive) return;
    await nextDay();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupIntro();
  setupCreationUI();
  setupGameButtons();
  showScreen("#screen-intro");

});



