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
  bg: "#f4f8fc",
  bg2: "#edf5ff",
  shell: "#0d223d",
  shell2: "#17406c",
  card: "#ffffff",
  cardSoft: "#f8fbff",
  border: "#d9e4ef",
  borderStrong: "#bfd0e2",
  text: "#13263c",
  textSoft: "#62758b",
  heading: "#0c2037",
  primary: "#0b5cab",
  primaryDark: "#083b72",
  primarySoft: "#eaf3ff",
  accent: "#0f766e",
  accentSoft: "#ecfdf8",
  warning: "#9a6708",
  warningSoft: "#fff8e8",
  danger: "#b42318",
  dangerSoft: "#fff4f3",
  success: "#166534",
  successSoft: "#eefcf3",
  lavenderSoft: "#f7f5ff",
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

function formatPatientSnapshot(form, risk, riskLabel) {
  const bits = [];
  if (form.age) bits.push(`${form.age} y/o`);
  if (form.sex) bits.push(form.sex === "female" ? "female" : "male");
  if (form.smoking === "Y") bits.push("smoker");
  else if (form.smoking === "N") bits.push("non-smoker");
  if (form.sbp && form.dbp) bits.push(`BP ${form.sbp}/${form.dbp}`);
  if (form.bmi) bits.push(`BMI ${form.bmi}`);
  if (risk != null) bits.push(`PREVENT ${risk}% ${riskLabel.toLowerCase()}`);
  return bits.length ? bits.join(" • ") : "Enter core inputs to generate a patient snapshot.";
}

function getPriorityPlan(derived, statinPlan, phq9Score) {
  const items = [];
  derived.orders.forEach((x) => addUnique(items, x));
  if (derived.counseling.includes("Smoking cessation counseling")) addUnique(items, "Offer smoking cessation counseling");
  if (
    statinPlan?.recommendation &&
    statinPlan.recommendation !== "Lifestyle optimization" &&
    statinPlan.recommendation !== "Need complete PREVENT inputs"
  ) {
    addUnique(items, statinPlan.recommendation);
  }
  if (phq9Score.positiveSuicideItem) addUnique(items, "Follow clinic suicide safety protocol");
  return items.slice(0, 6);
}

function getRiskBadgeStyle(label) {
  if (label === "High") return { background: COLORS.dangerSoft, color: COLORS.danger, border: "1px solid #f0c0bb" };
  if (label === "Intermediate" || label === "Borderline") return { background: COLORS.warningSoft, color: COLORS.warning, border: "1px solid #efd8a3" };
  if (label === "Low") return { background: COLORS.successSoft, color: COLORS.success, border: "1px solid #bde7c8" };
  return { background: COLORS.primarySoft, color: COLORS.primaryDark, border: "1px solid #c9dbef" };
}

function Stat({ label, value, tone = "default" }) {
  const bgMap = {
    default: COLORS.cardSoft,
    primary: COLORS.primarySoft,
    success: COLORS.successSoft,
    warning: COLORS.warningSoft,
    danger: COLORS.dangerSoft,
  };

  return (
    <div
      style={{
        background: bgMap[tone] || bgMap.default,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "16px",
        padding: "14px",
      }}
    >
      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.textSoft, fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ marginTop: "8px", fontSize: "22px", fontWeight: 900, color: COLORS.heading, lineHeight: 1.05 }}>
        {value}
      </div>
    </div>
  );
}

function Field({ name, label, value, onChange, error, min = "0", disabled = false, step }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "11px 12px",
          minHeight: "44px",
          borderRadius: "12px",
          border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
          background: disabled ? "#f3f6f9" : "#fff",
          boxSizing: "border-box",
          fontSize: "13px",
          color: COLORS.text,
          boxShadow: error ? "0 0 0 4px rgba(180,35,24,0.08)" : "0 1px 2px rgba(15,23,42,0.04)",
          outline: "none",
        }}
      />
      {error && <div style={{ color: COLORS.danger, fontSize: "12px", marginTop: "6px", fontWeight: 700 }}>{error}</div>}
    </div>
  );
}

