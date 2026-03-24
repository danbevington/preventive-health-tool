import { useMemo, useState } from "react";
import { calcPreventAscvd, riskCat } from "./lib/prevent";
import { buildStatinPathway } from "./lib/statinPathway";

const APP_VERSION = "v2.6.0";
const APP_LAST_REVIEWED = "2026-03-23";
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
};

const COLORS = {
  pageBg: "#eef3f8",
  shell: "#0f172a",
  shell2: "#16233a",
  card: "#ffffff",
  cardSoft: "#f8fbff",
  border: "#d8e2ee",
  text: "#10243e",
  textSoft: "#5d718a",
  heading: "#0b1f36",
  primary: "#0a5ea8",
  primaryDark: "#083f73",
  primarySoft: "#eaf3fb",
  accent: "#0f766e",
  accentSoft: "#ecfdf5",
  warning: "#a16207",
  warningSoft: "#fffbeb",
  danger: "#b42318",
  dangerSoft: "#fef3f2",
  success: "#166534",
  successSoft: "#f0fdf4",
  purpleSoft: "#faf5ff",
};

function parseNum(value) {
  return value === "" ? null : Number(value);
}

function yn(v) {
  return v === "Y";
}

function fieldStyle(hasError) {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "8px",
    border: `1px solid ${hasError ? COLORS.danger : COLORS.border}`,
    background: "#fff",
    boxSizing: "border-box",
    color: COLORS.text,
    outline: "none",
    fontSize: "14px",
    boxShadow: hasError ? "0 0 0 3px rgba(180,35,24,0.08)" : "none",
  };
}

