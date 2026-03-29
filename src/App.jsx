import { useMemo, useState } from "react";

const APP_VERSION = "v3.3.0";
const APP_LAST_REVIEWED = "2026-03-28";
const RISK_ENGINE_LABEL = "Official AHA PREVENT 10-Year ASCVD Base Model";

const INITIAL_FORM = {
  visitType: "awv",
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
  nonHdl: "",
  ldl: "",
  triglycerides: "",
  packYears: "",
  chronicLiverDisease: "",
  immunocompromised: "",
  priorVaccineHistoryKnown: "",
  evidenceOfImmunityMMR: "",
  evidenceOfImmunityVaricella: "",
  knownAscvd: "",
  veryHighRiskAscvd: "",
  apob: "",
  lpa: "",
  cac: "",
  needsADLReview: "",
  needsFallReview: "",
  needsCognitiveReview: "",
  needsAdvanceCarePlanning: "",
  alcoholRisk: "",
  drugUseRisk: "",
  anxietyConcern: "",
  depressionConcern: "",
  sleepConcern: "",
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
  "nonHdl",
  "ldl",
  "triglycerides",
  "packYears",
  "apob",
  "lpa",
  "cac",
]);

const PREVENT_REQUIRED_FIELDS = [
  ["age", "Age"],
  ["sex", "Sex"],
  ["sbp", "Systolic BP"],
  ["bmi", "BMI"],
  ["egfr", "eGFR"],
  ["smoking", "Smoking"],
  ["diabetes", "Diabetes"],
  ["bpTreated", "BP treatment"],
  ["lipidLowering", "Lipid-lowering therapy"],
  ["totalChol", "Total cholesterol"],
  ["hdl", "HDL cholesterol"],
];

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

function addRec(list, text, strength, action) {
  if (!list.some((item) => item.text === text)) list.push({ text, strength, action });
}

function cardStyle(background = COLORS.card) {
  return {
    background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
  };
}

function buttonStyle(kind = "default") {
  const base = {
    padding: "11px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "13px",
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

  return {
    ...base,
    border: `1px solid ${COLORS.borderStrong}`,
    background: "#fff",
    color: COLORS.text,
  };
}

function tabButtonStyle(active) {
  return {
    padding: "10px 14px",
    borderRadius: "999px",
    border: `1px solid ${active ? COLORS.primaryDark : COLORS.border}`,
    background: active ? `linear-gradient(180deg, ${COLORS.primarySoft}, #ffffff)` : "rgba(255,255,255,0.88)",
    color: active ? COLORS.primaryDark : COLORS.text,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "13px",
    textAlign: "left",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };
}

function calcPreventAscvd({ age, sex, sbp, bpTx, totalC, hdlC, statin, dm, smoking, egfr, bmi }) {
  if (!age || !sbp || !totalC || !hdlC || !egfr || !bmi || !["female", "male"].includes(sex)) return null;

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
  if (r == null) return { label: "Not calculated" };
  if (r < 3) return { label: "Low" };
  if (r < 5) return { label: "Borderline" };
  if (r < 10) return { label: "Intermediate" };
  return { label: "High" };
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
    recommendation = preventRisk >= 7.5 ? "High-intensity statin is reasonable" : "At least moderate-intensity statin";
    goal = "Usually LDL-C <70 mg/dL if higher risk";
  } else if (preventRisk == null) {
    recommendation = "Need complete PREVENT inputs";
    goal = "Pending risk calculation";
  } else if (preventRisk >= 10) {
    recommendation = "Moderate- to high-intensity statin is reasonable";
    goal = "Risk-based LDL-C reduction";
  } else if (preventRisk >= 5) {
    recommendation = "Shared decision-making for statin initiation";
    goal = "Risk-based LDL-C reduction";
  }

  if (ldl >= 160) enhancers.push("LDL-C >=160 mg/dL");
  if (tg >= 175) enhancers.push("Triglycerides >=175 mg/dL");
  if (apob >= 130) enhancers.push("ApoB >=130 mg/dL");
  if (lpa >= 50) enhancers.push("Lp(a) elevated");
  if (cac > 0) enhancers.push(`CAC present (${cac})`);
  if (cac === 0) notes.push("CAC = 0 may support deferring statin in selected primary-prevention cases.");
  if (cac >= 100) notes.push("CAC supports stronger statin consideration.");

  return { pathway, recommendation, goal, enhancers, notes };
}