function SelectField({ name, label, value, onChange, options, error }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "11px 12px",
          minHeight: "44px",
          borderRadius: "12px",
          border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
          background: "#fff",
          boxSizing: "border-box",
          fontSize: "13px",
          color: COLORS.text,
          outline: "none",
        }}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div style={{ color: COLORS.danger, fontSize: "12px", marginTop: "6px", fontWeight: 700 }}>{error}</div>}
    </div>
  );
}

function PillToggle({ name, label, value, onChange }) {
  const setValue = (next) => onChange({ target: { name, value: next } });

  const pillStyle = (active) => ({
    flex: 1,
    minWidth: 0,
    padding: "9px 10px",
    borderRadius: "999px",
    border: `1px solid ${active ? COLORS.primaryDark : COLORS.border}`,
    background: active ? COLORS.primarySoft : "#fff",
    color: active ? COLORS.primaryDark : COLORS.textSoft,
    fontWeight: 800,
    fontSize: "12px",
    cursor: "pointer",
  });

  return (
    <div>
      <div
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "4px",
          borderRadius: "999px",
          background: "#f4f8fc",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <button type="button" style={pillStyle(value === "Y")} onClick={() => setValue("Y")}>
          Yes
        </button>
        <button type="button" style={pillStyle(value === "N")} onClick={() => setValue("N")}>
          No
        </button>
      </div>
    </div>
  );
}