function labelStyle() {
  return {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "6px",
    color: COLORS.heading,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
}

function errorStyle() {
  return {
    color: COLORS.danger,
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: 600,
  };
}

function buttonStyle(kind = "default") {
  if (kind === "primary") {
    return {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #0b4f8a",
      background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    };
  }
  if (kind === "accent") {
    return {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #99e6dc",
      background: COLORS.accentSoft,
      color: COLORS.accent,
      cursor: "pointer",
      fontWeight: 700,
    };
  }
  return {
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    background: "#ffffff",
    color: COLORS.text,
    cursor: "pointer",
    fontWeight: 700,
  };
}

function cardStyle(background = COLORS.card) {
  return {
    background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 4px 18px rgba(15,23,42,0.06)",
  };
}

function sectionCardStyle(background = "#ffffff") {
  return {
    background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
  };
}

function sectionHeaderStyle() {
  return {
    fontSize: "16px",
    fontWeight: 800,
    color: COLORS.heading,
    marginBottom: "4px",
  };
}

function sectionSubheaderStyle() {
  return {
    fontSize: "12px",
    color: COLORS.textSoft,
    marginBottom: "12px",
  };
}

function getRiskBadgeStyle(label) {
  if (label === "High") {
    return {
      background: COLORS.dangerSoft,
      color: COLORS.danger,
      border: "1px solid #f5c2c7",
    };
  }
  if (label === "Intermediate" || label === "Borderline") {
    return {
      background: COLORS.warningSoft,
      color: COLORS.warning,
      border: "1px solid #fcd9a5",
    };
  }
  if (label === "Low") {
    return {
      background: COLORS.successSoft,
      color: COLORS.success,
      border: "1px solid #b7ebc6",
    };
  }
  return {
    background: COLORS.primarySoft,
    color: COLORS.primaryDark,
    border: "1px solid #bfd7ef",
  };
}

function validateScreeningInputs(form) {
  const errors = {};
  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const dbp = parseNum(form.dbp);
  const packYears = parseNum(form.packYears);

  if (!Number.isFinite(age) || age < 0 || age > 100) {
    errors.age = "Age must be 0–100.";
  }

  if (form.sex !== "" && !["male", "female"].includes(form.sex)) {
    errors.sex = "Sex must be male or female.";
  }

  if (form.sbp !== "" && (!Number.isFinite(sbp) || sbp < 70 || sbp > 250)) {
    errors.sbp = "Systolic BP must be 70–250.";
  }

  if (form.dbp !== "" && (!Number.isFinite(dbp) || dbp < 40 || dbp > 150)) {
    errors.dbp = "Diastolic BP must be 40–150.";
  }

  if (
    form.sbp !== "" &&
    form.dbp !== "" &&
    Number.isFinite(sbp) &&
    Number.isFinite(dbp) &&
    dbp >= sbp
  ) {
    errors.dbp = "Diastolic must be lower than systolic.";
  }

  if (form.smoking !== "" && !["Y", "N"].includes(form.smoking)) {
    errors.smoking = "Smoking must be Y or N.";
  }

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

  if (form.ldl !== "" && (!Number.isFinite(ldl) || ldl < 20 || ldl > 400)) {
    errors.ldl = "LDL-C must be 20–400.";
  }

  if (form.nonHdl !== "" && (!Number.isFinite(nonHdl) || nonHdl < 30 || nonHdl > 500)) {
    errors.nonHdl = "Non-HDL-C must be 30–500.";
  }

  if (form.triglycerides !== "" && (!Number.isFinite(tg) || tg < 20 || tg > 2000)) {
    errors.triglycerides = "Triglycerides must be 20–2000.";
  }

  if (form.apob !== "" && (!Number.isFinite(apob) || apob < 20 || apob > 300)) {
    errors.apob = "ApoB must be 20–300.";
  }

  if (form.lpa !== "" && (!Number.isFinite(lpa) || lpa < 0 || lpa > 500)) {
    errors.lpa = "Lp(a) must be 0–500.";
  }

  if (form.cac !== "" && (!Number.isFinite(cac) || cac < 0 || cac > 5000)) {
    errors.cac = "CAC must be 0–5000.";
  }

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

  if (form.age !== "" && (!Number.isFinite(age) || age < 30 || age > 79)) {
    errors.age = "For official PREVENT, age must be 30–79.";
  }

  if (form.sbp !== "" && (!Number.isFinite(sbp) || sbp < 90 || sbp > 200)) {
    errors.sbp = "For official PREVENT, SBP must be 90–200.";
  }

  if (form.bmi !== "" && (!Number.isFinite(bmi) || bmi < 18.5 || bmi > 39.9)) {
    errors.bmi = "For official PREVENT, BMI must be 18.5–39.9.";
  }

  if (form.egfr !== "" && (!Number.isFinite(egfr) || egfr <= 0)) {
    errors.egfr = "eGFR must be >0.";
  }

  if (form.totalChol !== "" && (!Number.isFinite(totalChol) || totalChol < 130 || totalChol > 320)) {
    errors.totalChol = "For official PREVENT, total cholesterol must be 130–320.";
  }

  if (form.hdl !== "" && (!Number.isFinite(hdl) || hdl < 20 || hdl > 100)) {
    errors.hdl = "For official PREVENT, HDL must be 20–100.";
  }

  if (Number.isFinite(totalChol) && Number.isFinite(hdl) && hdl >= totalChol) {
    errors.hdl = "HDL must be lower than total cholesterol.";
  }

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

function addUnique(list, text) {
  if (!list.includes(text)) list.push(text);
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
  if (age >= 50 || immunocompromised) {
    addUnique(vaccines, "Recombinant zoster (RZV) 2-dose series");
  }
  if (age >= 60 && age < 75) {
    addUnique(vaccines, "RSV vaccine if indicated / shared clinical decision-making");
  }
  if (age >= 75) {
    addUnique(vaccines, "RSV vaccine");
  }
  if (age >= 65) {
    addUnique(vaccines, "Pneumococcal vaccine per current CDC adult age/risk schedule");
    addUnique(vaccines, "Influenza annually (higher-dose/adjuvanted product may be preferred)");
  }

  if (sex === "female" && pregnant) {
    addUnique(vaccines, "Tdap during each pregnancy");
    addUnique(vaccines, "RSV vaccine during pregnancy when seasonally indicated");
  }

  if (!evidenceOfImmunityMMR && age >= 19) {
    addUnique(vaccines, "MMR if lacking evidence of immunity");
  }
  if (!evidenceOfImmunityVaricella && age >= 19) {
    addUnique(vaccines, "Varicella if lacking evidence of immunity");
  }
  if (!priorVaccineHistoryKnown && age >= 19) {
    addUnique(vaccines, "Review prior vaccine history / registry and assess catch-up needs");
  }

  if (
    immunocompromised ||
    asplenia ||
    cochlearImplant ||
    csfLeak ||
    chronicHeartDisease ||
    chronicLungDisease ||
    chronicKidneyDisease
  ) {
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

  if (collegeDormResident || military) {
    addUnique(vaccines, "Meningococcal vaccination if indicated");
  }

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

  if (!priorVaccineHistoryKnown && age >= 19) {
    addUnique(vaccines, "Review vaccine registry/history to determine catch-up needs");
  }
  if (age >= 19 && age <= 26) {
    addUnique(vaccines, "HPV catch-up if series incomplete");
    addUnique(vaccines, "Hepatitis B catch-up if series incomplete");
  }
  if (age >= 27 && age <= 45) {
    addUnique(vaccines, "HPV may be considered by shared decision-making if not fully vaccinated");
  }
  if (!evidenceOfImmunityMMR && age >= 19) {
    addUnique(vaccines, "MMR if lacking evidence of immunity");
  }
  if (!evidenceOfImmunityVaricella && age >= 19) {
    addUnique(vaccines, "Varicella if lacking evidence of immunity");
  }

  if (sex === "female" && pregnant) {
    addUnique(vaccines, "Tdap during current pregnancy");
    addUnique(vaccines, "RSV vaccine during pregnancy when seasonally indicated");
  }

  if (
    immunocompromised ||
    asplenia ||
    cochlearImplant ||
    csfLeak ||
    chronicHeartDisease ||
    chronicLungDisease ||
    chronicKidneyDisease
  ) {
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
  if (collegeDormResident || military) {
    addUnique(vaccines, "Meningococcal vaccination if indicated");
  }
  if (travelRisk || residenceRisk) {
    addUnique(vaccines, "Travel/residence-based vaccines as indicated");
  }

  return vaccines;
}

function getVaccinesForDisplay(form) {
  return form.vaccineMode === "current"
    ? getCurrentAgeVaccinesNeeded(form)
    : getCumulativeVaccinesByAgeAndRisk(form);
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [copyStatus, setCopyStatus] = useState("");

  const screeningErrors = useMemo(() => validateScreeningInputs(form), [form]);
  const additionalErrors = useMemo(() => validateAdditionalInputs(form), [form]);
  const preventRangeErrors = useMemo(() => validatePreventInputs(form), [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setCopyStatus("");
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setCopyStatus("");
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

  const patientSummary = useMemo(() => {
    if (Object.keys(screeningErrors).length > 0) {
      return {
        intro: "Your preventive health summary is not ready yet because some basic entries need to be corrected.",
        steps: ["Please correct the highlighted fields before reviewing recommendations."],
      };
    }

    const steps = [];

    if (derived.screenings.length > 0) {
      steps.push(`Recommended screening tests: ${derived.screenings.join(", ")}.`);
    }
    if (derived.vaccines.length > 0) {
      steps.push(
        form.vaccineMode === "current"
          ? `Vaccines to review now based on current age/history/risk: ${derived.vaccines.join(", ")}.`
          : `Vaccines to review by age/history/risk, including childhood series: ${derived.vaccines.join(", ")}.`
      );
    }
    if (derived.counseling.length > 0) {
      steps.push(`Lifestyle support topics to discuss: ${derived.counseling.join(", ")}.`);
    }
    if (statinPlan?.recommendation) {
      steps.push(`Cholesterol treatment direction: ${statinPlan.recommendation}.`);
    }

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

    lines.push("Clinical Results");
    lines.push(
      `- PREVENT-ASCVD 10-Year Risk: ${
        preventRisk != null ? `${preventRisk}% (${preventCategory.label})` : "Not calculated"
      }`
    );
    lines.push(`- Statin Pathway: ${statinPlan?.pathway || "Insufficient data"}`);
    lines.push(`- Recommendation: ${statinPlan?.recommendation || "Insufficient data"}`);
    lines.push(`- Goal: ${statinPlan?.goal || "Insufficient data"}`);
    lines.push(
      `- Vaccine View: ${
        form.vaccineMode === "current"
          ? "Minus childhood vaccines"
          : "Include childhood vaccines"
      }`
    );
    lines.push("");

    if (statinPlan?.enhancers?.length > 0) {
      lines.push("Risk Enhancers");
      statinPlan.enhancers.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (statinPlan?.notes?.length > 0) {
      lines.push("Statin Notes");
      statinPlan.notes.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (derived.screenings.length > 0) {
      lines.push("Screenings");
      derived.screenings.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (derived.vaccines.length > 0) {
      lines.push("Vaccines");
      derived.vaccines.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (derived.counseling.length > 0) {
      lines.push("Counseling");
      derived.counseling.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (derived.careGaps.length > 0) {
      lines.push("Care Gaps");
      derived.careGaps.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    if (derived.orders.length > 0) {
      lines.push("Suggested Orders / Actions");
      derived.orders.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    }

    lines.push("Patient-Friendly Summary");
    lines.push(patientSummary.intro);
    patientSummary.steps.forEach((item) => lines.push(`- ${item}`));

    return lines.join("\n");
  }, [preventRisk, preventCategory.label, statinPlan, derived, patientSummary, form.vaccineMode]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.pageBg} 0%, #f7fafc 100%)`,
        padding: "24px 16px 40px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: COLORS.text,
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; break-inside: avoid; }
          body { background: white; }
        }
      `}</style>

      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.shell} 0%, ${COLORS.shell2} 100%)`,
            color: "#fff",
            borderRadius: "14px",
            padding: "22px 24px",
            marginBottom: "18px",
            boxShadow: "0 12px 32px rgba(15,23,42,0.22)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: 0.72,
            }}
          >
            Clinical Decision Support
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "6px" }}>
            Preventive Health Decision Tool
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.86 }}>
            Partial inputs support preventive screening output; complete inputs generate official AHA PREVENT-ASCVD base-model risk.
          </div>
          <div style={{ marginTop: "6px", fontSize: "12px", opacity: 0.8 }}>
            Version {APP_VERSION} • Production Build
          </div>
        </div>

        <div className="print-card" style={{ ...cardStyle(), marginBottom: "18px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "8px 14px",
              fontSize: "13px",
              color: COLORS.textSoft,
            }}
          >
            <div><strong style={{ color: COLORS.heading }}>Version:</strong> {APP_VERSION}</div>
            <div><strong style={{ color: COLORS.heading }}>Reviewed:</strong> {APP_LAST_REVIEWED}</div>
            <div><strong style={{ color: COLORS.heading }}>Risk engine:</strong> {RISK_ENGINE_LABEL}</div>
          </div>
        </div>

        <div
          className="no-print"
          style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}
        >
          <button type="button" onClick={handleReset} style={buttonStyle("default")}>
            Reset Form
          </button>
          <button type="button" onClick={handlePrint} style={buttonStyle("primary")}>
            Print / Export Summary
          </button>
          <button type="button" onClick={handleCopy} style={buttonStyle("accent")}>
            Copy Results
          </button>
          {copyStatus && (
            <span
              style={{
                alignSelf: "center",
                fontSize: "13px",
                color: COLORS.primary,
                fontWeight: 700,
              }}
            >
              {copyStatus}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div className="no-print" style={cardStyle()}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: COLORS.heading,
                marginBottom: "16px",
              }}
            >
              Patient Inputs
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <div style={sectionCardStyle(COLORS.cardSoft)}>
                <div style={sectionHeaderStyle()}>PREVENT Score Inputs</div>
                <div style={sectionSubheaderStyle()}>
                  Required for official AHA PREVENT risk calculation.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                    <select
                      name="sex"
                      value={form.sex}
                      onChange={handleChange}
                      style={fieldStyle(!!basicError("sex"))}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {basicError("sex") && <div style={errorStyle()}>{basicError("sex")}</div>}
                  </div>

                  <div>
                    <label style={labelStyle()}>Smoking</label>
                    <select
                      name="smoking"
                      value={form.smoking}
                      onChange={handleChange}
                      style={fieldStyle(!!basicError("smoking"))}
                    >
                      <option value="">Optional unless calculating PREVENT</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                    {basicError("smoking") && <div style={errorStyle()}>{basicError("smoking")}</div>}
                  </div>

                  <div>
                    <label style={labelStyle()}>Diabetes</label>
                    <select name="diabetes" value={form.diabetes} onChange={handleChange} style={fieldStyle(false)}>
                      <option value="">Optional unless calculating PREVENT</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>BP treatment</label>
                    <select name="bpTreated" value={form.bpTreated} onChange={handleChange} style={fieldStyle(false)}>
                      <option value="">Optional unless calculating PREVENT</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Lipid-lowering therapy</label>
                    <select
                      name="lipidLowering"
                      value={form.lipidLowering}
                      onChange={handleChange}
                      style={fieldStyle(false)}
                    >
                      <option value="">Optional unless calculating PREVENT</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={sectionCardStyle("#fefefe")}>
                <div style={sectionHeaderStyle()}>Statin Pathway Inputs</div>
                <div style={sectionSubheaderStyle()}>
                  Used for lipid treatment direction and risk-enhancer interpretation.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        style={fieldStyle(!!basicError(name))}
                      />
                      {basicError(name) && <div style={errorStyle()}>{basicError(name)}</div>}
                    </div>
                  ))}

                  <div>
                    <label style={labelStyle()}>Known ASCVD</label>
                    <select
                      name="knownAscvd"
                      value={form.knownAscvd}
                      onChange={handleChange}
                      style={fieldStyle(false)}
                    >
                      <option value="">Optional</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Very-high-risk ASCVD</label>
                    <select
                      name="veryHighRiskAscvd"
                      value={form.veryHighRiskAscvd}
                      onChange={handleChange}
                      style={fieldStyle(false)}
                    >
                      <option value="">Optional</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={sectionCardStyle("#f9fafb")}>
                <div style={sectionHeaderStyle()}>Immunization Inputs</div>
                <div style={sectionSubheaderStyle()}>
                  Toggle between cumulative vaccine history and current-age vaccine needs.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle()}>Vaccine view</label>
                    <select
                      name="vaccineMode"
                      value={form.vaccineMode}
                      onChange={handleChange}
                      style={fieldStyle(false)}
                    >
                      <option value="cumulative">Include childhood vaccines</option>
                      <option value="current">Minus childhood vaccines</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Pack-years</label>
                    <input
                      type="number"
                      name="packYears"
                      value={form.packYears}
                      onChange={handleChange}
                      disabled={form.smoking !== "Y"}
                      style={{
                        ...fieldStyle(!!basicError("packYears")),
                        background: form.smoking !== "Y" ? "#f2f5f8" : "#fff",
                      }}
                    />
                    {basicError("packYears") && <div style={errorStyle()}>{basicError("packYears")}</div>}
                  </div>

                  {vaccineOptionFields.map(([name, label]) => (
                    <div key={name}>
                      <label style={labelStyle()}>{label}</label>
                      <select name={name} value={form[name]} onChange={handleChange} style={fieldStyle(false)}>
                        <option value="">Optional</option>
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "18px" }}>
            <div className="print-card" style={cardStyle(COLORS.cardSoft)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.heading }}>
                  Risk Overview
                </div>
                <span
                  style={{
                    ...riskBadge,
                    borderRadius: "999px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {preventCategory.label}
                </span>
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: COLORS.primaryDark,
                  lineHeight: 1,
                }}
              >
                {preventRisk != null ? `${preventRisk}%` : "—"}
              </div>

              <div style={{ marginTop: "8px", fontWeight: 700, color: COLORS.heading }}>
                Official AHA PREVENT-ASCVD 10-Year Risk
              </div>

              <div style={{ marginTop: "8px", fontSize: "13px", color: COLORS.textSoft }}>
                {preventRisk != null
                  ? `${preventCategory.label} risk (${preventCategory.range})`
                  : "Complete official base-model inputs within validated ranges are required to calculate PREVENT risk."}
              </div>
            </div>

            <div className="print-card" style={cardStyle(COLORS.primarySoft)}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: COLORS.heading,
                  marginBottom: "10px",
                }}
              >
                Statin Pathway
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>Pathway:</strong> {statinPlan?.pathway || "Insufficient data"}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Recommendation:</strong> {statinPlan?.recommendation || "Insufficient data"}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Goal:</strong> {statinPlan?.goal || "Insufficient data"}
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Risk enhancers:</strong>{" "}
                {statinPlan?.enhancers?.length ? statinPlan.enhancers.join(", ") : "None noted"}
              </div>
              <div>
                <strong>Notes:</strong> {statinPlan?.notes?.length ? statinPlan.notes.join(", ") : "None"}
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: COLORS.textSoft }}>
                Based on ACC/AHA guideline framework with individualized risk modifiers.
              </div>
            </div>

            <div className="print-card" style={cardStyle(COLORS.accentSoft)}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: COLORS.accent,
                  marginBottom: "10px",
                }}
              >
                Patient-Friendly Summary
              </div>
              <p style={{ marginTop: 0, color: COLORS.text }}>{patientSummary.intro}</p>
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {patientSummary.steps.map((item, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="no-print" style={cardStyle()}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: COLORS.heading,
                  marginBottom: "10px",
                }}
              >
                Copy / Paste Text
              </div>
              <textarea
                readOnly
                value={copyText}
                style={{
                  width: "100%",
                  minHeight: "220px",
                  padding: "12px",
                  borderRadius: "8px",
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

        <div className="print-card" style={{ ...cardStyle(), marginTop: "18px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: COLORS.heading,
              marginBottom: "14px",
            }}
          >
            Clinical Output
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { title: "Screenings", items: derived.screenings, bg: COLORS.primarySoft },
              { title: "Vaccines", items: derived.vaccines, bg: COLORS.successSoft },
              { title: "Counseling", items: derived.counseling, bg: COLORS.purpleSoft },
              { title: "Care Gaps", items: derived.careGaps, bg: COLORS.warningSoft },
            ].map((section) => (
              <div
                key={section.title}
                style={{
                  background: section.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: COLORS.heading,
                    marginBottom: "8px",
                  }}
                >
                  {section.title}
                </div>
                <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                  {section.items.length
                    ? section.items.map((item, i) => (
                        <li key={i} style={{ marginBottom: "6px" }}>
                          {item}
                        </li>
                      ))
                    : <li>None yet.</li>}
                </ul>
              </div>
            ))}

            <div
              style={{
                gridColumn: "1 / span 2",
                background: "#eef8f4",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: COLORS.heading,
                  marginBottom: "8px",
                }}
              >
                Suggested Orders / Actions
              </div>
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {derived.orders.length
                  ? derived.orders.map((item, i) => (
                      <li key={i} style={{ marginBottom: "6px" }}>
                        {item}
                      </li>
                    ))
                  : <li>No actions yet.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "18px",
            backgroundColor: "#0b1f3a",
            color: "#e6edf3",
            borderRadius: "10px",
            border: "1px solid #1e3a5f",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "8px", color: "#7dd3fc" }}>
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
            Recommendations reflect guideline logic last reviewed on {APP_LAST_REVIEWED} and may change as USPSTF, CDC, and AHA/ACC guidance is updated. Clinicians should verify recommendations against current primary sources.
          </div>

          <div style={{ marginTop: "6px" }}>
            This application does not store, transmit, or retain any patient data. All inputs are processed locally within the browser session.
          </div>

          <div style={{ marginTop: "6px" }}>
            This tool is intended for adult primary care decision support and does not apply to pediatric populations, pregnancy, or specialized cardiology management.
          </div>

          <div style={{ marginTop: "12px", fontWeight: "600", color: "#7dd3fc" }}>
            Guideline Sources
          </div>

          <ul style={{ paddingLeft: "18px", marginTop: "6px", marginBottom: 0 }}>
            <li>USPSTF Preventive Services Task Force (current recommendations)</li>
            <li>CDC age-based and risk-based immunization schedules</li>
            <li>AHA PREVENT official base-model equations</li>
            <li>ACC/AHA lipid management framework for statin decision support</li>
          </ul>

          <div style={{ marginTop: "10px", fontSize: "11px", color: "#9fb3c8" }}>
            © {new Date().getFullYear()} Daniel Bevington. All rights reserved. Version {APP_VERSION} | Last reviewed: {APP_LAST_REVIEWED}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: COLORS.textSoft,
            marginTop: "16px",
          }}
        >
          Clinical decision support only. Partial inputs support screening output; full official AHA PREVENT base-model inputs are needed for risk calculation.
        </div>
      </div>
    </div>
  );
}