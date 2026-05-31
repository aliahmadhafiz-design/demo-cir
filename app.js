let mapData = [];
let criteriaData = {};
let qaidaCriteria = [];
let qaidaLessonOrder = [];
let qaidaLessonStructure = {};
let currentBulkData = [];
const surahNames = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملک",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قریش",
  "الماعون",
  "الکوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

// Load Data once
async function loadData() {
  try {
    const [mapRes, paraRes, qaidaRes] = await Promise.all([
      fetch("academy_map.json").then((r) => r.json()),
      fetch("para.json").then((r) => r.json()),
      fetch("qaida.json").then((r) => r.json()),
    ]);
    mapData = mapRes;
    criteriaData = paraRes;
    qaidaCriteria = qaidaRes;
    qaidaLessonOrder = qaidaCriteria.map((item) => item.lesson);
    qaidaCriteria.forEach((item) => {
      qaidaLessonStructure[item.lesson] = Math.round(
        parseFloat(item["mumtaz-lines"]) * parseFloat(item["mumtaz-days"]),
      );
    });

    // Initialize the default view
    switchView("home");
  } catch (err) {
    console.error("Error loading data:", err);
    alert(
      "ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا ہے۔ براہ کرم چیک کریں کہ JSON فائلیں موجود ہیں۔",
    );
  }
}

// Router Logic
function switchView(view) {
  const homeView = document.getElementById("home-view");
  const bulkView = document.getElementById("bulk-view");
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("onclick").includes(view)) {
      link.classList.add("active");
    }
  });

  if (view === "home") {
    homeView.classList.remove("hidden");
    bulkView.classList.add("hidden");
    initIndividualEvaluation();
  } else {
    homeView.classList.add("hidden");
    bulkView.classList.remove("hidden");
  }
}

// --- Individual Evaluation Logic (Preserved) ---

function calcMonthlyAttendance() {
  const w = document.getElementById("monthlyWorkingDays").value || 0;
  const a = document.getElementById("monthlyAbsents").value || 0;
  const p = w - a;
  document.getElementById("monthlyPresentDays").innerText = p > 0 ? p : 0;
}

function initIndividualEvaluation() {
  initNazrahHifzControls();
  initQaidaControls();
  onCourseTypeChange();
}

function initNazrahHifzControls() {
  const ss = document.getElementById("startSurah");
  const es = document.getElementById("endSurah");
  if (!ss || !es || ss.options.length > 0) return; // Prevent double init

  const uniqueS = [
    ...new Set(mapData.map((d) => parseInt(d.verse_key.split(":")[0]))),
  ];
  uniqueS.forEach((n) => {
    const o = new Option(`${n}. ${surahNames[n - 1]}`, n);
    ss.add(o.cloneNode(true));
    es.add(o.cloneNode(true));
  });
  ss.onchange = () => loadAyahs("start");
  es.onchange = () => loadAyahs("end");
  loadAyahs("start");
  loadAyahs("end");
}

function initQaidaControls() {
  const sl = document.getElementById("startLesson");
  const el = document.getElementById("endLesson");
  if (!sl || !el || sl.options.length > 0) return;

  qaidaLessonOrder.forEach((lesson) => {
    const label =
      lesson === "Exercise" ? "Exercise (مشق)" : `سبق نمبر ${lesson}`;
    sl.add(new Option(label, lesson));
    el.add(new Option(label, lesson));
  });

  sl.onchange = () => updateQaidaLineOptions("start");
  el.onchange = () => updateQaidaLineOptions("end");
  updateQaidaLineOptions("start");
  updateQaidaLineOptions("end");
}

function updateQaidaLineOptions(type) {
  const lesson = document.getElementById(`${type}Lesson`).value;
  const sel = document.getElementById(`${type}Line`);
  if (!sel || !lesson) return;
  const totalLines = qaidaLessonStructure[lesson] || 0;
  sel.innerHTML = "";
  for (let i = 1; i <= totalLines; i++) {
    sel.add(new Option(`لائن نمبر ${i}`, i));
  }
}