function validatePreventInputs(form) {
  const errors = {};
  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const bmi = parseNum(form.bmi);
  const egfr = parseNum(form.egfr);
  const totalChol = parseNum(form.totalChol);
  const hdl = parseNum(form.hdl);

  if (form.age !== "" && (!Number.isFinite(age) || age < 30 || age > 79)) errors.age = "For official PREVENT, age must be 30-79.";
  if (form.sbp !== "" && (!Number.isFinite(sbp) || sbp < 90 || sbp > 200)) errors.sbp = "For official PREVENT, SBP must be 90-200.";
  if (form.bmi !== "" && (!Number.isFinite(bmi) || bmi < 18.5 || bmi > 39.9)) errors.bmi = "For official PREVENT, BMI must be 18.5-39.9.";
  if (form.egfr !== "" && (!Number.isFinite(egfr) || egfr <= 0)) errors.egfr = "eGFR must be >0.";
  if (form.totalChol !== "" && (!Number.isFinite(totalChol) || totalChol < 130 || totalChol > 320)) errors.totalChol = "For official PREVENT, total cholesterol must be 130-320.";
  if (form.hdl !== "" && (!Number.isFinite(hdl) || hdl < 20 || hdl > 100)) errors.hdl = "For official PREVENT, HDL must be 20-100.";
  if (Number.isFinite(totalChol) && Number.isFinite(hdl) && hdl >= totalChol) errors.hdl = "HDL must be lower than total cholesterol.";
  return errors;
}

function getMissingPreventItems(form) {
  const missing = [];
  const checks = {
    age: form.age !== "",
    sex: ["male", "female"].includes(form.sex),
    sbp: form.sbp !== "",
    bmi: form.bmi !== "",
    egfr: form.egfr !== "",
    smoking: ["Y", "N"].includes(form.smoking),
    diabetes: ["Y", "N"].includes(form.diabetes),
    bpTreated: ["Y", "N"].includes(form.bpTreated),
    lipidLowering: ["Y", "N"].includes(form.lipidLowering),
    totalChol: form.totalChol !== "",
    hdl: form.hdl !== "",
  };

  PREVENT_REQUIRED_FIELDS.forEach(([key, label]) => {
    if (!checks[key]) missing.push(label);
  });

  return missing;
}

function buildCareGaps(form) {
  const age = parseNum(form.age) ?? 0;
  const bmi = parseNum(form.bmi);
  const packYears = parseNum(form.packYears);
  const screenings = [];
  const vaccines = [];
  const counseling = [];
  const meds = [];
  const behavioral = [];

  if (age >= 45 && age <= 75) screenings.push("Colorectal cancer screening");
  if (form.sex === "female" && age >= 50 && age <= 74) screenings.push("Breast cancer screening");
  if (form.sex === "female" && age >= 21 && age <= 65) screenings.push("Cervical cancer screening");
  if (form.sex === "male" && age >= 65 && age <= 75 && form.smoking === "Y") screenings.push("AAA one-time screening");
  if (age >= 50 && age <= 80 && form.smoking === "Y" && Number.isFinite(packYears) && packYears >= 20) screenings.push("Annual low-dose CT lung screening");
  if (age >= 18) {
    screenings.push("Depression screening");
    screenings.push("HIV screening");
    screenings.push("Hepatitis C screening");
  }
  if (age < 65) screenings.push("Anxiety screening");
  screenings.push("Unhealthy alcohol use counseling if indicated");
  screenings.push("Unhealthy drug use screening if indicated");

  if (form.depressionConcern !== "N") behavioral.push("Depression symptom review / PHQ-based follow-up");
  if (form.anxietyConcern !== "N" && age < 65) behavioral.push("Anxiety symptom review / GAD-based follow-up");
  if (form.alcoholRisk !== "N") behavioral.push("Alcohol use assessment and brief intervention");
  if (form.drugUseRisk !== "N") behavioral.push("Substance use assessment and risk-reduction counseling");
  if (form.sleepConcern !== "N") behavioral.push("Sleep concern review and contributing factor assessment");

  if (age >= 19) vaccines.push("COVID-19 vaccine review");
  if (age >= 0.5) vaccines.push("Annual influenza vaccine");
  if (age >= 50 || form.immunocompromised === "Y") vaccines.push("Recombinant zoster (RZV)");
  if (age >= 65) vaccines.push("Age/risk-based pneumococcal review");
  if (form.priorVaccineHistoryKnown !== "Y") vaccines.push("Reconcile vaccine registry / outside records");
  if (form.evidenceOfImmunityMMR !== "Y" && age >= 19) vaccines.push("MMR immunity review");
  if (form.evidenceOfImmunityVaricella !== "Y" && age >= 19) vaccines.push("Varicella immunity review");

  if (Number.isFinite(bmi) && bmi >= 30) counseling.push("Weight management / nutrition counseling");
  if (form.smoking === "Y") counseling.push("Smoking cessation counseling");
  counseling.push("Exercise and diet review");

  if (form.knownAscvd === "Y") meds.push("Secondary prevention lipid review");

  return { screenings, vaccines, counseling, meds, behavioral };
}

