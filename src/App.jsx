import { useMemo, useState } from "react";

const APP_VERSION = "v3.1.0";
const APP_LAST_REVIEWED = "2026-03-27";
const RISK_ENGINE_LABEL = "Official AHA PREVENT 10-Year ASCVD Base Model";

const INITIAL_FORM = {
  age: "",
  sex: "",
  sbp: "",
  dbp: "",
  bmi: "",
  egfr: "",
  smoking: "",
  diabetes: "",
  bpTreated: "",
  lipidLowering: "",
  totalChol: "",
  hdl: "",
  ldl: "",
  nonHdl: "",
  triglycerides: "",
  knownAscvd: "",
  veryHighRiskAscvd: "",
  apob: "",
  lpa: "",
  cac: "",
  packYears: "",

  vaccineMode: "cumulative",

  priorVaccineHistoryKnown: "",
  evidenceOfImmunityMMR: "",
  evidenceOfImmunityVaricella: "",
  pregnant: "",
  immunocompromised: "",
  chronicLiverDisease: "",
  chronicKidneyDisease: "",
  chronicHeartDisease: "",
  chronicLungDisease: "",
  asplenia: "",
  cochlearImplant: "",
  csfLeak: "",
  healthcareWorker: "",
  collegeDormResident: "",
  military: "",
  travelRisk: "",
  residenceRisk: "",

  chaAge: "",
  chaSex: "",
  chaCHF: "",
  chaHTN: "",
  chaDM: "",
  chaStrokeTIA: "",
  chaVascular: "",

  wellsDvtSigns: "",
  wellsPeMostLikely: "",
  wellsHrOver100: "",
  wellsRecentSurgeryImmobilization: "",
  wellsPriorDvtPe: "",
  wellsHemoptysis: "",
  wellsMalignancy: "",

  dvtActiveCancer: "",
  dvtParalysisOrCast: "",
  dvtBedriddenOrSurgery: "",
  dvtLocalizedTenderness: "",
  dvtEntireLegSwollen: "",
  dvtCalfSwelling3cm: "",
  dvtPittingEdema: "",
  dvtCollateralVeins: "",
  dvtPriorDvt: "",
  dvtAlternativeDiagnosisLikely: "",

  hasBledHypertension: "",
  hasBledRenal: "",
  hasBledLiver: "",
  hasBledStroke: "",
  hasBledBleeding: "",
  hasBledLabileInr: "",
  hasBledElderly: "",
  hasBledDrugs: "",
  hasBledAlcohol: "",

  phq9_1: "0",
  phq9_2: "0",
  phq9_3: "0",
  phq9_4: "0",
  phq9_5: "0",
  phq9_6: "0",
  phq9_7: "0",
  phq9_8: "0",
  phq9_9: "0",
};

const COLORS = {
  pageBg: "#f3f7fb",
  shell: "#0c1f38",
  shell2: "#18365c",
  card: "rgba(255,255,255,0.94)",
  cardSoft: "#f7fbff",
  cardMute: "#fcfdff",
  border: "#d7e3ef",
  borderStrong: "#bfd2e4",
  text: "#11263f",
  textSoft: "#61758d",
  heading: "#0d2138",
  primary: "#0b5cab",
  primaryDark: "#093d74",
  primarySoft: "#ebf4ff",
  accent: "#0d7a6e",
  accentSoft: "#edfdf8",
  warning: "#9a6708",
  warningSoft: "#fff8e8",
  danger: "#b42318",
  dangerSoft: "#fff3f2",
  success: "#166534",
  successSoft: "#eefcf3",
  lavenderSoft: "#f6f4ff",
};

const PREVENT = {
  female: {
    age: 0.719883,
    nonHdlC: 0.1176967,
    hdlC: -0.151185,
    sbpLt110: -0.0835358,
    sbpGte110: 0.3592852,
    dm: 0.8348585,
    smoking: 0.4831078,
    bmiLt30: 0.0,
    bmiGte30: 0.0,
    egfrLt60: 0.4864619,
    egfrGte60: 0.0397779,
    bpTx: 0.2265309,
    statin: -0.0592374,
    bpTxSbpGte110: -0.0395762,
    statinNonHdlC: 0.0844423,
    ageNonHdlC: -0.0567839,
    ageHdlC: 0.0325692,
    ageSbpGte110: -0.1035985,
    ageDm: -0.2417542,
    ageSmoking: -0.0791142,
    ageBmiGte30: 0.0,
    ageEgfrLt60: -0.1671492,
    constant: -3.819975,
  },
  male: {
    age: 0.7099847,
    nonHdlC: 0.1658663,
    hdlC: -0.1144285,
    sbpLt110: -0.2837212,
    sbpGte110: 0.3239977,
    dm: 0.7189597,
    smoking: 0.3956973,
    bmiLt30: 0.0,
    bmiGte30: 0.0,
    egfrLt60: 0.3690075,
    egfrGte60: 0.0203619,
    bpTx: 0.2036522,
    statin: -0.0865581,
    bpTxSbpGte110: -0.0322916,
    statinNonHdlC: 0.114563,
    ageNonHdlC: -0.0300005,
    ageHdlC: 0.0232747,
    ageSbpGte110: -0.0927024,
    ageDm: -0.2018525,
    ageSmoking: -0.0970527,
    ageBmiGte30: 0.0,
    ageEgfrLt60: -0.1217081,
    constant: -3.500655,
  },
};

const NON_NEGATIVE_FIELDS = new Set([
  "age",
  "sbp",
  "dbp",
  "bmi",
  "egfr",
  "totalChol",
  "hdl",
  "ldl",
  "nonHdl",
  "triglycerides",
  "apob",
  "lpa",
  "cac",
  "packYears",
  "chaAge",
]);

function parseNum(value) {
  return value === "" ? null : Number(value);
}

function sanitizeNonNegativeInput(name, value) {
  if (!NON_NEGATIVE_FIELDS.has(name) || value === "") return value;
  if (value.startsWith("-")) return value.replace(/^-+/, "");
  const num = Number(value);
  return Number.isFinite(num) && num < 0 ? "0" : value;
}

function yn(v) {
  return v === "Y";
}

function addUnique(list, text) {
  if (!list.includes(text)) list.push(text);
}

function calcPreventAscvd({
  age,
  sex,
  sbp,
  bpTx,
  totalC,
  hdlC,
  statin,
  dm,
  smoking,
  egfr,
  bmi,
}) {
  if (
    !age ||
    !sbp ||
    !totalC ||
    !hdlC ||
    !egfr ||
    !bmi ||
    !["female", "male"].includes(sex)
  ) {
    return null;
  }

  const c = PREVENT[sex];
  const toMmol = (mg) => mg / 38.67;

  const a = (age - 55) / 10;
  const nh = toMmol(totalC - hdlC) - 3.5;
  const hd = (toMmol(hdlC) - 1.3) / 0.3;
  const sl = (Math.min(sbp, 110) - 110) / 20;
  const sh = (Math.max(sbp, 110) - 130) / 20;

  const d = dm ? 1 : 0;
  const sm = smoking ? 1 : 0;
  const bp = bpTx ? 1 : 0;
  const st = statin ? 1 : 0;

  const bl = (Math.min(bmi, 30) - 25) / 5;
  const bh = (Math.max(bmi, 30) - 30) / 5;
  const el = (Math.min(egfr, 60) - 60) / -15;
  const eh = (Math.max(egfr, 60) - 90) / -15;

  const x =
    c.age * a +
    c.nonHdlC * nh +
    c.hdlC * hd +
    c.sbpLt110 * sl +
    c.sbpGte110 * sh +
    c.dm * d +
    c.smoking * sm +
    c.bmiLt30 * bl +
    c.bmiGte30 * bh +
    c.egfrLt60 * el +
    c.egfrGte60 * eh +
    c.bpTx * bp +
    c.statin * st +
    c.bpTxSbpGte110 * (bp * sh) +
    c.statinNonHdlC * (st * nh) +
    c.ageNonHdlC * (a * nh) +
    c.ageHdlC * (a * hd) +
    c.ageSbpGte110 * (a * sh) +
    c.ageDm * (a * d) +
    c.ageSmoking * (a * sm) +
    c.ageBmiGte30 * (a * bh) +
    c.ageEgfrLt60 * (a * el) +
    c.constant;

  return Math.round((Math.exp(x) / (1 + Math.exp(x))) * 1000) / 10;
}

function riskCat(r) {
  if (r == null) return { label: "Not calculated", range: "" };
  if (r < 3) return { label: "Low", range: "<3%" };
  if (r < 5) return { label: "Borderline", range: "3–<5%" };
  if (r < 10) return { label: "Intermediate", range: "5–<10%" };
  return { label: "High", range: "≥10%" };
}