function ModeToggle({ name, label, value, onChange }) {
  const setValue = (next) => onChange({ target: { name, value: next } });

  const pillStyle = (active) => ({
    flex: 1,
    minWidth: 0,
    padding: "9px 10px",
    borderRadius: "999px",
    border: `1px solid ${active ? COLORS.primaryDark : COLORS.border}`,
    background: active ? COLORS.primarySoft : "#fff",
    color: active ? COLORS.primaryDark : COLORS.textSoft,
    fontWeight: 800,
    fontSize: "12px",
    cursor: "pointer",
    lineHeight: 1.2,
  });

  return (
    <div>
      <div
        style={{
          display: "block",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "4px",
          borderRadius: "999px",
          background: "#f4f8fc",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <button type="button" style={pillStyle(value === "cumulative")} onClick={() => setValue("cumulative")}>
          Include childhood vaccines
        </button>
        <button type="button" style={pillStyle(value === "current")} onClick={() => setValue("current")}>
          Minus childhood vaccines
        </button>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 900, color: COLORS.heading }}>{title}</div>
          <div style={{ fontSize: "12px", color: COLORS.textSoft, marginTop: "4px", lineHeight: 1.45 }}>{subtitle}</div>
        </div>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            background: COLORS.primarySoft,
            color: COLORS.primaryDark,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 160ms ease",
          }}
        >
          ⌃
        </div>
      </button>

      {open && <div style={{ marginTop: "16px" }}>{children}</div>}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [copyStatus, setCopyStatus] = useState("");
  const [activeSummaryTab, setActiveSummaryTab] = useState("plan");

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
    setActiveSummaryTab("plan");
  };

  const handlePrint = () => window.print();

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

    if (form.sex === "female" && age >= 21 && age <= 65) screenings.push("Cervical cancer screening");

    if (form.sex === "male" && age >= 65 && age <= 75 && form.smoking === "Y") {
      screenings.push("AAA one-time screening");
      orders.push("Abdominal ultrasound");
    }

    if (age >= 50 && age <= 80 && form.smoking === "Y" && Number.isFinite(packYears) && packYears >= 20) {
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

    if ((Number.isFinite(sbp) && sbp >= 130) || (Number.isFinite(dbp) && dbp >= 80)) {
      careGaps.push("Hypertension evaluation needed");
      orders.push("Repeat BP / home BP monitoring");
    }

    if (Number.isFinite(bmi) && bmi >= 30) counseling.push("Obesity management counseling");
    if (form.smoking === "Y") counseling.push("Smoking cessation counseling");

    if (preventRisk != null) {
      careGaps.push(`10-year PREVENT-ASCVD risk: ${preventRisk}% (${preventCategory.label})`);
    } else {
      careGaps.push("Screening recommendations can be shown with partial inputs. Official AHA PREVENT risk requires complete base-model inputs within validated ranges.");
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
          `Pathway: ${statinPlan.pathway}`,
          `Recommendation: ${statinPlan.recommendation}`,
          `Goal: ${statinPlan.goal}`,
          `Risk enhancers: ${statinPlan.enhancers.length ? statinPlan.enhancers.join(", ") : "None noted"}`,
          `Notes: ${statinPlan.notes.length ? statinPlan.notes.join(", ") : "None"}`,
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
          ...(chaScore.items.length ? [`Factors: ${chaScore.items.join(", ")}`] : []),
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
          ...(wellsScore.items.length ? [`Criteria: ${wellsScore.items.join(", ")}`] : []),
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
          ...(wellsDvtScore.items.length ? [`Criteria: ${wellsDvtScore.items.join(", ")}`] : []),
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
          ...(hasBledScore.items.length ? [`Factors: ${hasBledScore.items.join(", ")}`] : []),
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
  }, [form, preventRisk, preventCategory.label, statinPlan, chaScore, wellsScore, wellsDvtScore, hasBledScore, phq9Score, derived]);

  const patientSummary = useMemo(() => {
    if (Object.keys(screeningErrors).length > 0) {
      return {
        intro: "Your preventive health summary is not ready yet because some basic entries need to be corrected.",
        steps: ["Please correct the highlighted fields before reviewing recommendations."],
      };
    }

    const steps = [];
    derived.screenings.forEach((item) => steps.push(`Screening: ${item}`));
    derived.vaccines.forEach((item) =>
      steps.push(form.vaccineMode === "current" ? `Vaccine to review now: ${item}` : `Vaccine/history review: ${item}`)
    );
    derived.counseling.forEach((item) => steps.push(`Counseling: ${item}`));
    derived.careGaps.forEach((item) => steps.push(`Care gap: ${item}`));
    derived.orders.forEach((item) => steps.push(`Suggested action: ${item}`));
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
      lines.push(`- View mode: ${form.vaccineMode === "current" ? "Minus childhood vaccines" : "Include childhood vaccines"}`);
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
      setCopyStatus("Copy failed. Select and copy manually.");
    }
  };

  const basicError = (name) => screeningErrors[name] || additionalErrors[name] || preventRangeErrors[name];
  const riskBadge = getRiskBadgeStyle(preventCategory.label);
  const patientSnapshot = formatPatientSnapshot(form, preventRisk, preventCategory.label);
  const todayPlan = getPriorityPlan(derived, statinPlan, phq9Score);

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
    ["phq9_6", "Feeling bad about yourself or that you are a failure"],
    ["phq9_7", "Trouble concentrating on things"],
    ["phq9_8", "Moving or speaking slowly, or being fidgety/restless"],
    ["phq9_9", "Thoughts you would be better off dead or of hurting yourself"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top left, rgba(97,168,255,0.14), transparent 28%),
          radial-gradient(circle at top right, rgba(13,122,110,0.12), transparent 24%),
          linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bg2} 45%, #f8fbfe 100%)
        `,
        padding: "24px 16px 32px",
        fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
        color: COLORS.text,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }

        input:focus, select:focus, textarea:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 4px rgba(11,92,171,0.12) !important;
        }

        @page {
          size: auto;
          margin: 10mm;
        }

        .app-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
          gap: 20px;
          align-items: start;
        }

        .core-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(120px, 1fr));
          gap: 16px;
        }

        .adv-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(140px, 1fr));
          gap: 16px;
        }

        .adv-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 16px;
        }

        .summary-rail {
          display: grid;
          gap: 18px;
          position: sticky;
          top: 16px;
          z-index: 1;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 18px;
          align-items: end;
        }

        @media (max-width: 1180px) {
          .app-grid {
            grid-template-columns: 1fr;
          }

          .summary-rail {
            position: static;
          }

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .core-grid,
          .adv-grid-4 {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
          }
        }

        @media (max-width: 760px) {
          .core-grid,
          .adv-grid-4,
          .adv-grid-3 {
            grid-template-columns: 1fr;
          }
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

          .app-grid {
            display: block !important;
          }

          .summary-rail {
            position: static !important;
            display: block !important;
          }

          .print-card {
            background: #fff !important;
            box-shadow: none !important;
            border: 1px solid #d6dee8 !important;
            border-radius: 10px !important;
            margin: 0 0 10px 0 !important;
            padding: 12px !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
          }

          .print-only-summary {
            display: block !important;
          }

          .screen-only {
            display: none !important;
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

              <div style={{ fontSize: "34px", fontWeight: 900, marginTop: "14px", letterSpacing: "-0.03em" }}>
                Preventive Health Decision Tool
              </div>

              <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.9, lineHeight: 1.55, maxWidth: "760px" }}>
                {patientSnapshot}
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
              <div style={{ fontSize: "11px", opacity: 0.74, textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
          {copyStatus && <span style={{ alignSelf: "center", fontSize: "13px", color: COLORS.primary, fontWeight: 800 }}>{copyStatus}</span>}
        </div>

        <div className="print-only-summary" style={{ display: "none" }}>
          <div className="print-card">
            <div style={{ fontSize: "20px", fontWeight: 900, color: COLORS.heading }}>Clinical Summary</div>
            <div style={{ marginTop: "10px", fontSize: "13px", color: COLORS.textSoft }}>{patientSnapshot}</div>
            <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
              <div><strong>PREVENT:</strong> {preventRisk != null ? `${preventRisk}% (${preventCategory.label})` : "Not calculated"}</div>
              <div><strong>Statin pathway:</strong> {statinPlan.recommendation}</div>
              {todayPlan.length > 0 && <div><strong>Today's plan:</strong> {todayPlan.join(", ")}</div>}
              {derived.screenings.length > 0 && <div><strong>Screenings:</strong> {derived.screenings.join(", ")}</div>}
              {derived.vaccines.length > 0 && <div><strong>Vaccines:</strong> {derived.vaccines.join(", ")}</div>}
              {derived.orders.length > 0 && <div><strong>Suggested actions:</strong> {derived.orders.join(", ")}</div>}
            </div>
          </div>
        </div>

        <div className="app-grid">
          <div className="screen-only" style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                ...cardStyle(),
                marginBottom: "18px",
                background: `linear-gradient(180deg, #ffffff 0%, ${COLORS.cardSoft} 100%)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start", marginBottom: "14px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: COLORS.heading, letterSpacing: "-0.02em" }}>
                    Core Inputs First
                  </div>
                  <div style={{ fontSize: "13px", color: COLORS.textSoft, marginTop: "4px", lineHeight: 1.5 }}>
                    Start here to generate the official PREVENT score and the highest-priority prevention guidance.
                  </div>
                </div>

                <div
                  style={{
                    ...riskBadge,
                    borderRadius: "999px",
                    padding: "9px 13px",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  {preventCategory.label}
                </div>
              </div>

              <div className="core-grid">
                <Field name="age" label="Age" value={form.age} onChange={handleChange} error={basicError("age")} />
                <SelectField
                  name="sex"
                  label="Sex"
                  value={form.sex}
                  onChange={handleChange}
                  error={basicError("sex")}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
                <Field name="sbp" label="Systolic BP" value={form.sbp} onChange={handleChange} error={basicError("sbp")} />
                <Field name="dbp" label="Diastolic BP" value={form.dbp} onChange={handleChange} error={basicError("dbp")} />
                <Field name="bmi" label="BMI" value={form.bmi} onChange={handleChange} error={basicError("bmi")} step="0.1" />
                <Field name="egfr" label="eGFR" value={form.egfr} onChange={handleChange} error={basicError("egfr")} />
                <Field name="totalChol" label="Total cholesterol" value={form.totalChol} onChange={handleChange} error={basicError("totalChol")} />
                <Field name="hdl" label="HDL cholesterol" value={form.hdl} onChange={handleChange} error={basicError("hdl")} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: "16px", marginTop: "16px" }}>
                <PillToggle name="smoking" label="Smoking" value={form.smoking} onChange={handleChange} />
                <PillToggle name="diabetes" label="Diabetes" value={form.diabetes} onChange={handleChange} />
                <PillToggle name="bpTreated" label="BP treatment" value={form.bpTreated} onChange={handleChange} />
                <PillToggle name="lipidLowering" label="Lipid-lowering therapy" value={form.lipidLowering} onChange={handleChange} />
              </div>

              {form.smoking === "Y" && (
                <div style={{ marginTop: "16px", maxWidth: "220px" }}>
                  <Field name="packYears" label="Pack-years" value={form.packYears} onChange={handleChange} error={basicError("packYears")} />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <Panel
                title="Statin Details"
                subtitle="Lipid treatment direction and risk-enhancer interpretation."
                defaultOpen={false}
              >
                <div className="adv-grid-4">
                  <Field name="ldl" label="LDL-C" value={form.ldl} onChange={handleChange} error={basicError("ldl")} />
                  <Field name="nonHdl" label="Non-HDL-C" value={form.nonHdl} onChange={handleChange} error={basicError("nonHdl")} />
                  <Field name="triglycerides" label="Triglycerides" value={form.triglycerides} onChange={handleChange} error={basicError("triglycerides")} />
                  <Field name="apob" label="ApoB" value={form.apob} onChange={handleChange} error={basicError("apob")} />
                  <Field name="lpa" label="Lp(a)" value={form.lpa} onChange={handleChange} error={basicError("lpa")} />
                  <Field name="cac" label="CAC" value={form.cac} onChange={handleChange} error={basicError("cac")} />
                  <PillToggle name="knownAscvd" label="Known ASCVD" value={form.knownAscvd} onChange={handleChange} />
                  {form.knownAscvd === "Y" && (
                    <PillToggle name="veryHighRiskAscvd" label="Very-high-risk ASCVD" value={form.veryHighRiskAscvd} onChange={handleChange} />
                  )}
                </div>
              </Panel>

              <div style={{ position: "relative", zIndex: 30 }}>
                <Panel
                  title="Immunizations"
                  subtitle="Current-age vaccine review and cumulative history logic."
                  defaultOpen={false}
                >
                  <div className="adv-grid-4">
                    <ModeToggle
                      name="vaccineMode"
                      label="Vaccine view"
                      value={form.vaccineMode}
                      onChange={handleChange}
                    />

                    {vaccineOptionFields.map(([name, label]) => {
                      if (name === "pregnant" && form.sex !== "female") return null;
                      return <PillToggle key={name} name={name} label={label} value={form[name]} onChange={handleChange} />;
                    })}
                  </div>
                </Panel>
              </div>

              <Panel
                title="Additional Calculators"
                subtitle="Stroke, thromboembolic, bleeding-risk, and PHQ-9 tools."
                defaultOpen={false}
              >
                <div style={{ display: "grid", gap: "18px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>CHA₂DS₂-VASc</div>
                    <div className="adv-grid-3">
                      <Field name="chaAge" label="Age" value={form.chaAge} onChange={handleChange} />
                      <SelectField
                        name="chaSex"
                        label="Sex"
                        value={form.chaSex}
                        onChange={handleChange}
                        options={[
                          { value: "male", label: "Male" },
                          { value: "female", label: "Female" },
                        ]}
                      />
                      <PillToggle name="chaCHF" label="CHF / LV dysfunction" value={form.chaCHF} onChange={handleChange} />
                      <PillToggle name="chaHTN" label="Hypertension" value={form.chaHTN} onChange={handleChange} />
                      <PillToggle name="chaDM" label="Diabetes mellitus" value={form.chaDM} onChange={handleChange} />
                      <PillToggle name="chaStrokeTIA" label="Stroke / TIA / thromboembolism" value={form.chaStrokeTIA} onChange={handleChange} />
                      <PillToggle name="chaVascular" label="Vascular disease" value={form.chaVascular} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>Wells PE</div>
                    <div className="adv-grid-3">
                      <PillToggle name="wellsDvtSigns" label="Clinical signs of DVT" value={form.wellsDvtSigns} onChange={handleChange} />
                      <PillToggle name="wellsPeMostLikely" label="PE more likely than alternative diagnosis" value={form.wellsPeMostLikely} onChange={handleChange} />
                      <PillToggle name="wellsHrOver100" label="Heart rate >100" value={form.wellsHrOver100} onChange={handleChange} />
                      <PillToggle name="wellsRecentSurgeryImmobilization" label="Recent surgery / immobilization" value={form.wellsRecentSurgeryImmobilization} onChange={handleChange} />
                      <PillToggle name="wellsPriorDvtPe" label="Prior DVT or PE" value={form.wellsPriorDvtPe} onChange={handleChange} />
                      <PillToggle name="wellsHemoptysis" label="Hemoptysis" value={form.wellsHemoptysis} onChange={handleChange} />
                      <PillToggle name="wellsMalignancy" label="Malignancy" value={form.wellsMalignancy} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>Wells DVT</div>
                    <div className="adv-grid-3">
                      <PillToggle name="dvtActiveCancer" label="Active cancer" value={form.dvtActiveCancer} onChange={handleChange} />
                      <PillToggle name="dvtParalysisOrCast" label="Paralysis / cast" value={form.dvtParalysisOrCast} onChange={handleChange} />
                      <PillToggle name="dvtBedriddenOrSurgery" label="Bedridden / surgery" value={form.dvtBedriddenOrSurgery} onChange={handleChange} />
                      <PillToggle name="dvtLocalizedTenderness" label="Localized tenderness" value={form.dvtLocalizedTenderness} onChange={handleChange} />
                      <PillToggle name="dvtEntireLegSwollen" label="Entire leg swollen" value={form.dvtEntireLegSwollen} onChange={handleChange} />
                      <PillToggle name="dvtCalfSwelling3cm" label="Calf swelling >3 cm" value={form.dvtCalfSwelling3cm} onChange={handleChange} />
                      <PillToggle name="dvtPittingEdema" label="Pitting edema" value={form.dvtPittingEdema} onChange={handleChange} />
                      <PillToggle name="dvtCollateralVeins" label="Collateral superficial veins" value={form.dvtCollateralVeins} onChange={handleChange} />
                      <PillToggle name="dvtPriorDvt" label="Prior DVT" value={form.dvtPriorDvt} onChange={handleChange} />
                      <PillToggle name="dvtAlternativeDiagnosisLikely" label="Alternative diagnosis likely" value={form.dvtAlternativeDiagnosisLikely} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>HAS-BLED</div>
                    <div className="adv-grid-3">
                      <PillToggle name="hasBledHypertension" label="Hypertension" value={form.hasBledHypertension} onChange={handleChange} />
                      <PillToggle name="hasBledRenal" label="Abnormal renal function" value={form.hasBledRenal} onChange={handleChange} />
                      <PillToggle name="hasBledLiver" label="Abnormal liver function" value={form.hasBledLiver} onChange={handleChange} />
                      <PillToggle name="hasBledStroke" label="Prior stroke" value={form.hasBledStroke} onChange={handleChange} />
                      <PillToggle name="hasBledBleeding" label="Bleeding history" value={form.hasBledBleeding} onChange={handleChange} />
                      <PillToggle name="hasBledLabileInr" label="Labile INR" value={form.hasBledLabileInr} onChange={handleChange} />
                      <PillToggle name="hasBledElderly" label="Age >65" value={form.hasBledElderly} onChange={handleChange} />
                      <PillToggle name="hasBledDrugs" label="Drugs predisposing to bleeding" value={form.hasBledDrugs} onChange={handleChange} />
                      <PillToggle name="hasBledAlcohol" label="Alcohol excess" value={form.hasBledAlcohol} onChange={handleChange} />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>PHQ-9</div>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {phqQuestions.map(([name, label]) => (
                        <SelectField
                          key={name}
                          name={name}
                          label={label}
                          value={form[name]}
                          onChange={handleChange}
                          options={[
                            { value: "0", label: "Not at all" },
                            { value: "1", label: "Several days" },
                            { value: "2", label: "More than half the days" },
                            { value: "3", label: "Nearly every day" },
                          ]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="summary-rail">
            <div className="print-card" style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading }}>Clinical Summary</div>
                  <div style={{ marginTop: "4px", fontSize: "12px", color: COLORS.textSoft }}>Highest-priority risk and action guidance.</div>
                </div>
                <span
                  style={{
                    ...riskBadge,
                    borderRadius: "999px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  {preventCategory.label}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Stat
                  label="PREVENT Risk"
                  value={preventRisk != null ? `${preventRisk}%` : "—"}
                  tone={
                    preventCategory.label === "High"
                      ? "danger"
                      : preventCategory.label === "Intermediate" || preventCategory.label === "Borderline"
                        ? "warning"
                        : "primary"
                  }
                />
                <Stat label="Statin Pathway" value={statinPlan.pathway} tone="primary" />
                <Stat label="PHQ-9" value={`${phq9Score.score} • ${phq9Score.severity}`} tone={phq9Score.score >= 10 ? "warning" : "default"} />
                <Stat label="Vaccines Listed" value={String(derived.vaccines.length)} tone="success" />
              </div>

              <div style={{ marginTop: "14px", padding: "14px", borderRadius: "16px", background: COLORS.primarySoft, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.primaryDark, fontWeight: 800 }}>
                  Recommendation
                </div>
                <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: 800, color: COLORS.heading, lineHeight: 1.4 }}>
                  {statinPlan.recommendation}
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: COLORS.textSoft }}>
                  Goal: {statinPlan.goal}
                </div>
              </div>
            </div>

            <div className="print-card" style={cardStyle()}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                {[
                  ["plan", "Today's Plan"],
                  ["screenings", "Screenings"],
                  ["vaccines", "Vaccines"],
                  ["calculators", "Extra Calculators"],
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveSummaryTab(key)} style={tabButtonStyle(activeSummaryTab === key)}>
                    {label}
                  </button>
                ))}
              </div>

              {activeSummaryTab === "plan" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Today's Plan</div>
                  <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    {todayPlan.length
                      ? todayPlan.map((item, i) => (
                          <li key={i} style={{ marginBottom: "8px" }}>
                            {item}
                          </li>
                        ))
                      : <li>No prioritized actions yet.</li>}
                  </ul>
                </div>
              )}

              {activeSummaryTab === "screenings" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Screenings Due / Relevant</div>
                  <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    {derived.screenings.length
                      ? derived.screenings.map((item, i) => (
                          <li key={i} style={{ marginBottom: "8px" }}>
                            {item}
                          </li>
                        ))
                      : <li>No screening items yet.</li>}
                  </ul>
                </div>
              )}

              {activeSummaryTab === "vaccines" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Vaccine Review</div>
                  <div style={{ marginBottom: "8px", fontSize: "12px", color: COLORS.textSoft }}>
                    View mode: {form.vaccineMode === "current" ? "Minus childhood vaccines" : "Include childhood vaccines"}
                  </div>
                  <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    {derived.vaccines.length
                      ? derived.vaccines.map((item, i) => (
                          <li key={i} style={{ marginBottom: "8px" }}>
                            {item}
                          </li>
                        ))
                      : <li>No vaccine items yet.</li>}
                  </ul>
                </div>
              )}

              {activeSummaryTab === "calculators" && (
                <div style={{ display: "grid", gap: "12px" }}>
                  {reportData.calculators.length
                    ? reportData.calculators.map((calc) => (
                        <div key={calc.title} style={{ border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "14px", background: COLORS.cardSoft }}>
                          <div style={{ fontWeight: 900, color: COLORS.heading }}>{calc.title}</div>
                          <ul style={{ paddingLeft: "20px", margin: "8px 0 0 0" }}>
                            {calc.lines.map((line, idx) => (
                              <li key={idx} style={{ marginBottom: "6px" }}>
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    : <div style={{ color: COLORS.textSoft }}>Additional calculator outputs will appear here.</div>}
                </div>
              )}
            </div>

            <div className="print-card" style={cardStyle()}>
              <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Patient-Friendly Summary</div>
              <p style={{ marginTop: 0, color: COLORS.text, lineHeight: 1.6 }}>{patientSummary.intro}</p>
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {patientSummary.steps.slice(0, 12).map((item, i) => (
                  <li key={i} style={{ marginBottom: "7px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="print-card" style={cardStyle()}>
              <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "12px" }}>Printable Report</div>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  ["Care Gaps", derived.careGaps, COLORS.warningSoft],
                  ["Counseling", derived.counseling, COLORS.lavenderSoft],
                  ["Suggested Orders / Actions", derived.orders, COLORS.successSoft],
                ].map(([title, items, bg]) => (
                  <div key={title} style={{ background: bg, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "14px" }}>
                    <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "8px" }}>{title}</div>
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {items.length
                        ? items.map((item, i) => (
                            <li key={i} style={{ marginBottom: "6px" }}>
                              {item}
                            </li>
                          ))
                        : <li>None.</li>}
                    </ul>
                  </div>
                ))}
              </div>
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
            This tool is intended for <strong>educational and informational purposes only</strong> and does not replace clinical judgment, professional medical advice, diagnosis, or treatment.
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