function buildAwvChecklist(form) {
  const checklist = [];
  checklist.push("Health risk assessment reviewed");
  checklist.push("Medication list reconciled");
  checklist.push("Problem list updated");
  checklist.push("Preventive screening schedule updated");
  if (form.needsCognitiveReview !== "N") checklist.push("Cognitive review performed or documented");
  if (form.needsFallReview !== "N") checklist.push("Fall risk review completed");
  if (form.needsADLReview !== "N") checklist.push("ADL / IADL functional review completed");
  if (form.needsAdvanceCarePlanning !== "N") checklist.push("Advance care planning offered / reviewed");
  checklist.push("Personalized prevention plan documented");
  return checklist;
}

function buildActionPlan({ form, preventRisk, statinPlan, careGaps, missingPreventItems, preventErrors }) {
  const dueNow = [];
  const consider = [];
  const discuss = [];

  if (Object.keys(preventErrors).length > 0) addRec(dueNow, "Correct highlighted PREVENT fields.", "Recommended", "review");
  if (missingPreventItems.length > 0) addRec(dueNow, `Complete missing PREVENT items: ${missingPreventItems.join(", ")}.`, "Recommended", "review");

  careGaps.screenings.forEach((x) => addRec(dueNow, x, "Recommended", "order"));
  careGaps.vaccines.slice(0, 5).forEach((x) => addRec(consider, x, "Recommended", "review"));
  careGaps.counseling.forEach((x) => addRec(discuss, x, "Recommended", "counsel"));
  careGaps.meds.forEach((x) => addRec(discuss, x, "Recommended", "review"));
  careGaps.behavioral.forEach((x) => addRec(dueNow, x, "Recommended", "screen"));

  if (statinPlan.recommendation && statinPlan.recommendation !== "Lifestyle optimization" && statinPlan.recommendation !== "Need complete PREVENT inputs") {
    if (preventRisk != null && preventRisk >= 10) addRec(dueNow, statinPlan.recommendation, "Reasonable", "prescribe");
    else addRec(discuss, statinPlan.recommendation, "Shared decision-making", "discuss");
  }

  if (form.visitType === "awv") addRec(dueNow, "Finalize written preventive screening schedule.", "Recommended", "document");
  if (form.smoking === "Y") addRec(dueNow, "Offer cessation medication and quit support.", "Recommended", "counsel");
  if (preventRisk != null && preventRisk < 5) addRec(discuss, "Reinforce lifestyle prevention and periodic reassessment.", "Recommended", "counsel");
  if (statinPlan.enhancers.length > 0) addRec(consider, `Risk enhancers present: ${statinPlan.enhancers.join(", ")}.`, "Reasonable", "review");

  return { dueNow, consider, discuss };
}

function renderRecommendation(rec) {
  return `${rec.action.toUpperCase()} • ${rec.strength}: ${rec.text}`;
}