function buildStatinPathway(form, preventRisk) {
  const ldl = Number(form.ldl || 0);
  const knownAscvd = form.knownAscvd === "Y";
  const veryHighRisk = form.veryHighRiskAscvd === "Y";
  const diabetes = form.diabetes === "Y";
  const tg = Number(form.triglycerides || 0);
  const apob = Number(form.apob || 0);
  const lpa = Number(form.lpa || 0);
  const cac = Number(form.cac || 0);

  let pathway = "Primary prevention";
  let recommendation = "Lifestyle optimization";
  let goal = "Individualized";
  const enhancers = [];
  const notes = [];

  if (knownAscvd) {
    pathway = "Secondary prevention";
    recommendation = "High-intensity statin unless contraindicated";
    goal = veryHighRisk ? "LDL-C <55 mg/dL" : "LDL-C <70 mg/dL";
  } else if (ldl >= 190) {
    pathway = "Severe hypercholesterolemia";
    recommendation = "High-intensity statin";
    goal = "At least 50% LDL-C reduction";
  } else if (diabetes) {
    pathway = "Diabetes pathway";
    recommendation =
      preventRisk >= 7.5
        ? "High-intensity statin is reasonable"
        : "At least moderate-intensity statin";
    goal = "Usually LDL-C <70 mg/dL if higher risk";
  } else {
    if (preventRisk == null) {
      recommendation = "Need complete PREVENT inputs";
      goal = "Pending risk calculation";
    } else if (preventRisk >= 10) {
      recommendation = "Moderate- to high-intensity statin is reasonable";
      goal = "Risk-based LDL-C reduction";
    } else if (preventRisk >= 5) {
      recommendation = "Shared decision-making for statin initiation";
      goal = "Risk-based LDL-C reduction";
    } else {
      recommendation = "Lifestyle-first management may be reasonable";
      goal = "Risk-based LDL-C reduction";
    }
  }

  if (ldl >= 160) enhancers.push("LDL-C ≥160 mg/dL");
  if (tg >= 175) enhancers.push("Triglycerides ≥175 mg/dL");
  if (apob >= 130) enhancers.push("ApoB ≥130 mg/dL");
  if (lpa >= 50) enhancers.push("Lp(a) elevated");
  if (cac > 0) enhancers.push(`CAC present (${cac})`);

  if (cac === 0) notes.push("CAC = 0 may support deferring statin in selected primary-prevention cases.");
  if (cac >= 100) notes.push("CAC supports stronger statin consideration.");
  if (tg >= 500) notes.push("Evaluate severe hypertriglyceridemia management.");

  return { pathway, recommendation, goal, enhancers, notes };
}

function calcCha2ds2Vasc(form) {
  const age = Number(form.chaAge || 0);
  let score = 0;
  const items = [];

  if (form.chaCHF === "Y") {
    score += 1;
    items.push("Congestive heart failure / LV dysfunction");
  }
  if (form.chaHTN === "Y") {
    score += 1;
    items.push("Hypertension");
  }
  if (age >= 75) {
    score += 2;
    items.push("Age ≥75");
  } else if (age >= 65) {
    score += 1;
    items.push("Age 65–74");
  }
  if (form.chaDM === "Y") {
    score += 1;
    items.push("Diabetes mellitus");
  }
  if (form.chaStrokeTIA === "Y") {
    score += 2;
    items.push("Stroke / TIA / thromboembolism history");
  }
  if (form.chaVascular === "Y") {
    score += 1;
    items.push("Vascular disease");
  }
  if (form.chaSex === "female") {
    score += 1;
    items.push("Female sex");
  }

  let interpretation = "Low stroke-risk profile";
  if (score >= 2) interpretation = "Elevated stroke-risk profile";
  else if (score === 1) interpretation = "Intermediate stroke-risk profile";

  return { score, items, interpretation };
}

function calcWellsPE(form) {
  let score = 0;
  const items = [];

  if (form.wellsDvtSigns === "Y") {
    score += 3;
    items.push("Clinical signs/symptoms of DVT (+3)");
  }
  if (form.wellsPeMostLikely === "Y") {
    score += 3;
    items.push("PE more likely than alternative diagnosis (+3)");
  }
  if (form.wellsHrOver100 === "Y") {
    score += 1.5;
    items.push("Heart rate >100 (+1.5)");
  }
  if (form.wellsRecentSurgeryImmobilization === "Y") {
    score += 1.5;
    items.push("Recent surgery / immobilization (+1.5)");
  }
  if (form.wellsPriorDvtPe === "Y") {
    score += 1.5;
    items.push("Prior DVT/PE (+1.5)");
  }
  if (form.wellsHemoptysis === "Y") {
    score += 1;
    items.push("Hemoptysis (+1)");
  }
  if (form.wellsMalignancy === "Y") {
    score += 1;
    items.push("Malignancy (+1)");
  }

  return {
    score,
    items,
    interpretation: score >= 4.5 ? "PE likely" : "PE unlikely",
  };
}

function calcWellsDvt(form) {
  let score = 0;
  const items = [];

  const add = (condition, points, label) => {
    if (condition) {
      score += points;
      items.push(`${label} (${points > 0 ? "+" : ""}${points})`);
    }
  };

  add(form.dvtActiveCancer === "Y", 1, "Active cancer");
  add(form.dvtParalysisOrCast === "Y", 1, "Paralysis, paresis, or recent lower-extremity cast");
  add(form.dvtBedriddenOrSurgery === "Y", 1, "Bedridden >3 days recently or major surgery within 12 weeks");
  add(form.dvtLocalizedTenderness === "Y", 1, "Localized tenderness along deep venous system");
  add(form.dvtEntireLegSwollen === "Y", 1, "Entire leg swollen");
  add(form.dvtCalfSwelling3cm === "Y", 1, "Calf swelling >3 cm");
  add(form.dvtPittingEdema === "Y", 1, "Pitting edema confined to symptomatic leg");
  add(form.dvtCollateralVeins === "Y", 1, "Collateral superficial veins");
  add(form.dvtPriorDvt === "Y", 1, "Previously documented DVT");
  add(form.dvtAlternativeDiagnosisLikely === "Y", -2, "Alternative diagnosis at least as likely as DVT");

  return {
    score,
    interpretation: score >= 2 ? "DVT likely" : "DVT unlikely",
    items,
  };
}

function calcHasBled(form) {
  let score = 0;
  const items = [];

  const add = (condition, label) => {
    if (condition) {
      score += 1;
      items.push(label);
    }
  };

  add(form.hasBledHypertension === "Y", "Hypertension (SBP >160 mmHg)");
  add(form.hasBledRenal === "Y", "Abnormal renal function");
  add(form.hasBledLiver === "Y", "Abnormal liver function");
  add(form.hasBledStroke === "Y", "Prior stroke");
  add(form.hasBledBleeding === "Y", "Bleeding history or predisposition");
  add(form.hasBledLabileInr === "Y", "Labile INR");
  add(form.hasBledElderly === "Y", "Age >65");
  add(form.hasBledDrugs === "Y", "Drugs predisposing to bleeding");
  add(form.hasBledAlcohol === "Y", "Alcohol excess");

  let interpretation = "Lower bleeding-risk profile";
  if (score >= 3) interpretation = "Higher bleeding-risk profile";
  else if (score === 2) interpretation = "Moderate bleeding-risk profile";

  return { score, interpretation, items };
}

function calcPhq9(form) {
  const responses = [
    Number(form.phq9_1 || 0),
    Number(form.phq9_2 || 0),
    Number(form.phq9_3 || 0),
    Number(form.phq9_4 || 0),
    Number(form.phq9_5 || 0),
    Number(form.phq9_6 || 0),
    Number(form.phq9_7 || 0),
    Number(form.phq9_8 || 0),
    Number(form.phq9_9 || 0),
  ];

  const score = responses.reduce((sum, n) => sum + n, 0);

  let severity = "None / minimal";
  if (score >= 20) severity = "Severe";
  else if (score >= 15) severity = "Moderately severe";
  else if (score >= 10) severity = "Moderate";
  else if (score >= 5) severity = "Mild";

  return {
    score,
    severity,
    positiveSuicideItem: Number(form.phq9_9 || 0) > 0,
  };
}

function fieldStyle(hasError) {
  return {
    width: "100%",
    maxWidth: "100%",
    padding: "10px 12px",
    borderRadius: "12px",
    border: `1px solid ${hasError ? COLORS.danger : COLORS.border}`,
    background: "#fff",
    boxSizing: "border-box",
    color: COLORS.text,
    outline: "none",
    fontSize: "13px",
    minHeight: "42px",
    transition: "border-color 140ms ease, box-shadow 140ms ease",
    boxShadow: hasError ? "0 0 0 4px rgba(180,35,24,0.09)" : "0 1px 2px rgba(9,30,66,0.04)",
  };
}

function wideFieldStyle(hasError) {
  return {
    ...fieldStyle(hasError),
    maxWidth: "100%",
  };
}

function labelStyle() {
  return {
    display: "block",
    fontSize: "10px",
    fontWeight: 800,
    marginBottom: "6px",
    color: COLORS.heading,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };
}

function errorStyle() {
  return {
    color: COLORS.danger,
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: 700,
  };
}

function buttonStyle(kind = "default") {
  const base = {
    padding: "11px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "13px",
    letterSpacing: "0.01em",
    transition: "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
    boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
  };

  if (kind === "primary") {
    return {
      ...base,
      border: "1px solid #0b4f8a",
      background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
      color: "#fff",
    };
  }
  if (kind === "accent") {
    return {
      ...base,
      border: "1px solid #9fe5d9",
      background: `linear-gradient(180deg, #f4fffc, ${COLORS.accentSoft})`,
      color: COLORS.accent,
    };
  }
  return {
    ...base,
    border: `1px solid ${COLORS.borderStrong}`,
    background: "rgba(255,255,255,0.95)",
    color: COLORS.text,
  };
}

function tabButtonStyle(active) {
  return {
    padding: "10px 14px",
    borderRadius: "999px",
    border: `1px solid ${active ? COLORS.primaryDark : COLORS.border}`,
    background: active
      ? `linear-gradient(180deg, ${COLORS.primarySoft}, #ffffff)`
      : "rgba(255,255,255,0.88)",
    color: active ? COLORS.primaryDark : COLORS.text,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "13px",
    boxShadow: active ? "0 8px 18px rgba(11,92,171,0.12)" : "none",
  };
}

function cardStyle(background = COLORS.card) {
  return {
    background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    backdropFilter: "blur(8px)",
  };
}

function sectionCardStyle(background = "#ffffff") {
  return {
    background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
  };
}

function sectionHeaderStyle() {
  return {
    fontSize: "17px",
    fontWeight: 900,
    color: COLORS.heading,
    marginBottom: "5px",
    letterSpacing: "-0.01em",
  };
}

function sectionSubheaderStyle() {
  return {
    fontSize: "12px",
    color: COLORS.textSoft,
    marginBottom: "14px",
    lineHeight: 1.5,
  };
}

function sectionToggleStyle() {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "0",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    color: COLORS.heading,
  };
}