function loadAyahs(t) {
  const s = document.getElementById(`${t}Surah`).value;
  const sel = document.getElementById(`${t}Ayah`);
  if (!sel) return;
  sel.innerHTML = "";
  mapData
    .filter((d) => d.verse_key.startsWith(`${s}:`))
    .forEach((d) => {
      let txt =
        d.type === "name"
          ? "ہیڈر"
          : d.type === "basmala"
            ? "بسم اللہ"
            : `آیت ${d.verse_key.split(":")[1]}`;
      sel.add(new Option(txt, d.index));
    });
}

function findCurrentPara(surah, ayah) {
  const s = parseInt(surah);
  const a = parseInt(ayah);
  for (let p in criteriaData) {
    const lastKey = criteriaData[p].last_verse_key.split(":");
    const lastS = parseInt(lastKey[0]);
    const lastA = parseInt(lastKey[1]);
    if (s < lastS || (s === lastS && a <= lastA)) {
      return p;
    }
  }
  return "30";
}

function generateFullReport() {
  const course = document.getElementById("courseType").value;
  if (course === "qaida") {
    generateQaidaReport();
    return;
  }

  const sIdx = parseInt(document.getElementById("startAyah").value);
  const eIdx = parseInt(document.getElementById("endAyah").value);
  const mPresent = parseInt(
    document.getElementById("monthlyPresentDays").innerText,
  );
  const cDays =
    parseInt(document.getElementById("totalCumulativeDays").value) || 0;

  if (mPresent <= 0) {
    alert("ایام حاضری کم از کم 1 ہونی چاہیے!");
    return;
  }

  const startObj = mapData.find((d) => d.index === sIdx);
  const endObj = mapData.find((d) => d.index === eIdx);

  const [startS, startA] = startObj.verse_key.split(":");
  const [endS, endA] = endObj.verse_key.split(":");

  let mLines = 0;
  if (startObj.verse_key === "114:0" && endObj.verse_key === "78:40") {
    mLines = 336;
  } else {
    const selection = mapData.filter((d) => d.index >= sIdx && d.index <= eIdx);
    let lineMap = {};
    selection.forEach((item) => {
      if (item.sp === item.ep) {
        for (let l = item.sl; l <= item.el; l++)
          lineMap[`${item.sp}-${l}`] = true;
      } else {
        let maxL = item.sp <= 2 ? 8 : 16;
        for (let l = item.sl; l <= maxL; l++) lineMap[`${item.sp}-${l}`] = true;
        for (let l = 1; l <= item.el; l++) lineMap[`${item.ep}-${l}`] = true;
      }
    });
    mLines = Object.keys(lineMap).length;
  }

  const mAvg = (mLines / mPresent).toFixed(1);
  const targetPara = findCurrentPara(endS, endA);
  const mCrit = criteriaData[targetPara][course + "_para_lines"];

  let mStatus = "کمزور",
    mColor = "bg-red-100 text-red-800";
  if (mAvg >= mCrit.mumtaz) {
    mStatus = "ممتاز";
    mColor = "bg-emerald-100 text-emerald-800";
  } else if (mAvg >= mCrit.behter) {
    mStatus = "بہتر";
    mColor = "bg-blue-100 text-blue-800";
  }

  const cCrit = criteriaData[targetPara];
  const behtarMax = cCrit[course + "_total-behtar_days"];
  const mumtazMax = cCrit[course + "_total-mumtaz_days"];

  let cStatus = "کمزور",
    cColor = "bg-red-100 text-red-800";
  if (cDays <= mumtazMax) {
    cStatus = "ممتاز";
    cColor = "bg-emerald-100 text-emerald-800";
  } else if (cDays <= behtarMax) {
    cStatus = "بہتر";
    cColor = "bg-blue-100 text-blue-800";
  }

  document.getElementById("finalReport").classList.remove("hidden");
  document.getElementById("resMLines").innerText = mLines;
  document.getElementById("resMAvg").innerText = mAvg;
  document.getElementById("resMStatus").innerText = mStatus;
  document.getElementById("resMStatusBox").className =
    `text-center p-4 rounded-2xl mt-4 ${mColor}`;

  document.getElementById("resCDays").innerText = cDays;
  document.getElementById("resCReq").innerText = mumtazMax;
  document.getElementById("resCStatus").innerText = cStatus;
  document.getElementById("resCStatusBox").className =
    `text-center p-4 rounded-2xl mt-4 ${cColor}`;

  const name = document.getElementById("studentName").value || "طالب علم";
  document.getElementById("finalNarrative").innerHTML =
    `<b>${name}</b> کی ماہانہ کارکردگی <b>${mStatus}</b> رہی جبکہ مجموعی طور پر کورس کا معیار <b>${cStatus}</b> پایا گیا۔ (پارہ نمبر: ${targetPara})`;

  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function onCourseTypeChange() {
  const course = document.getElementById("courseType").value;
  const nazrahSection = document.getElementById("nazrah-hifz-section");
  const qaidaSection = document.getElementById("qaida-section");
  if (course === "qaida") {
    nazrahSection.classList.add("hidden");
    qaidaSection.classList.remove("hidden");
  } else {
    nazrahSection.classList.remove("hidden");
    qaidaSection.classList.add("hidden");
  }
}

function generateQaidaReport() {
  const sLesson = document.getElementById("startLesson").value;
  const sLine = parseInt(document.getElementById("startLine").value) || 1;
  const eLesson = document.getElementById("endLesson").value;
  const eLine = parseInt(document.getElementById("endLine").value) || 1;
  const mPresent = parseInt(
    document.getElementById("monthlyPresentDays").innerText,
  );
  const cDays =
    parseInt(document.getElementById("totalCumulativeDays").value) || 0;

  if (mPresent <= 0) {
    alert("ایام حاضری کم از کم 1 ہونی چاہیے!");
    return;
  }

  const sIdx = qaidaLessonOrder.indexOf(sLesson);
  const eIdx = qaidaLessonOrder.indexOf(eLesson);
  if (
    sIdx === -1 ||
    eIdx === -1 ||
    sIdx > eIdx ||
    (sIdx === eIdx && sLine > eLine)
  ) {
    alert("انتہائے سبق ابتدائی سبق سے پیچھے نہیں ہونا چاہئے۔");
    return;
  }

  let totalLines = 0;
  if (sLesson === eLesson) {
    totalLines = eLine - sLine + 1;
  } else {
    totalLines += qaidaLessonStructure[sLesson] - sLine + 1;
    for (let i = sIdx + 1; i < eIdx; i++) {
      totalLines += qaidaLessonStructure[qaidaLessonOrder[i]];
    }
    totalLines += eLine;
  }

  const mAvg = (totalLines / mPresent).toFixed(1);
  const endCriteria = qaidaCriteria.find((item) => item.lesson === eLesson);
  if (!endCriteria) {
    alert("قاعدہ کا معیار ڈیٹا دستیاب نہیں ہے۔");
    return;
  }

  const mMumtazTarget = parseFloat(endCriteria["mumtaz-lines"]);
  const mBehterTarget = parseFloat(endCriteria["behter-lines"]);
  let mStatus = "کمزور";
  let mColor = "bg-red-100 text-red-800";
  if (mAvg >= mMumtazTarget) {
    mStatus = "ممتاز";
    mColor = "bg-emerald-100 text-emerald-800";
  } else if (mAvg >= mBehterTarget) {
    mStatus = "بہتر";
    mColor = "bg-blue-100 text-blue-800";
  }

  const cMumtazTarget = parseInt(endCriteria["final-total-mumtaz-days"]);
  const cBehterTarget = parseInt(endCriteria["final-total-behter-days"]);
  let cStatus = "کمزور";
  let cColor = "bg-red-100 text-red-800";
  if (cDays <= cMumtazTarget) {
    cStatus = "ممتاز";
    cColor = "bg-emerald-100 text-emerald-800";
  } else if (cDays <= cBehterTarget) {
    cStatus = "بہتر";
    cColor = "bg-blue-100 text-blue-800";
  }

  document.getElementById("finalReport").classList.remove("hidden");
  document.getElementById("resMLines").innerText = totalLines;
  document.getElementById("resMAvg").innerText = mAvg;
  document.getElementById("resMStatus").innerText = mStatus;
  document.getElementById("resMStatusBox").className =
    `text-center p-4 rounded-2xl mt-4 ${mColor}`;

  document.getElementById("resCDays").innerText = cDays;
  document.getElementById("resCReq").innerText = cMumtazTarget;
  document.getElementById("resCStatus").innerText = cStatus;
  document.getElementById("resCStatusBox").className =
    `text-center p-4 rounded-2xl mt-4 ${cColor}`;

  const name = document.getElementById("studentName").value || "طالب علم";
  const displayLesson =
    eLesson === "Exercise" ? "Exercise (مشق)" : `سبق نمبر ${eLesson}`;
  document.getElementById("finalNarrative").innerHTML =
    `طالب علم <b>${name}</b> کی ماہانہ کارکردگی <b>${mStatus}</b> رہی جبکہ مجموعی معیار <b>${cStatus}</b> پایا گیا۔ (اب تک: ${displayLesson})`;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// --- Bulk Evaluation Logic (Preserved) ---

function findParaBulk(surah, ayah) {
  const s = parseInt(surah);
  const a = parseInt(ayah);
  for (let p in criteriaData) {
    const lastKey = criteriaData[p].last_verse_key.split(":");
    if (
      s < parseInt(lastKey[0]) ||
      (s === parseInt(lastKey[0]) && a <= parseInt(lastKey[1]))
    ) {
      return p;
    }
  }
  return "30";
}

function calculateLinesBulk(startKey, endKey) {
  if (startKey === "114:0" && endKey === "78:40") return 336;
  const sIdx = mapData.find((d) => d.verse_key === startKey)?.index;
  const eIdx = mapData.find((d) => d.verse_key === endKey)?.index;
  if (sIdx === undefined || eIdx === undefined) return 0;
  const selection = mapData.filter((d) => d.index >= sIdx && d.index <= eIdx);
  let lineMap = {};
  selection.forEach((item) => {
    if (item.sp === item.ep) {
      for (let l = item.sl; l <= item.el; l++)
        lineMap[`${item.sp}-${l}`] = true;
    } else {
      let maxL = item.sp <= 2 ? 8 : 16;
      for (let l = item.sl; l <= maxL; l++) lineMap[`${item.sp}-${l}`] = true;
      for (let l = 1; l <= item.el; l++) lineMap[`${item.ep}-${l}`] = true;
    }
  });
  return Object.keys(lineMap).length;
}

function calculateQaidaBulkLines(startValue, endValue) {
  const [startLesson, startLine] = startValue.split(":");
  const [endLesson, endLine] = endValue.split(":");
  const sIdx = qaidaLessonOrder.indexOf(startLesson);
  const eIdx = qaidaLessonOrder.indexOf(endLesson);
  if (sIdx === -1 || eIdx === -1 || sIdx > eIdx) return 0;

  let totalLines = 0;
  const startLineNum = parseInt(startLine, 10) || 1;
  const endLineNum = parseInt(endLine, 10) || 1;

  if (sIdx === eIdx) {
    totalLines = Math.max(0, endLineNum - startLineNum + 1);
  } else {
    totalLines += Math.max(
      0,
      qaidaLessonStructure[startLesson] - startLineNum + 1,
    );
    for (let i = sIdx + 1; i < eIdx; i++) {
      totalLines += qaidaLessonStructure[qaidaLessonOrder[i]] || 0;
    }
    totalLines += Math.max(0, endLineNum);
  }

  return totalLines;
}

function processBulkData() {
  const input = document.getElementById("jsonDataInput").value;
  try {
    currentBulkData = JSON.parse(input);
  } catch (e) {
    alert("JSON ڈیٹا درست نہیں ہے۔ براہ کرم فارمیٹ چیک کریں۔");
    return;
  }

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  currentBulkData.forEach((s, idx) => {
    const courseType = (s.course || "").toLowerCase();
    const presentDays =
      (parseInt(s.m_academy_days) || 0) - (parseInt(s.m_absents_leaves) || 0);
    const effectivePresent = presentDays > 0 ? presentDays : 1;
    let totalLines = 0;
    let targetLabel = "--";
    let mCrit = { mumtaz: 0, behter: 0 };
    let cMumtazTarget = 0;
    let cBehterTarget = 0;

    if (courseType === "qaida") {
      totalLines = calculateQaidaBulkLines(s.m_start_lesson, s.m_end_lesson);
      const [lesson] = s.m_end_lesson.split(":");
      const endCriteria = qaidaCriteria.find((item) => item.lesson === lesson);
      if (!endCriteria) return;
      targetLabel = lesson === "Exercise" ? "Exercise (مشق)" : `سبق ${lesson}`;
      mCrit = {
        mumtaz: parseFloat(endCriteria["mumtaz-lines"]),
        behter: parseFloat(endCriteria["behter-lines"]),
      };
      cMumtazTarget = parseInt(endCriteria["final-total-mumtaz-days"]);
      cBehterTarget = parseInt(endCriteria["final-total-behter-days"]);
    } else {
      totalLines = calculateLinesBulk(s.m_start_lesson, s.m_end_lesson);
      const endV = s.m_end_lesson.split(":");
      const paraNum = findParaBulk(endV[0], endV[1]);
      targetLabel = paraNum;
      const cCrit = criteriaData[paraNum] || {};
      mCrit = cCrit[s.course + "_para_lines"] || { mumtaz: 0, behter: 0 };
      cMumtazTarget = cCrit[s.course + "_total-mumtaz_days"] || 0;
      cBehterTarget = cCrit[s.course + "_total-behtar_days"] || 0;
    }

    const dailyAvg = (totalLines / effectivePresent).toFixed(1);
    let mStatus = "کمزور";
    let mClass = "badge-kamzor";
    if (dailyAvg >= mCrit.mumtaz) {
      mStatus = "ممتاز";
      mClass = "badge-mumtaz";
    } else if (dailyAvg >= mCrit.behter) {
      mStatus = "بہتر";
      mClass = "badge-behter";
    }

    const cDays = parseInt(s.total_course_days) || 0;
    let cStatus = "کمزور";
    let cClass = "badge-kamzor";
    if (cDays <= cMumtazTarget) {
      cStatus = "ممتاز";
      cClass = "badge-mumtaz";
    } else if (cDays <= cBehterTarget) {
      cStatus = "بہتر";
      cClass = "badge-behter";
    }

    s.calculated = {
      totalLines,
      dailyAvg,
      targetLabel,
      mStatus,
      cStatus,
      mumtazTarget: cMumtazTarget,
    };

    const courseLabel =
      courseType === "nazrah"
        ? "ناظرہ"
        : courseType === "hifz"
          ? "حفظ"
          : "مدنی قاعدہ";

    const row = `
            <tr>
                <td class="font-bold">${s.cr}</td>
                <td class="urdu-text text-lg">${courseLabel}</td>
                <td class="font-bold">${targetLabel}</td>
                <td class="font-bold">${totalLines}</td>
                <td class="font-bold text-primary">${dailyAvg}</td>
                <td><span class="badge ${mClass}">${mStatus}</span></td>
                <td class="font-bold">${cDays}</td>
                <td class="font-bold text-accent">${cMumtazTarget}</td>
                <td><span class="badge ${cClass}">${cStatus}</span></td>
                <td>
                    <button onclick="downloadBulkStudentReport(${idx})" class="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all" title="ڈاؤن لوڈ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });

  document.getElementById("resultSection").classList.remove("hidden");
  document.getElementById("copyBtn").classList.remove("hidden");
}

function copyTableToClipboard() {
  const table = document.getElementById("inspectionTable");
  let range, sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(table);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(table);
      sel.addRange(range);
    }
    document.execCommand("copy");
    sel.removeAllRanges();
    alert("ٹیبل کاپی ہو گیا ہے! اب آپ اسے ایکسل میں پیسٹ کر سکتے ہیں۔");
  }
}

// --- Image Generation Logic ---

async function downloadIndividualReport() {
  const courseValue = document.getElementById("courseType").value;
  const courseLabel =
    courseValue === "nazrah"
      ? "ناظرہ"
      : courseValue === "hifz"
        ? "حفظ"
        : "مدنی قاعدہ";

  const data = {
    name: document.getElementById("studentName").value || "طالب علم",
    course: courseLabel,
    mAvg: document.getElementById("resMAvg").innerText,
    mStatus: document.getElementById("resMStatus").innerText,
    cDays: document.getElementById("resCDays").innerText,
    cStatus: document.getElementById("resCStatus").innerText,
    narrative: document.getElementById("finalNarrative").innerText,
  };
  await generateImageReport(data);
}

async function downloadBulkStudentReport(idx) {
  const s = currentBulkData[idx];
  const courseLabel =
    s.course === "nazrah"
      ? "ناظرہ"
      : s.course === "hifz"
        ? "حفظ"
        : "مدنی قاعدہ";
  const data = {
    name: s.cr || "طالب علم",
    course: courseLabel,
    mAvg: s.calculated.dailyAvg,
    mStatus: s.calculated.mStatus,
    cDays: s.total_course_days,
    cStatus: s.calculated.cStatus,
    narrative: `${s.cr} کی ماہانہ کارکردگی ${s.calculated.mStatus} رہی جبکہ مجموعی معیار ${s.calculated.cStatus} پایا گیا۔ (پارہ: ${s.calculated.targetLabel})`,
  };
  await generateImageReport(data);
}

async function generateImageReport(data) {
  const template = document.getElementById("cert-template");

  // Get Current Date and Month in Urdu
  const now = new Date();
  const monthsUrdu = [
    "جنوری",
    "فروری",
    "مارچ",
    "اپریل",
    "مئی",
    "جون",
    "جولائی",
    "اگست",
    "ستمبر",
    "اکتوبر",
    "نومبر",
    "دسمبر",
  ];
  const urduDate = now.toLocaleDateString("ur-PK");
  const urduMonth = monthsUrdu[now.getMonth()];

  // Populate Template
  document.getElementById("cert-name").innerText = data.name;
  document.getElementById("cert-course").innerText = data.course;
  document.getElementById("cert-m-avg").innerText = data.mAvg;
  document.getElementById("cert-m-status").innerText = data.mStatus;
  document.getElementById("cert-c-days").innerText = data.cDays;
  document.getElementById("cert-c-status").innerText = data.cStatus;
  document.getElementById("cert-narrative").innerText = data.narrative;
  document.getElementById("cert-date").innerText = urduDate;
  document.getElementById("cert-month").innerText = urduMonth;

  // Show template briefly for capture
  template.classList.remove("hidden");

  try {
    const canvas = await html2canvas(template, {
      scale: 3, // Even higher resolution for "Ultra Advanced"
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure fonts are applied in the clone
        const clonedTemplate = clonedDoc.getElementById("cert-template");
        clonedTemplate.style.fontFamily = "'Urdu', serif";
      },
    });

    const link = document.createElement("a");
    link.download = `Report_${data.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Image generation failed:", err);
    alert("تصویر تیار کرنے میں خرابی پیش آئی ہے۔");
  } finally {
    template.classList.add("hidden");
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", loadData);