function formatPatientSnapshot(form, risk, riskLabel) {
  const bits = [];
  if (form.visitType === "awv") bits.push("Medicare-style AWV workflow");
  if (form.visitType === "adult_prevention") bits.push("Adult prevention visit");
  if (form.visitType === "chronic_followup") bits.push("Chronic follow-up prevention review");
  if (form.age) bits.push(`${form.age} y/o`);
  if (form.sex) bits.push(form.sex === "female" ? "female" : "male");
  if (form.sbp && form.dbp) bits.push(`BP ${form.sbp}/${form.dbp}`);
  if (form.bmi) bits.push(`BMI ${form.bmi}`);
  if (risk != null) bits.push(`PREVENT ${risk}% ${riskLabel.toLowerCase()}`);
  return bits.join(" • ");
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

function Field({ name, label, value, onChange, error, unit, requiredForPrevent = false, step }) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>{label}</span>
        <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
          {unit && <span style={{ color: COLORS.textSoft, fontWeight: 700 }}>{unit}</span>}
          {requiredForPrevent && <span style={{ color: COLORS.primaryDark, background: COLORS.primarySoft, borderRadius: "999px", padding: "2px 6px" }}>PREVENT</span>}
        </span>
      </label>
      <input
        type="number"
        step={step}
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
      />
      {error && <div style={{ color: COLORS.danger, fontSize: "12px", marginTop: "6px", fontWeight: 700 }}>{error}</div>}
    </div>
  );
}

function SelectField({ name, label, value, onChange, options, error, requiredForPrevent = false }) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>{label}</span>
        {requiredForPrevent && <span style={{ color: COLORS.primaryDark, background: COLORS.primarySoft, borderRadius: "999px", padding: "2px 6px" }}>PREVENT</span>}
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