function sectionChevronStyle(open) {
  return {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: COLORS.primarySoft,
    color: COLORS.primaryDark,
    fontSize: "16px",
    fontWeight: 900,
    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
    transition: "transform 140ms ease",
  };
}

function getRiskBadgeStyle(label) {
  if (label === "High") {
    return {
      background: COLORS.dangerSoft,
      color: COLORS.danger,
      border: "1px solid #f3c0bd",
    };
  }
  if (label === "Intermediate" || label === "Borderline") {
    return {
      background: COLORS.warningSoft,
      color: COLORS.warning,
      border: "1px solid #f3d9a6",
    };
  }
  if (label === "Low") {
    return {
      background: COLORS.successSoft,
      color: COLORS.success,
      border: "1px solid #b9e7c7",
    };
  }
  return {
    background: COLORS.primarySoft,
    color: COLORS.primaryDark,
    border: "1px solid #c2d8ef",
  };
}

function validateScreeningInputs(form) {
  const errors = {};
  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const dbp = parseNum(form.dbp);
  const packYears = parseNum(form.packYears);

  if (!Number.isFinite(age) || age < 0 || age > 100) errors.age = "Age must be 0–100.";
  if (form.sex !== "" && !["male", "female"].includes(form.sex)) errors.sex = "Sex must be male or female.";
  if (form.sbp !== "" && (!Number.isFinite(sbp) || sbp < 70 || sbp > 250)) errors.sbp = "Systolic BP must be 70–250.";
  if (form.dbp !== "" && (!Number.isFinite(dbp) || dbp < 40 || dbp > 150)) errors.dbp = "Diastolic BP must be 40–150.";
  if (form.sbp !== "" && form.dbp !== "" && Number.isFinite(sbp) && Number.isFinite(dbp) && dbp >= sbp) {
    errors.dbp = "Diastolic must be lower than systolic.";
  }
  if (form.smoking !== "" && !["Y", "N"].includes(form.smoking)) errors.smoking = "Smoking must be Y or N.";
  if (
    form.smoking === "Y" &&
    form.packYears !== "" &&
    (!Number.isFinite(packYears) || packYears < 0 || packYears > 200)
  ) {
    errors.packYears = "Pack-years must be 0–200.";
  }

  return errors;
}

function validateAdditionalInputs(form) {
  const errors = {};
  const ldl = parseNum(form.ldl);
  const nonHdl = parseNum(form.nonHdl);
  const tg = parseNum(form.triglycerides);
  const apob = parseNum(form.apob);
  const lpa = parseNum(form.lpa);
  const cac = parseNum(form.cac);

  if (form.ldl !== "" && (!Number.isFinite(ldl) || ldl < 20 || ldl > 400)) errors.ldl = "LDL-C must be 20–400.";
  if (form.nonHdl !== "" && (!Number.isFinite(nonHdl) || nonHdl < 30 || nonHdl > 500)) errors.nonHdl = "Non-HDL-C must be 30–500.";
  if (form.triglycerides !== "" && (!Number.isFinite(tg) || tg < 20 || tg > 2000)) errors.triglycerides = "Triglycerides must be 20–2000.";
  if (form.apob !== "" && (!Number.isFinite(apob) || apob < 20 || apob > 300)) errors.apob = "ApoB must be 20–300.";
  if (form.lpa !== "" && (!Number.isFinite(lpa) || lpa < 0 || lpa > 500)) errors.lpa = "Lp(a) must be 0–500.";
  if (form.cac !== "" && (!Number.isFinite(cac) || cac < 0 || cac > 5000)) errors.cac = "CAC must be 0–5000.";

  return errors;
}

function validatePreventInputs(form) {
  const errors = {};
  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const bmi = parseNum(form.bmi);
  const egfr = parseNum(form.egfr);
  const totalChol = parseNum(form.totalChol);
  const hdl = parseNum(form.hdl);

  if (form.age !== "" && (!Number.isFinite(age) || age < 30 || age > 79)) errors.age = "For official PREVENT, age must be 30–79.";
  if (form.sbp !== "" && (!Number.isFinite(sbp) || sbp < 90 || sbp > 200)) errors.sbp = "For official PREVENT, SBP must be 90–200.";
  if (form.bmi !== "" && (!Number.isFinite(bmi) || bmi < 18.5 || bmi > 39.9)) errors.bmi = "For official PREVENT, BMI must be 18.5–39.9.";
  if (form.egfr !== "" && (!Number.isFinite(egfr) || egfr <= 0)) errors.egfr = "eGFR must be >0.";
  if (form.totalChol !== "" && (!Number.isFinite(totalChol) || totalChol < 130 || totalChol > 320)) {
    errors.totalChol = "For official PREVENT, total cholesterol must be 130–320.";
  }
  if (form.hdl !== "" && (!Number.isFinite(hdl) || hdl < 20 || hdl > 100)) errors.hdl = "For official PREVENT, HDL must be 20–100.";
  if (Number.isFinite(totalChol) && Number.isFinite(hdl) && hdl >= totalChol) errors.hdl = "HDL must be lower than total cholesterol.";

  return errors;
}

function hasCompletePreventInputs(form) {
  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const bmi = parseNum(form.bmi);
  const egfr = parseNum(form.egfr);
  const totalChol = parseNum(form.totalChol);
  const hdl = parseNum(form.hdl);

  return (
    Number.isFinite(age) &&
    age >= 30 &&
    age <= 79 &&
    ["male", "female"].includes(form.sex) &&
    Number.isFinite(sbp) &&
    sbp >= 90 &&
    sbp <= 200 &&
    Number.isFinite(bmi) &&
    bmi >= 18.5 &&
    bmi <= 39.9 &&
    Number.isFinite(egfr) &&
    egfr > 0 &&
    ["Y", "N"].includes(form.smoking) &&
    ["Y", "N"].includes(form.diabetes) &&
    ["Y", "N"].includes(form.bpTreated) &&
    ["Y", "N"].includes(form.lipidLowering) &&
    Number.isFinite(totalChol) &&
    totalChol >= 130 &&
    totalChol <= 320 &&
    Number.isFinite(hdl) &&
    hdl >= 20 &&
    hdl <= 100 &&
    hdl < totalChol
  );
}

function getCumulativeVaccinesByAgeAndRisk(form) {
  const age = Number(form.age || 0);
  const sex = form.sex;

  const pregnant = form.pregnant === "Y";
  const immunocompromised = form.immunocompromised === "Y";
  const chronicLiverDisease = form.chronicLiverDisease === "Y";
  const chronicKidneyDisease = form.chronicKidneyDisease === "Y";
  const chronicHeartDisease = form.chronicHeartDisease === "Y";
  const chronicLungDisease = form.chronicLungDisease === "Y";
  const asplenia = form.asplenia === "Y";
  const cochlearImplant = form.cochlearImplant === "Y";
  const csfLeak = form.csfLeak === "Y";
  const healthcareWorker = form.healthcareWorker === "Y";
  const collegeDormResident = form.collegeDormResident === "Y";
  const military = form.military === "Y";
  const travelRisk = form.travelRisk === "Y";
  const residenceRisk = form.residenceRisk === "Y";

  const priorVaccineHistoryKnown = form.priorVaccineHistoryKnown === "Y";
  const evidenceOfImmunityMMR = form.evidenceOfImmunityMMR === "Y";
  const evidenceOfImmunityVaricella = form.evidenceOfImmunityVaricella === "Y";

  const vaccines = [];
  if (!Number.isFinite(age) || age < 0) return vaccines;

  if (age >= 0) addUnique(vaccines, "Hepatitis B series");
  if (age >= 2 / 12) {
    addUnique(vaccines, "Rotavirus series");
    addUnique(vaccines, "DTaP series");
    addUnique(vaccines, "Hib series");
    addUnique(vaccines, "Pneumococcal conjugate (PCV) series");
    addUnique(vaccines, "Inactivated poliovirus (IPV) series");
  }
  if (age >= 6 / 12) {
    addUnique(vaccines, "Influenza annually");
    addUnique(vaccines, "COVID-19 per current CDC age-based schedule");
  }
  if (age >= 1) {
    addUnique(vaccines, "MMR series");
    addUnique(vaccines, "Varicella series");
    addUnique(vaccines, "Hepatitis A series");
  }
  if (age >= 4) {
    addUnique(vaccines, "DTaP booster at 4–6 years");
    addUnique(vaccines, "IPV booster at 4–6 years");
    addUnique(vaccines, "MMR second dose");
    addUnique(vaccines, "Varicella second dose");
  }
  if (age >= 9) addUnique(vaccines, "HPV series");
  if (age >= 11) {
    addUnique(vaccines, "Tdap adolescent dose");
    addUnique(vaccines, "MenACWY first dose");
  }
  if (age >= 16) addUnique(vaccines, "MenACWY booster");

  if (age >= 19) {
    addUnique(vaccines, "COVID-19 per current adult CDC schedule");
    addUnique(vaccines, "Td or Tdap booster every 10 years after Tdap");
  }
  if (age >= 19 && age <= 26) {
    addUnique(vaccines, "HPV catch-up if not previously completed");
    addUnique(vaccines, "Hepatitis B if not previously completed");
    addUnique(vaccines, "Hepatitis A if catch-up or indicated");
  }
  if (age >= 27 && age <= 45) {
    addUnique(vaccines, "HPV based on shared clinical decision-making if not adequately vaccinated");
  }
  if (age >= 50 || immunocompromised) addUnique(vaccines, "Recombinant zoster (RZV) 2-dose series");
  if (age >= 60 && age < 75) addUnique(vaccines, "RSV vaccine if indicated / shared clinical decision-making");
  if (age >= 75) addUnique(vaccines, "RSV vaccine");
  if (age >= 65) {
    addUnique(vaccines, "Pneumococcal vaccine per current CDC adult age/risk schedule");
    addUnique(vaccines, "Influenza annually (higher-dose/adjuvanted product may be preferred)");
  }

  if (sex === "female" && pregnant) {
    addUnique(vaccines, "Tdap during each pregnancy");
    addUnique(vaccines, "RSV vaccine during pregnancy when seasonally indicated");
  }

  if (!evidenceOfImmunityMMR && age >= 19) addUnique(vaccines, "MMR if lacking evidence of immunity");
  if (!evidenceOfImmunityVaricella && age >= 19) addUnique(vaccines, "Varicella if lacking evidence of immunity");
  if (!priorVaccineHistoryKnown && age >= 19) addUnique(vaccines, "Review prior vaccine history / registry and assess catch-up needs");

  if (immunocompromised || asplenia || cochlearImplant || csfLeak || chronicHeartDisease || chronicLungDisease || chronicKidneyDisease) {
    addUnique(vaccines, "Pneumococcal vaccine based on risk condition");
  }

  if (asplenia) {
    addUnique(vaccines, "Meningococcal vaccines based on asplenia risk");
    addUnique(vaccines, "Hib if indicated");
  }

  if (chronicLiverDisease) {
    addUnique(vaccines, "Hepatitis A vaccine");
    addUnique(vaccines, "Hepatitis B vaccine");
  }

  if (healthcareWorker) {
    addUnique(vaccines, "Hepatitis B if not immune");
    addUnique(vaccines, "MMR if lacking evidence of immunity");
    addUnique(vaccines, "Varicella if lacking evidence of immunity");
    addUnique(vaccines, "Annual influenza");
  }

  if (collegeDormResident || military) addUnique(vaccines, "Meningococcal vaccination if indicated");

  if (travelRisk || residenceRisk) {
    addUnique(vaccines, "Travel/residence-based vaccines as indicated");
    addUnique(vaccines, "Meningococcal / Hepatitis A / other destination-specific vaccines if indicated");
  }

  return vaccines;
}

function getCurrentAgeVaccinesNeeded(form) {
  const age = Number(form.age || 0);
  const sex = form.sex;

  const pregnant = form.pregnant === "Y";
  const immunocompromised = form.immunocompromised === "Y";
  const chronicLiverDisease = form.chronicLiverDisease === "Y";
  const chronicKidneyDisease = form.chronicKidneyDisease === "Y";
  const chronicHeartDisease = form.chronicHeartDisease === "Y";
  const chronicLungDisease = form.chronicLungDisease === "Y";
  const asplenia = form.asplenia === "Y";
  const cochlearImplant = form.cochlearImplant === "Y";
  const csfLeak = form.csfLeak === "Y";
  const healthcareWorker = form.healthcareWorker === "Y";
  const collegeDormResident = form.collegeDormResident === "Y";
  const military = form.military === "Y";
  const travelRisk = form.travelRisk === "Y";
  const residenceRisk = form.residenceRisk === "Y";

  const priorVaccineHistoryKnown = form.priorVaccineHistoryKnown === "Y";
  const evidenceOfImmunityMMR = form.evidenceOfImmunityMMR === "Y";
  const evidenceOfImmunityVaricella = form.evidenceOfImmunityVaricella === "Y";

  const vaccines = [];
  if (!Number.isFinite(age) || age < 0) return vaccines;

  if (age >= 6 / 12) addUnique(vaccines, "Influenza annually");
  if (age >= 19) addUnique(vaccines, "COVID-19 per current CDC adult schedule");
  if (age >= 19) addUnique(vaccines, "Td or Tdap booster if due (every 10 years after prior Tdap)");
  if (age >= 50 || immunocompromised) addUnique(vaccines, "Recombinant zoster (RZV) if not completed");
  if (age >= 60 && age < 75) addUnique(vaccines, "RSV vaccine if indicated / shared clinical decision-making");
  if (age >= 75) addUnique(vaccines, "RSV vaccine");
  if (age >= 65) addUnique(vaccines, "Pneumococcal vaccine per current adult age/risk schedule");

  if (!priorVaccineHistoryKnown && age >= 19) addUnique(vaccines, "Review vaccine registry/history to determine catch-up needs");
  if (age >= 19 && age <= 26) {
    addUnique(vaccines, "HPV catch-up if series incomplete");
    addUnique(vaccines, "Hepatitis B catch-up if series incomplete");
  }
  if (age >= 27 && age <= 45) addUnique(vaccines, "HPV may be considered by shared decision-making if not fully vaccinated");
  if (!evidenceOfImmunityMMR && age >= 19) addUnique(vaccines, "MMR if lacking evidence of immunity");
  if (!evidenceOfImmunityVaricella && age >= 19) addUnique(vaccines, "Varicella if lacking evidence of immunity");

  if (sex === "female" && pregnant) {
    addUnique(vaccines, "Tdap during current pregnancy");
    addUnique(vaccines, "RSV vaccine during pregnancy when seasonally indicated");
  }

  if (immunocompromised || asplenia || cochlearImplant || csfLeak || chronicHeartDisease || chronicLungDisease || chronicKidneyDisease) {
    addUnique(vaccines, "Pneumococcal vaccine based on risk condition");
  }
  if (asplenia) {
    addUnique(vaccines, "Meningococcal vaccines based on asplenia risk");
    addUnique(vaccines, "Hib if indicated");
  }
  if (chronicLiverDisease) {
    addUnique(vaccines, "Hepatitis A vaccine");
    addUnique(vaccines, "Hepatitis B vaccine");
  }
  if (healthcareWorker) {
    addUnique(vaccines, "Hepatitis B if not immune");
    addUnique(vaccines, "MMR if lacking evidence of immunity");
    addUnique(vaccines, "Varicella if lacking evidence of immunity");
    addUnique(vaccines, "Annual influenza");
  }
  if (collegeDormResident || military) addUnique(vaccines, "Meningococcal vaccination if indicated");
  if (travelRisk || residenceRisk) addUnique(vaccines, "Travel/residence-based vaccines as indicated");

  return vaccines;
}

function getVaccinesForDisplay(form) {
  return form.vaccineMode === "current"
    ? getCurrentAgeVaccinesNeeded(form)
    : getCumulativeVaccinesByAgeAndRisk(form);
}

function YesNoField({ name, label, value, onChange }) {
  return (
    <div>
      <label style={labelStyle()}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={wideFieldStyle(false)}>
        <option value="">Select</option>
        <option value="Y">Yes</option>
        <option value="N">No</option>
      </select>
    </div>
  );
}