function PillToggle({ name, label, value, onChange, requiredForPrevent = false }) {
  const setValue = (next) => onChange({ target: { name, value: next } });
  const pillStyle = (active) => ({
    flex: 1,
    minWidth: 0,
    padding: "9px 8px",
    borderRadius: "999px",
    border: `1px solid ${active ? COLORS.primaryDark : COLORS.border}`,
    background: active ? COLORS.primarySoft : "#fff",
    color: active ? COLORS.primaryDark : COLORS.textSoft,
    fontWeight: 800,
    fontSize: "11px",
    cursor: "pointer",
    textAlign: "center",
  });

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          fontSize: "10px",
          fontWeight: 800,
          marginBottom: "6px",
          color: COLORS.heading,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span>{label}</span>
        {requiredForPrevent && <span style={{ color: COLORS.primaryDark, background: COLORS.primarySoft, borderRadius: "999px", padding: "2px 6px" }}>PREVENT</span>}
      </div>
      <div style={{ display: "flex", gap: "6px", padding: "4px", borderRadius: "999px", background: "#f4f8fc", border: `1px solid ${COLORS.border}` }}>
        <button type="button" style={pillStyle(value === "Y")} onClick={() => setValue("Y")}>Yes</button>
        <button type="button" style={pillStyle(value === "N")} onClick={() => setValue("N")}>No</button>
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [copyStatus, setCopyStatus] = useState("");
  const [activeSummaryTab, setActiveSummaryTab] = useState("careGaps");

  const preventErrors = useMemo(() => validatePreventInputs(form), [form]);
  const missingPreventItems = useMemo(() => getMissingPreventItems(form), [form]);
  const canCalculatePrevent = missingPreventItems.length === 0 && Object.keys(preventErrors).length === 0;

  const handleChange = (e) => {
    const { name } = e.target;
    const value = sanitizeNonNegativeInput(name, e.target.value);
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "totalChol" && next.hdl !== "" && value !== "") {
        const total = Number(value);
        const hdl = Number(next.hdl);
        if (Number.isFinite(total) && Number.isFinite(hdl) && total > hdl) next.nonHdl = String(total - hdl);
      }
      if (name === "hdl" && next.totalChol !== "" && value !== "") {
        const total = Number(next.totalChol);
        const hdl = Number(value);
        if (Number.isFinite(total) && Number.isFinite(hdl) && total > hdl) next.nonHdl = String(total - hdl);
      }
      return next;
    });
    setCopyStatus("");
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setActiveSummaryTab("careGaps");
    setCopyStatus("");
  };

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
  const careGaps = useMemo(() => buildCareGaps(form), [form]);
  const awvChecklist = useMemo(() => buildAwvChecklist(form), [form]);
  const actionPlan = useMemo(
    () => buildActionPlan({ form, preventRisk, statinPlan, careGaps, missingPreventItems, preventErrors }),
    [form, preventRisk, statinPlan, careGaps, missingPreventItems, preventErrors]
  );

  const patientSnapshot = formatPatientSnapshot(form, preventRisk, preventCategory.label);

  const copyText = useMemo(() => {
    const lines = [];
    lines.push("Preventive Health Decision Tool Summary");
    lines.push(`Version: ${APP_VERSION}`);
    lines.push(`Reviewed: ${APP_LAST_REVIEWED}`);
    lines.push("");
    lines.push("Risk");
    lines.push(`- PREVENT: ${preventRisk != null ? `${preventRisk}% (${preventCategory.label})` : "Not calculated"}`);
    lines.push(`- Statin pathway: ${statinPlan.recommendation}`);
    lines.push("");
    lines.push("Care Gaps");
    careGaps.screenings.forEach((item) => lines.push(`- Screening: ${item}`));
    careGaps.vaccines.forEach((item) => lines.push(`- Vaccine: ${item}`));
    careGaps.counseling.forEach((item) => lines.push(`- Counseling: ${item}`));
    careGaps.behavioral.forEach((item) => lines.push(`- Behavioral health: ${item}`));
    lines.push("");
    lines.push("Action Plan");
    actionPlan.dueNow.forEach((item) => lines.push(`- Due now: ${renderRecommendation(item)}`));
    actionPlan.consider.forEach((item) => lines.push(`- Consider: ${renderRecommendation(item)}`));
    actionPlan.discuss.forEach((item) => lines.push(`- Discuss: ${renderRecommendation(item)}`));
    if (form.visitType === "awv") {
      lines.push("");
      lines.push("AWV Checklist");
      awvChecklist.forEach((item) => lines.push(`- ${item}`));
    }
    return lines.join("\n");
  }, [preventRisk, preventCategory.label, statinPlan.recommendation, careGaps, actionPlan, awvChecklist, form.visitType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("Results copied.");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Copy failed.");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bg2} 45%, #f8fbfe 100%)`,
        padding: "24px 16px 32px",
        fontFamily: '"Avenir Next", "Segoe UI", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif',
        color: COLORS.text,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .summary-left, .summary-left * { text-align: left; }
        .summary-left ul { padding-left: 20px; margin: 0; list-style-position: outside; }
        .summary-left li { line-height: 1.5; }
        .app-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr); gap: 20px; align-items: start; }
        .core-grid { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 16px; }
        .summary-rail { display: grid; gap: 18px; position: sticky; top: 16px; }
        .hero-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 18px; align-items: end; }
        @media (max-width: 1180px) {
          .app-grid, .hero-grid { grid-template-columns: 1fr; }
          .summary-rail { position: static; }
          .core-grid { grid-template-columns: repeat(2, minmax(160px, 1fr)); }
        }
        @media (max-width: 760px) {
          .core-grid { grid-template-columns: 1fr; }
        }
        @media print {
          .no-print, .screen-only { display: none !important; }
          .print-only-summary { display: block !important; }
          .app-grid { display: block !important; }
          .print-card {
            background: #fff !important;
            box-shadow: none !important;
            border: 1px solid #d6dee8 !important;
            border-radius: 10px !important;
            margin: 0 0 10px 0 !important;
            padding: 12px !important;
            break-inside: avoid-page;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
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
              <div style={{ display: "inline-flex", padding: "7px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
                Primary Care Workflow
              </div>
              <div style={{ fontSize: "34px", fontWeight: 900, marginTop: "14px", letterSpacing: "-0.03em" }}>
                Preventive Health Decision Tool
              </div>
              <div style={{ marginTop: "10px", fontSize: "14px", opacity: 0.9, lineHeight: 1.55, maxWidth: "760px" }}>
                {patientSnapshot || "Choose a visit type and enter core prevention data to build a primary-care action plan."}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "18px", padding: "16px" }}>
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
          <button type="button" onClick={handleReset} style={buttonStyle()}>Reset Form</button>
          <button type="button" onClick={handlePrint} style={buttonStyle("primary")}>Print / Export Summary</button>
          <button type="button" onClick={handleCopy} style={buttonStyle()}>Copy Results</button>
          {copyStatus && <span style={{ alignSelf: "center", fontSize: "13px", color: COLORS.primary, fontWeight: 800 }}>{copyStatus}</span>}
        </div>

        <div className="print-only-summary" style={{ display: "none" }}>
          <div className="print-card summary-left" style={cardStyle()}>
            <div style={{ fontSize: "20px", fontWeight: 900, color: COLORS.heading }}>Primary Care Summary</div>
            <div style={{ marginTop: "10px", fontSize: "13px", color: COLORS.textSoft }}>{patientSnapshot}</div>
            <div style={{ marginTop: "14px", display: "grid", gap: "14px" }}>
              <div>
                <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "6px" }}>Risk</div>
                <ul>
                  <li>PREVENT: {preventRisk != null ? `${preventRisk}% (${preventCategory.label})` : "Not calculated"}</li>
                  <li>Statin pathway: {statinPlan.recommendation}</li>
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "6px" }}>Care Gaps</div>
                <ul>
                  {careGaps.screenings.map((item, i) => <li key={`sg-${i}`}>Screening: {item}</li>)}
                  {careGaps.vaccines.map((item, i) => <li key={`vg-${i}`}>Vaccine: {item}</li>)}
                  {careGaps.counseling.map((item, i) => <li key={`cg-${i}`}>Counseling: {item}</li>)}
                  {careGaps.behavioral.map((item, i) => <li key={`bg-${i}`}>Behavioral health: {item}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "6px" }}>Action Plan</div>
                <ul>
                  {actionPlan.dueNow.map((item, i) => <li key={`dn-${i}`}>Due now: {renderRecommendation(item)}</li>)}
                  {actionPlan.consider.map((item, i) => <li key={`co-${i}`}>Consider: {renderRecommendation(item)}</li>)}
                  {actionPlan.discuss.map((item, i) => <li key={`di-${i}`}>Discuss: {renderRecommendation(item)}</li>)}
                </ul>
              </div>
              {form.visitType === "awv" && (
                <div>
                  <div style={{ fontWeight: 900, color: COLORS.heading, marginBottom: "6px" }}>AWV Checklist</div>
                  <ul>{awvChecklist.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="app-grid">
          <div className="screen-only">
            <div style={{ ...cardStyle(), marginBottom: "18px", background: `linear-gradient(180deg, #ffffff 0%, ${COLORS.cardSoft} 100%)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start", marginBottom: "14px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: COLORS.heading }}>Visit Setup</div>
                  <div style={{ fontSize: "13px", color: COLORS.textSoft, marginTop: "4px", lineHeight: 1.5 }}>
                    V3 is organized around AWV, adult prevention, and care-gap closure instead of calculator-first output.
                  </div>
                </div>
                <div style={{ background: COLORS.primarySoft, color: COLORS.primaryDark, borderRadius: "999px", padding: "9px 13px", fontSize: "12px", fontWeight: 900 }}>
                  {preventCategory.label}
                </div>
              </div>

              <div style={{ maxWidth: "260px", marginBottom: "16px" }}>
                <SelectField
                  name="visitType"
                  label="Visit Type"
                  value={form.visitType}
                  onChange={handleChange}
                  options={[
                    { value: "awv", label: "Annual wellness visit" },
                    { value: "adult_prevention", label: "Adult prevention visit" },
                    { value: "chronic_followup", label: "Chronic follow-up" },
                  ]}
                />
              </div>

              {missingPreventItems.length > 0 && (
                <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "16px", background: COLORS.warningSoft, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.warning, fontWeight: 800 }}>
                    Missing for PREVENT
                  </div>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                    {missingPreventItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

              <div className="core-grid">
                <Field name="age" label="Age" unit="years" value={form.age} onChange={handleChange} error={preventErrors.age} requiredForPrevent />
                <SelectField name="sex" label="Sex" value={form.sex} onChange={handleChange} error={preventErrors.sex} requiredForPrevent options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
                <Field name="sbp" label="Systolic BP" unit="mmHg" value={form.sbp} onChange={handleChange} error={preventErrors.sbp} requiredForPrevent />
                <Field name="dbp" label="Diastolic BP" unit="mmHg" value={form.dbp} onChange={handleChange} error={null} />
                <Field name="bmi" label="BMI" value={form.bmi} onChange={handleChange} error={preventErrors.bmi} requiredForPrevent step="0.1" />
                <Field name="egfr" label="eGFR" value={form.egfr} onChange={handleChange} error={preventErrors.egfr} requiredForPrevent />
                <Field name="totalChol" label="Total cholesterol" unit="mg/dL" value={form.totalChol} onChange={handleChange} error={preventErrors.totalChol} requiredForPrevent />
                <Field name="hdl" label="HDL cholesterol" unit="mg/dL" value={form.hdl} onChange={handleChange} error={preventErrors.hdl} requiredForPrevent />
                <Field name="nonHdl" label="Non-HDL cholesterol" unit="mg/dL" value={form.nonHdl} onChange={handleChange} error={null} />
                <Field name="ldl" label="LDL cholesterol" unit="mg/dL" value={form.ldl} onChange={handleChange} error={null} />
                <Field name="triglycerides" label="Triglycerides" unit="mg/dL" value={form.triglycerides} onChange={handleChange} error={null} />
                <Field name="packYears" label="Pack-years" value={form.packYears} onChange={handleChange} error={null} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginTop: "16px", alignItems: "start" }}>
                <PillToggle name="smoking" label="Smoking" value={form.smoking} onChange={handleChange} requiredForPrevent />
                <PillToggle name="diabetes" label="Diabetes" value={form.diabetes} onChange={handleChange} requiredForPrevent />
                <PillToggle name="bpTreated" label="BP treatment" value={form.bpTreated} onChange={handleChange} requiredForPrevent />
                <PillToggle name="lipidLowering" label="Lipid-lowering therapy" value={form.lipidLowering} onChange={handleChange} requiredForPrevent />
                <PillToggle name="knownAscvd" label="Known ASCVD" value={form.knownAscvd} onChange={handleChange} />
                <PillToggle name="immunocompromised" label="Immunocompromised" value={form.immunocompromised} onChange={handleChange} />
                <PillToggle name="chronicLiverDisease" label="Chronic liver disease" value={form.chronicLiverDisease} onChange={handleChange} />
                <PillToggle name="priorVaccineHistoryKnown" label="Vaccine history known" value={form.priorVaccineHistoryKnown} onChange={handleChange} />
                <PillToggle name="evidenceOfImmunityMMR" label="MMR immunity" value={form.evidenceOfImmunityMMR} onChange={handleChange} />
                <PillToggle name="evidenceOfImmunityVaricella" label="Varicella immunity" value={form.evidenceOfImmunityVaricella} onChange={handleChange} />
                <PillToggle name="depressionConcern" label="Depression concern" value={form.depressionConcern} onChange={handleChange} />
                <PillToggle name="anxietyConcern" label="Anxiety concern" value={form.anxietyConcern} onChange={handleChange} />
                <PillToggle name="alcoholRisk" label="Alcohol risk" value={form.alcoholRisk} onChange={handleChange} />
                <PillToggle name="drugUseRisk" label="Drug use risk" value={form.drugUseRisk} onChange={handleChange} />
                <PillToggle name="sleepConcern" label="Sleep concern" value={form.sleepConcern} onChange={handleChange} />
              </div>

              {form.visitType === "awv" && (
                <div style={{ marginTop: "18px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>AWV Workflow Inputs</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                    <PillToggle name="needsADLReview" label="ADL / IADL review completed" value={form.needsADLReview} onChange={handleChange} />
                    <PillToggle name="needsFallReview" label="Fall risk review completed" value={form.needsFallReview} onChange={handleChange} />
                    <PillToggle name="needsCognitiveReview" label="Cognitive review completed" value={form.needsCognitiveReview} onChange={handleChange} />
                    <PillToggle name="needsAdvanceCarePlanning" label="Advance care planning addressed" value={form.needsAdvanceCarePlanning} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="summary-rail">
            <div className="print-card" style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: COLORS.heading }}>Primary Care Summary</div>
                  <div style={{ marginTop: "4px", fontSize: "12px", color: COLORS.textSoft }}>Care gaps and visit-action planning come first; calculators support the workflow.</div>
                </div>
                <span style={{ background: COLORS.primarySoft, color: COLORS.primaryDark, borderRadius: "999px", padding: "8px 12px", fontSize: "12px", fontWeight: 900 }}>
                  {preventCategory.label}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Stat label="PREVENT Risk" value={preventRisk != null ? `${preventRisk}%` : "—"} tone="primary" />
                <Stat label="Visit Type" value={form.visitType === "awv" ? "AWV" : form.visitType === "adult_prevention" ? "Prevention" : "Follow-up"} tone="success" />
                <Stat label="Screening Gaps" value={String(careGaps.screenings.length)} tone="warning" />
                <Stat label="Vaccine Gaps" value={String(careGaps.vaccines.length)} tone="default" />
              </div>

              <div style={{ marginTop: "14px", padding: "14px", borderRadius: "16px", background: COLORS.primarySoft, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.primaryDark, fontWeight: 800 }}>
                  Medication Prevention
                </div>
                <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: 800, color: COLORS.heading, lineHeight: 1.4 }}>
                  {statinPlan.recommendation}
                </div>
                <div style={{ marginTop: "6px", fontSize: "13px", color: COLORS.textSoft }}>
                  Goal: {statinPlan.goal}
                </div>
              </div>
            </div>

            <div className="print-card summary-left" style={{ ...cardStyle(), textAlign: "left" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px", justifyContent: "flex-start" }}>
                {[
                  ["careGaps", "Care Gaps"],
                  ["actionPlan", "Action Plan"],
                  ["awv", "AWV Checklist"],
                  ["export", "Export View"],
                ].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setActiveSummaryTab(key)} style={tabButtonStyle(activeSummaryTab === key)}>
                    {label}
                  </button>
                ))}
              </div>

              {activeSummaryTab === "careGaps" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Care Gaps</div>
                  <ul>
                    {careGaps.screenings.map((item, i) => <li key={`s-${i}`}>Screening: {item}</li>)}
                    {careGaps.vaccines.map((item, i) => <li key={`v-${i}`}>Vaccine: {item}</li>)}
                    {careGaps.counseling.map((item, i) => <li key={`c-${i}`}>Counseling: {item}</li>)}
                    {careGaps.behavioral.map((item, i) => <li key={`b-${i}`}>Behavioral health: {item}</li>)}
                    {careGaps.meds.map((item, i) => <li key={`m-${i}`}>Medication: {item}</li>)}
                  </ul>
                </div>
              )}

              {activeSummaryTab === "actionPlan" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Action Plan</div>
                  <div style={{ fontWeight: 800, color: COLORS.heading, marginBottom: "6px" }}>Due Now</div>
                  <ul>{actionPlan.dueNow.map((item, i) => <li key={`dn-${i}`}>{renderRecommendation(item)}</li>)}</ul>
                  <div style={{ fontWeight: 800, color: COLORS.heading, margin: "12px 0 6px" }}>Consider</div>
                  <ul>{actionPlan.consider.map((item, i) => <li key={`co-${i}`}>{renderRecommendation(item)}</li>)}</ul>
                  <div style={{ fontWeight: 800, color: COLORS.heading, margin: "12px 0 6px" }}>Discuss</div>
                  <ul>{actionPlan.discuss.map((item, i) => <li key={`di-${i}`}>{renderRecommendation(item)}</li>)}</ul>
                </div>
              )}

              {activeSummaryTab === "awv" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>AWV Checklist</div>
                  {form.visitType === "awv" ? (
                    <ul>{awvChecklist.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  ) : (
                    <div style={{ color: COLORS.textSoft }}>Switch the visit type to Annual wellness visit to show AWV workflow tasks.</div>
                  )}
                </div>
              )}

              {activeSummaryTab === "export" && (
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: COLORS.heading, marginBottom: "10px" }}>Export Preview</div>
                  <ul>
                    <li>Structured around Risk, Care Gaps, Action Plan, and AWV checklist</li>
                    <li>Bullet-list formatting in print and copy output</li>
                    <li>Primary-care framing replaces calculator-first framing</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