function CollapsibleSection({
  sectionKey,
  title,
  subtitle,
  collapsedSections,
  toggleSection,
  background,
  children,
}) {
  const open = !collapsedSections[sectionKey];

  return (
    <div style={sectionCardStyle(background)}>
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        style={sectionToggleStyle()}
      >
        <div>
          <div style={sectionHeaderStyle()}>{title}</div>
          <div style={sectionSubheaderStyle()}>{subtitle}</div>
        </div>
        <span style={sectionChevronStyle(open)}>⌃</span>
      </button>

      {open && <div className="collapsible-content">{children}</div>}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [copyStatus, setCopyStatus] = useState("");
  const [activeTab, setActiveTab] = useState("prevent");
  const [collapsedSections, setCollapsedSections] = useState({
    preventInputs: false,
    statinInputs: true,
    immunizationInputs: true,
    chaInputs: true,
    wellsPeInputs: true,
    wellsDvtInputs: true,
    hasBledInputs: true,
    phq9Inputs: true,
  });

  const screeningErrors = useMemo(() => validateScreeningInputs(form), [form]);
  const additionalErrors = useMemo(() => validateAdditionalInputs(form), [form]);
  const preventRangeErrors = useMemo(() => validatePreventInputs(form), [form]);

  const handleChange = (e) => {
    const { name } = e.target;
    const value = sanitizeNonNegativeInput(name, e.target.value);
    setForm((prev) => ({ ...prev, [name]: value }));
    setCopyStatus("");
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setCopyStatus("");
  };

  const handlePrint = () => window.print();

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const focusPreventInputs = () => {
    setCollapsedSections({
      preventInputs: false,
      statinInputs: true,
      immunizationInputs: true,
      chaInputs: true,
      wellsPeInputs: true,
      wellsDvtInputs: true,
      hasBledInputs: true,
      phq9Inputs: true,
    });
  };

  const canCalculatePrevent = useMemo(() => hasCompletePreventInputs(form), [form]);

  const preventRisk = useMemo(() => {
    if (!canCalculatePrevent) return null;

    return calcPreventAscvd({
      age: Number(form.age),
      sex: form.sex,
      sbp: Number(form.sbp),
      bpTx: yn(form.bpTreated),
      totalC: Number(form.totalChol),
      hdlC: Number(form.hdl),
      statin: yn(form.lipidLowering),
      dm: yn(form.diabetes),
      smoking: yn(form.smoking),
      egfr: Number(form.egfr),
      bmi: Number(form.bmi),
    });
  }, [form, canCalculatePrevent]);

  const preventCategory = riskCat(preventRisk);
  const statinPlan = useMemo(() => buildStatinPathway(form, preventRisk), [form, preventRisk]);
  const chaScore = useMemo(() => calcCha2ds2Vasc(form), [form]);
  const wellsScore = useMemo(() => calcWellsPE(form), [form]);
  const wellsDvtScore = useMemo(() => calcWellsDvt(form), [form]);
  const hasBledScore = useMemo(() => calcHasBled(form), [form]);
  const phq9Score = useMemo(() => calcPhq9(form), [form]);

  const derived = useMemo(() => {
    const age = parseNum(form.age) ?? 0;
    const sbp = parseNum(form.sbp);
    const dbp = parseNum(form.dbp);
    const bmi = parseNum(form.bmi);
    const packYears = parseNum(form.packYears);

    const screenings = [];
    const vaccines = getVaccinesForDisplay(form);
    const counseling = [];
    const careGaps = [];
    const orders = [];

    if (Object.keys(screeningErrors).length > 0) {
      return {
        screenings,
        vaccines,
        counseling,
        careGaps: ["Resolve the basic input errors to generate preventive screening recommendations."],
        orders,
      };
    }

    if (age >= 45 && age <= 75) {
      screenings.push("Colorectal cancer screening");
      careGaps.push("CRC screening if not up to date");
      orders.push("FIT test or colonoscopy referral");
    }

    if (form.sex === "female" && age >= 50 && age <= 74) {
      screenings.push("Mammogram every 2 years");
      orders.push("Screening mammogram");
    }

    if (form.sex === "female" && age >= 21 && age <= 65) {
      screenings.push("Cervical cancer screening");
    }

    if (form.sex === "male" && age >= 65 && age <= 75 && form.smoking === "Y") {
      screenings.push("AAA one-time screening");
      orders.push("Abdominal ultrasound");
    }

    if (
      age >= 50 &&
      age <= 80 &&
      form.smoking === "Y" &&
      Number.isFinite(packYears) &&
      packYears >= 20
    ) {
      screenings.push("Annual low-dose CT for lung cancer");
      orders.push("Low-dose CT chest");
    }

    if (age >= 18) {
      screenings.push("Depression screening");
      screenings.push("HIV screening");
      screenings.push("Hepatitis C screening");
    }

    if (age >= 35) {
      if (Number.isFinite(bmi) && bmi >= 25) {
        screenings.push("Diabetes screening");
        orders.push("A1c or fasting glucose");
      } else if (form.bmi === "") {
        screenings.push("Consider diabetes screening if overweight/obesity is confirmed");
      }
    }

    if (Number.isFinite(sbp) && sbp >= 130) {
      careGaps.push("Hypertension evaluation needed");
      orders.push("Repeat BP / home BP monitoring");
    } else if (Number.isFinite(dbp) && dbp >= 80) {
      careGaps.push("Hypertension evaluation needed");
      orders.push("Repeat BP / home BP monitoring");
    }

    if (Number.isFinite(bmi) && bmi >= 30) {
      counseling.push("Obesity management counseling");
    }

    if (form.smoking === "Y") {
      counseling.push("Smoking cessation counseling");
    }

    if (preventRisk != null) {
      careGaps.push(`10-year PREVENT-ASCVD risk: ${preventRisk}% (${preventCategory.label})`);
    } else {
      careGaps.push(
        "Screening recommendations can be shown with partial inputs. Official AHA PREVENT risk requires complete base-model inputs within validated ranges."
      );
    }

    return { screenings, vaccines, counseling, careGaps, orders };
  }, [form, screeningErrors, preventRisk, preventCategory.label]);

  const reportData = useMemo(() => {
    const calculators = [];

    if (preventRisk != null || hasCompletePreventInputs(form)) {
      calculators.push({
        title: "PREVENT-ASCVD",
        lines: [
          `10-year risk: ${preventRisk != null ? `${preventRisk}% (${preventCategory.label})` : "Not calculated"}`,
          "Model: Official AHA PREVENT base model",
        ],
      });
    }

    const showStatinResult =
      form.ldl !== "" ||
      form.knownAscvd === "Y" ||
      form.veryHighRiskAscvd === "Y" ||
      form.diabetes === "Y" ||
      form.triglycerides !== "" ||
      form.apob !== "" ||
      form.lpa !== "" ||
      form.cac !== "";

    if (showStatinResult) {
      calculators.push({
        title: "Statin Pathway",
        lines: [
          `Pathway: ${statinPlan?.pathway || "Insufficient data"}`,
          `Recommendation: ${statinPlan?.recommendation || "Insufficient data"}`,
          `Goal: ${statinPlan?.goal || "Insufficient data"}`,
          `Risk enhancers: ${statinPlan?.enhancers?.length ? statinPlan.enhancers.join(", ") : "None noted"}`,
          `Notes: ${statinPlan?.notes?.length ? statinPlan.notes.join(", ") : "None"}`,
        ],
      });
    }

    const showChaResult =
      form.chaAge !== "" ||
      form.chaSex !== "" ||
      form.chaCHF === "Y" ||
      form.chaHTN === "Y" ||
      form.chaDM === "Y" ||
      form.chaStrokeTIA === "Y" ||
      form.chaVascular === "Y";

    if (showChaResult) {
      calculators.push({
        title: "CHA₂DS₂-VASc",
        lines: [
          `Score: ${chaScore.score}`,
          `Interpretation: ${chaScore.interpretation}`,
          ...(chaScore.items?.length ? [`Factors: ${chaScore.items.join(", ")}`] : []),
        ],
      });
    }

    const showWellsPeResult =
      form.wellsDvtSigns === "Y" ||
      form.wellsPeMostLikely === "Y" ||
      form.wellsHrOver100 === "Y" ||
      form.wellsRecentSurgeryImmobilization === "Y" ||
      form.wellsPriorDvtPe === "Y" ||
      form.wellsHemoptysis === "Y" ||
      form.wellsMalignancy === "Y";

    if (showWellsPeResult) {
      calculators.push({
        title: "Wells PE",
        lines: [
          `Score: ${wellsScore.score}`,
          `Interpretation: ${wellsScore.interpretation}`,
          ...(wellsScore.items?.length ? [`Criteria: ${wellsScore.items.join(", ")}`] : []),
        ],
      });
    }

    const showWellsDvtResult =
      form.dvtActiveCancer === "Y" ||
      form.dvtParalysisOrCast === "Y" ||
      form.dvtBedriddenOrSurgery === "Y" ||
      form.dvtLocalizedTenderness === "Y" ||
      form.dvtEntireLegSwollen === "Y" ||
      form.dvtCalfSwelling3cm === "Y" ||
      form.dvtPittingEdema === "Y" ||
      form.dvtCollateralVeins === "Y" ||
      form.dvtPriorDvt === "Y" ||
      form.dvtAlternativeDiagnosisLikely === "Y";

    if (showWellsDvtResult) {
      calculators.push({
        title: "Wells DVT",
        lines: [
          `Score: ${wellsDvtScore.score}`,
          `Interpretation: ${wellsDvtScore.interpretation}`,
          ...(wellsDvtScore.items?.length ? [`Criteria: ${wellsDvtScore.items.join(", ")}`] : []),
        ],
      });
    }

    const showHasBledResult =
      form.hasBledHypertension === "Y" ||
      form.hasBledRenal === "Y" ||
      form.hasBledLiver === "Y" ||
      form.hasBledStroke === "Y" ||
      form.hasBledBleeding === "Y" ||
      form.hasBledLabileInr === "Y" ||
      form.hasBledElderly === "Y" ||
      form.hasBledDrugs === "Y" ||
      form.hasBledAlcohol === "Y";

    if (showHasBledResult) {
      calculators.push({
        title: "HAS-BLED",
        lines: [
          `Score: ${hasBledScore.score}`,
          `Interpretation: ${hasBledScore.interpretation}`,
          ...(hasBledScore.items?.length ? [`Factors: ${hasBledScore.items.join(", ")}`] : []),
        ],
      });
    }

    const showPhq9Result = [
      form.phq9_1,
      form.phq9_2,
      form.phq9_3,
      form.phq9_4,
      form.phq9_5,
      form.phq9_6,
      form.phq9_7,
      form.phq9_8,
      form.phq9_9,
    ].some((v) => v !== "0");

    if (showPhq9Result) {
      calculators.push({
        title: "PHQ-9",
        lines: [
          `Score: ${phq9Score.score}`,
          `Severity: ${phq9Score.severity}`,
          `Item 9: ${phq9Score.positiveSuicideItem ? "Positive response present" : "No positive response"}`,
        ],
      });
    }

    return {
      calculators,
      screenings: derived.screenings,
      vaccines: derived.vaccines,
      counseling: derived.counseling,
      careGaps: derived.careGaps,
      orders: derived.orders,
    };
  }, [
    form,
    preventRisk,
    preventCategory.label,
    statinPlan,
    chaScore,
    wellsScore,
    wellsDvtScore,
    hasBledScore,
    phq9Score,
    derived,
  ]);

  const patientSummary = useMemo(() => {
    if (Object.keys(screeningErrors).length > 0) {
      return {
        intro: "Your preventive health summary is not ready yet because some basic entries need to be corrected.",
        steps: ["Please correct the highlighted fields before reviewing recommendations."],
      };
    }

    const steps = [];

    if (derived.screenings.length > 0) derived.screenings.forEach((item) => steps.push(`Screening: ${item}`));
    if (derived.vaccines.length > 0) {
      derived.vaccines.forEach((item) =>
        steps.push(
          form.vaccineMode === "current"
            ? `Vaccine to review now: ${item}`
            : `Vaccine/history review: ${item}`
        )
      );
    }
    if (derived.counseling.length > 0) derived.counseling.forEach((item) => steps.push(`Counseling: ${item}`));
    if (derived.careGaps.length > 0) derived.careGaps.forEach((item) => steps.push(`Care gap: ${item}`));
    if (derived.orders.length > 0) derived.orders.forEach((item) => steps.push(`Suggested action: ${item}`));
    if (statinPlan?.recommendation) steps.push(`Statin pathway recommendation: ${statinPlan.recommendation}`);

    const intro =
      preventRisk != null
        ? `Estimated 10-year PREVENT-ASCVD risk: ${preventRisk}% (${preventCategory.label}).`
        : "PREVENT-ASCVD risk is not calculated yet because more data is needed or one or more values are outside official validated ranges.";

    return { intro, steps };
  }, [screeningErrors, derived, statinPlan, preventRisk, preventCategory.label, form.vaccineMode]);

  const copyText = useMemo(() => {
    const lines = [];

    lines.push("Preventive Health Decision Tool Summary");
    lines.push(`Version: ${APP_VERSION}`);
    lines.push(`Last reviewed: ${APP_LAST_REVIEWED}`);
    lines.push(`Risk engine: ${RISK_ENGINE_LABEL}`);
    lines.push("");

    if (reportData.calculators.length > 0) {
      lines.push("Calculators");
      reportData.calculators.forEach((calc) => {
        lines.push(`- ${calc.title}`);
        calc.lines.forEach((line) => lines.push(`  - ${line}`));
      });
      lines.push("");
    }

    if (reportData.screenings.length > 0) {
      lines.push("Screenings");
      reportData.screenings.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (reportData.vaccines.length > 0) {
      lines.push("Vaccines");
      lines.push(
        `- View mode: ${
          form.vaccineMode === "current"
            ? "Minus childhood vaccines"
            : "Include childhood vaccines"
        }`
      );
      reportData.vaccines.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (reportData.counseling.length > 0) {
      lines.push("Counseling");
      reportData.counseling.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (reportData.careGaps.length > 0) {
      lines.push("Care Gaps");
      reportData.careGaps.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (reportData.orders.length > 0) {
      lines.push("Suggested Orders / Actions");
      reportData.orders.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    lines.push("Patient-Friendly Summary");
    lines.push(patientSummary.intro);
    patientSummary.steps.forEach((item) => lines.push(`- ${item}`));

    return lines.join("\n");
  }, [reportData, form.vaccineMode, patientSummary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("Results copied.");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Copy failed. Select the text below and copy manually.");
    }
  };

  const basicError = (name) =>
    screeningErrors[name] || additionalErrors[name] || preventRangeErrors[name];

  const riskBadge = getRiskBadgeStyle(preventCategory.label);

  const vaccineOptionFields = [
    ["priorVaccineHistoryKnown", "Prior vaccine history known"],
    ["evidenceOfImmunityMMR", "Evidence of immunity: MMR"],
    ["evidenceOfImmunityVaricella", "Evidence of immunity: Varicella"],
    ["pregnant", "Pregnant"],
    ["immunocompromised", "Immunocompromised"],
    ["chronicLiverDisease", "Chronic liver disease"],
    ["chronicKidneyDisease", "Chronic kidney disease"],
    ["chronicHeartDisease", "Chronic heart disease"],
    ["chronicLungDisease", "Chronic lung disease"],
    ["asplenia", "Asplenia"],
    ["cochlearImplant", "Cochlear implant"],
    ["csfLeak", "CSF leak"],
    ["healthcareWorker", "Healthcare worker"],
    ["collegeDormResident", "College dorm resident"],
    ["military", "Military"],
    ["travelRisk", "Travel risk"],
    ["residenceRisk", "Residence risk"],
  ];

  const phqQuestions = [
    ["phq9_1", "Little interest or pleasure in doing things"],
    ["phq9_2", "Feeling down, depressed, or hopeless"],
    ["phq9_3", "Trouble falling or staying asleep, or sleeping too much"],
    ["phq9_4", "Feeling tired or having little energy"],
    ["phq9_5", "Poor appetite or overeating"],
    ["phq9_6", "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"],
    ["phq9_7", "Trouble concentrating on things"],
    ["phq9_8", "Moving or speaking slowly, or being fidgety/restless"],
    ["phq9_9", "Thoughts that you would be better off dead or of hurting yourself"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top left, rgba(97,168,255,0.14), transparent 28%),
          radial-gradient(circle at top right, rgba(13,122,110,0.12), transparent 24%),
          linear-gradient(180deg, ${COLORS.pageBg} 0%, #eef6ff 45%, #f8fbfe 100%)
        `,
        padding: "24px 16px 32px",
        fontFamily:
          '"Avenir Next", "Segoe UI", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
        color: COLORS.text,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }

        input:focus, select:focus, textarea:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(11,92,171,0.12) !important;
        }

        button:hover { transform: translateY(-1px); }
        button:active { transform: translateY(0); }

        .app-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
          gap: 18px;
          align-items: start;
        }

        .input-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(120px, 1fr));
          gap: 16px;
        }

        .input-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 16px;
        }

        .input-grid-vax {
          display: grid;
          grid-template-columns: repeat(4, minmax(180px, 1fr));
          gap: 16px;
        }

        .results-rail {
          display: grid;
          gap: 18px;
          position: sticky;
          top: 16px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
          align-items: end;
        }

        .collapsible-content {
          overflow: hidden;
        }

        @media (max-width: 1180px) {
          .app-main-grid {
            grid-template-columns: 1fr;
          }

          .results-rail {
            position: static;
          }

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .input-grid-4,
          .input-grid-vax {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
          }
        }

        @media (max-width: 760px) {
          .input-grid-4,
          .input-grid-3,
          .input-grid-vax {
            grid-template-columns: 1fr;
          }
        }

        @page {
          size: auto;
          margin: 10mm;
        }

        @media print {
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .print-shell {
            max-width: none !important;
            margin: 0 !important;
          }

          .app-main-grid {
            display: block !important;
          }

          .results-rail {
            position: static !important;
            display: block !important;
          }

          .print-card {
            box-shadow: none !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
            border-radius: 10px !important;
            border: 1px solid #d6dee8 !important;
            background: #fff !important;
            margin: 0 0 10px 0 !important;
            padding: 12px !important;
          }

          .print-report-stack {
            display: block !important;
            gap: 0 !important;
          }

          .print-report-stack > div {
            margin-bottom: 8px !important;
          }

          .print-title {
            font-size: 22px !important;
          }

          .print-subtle {
            font-size: 11px !important;
            color: #334155 !important;
          }
        }
      `}</style>

      <div className="print-shell" style={{ maxWidth: "1380px", margin: "0 auto" }}>
        <div
          className="print-card"
          style={{
            background: `linear-gradient(135deg, ${COLORS.shell} 0%, ${COLORS.shell2} 100%)`,
            color: "#fff",
            borderRadius: "24px",
            padding: "28px",
            marginBottom: "18px",
            boxShadow: "0 24px 50px rgba(12,31,56,0.26)",
          }}
        >
          <div className="hero-grid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 800,
                }}
              >
                Clinical Decision Support
              </div>

              <div className="print-title" style={{ fontSize: "34px", fontWeight: 900, marginTop: "14px", letterSpacing: "-0.03em" }}>
                Preventive Health Decision Tool
              </div>

              <div style={{ marginTop: "10px", fontSize: "15px", opacity: 0.9, lineHeight: 1.55, maxWidth: "760px" }}>
                Integrated prevention, cardiovascular risk, thromboembolic scoring, bleeding-risk support,
                vaccination review, and PHQ-9 screening in one streamlined workflow.
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <div className="print-subtle" style={{ fontSize: "11px", opacity: 0.74, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Build Metadata
              </div>
              <div style={{ marginTop: "10px", display: "grid", gap: "8px", fontSize: "13px" }}>
                <div><strong>Version:</strong> {APP_VERSION}</div>
                <div><strong>Reviewed:</strong> {APP_LAST_REVIEWED}</div>
                <div><strong>Engine:</strong> {RISK_ENGINE_LABEL}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button type="button" onClick={handleReset} style={buttonStyle("default")}>Reset Form</button>
          <button type="button" onClick={handlePrint} style={buttonStyle("primary")}>Print / Export Summary</button>
          <button type="button" onClick={handleCopy} style={buttonStyle("accent")}>Copy Results</button>
          <button type="button" onClick={focusPreventInputs} style={buttonStyle("default")}>Focus PREVENT Inputs</button>
          {copyStatus && (
            <span style={{ alignSelf: "center", fontSize: "13px", color: COLORS.primary, fontWeight: 800 }}>
              {copyStatus}
            </span>
          )}
        </div>

        <div className="app-main-grid">
          <div className="no-print" style={cardStyle()}>
            <div style={{ fontSize: "19px", fontWeight: 900, color: COLORS.heading, marginBottom: "16px", letterSpacing: "-0.02em" }}>
              Patient Inputs
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <CollapsibleSection
                sectionKey="preventInputs"
                title="PREVENT Score Inputs"
                subtitle="Required for official AHA PREVENT risk calculation."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background={COLORS.cardSoft}
              >
                <div className="input-grid-4">
                  {[
                    ["age", "Age"],
                    ["sbp", "Systolic BP"],
                    ["dbp", "Diastolic BP"],
                    ["bmi", "BMI"],
                    ["egfr", "eGFR"],
                    ["totalChol", "Total cholesterol"],
                    ["hdl", "HDL cholesterol"],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label style={labelStyle()}>{label}</label>
                      <input
                        type="number"
                        min="0"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        style={fieldStyle(!!basicError(name))}
                      />
                      {basicError(name) && <div style={errorStyle()}>{basicError(name)}</div>}
                    </div>
                  ))}

                  <div>
                    <label style={labelStyle()}>Sex</label>
                    <select name="sex" value={form.sex} onChange={handleChange} style={fieldStyle(!!basicError("sex"))}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {basicError("sex") && <div style={errorStyle()}>{basicError("sex")}</div>}
                  </div>

                  <div>
                    <label style={labelStyle()}>Smoking</label>
                    <select name="smoking" value={form.smoking} onChange={handleChange} style={fieldStyle(!!basicError("smoking"))}>
                      <option value="">Select</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                    {basicError("smoking") && <div style={errorStyle()}>{basicError("smoking")}</div>}
                  </div>

                  <div>
                    <label style={labelStyle()}>Pack-years</label>
                    <input
                      type="number"
                      min="0"
                      name="packYears"
                      value={form.packYears}
                      onChange={handleChange}
                      disabled={form.smoking !== "Y"}
                      style={{
                        ...fieldStyle(!!basicError("packYears")),
                        background: form.smoking !== "Y" ? "#f2f6fa" : "#fff",
                      }}
                    />
                    {basicError("packYears") && <div style={errorStyle()}>{basicError("packYears")}</div>}
                  </div>

                  <div>
                    <label style={labelStyle()}>Diabetes</label>
                    <select name="diabetes" value={form.diabetes} onChange={handleChange} style={fieldStyle(false)}>
                      <option value="">Select</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>BP treatment</label>
                    <select name="bpTreated" value={form.bpTreated} onChange={handleChange} style={fieldStyle(false)}>
                      <option value="">Select</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Lipid-lowering therapy</label>
                    <select name="lipidLowering" value={form.lipidLowering} onChange={handleChange} style={fieldStyle(false)}>
                      <option value="">Select</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="statinInputs"
                title="Statin Pathway Inputs"
                subtitle="Used for lipid treatment direction and risk-enhancer interpretation."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background={COLORS.cardMute}
              >
                <div className="input-grid-4">
                  {[
                    ["ldl", "LDL-C"],
                    ["nonHdl", "Non-HDL-C"],
                    ["triglycerides", "Triglycerides"],
                    ["apob", "ApoB"],
                    ["lpa", "Lp(a)"],
                    ["cac", "CAC"],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label style={labelStyle()}>{label}</label>
                      <input
                        type="number"
                        min="0"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        style={fieldStyle(!!basicError(name))}
                      />
                      {basicError(name) && <div style={errorStyle()}>{basicError(name)}</div>}
                    </div>
                  ))}

                  <YesNoField name="knownAscvd" label="Known ASCVD" value={form.knownAscvd} onChange={handleChange} />
                  <YesNoField name="veryHighRiskAscvd" label="Very-high-risk ASCVD" value={form.veryHighRiskAscvd} onChange={handleChange} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="immunizationInputs"
                title="Immunization Inputs"
                subtitle="Toggle between cumulative vaccine history and current-age vaccine needs."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#f7fbfb"
              >
                <div className="input-grid-vax">
                  <div>
                    <label style={labelStyle()}>Vaccine view</label>
                    <select name="vaccineMode" value={form.vaccineMode} onChange={handleChange} style={wideFieldStyle(false)}>
                      <option value="cumulative">Include childhood vaccines</option>
                      <option value="current">Minus childhood vaccines</option>
                    </select>
                  </div>

                  {vaccineOptionFields.map(([name, label]) => (
                    <YesNoField key={name} name={name} label={label} value={form[name]} onChange={handleChange} />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="chaInputs"
                title="CHA₂DS₂-VASc Inputs"
                subtitle="Stroke-risk scoring input fields for atrial fibrillation."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#fffdf7"
              >
                <div className="input-grid-3">
                  <div>
                    <label style={labelStyle()}>Age</label>
                    <input
                      type="number"
                      min="0"
                      name="chaAge"
                      value={form.chaAge}
                      onChange={handleChange}
                      style={wideFieldStyle(false)}
                    />
                  </div>

                  <div>
                    <label style={labelStyle()}>Sex</label>
                    <select name="chaSex" value={form.chaSex} onChange={handleChange} style={wideFieldStyle(false)}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <YesNoField name="chaCHF" label="CHF / LV dysfunction" value={form.chaCHF} onChange={handleChange} />
                  <YesNoField name="chaHTN" label="Hypertension" value={form.chaHTN} onChange={handleChange} />
                  <YesNoField name="chaDM" label="Diabetes mellitus" value={form.chaDM} onChange={handleChange} />
                  <YesNoField name="chaStrokeTIA" label="Stroke / TIA / thromboembolism" value={form.chaStrokeTIA} onChange={handleChange} />
                  <YesNoField name="chaVascular" label="Vascular disease" value={form.chaVascular} onChange={handleChange} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="wellsPeInputs"
                title="Wells PE Inputs"
                subtitle="Pretest probability scoring inputs for pulmonary embolism."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#fff9f8"
              >
                <div className="input-grid-3">
                  <YesNoField name="wellsDvtSigns" label="Clinical signs of DVT" value={form.wellsDvtSigns} onChange={handleChange} />
                  <YesNoField name="wellsPeMostLikely" label="PE more likely than alternative diagnosis" value={form.wellsPeMostLikely} onChange={handleChange} />
                  <YesNoField name="wellsHrOver100" label="Heart rate >100" value={form.wellsHrOver100} onChange={handleChange} />
                  <YesNoField name="wellsRecentSurgeryImmobilization" label="Recent surgery / immobilization" value={form.wellsRecentSurgeryImmobilization} onChange={handleChange} />
                  <YesNoField name="wellsPriorDvtPe" label="Prior DVT or PE" value={form.wellsPriorDvtPe} onChange={handleChange} />
                  <YesNoField name="wellsHemoptysis" label="Hemoptysis" value={form.wellsHemoptysis} onChange={handleChange} />
                  <YesNoField name="wellsMalignancy" label="Malignancy" value={form.wellsMalignancy} onChange={handleChange} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="wellsDvtInputs"
                title="Wells DVT Inputs"
                subtitle="Pretest probability scoring inputs for lower-extremity DVT."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#fff8f5"
              >
                <div className="input-grid-3">
                  <YesNoField name="dvtActiveCancer" label="Active cancer" value={form.dvtActiveCancer} onChange={handleChange} />
                  <YesNoField name="dvtParalysisOrCast" label="Paralysis / paresis / recent leg cast" value={form.dvtParalysisOrCast} onChange={handleChange} />
                  <YesNoField name="dvtBedriddenOrSurgery" label="Bedridden >3 days or major surgery within 12 weeks" value={form.dvtBedriddenOrSurgery} onChange={handleChange} />
                  <YesNoField name="dvtLocalizedTenderness" label="Localized deep venous tenderness" value={form.dvtLocalizedTenderness} onChange={handleChange} />
                  <YesNoField name="dvtEntireLegSwollen" label="Entire leg swollen" value={form.dvtEntireLegSwollen} onChange={handleChange} />
                  <YesNoField name="dvtCalfSwelling3cm" label="Calf swelling >3 cm" value={form.dvtCalfSwelling3cm} onChange={handleChange} />
                  <YesNoField name="dvtPittingEdema" label="Pitting edema confined to symptomatic leg" value={form.dvtPittingEdema} onChange={handleChange} />
                  <YesNoField name="dvtCollateralVeins" label="Collateral superficial veins" value={form.dvtCollateralVeins} onChange={handleChange} />
                  <YesNoField name="dvtPriorDvt" label="Previously documented DVT" value={form.dvtPriorDvt} onChange={handleChange} />
                  <YesNoField name="dvtAlternativeDiagnosisLikely" label="Alternative diagnosis at least as likely as DVT" value={form.dvtAlternativeDiagnosisLikely} onChange={handleChange} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="hasBledInputs"
                title="HAS-BLED Inputs"
                subtitle="Bleeding-risk scoring inputs for anticoagulated atrial fibrillation patients."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#fff8f2"
              >
                <div className="input-grid-3">
                  <YesNoField name="hasBledHypertension" label="Hypertension (SBP >160)" value={form.hasBledHypertension} onChange={handleChange} />
                  <YesNoField name="hasBledRenal" label="Abnormal renal function" value={form.hasBledRenal} onChange={handleChange} />
                  <YesNoField name="hasBledLiver" label="Abnormal liver function" value={form.hasBledLiver} onChange={handleChange} />
                  <YesNoField name="hasBledStroke" label="Prior stroke" value={form.hasBledStroke} onChange={handleChange} />
                  <YesNoField name="hasBledBleeding" label="Bleeding history / predisposition" value={form.hasBledBleeding} onChange={handleChange} />
                  <YesNoField name="hasBledLabileInr" label="Labile INR" value={form.hasBledLabileInr} onChange={handleChange} />
                  <YesNoField name="hasBledElderly" label="Age >65" value={form.hasBledElderly} onChange={handleChange} />
                  <YesNoField name="hasBledDrugs" label="Drugs predisposing to bleeding" value={form.hasBledDrugs} onChange={handleChange} />
                  <YesNoField name="hasBledAlcohol" label="Alcohol excess" value={form.hasBledAlcohol} onChange={handleChange} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                sectionKey="phq9Inputs"
                title="PHQ-9 Inputs"
                subtitle="Depression symptom severity screening over the past 2 weeks."
                collapsedSections={collapsedSections}
                toggleSection={toggleSection}
                background="#f8f7ff"
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  {phqQuestions.map(([name, label]) => (
                    <div key={name}>
                      <label style={labelStyle()}>{label}</label>
                      <select name={name} value={form[name]} onChange={handleChange} style={wideFieldStyle(false)}>
                        <option value="0">Not at all</option>
                        <option value="1">Several days</option>
                        <option value="2">More than half the days</option>
                        <option value="3">Nearly every day</option>
                      </select>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </div>

          <div className="results-rail">
            <div className="no-print" style={{ ...cardStyle(), padding: "14px", textAlign: "left" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  ["prevent", "PREVENT Score"],
                  ["statin", "Statin Pathway"],
                  ["screenings", "Screenings"],
                  ["cha2ds2vasc", "CHA₂DS₂-VASc"],
                  ["wells", "Wells PE"],
                  ["wellsDvt", "Wells DVT"],
                  ["hasBled", "HAS-BLED"],
                  ["phq9", "PHQ-9"],
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveTab(key)} style={tabButtonStyle(activeTab === key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "prevent" && (
              <div className="no-print" style={{ ...cardStyle(COLORS.cardSoft), textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading }}>Risk Overview</div>
                  <span
                    style={{
                      ...riskBadge,
                      borderRadius: "999px",
                      padding: "8px 13px",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}
                  >
                    {preventCategory.label}
                  </span>
                </div>

                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {preventRisk != null ? `${preventRisk}%` : "—"}
                </div>

                <div style={{ marginTop: "10px", fontWeight: 800, color: COLORS.heading }}>
                  Official AHA PREVENT-ASCVD 10-Year Risk
                </div>

                <div style={{ marginTop: "8px", fontSize: "13px", color: COLORS.textSoft, lineHeight: 1.55 }}>
                  {preventRisk != null
                    ? `${preventCategory.label} risk (${preventCategory.range})`
                    : "Complete official base-model inputs within validated ranges are required to calculate PREVENT risk."}
                </div>
              </div>
            )}

            {activeTab === "statin" && (
              <div className="no-print" style={{ ...cardStyle(COLORS.primarySoft), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>
                  Statin Pathway
                </div>
                <div style={{ marginBottom: "8px" }}><strong>Pathway:</strong> {statinPlan?.pathway || "Insufficient data"}</div>
                <div style={{ marginBottom: "8px" }}><strong>Recommendation:</strong> {statinPlan?.recommendation || "Insufficient data"}</div>
                <div style={{ marginBottom: "8px" }}><strong>Goal:</strong> {statinPlan?.goal || "Insufficient data"}</div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Risk enhancers:</strong>{" "}
                  {statinPlan?.enhancers?.length ? statinPlan.enhancers.join(", ") : "None noted"}
                </div>
                <div><strong>Notes:</strong> {statinPlan?.notes?.length ? statinPlan.notes.join(", ") : "None"}</div>
              </div>
            )}

            {activeTab === "screenings" && (
              <>
                <div className="no-print" style={{ ...cardStyle(COLORS.accentSoft), textAlign: "left" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.accent, marginBottom: "10px" }}>
                    Patient-Friendly Summary
                  </div>
                  <p style={{ marginTop: 0, color: COLORS.text, lineHeight: 1.6 }}>{patientSummary.intro}</p>
                  <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                    {patientSummary.steps.map((item, i) => (
                      <li key={i} style={{ marginBottom: "6px" }}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="no-print" style={{ ...cardStyle(), textAlign: "left" }}>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "14px" }}>
                    Clinical Output
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                    {[
                      { title: "Screenings", items: derived.screenings, bg: COLORS.primarySoft },
                      { title: "Vaccines", items: derived.vaccines, bg: COLORS.successSoft },
                      { title: "Counseling", items: derived.counseling, bg: COLORS.lavenderSoft },
                      { title: "Care Gaps", items: derived.careGaps, bg: COLORS.warningSoft },
                    ].map((section) => (
                      <div
                        key={section.title}
                        style={{
                          background: section.bg,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: "14px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ fontSize: "15px", fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                          {section.title}
                        </div>
                        <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                          {section.items.length
                            ? section.items.map((item, i) => (
                                <li key={i} style={{ marginBottom: "6px" }}>{item}</li>
                              ))
                            : <li>None yet.</li>}
                        </ul>
                      </div>
                    ))}

                    <div
                      style={{
                        background: "#eef8f4",
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "14px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                        Suggested Orders / Actions
                      </div>
                      <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                        {derived.orders.length
                          ? derived.orders.map((item, i) => (
                              <li key={i} style={{ marginBottom: "6px" }}>{item}</li>
                            ))
                          : <li>No actions yet.</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "cha2ds2vasc" && (
              <div className="no-print" style={{ ...cardStyle("#fffdf7"), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                  CHA₂DS₂-VASc Score
                </div>
                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1 }}>
                  {chaScore.score}
                </div>
                <div style={{ marginTop: "8px", fontWeight: 800, color: COLORS.heading }}>
                  {chaScore.interpretation}
                </div>
                <ul style={{ paddingLeft: "20px", marginTop: "12px", marginBottom: 0 }}>
                  {chaScore.items.length ? chaScore.items.map((item, i) => <li key={i}>{item}</li>) : <li>No factors selected yet.</li>}
                </ul>
              </div>
            )}

            {activeTab === "wells" && (
              <div className="no-print" style={{ ...cardStyle("#fff8f8"), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                  Wells PE Score
                </div>
                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1 }}>
                  {wellsScore.score}
                </div>
                <div style={{ marginTop: "8px", fontWeight: 800, color: COLORS.heading }}>
                  {wellsScore.interpretation}
                </div>
                <ul style={{ paddingLeft: "20px", marginTop: "12px", marginBottom: 0 }}>
                  {wellsScore.items.length ? wellsScore.items.map((item, i) => <li key={i}>{item}</li>) : <li>No criteria selected yet.</li>}
                </ul>
              </div>
            )}

            {activeTab === "wellsDvt" && (
              <div className="no-print" style={{ ...cardStyle("#fff8f5"), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                  Wells DVT Score
                </div>
                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1 }}>
                  {wellsDvtScore.score}
                </div>
                <div style={{ marginTop: "8px", fontWeight: 800, color: COLORS.heading }}>
                  {wellsDvtScore.interpretation}
                </div>
                <ul style={{ paddingLeft: "20px", marginTop: "12px", marginBottom: 0 }}>
                  {wellsDvtScore.items.length ? wellsDvtScore.items.map((item, i) => <li key={i}>{item}</li>) : <li>No criteria selected yet.</li>}
                </ul>
              </div>
            )}

            {activeTab === "hasBled" && (
              <div className="no-print" style={{ ...cardStyle("#fff8f2"), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                  HAS-BLED Score
                </div>
                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1 }}>
                  {hasBledScore.score}
                </div>
                <div style={{ marginTop: "8px", fontWeight: 800, color: COLORS.heading }}>
                  {hasBledScore.interpretation}
                </div>
                <ul style={{ paddingLeft: "20px", marginTop: "12px", marginBottom: 0 }}>
                  {hasBledScore.items.length ? hasBledScore.items.map((item, i) => <li key={i}>{item}</li>) : <li>No factors selected yet.</li>}
                </ul>
              </div>
            )}

            {activeTab === "phq9" && (
              <div className="no-print" style={{ ...cardStyle("#f8f7ff"), textAlign: "left" }}>
                <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                  PHQ-9 Score
                </div>
                <div style={{ fontSize: "40px", fontWeight: 900, color: COLORS.primaryDark, lineHeight: 1 }}>
                  {phq9Score.score}
                </div>
                <div style={{ marginTop: "8px", fontWeight: 800, color: COLORS.heading }}>
                  {phq9Score.severity}
                </div>
                <div style={{ marginTop: "10px", fontSize: "13px", color: COLORS.text }}>
                  <strong>Item 9:</strong>{" "}
                  {phq9Score.positiveSuicideItem
                    ? "Positive response present — follow clinic suicide safety protocol."
                    : "No positive response on item 9."}
                </div>
              </div>
            )}

            <div className="print-card" style={{ ...cardStyle(), textAlign: "left" }}>
              <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "14px" }}>
                Printable Report
              </div>

              <div className="print-report-stack" style={{ display: "grid", gap: "12px" }}>
                {reportData.calculators.length > 0 && (
                  <div
                    style={{
                      background: COLORS.cardSoft,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Calculators
                    </div>
                    {reportData.calculators.map((calc) => (
                      <div key={calc.title} style={{ marginBottom: "10px" }}>
                        <div style={{ fontWeight: 800 }}>{calc.title}</div>
                        <ul style={{ paddingLeft: "20px", margin: "6px 0 0 0" }}>
                          {calc.lines.map((line, idx) => (
                            <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {reportData.screenings.length > 0 && (
                  <div
                    style={{
                      background: COLORS.primarySoft,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Screenings
                    </div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {reportData.screenings.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reportData.vaccines.length > 0 && (
                  <div
                    style={{
                      background: COLORS.successSoft,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Vaccines
                    </div>
                    <div style={{ marginBottom: "8px", fontSize: "13px", color: COLORS.textSoft }}>
                      View mode:{" "}
                      {form.vaccineMode === "current"
                        ? "Minus childhood vaccines"
                        : "Include childhood vaccines"}
                    </div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {reportData.vaccines.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reportData.counseling.length > 0 && (
                  <div
                    style={{
                      background: COLORS.lavenderSoft,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Counseling
                    </div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {reportData.counseling.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reportData.careGaps.length > 0 && (
                  <div
                    style={{
                      background: COLORS.warningSoft,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Care Gaps
                    </div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {reportData.careGaps.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reportData.orders.length > 0 && (
                  <div
                    style={{
                      background: "#eef8f4",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>
                      Suggested Orders / Actions
                    </div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {reportData.orders.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reportData.calculators.length === 0 &&
                  reportData.screenings.length === 0 &&
                  reportData.vaccines.length === 0 &&
                  reportData.counseling.length === 0 &&
                  reportData.careGaps.length === 0 &&
                  reportData.orders.length === 0 && (
                    <div style={{ color: COLORS.textSoft, fontSize: "13px" }}>
                      Results will appear here for copying and printing once inputs are entered.
                    </div>
                  )}
              </div>
            </div>

            <div className="no-print" style={{ ...cardStyle(), textAlign: "left" }}>
              <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>
                Copy / Paste Text
              </div>
              <textarea
                readOnly
                value={copyText}
                style={{
                  width: "100%",
                  minHeight: "220px",
                  padding: "14px",
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.border}`,
                  boxSizing: "border-box",
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: "13px",
                  background: "#f8fafc",
                  color: COLORS.text,
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="print-card"
          style={{
            marginTop: "22px",
            padding: "18px",
            background: "linear-gradient(180deg, #0c1f38, #112846)",
            color: "#e6edf3",
            borderRadius: "18px",
            border: "1px solid #1d3d63",
            fontSize: "13px",
            lineHeight: "1.6",
            boxShadow: "0 14px 32px rgba(12,31,56,0.18)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: "8px", color: "#7dd3fc", letterSpacing: "0.02em" }}>
            Clinical Disclaimer
          </div>

          <div>
            This tool is intended for <strong>educational and informational purposes only</strong> and does not replace
            clinical judgment, professional medical advice, diagnosis, or treatment.
          </div>

          <div style={{ marginTop: "6px" }}>
            Clinicians should independently verify all recommendations and consult official guidelines prior to making patient care decisions.
          </div>

          <div style={{ marginTop: "6px" }}>
            No patient-specific medical decisions should be made solely based on this tool.
          </div>

          <div style={{ marginTop: "6px" }}>
            Recommendations reflect guideline logic last reviewed on {APP_LAST_REVIEWED} and may change as guidance is updated.
          </div>

          <div style={{ marginTop: "6px" }}>
            This application does not store, transmit, or retain any patient data. All inputs are processed locally within the browser session.
          </div>

          <div style={{ marginTop: "10px", fontSize: "11px", color: "#a7bbcf" }}>
            © {new Date().getFullYear()} Daniel Bevington. All rights reserved. Version {APP_VERSION} | Last reviewed: {APP_LAST_REVIEWED}
          </div>
        </div>
      </div>
    </div>
  );
}
