import { useMemo, useState } from "react";

const APP_VERSION = "v1.9.0";
const APP_LAST_REVIEWED = "2026-03-22";
const RISK_ENGINE_LABEL = "PREVENT-ASCVD 10-Year Base Model";

const INITIAL_FORM = {
  age: "",
  sex: "", // male | female
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
  packYears: "",
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

function getRiskBadgeStyle(label) {
  if (label === "High") {
    return { background: COLORS.dangerSoft, color: COLORS.danger, border: "1px solid #f5c2c7" };
  }
  if (label === "Intermediate" || label === "Borderline") {
    return { background: COLORS.warningSoft, color: COLORS.warning, border: "1px solid #fcd9a5" };
  }
  if (label === "Low") {
    return { background: COLORS.successSoft, color: COLORS.success, border: "1px solid #b7ebc6" };
  }
  return { background: COLORS.primarySoft, color: COLORS.primaryDark, border: "1px solid #bfd7ef" };
}

function validateScreeningInputs(form) {
  const errors = {};

  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const dbp = parseNum(form.dbp);
  const packYears = parseNum(form.packYears);

  if (!Number.isFinite(age) || age < 18 || age > 100) {
    errors.age = "Age must be 18–100.";
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

function validatePreventInputs(form) {
  const errors = {};

  const age = parseNum(form.age);
  const sbp = parseNum(form.sbp);
  const bmi = parseNum(form.bmi);
  const egfr = parseNum(form.egfr);
  const totalChol = parseNum(form.totalChol);
  const hdl = parseNum(form.hdl);

  if (!Number.isFinite(age) || age < 30 || age > 79) {
    errors.age = "Age must be 30–79 for PREVENT-ASCVD.";
  }

  if (!["male", "female"].includes(form.sex)) {
    errors.sex = "Sex is required for PREVENT-ASCVD.";
  }

  if (!Number.isFinite(sbp) || sbp < 70 || sbp > 250) {
    errors.sbp = "Systolic BP is required for PREVENT-ASCVD.";
  }

  if (!Number.isFinite(bmi) || bmi < 10 || bmi > 80) {
    errors.bmi = "BMI is required for PREVENT-ASCVD.";
  }

  if (!Number.isFinite(egfr) || egfr < 15 || egfr > 140) {
    errors.egfr = "eGFR is required for PREVENT-ASCVD.";
  }

  if (!["Y", "N"].includes(form.smoking)) {
    errors.smoking = "Smoking is required for PREVENT-ASCVD.";
  }

  if (!["Y", "N"].includes(form.diabetes)) {
    errors.diabetes = "Diabetes is required for PREVENT-ASCVD.";
  }

  if (!["Y", "N"].includes(form.bpTreated)) {
    errors.bpTreated = "BP treatment is required for PREVENT-ASCVD.";
  }

  if (!["Y", "N"].includes(form.lipidLowering)) {
    errors.lipidLowering = "Lipid-lowering therapy is required for PREVENT-ASCVD.";
  }

  if (!Number.isFinite(totalChol) || totalChol < 80 || totalChol > 400) {
    errors.totalChol = "Total cholesterol is required for PREVENT-ASCVD.";
  }

  if (!Number.isFinite(hdl) || hdl < 10 || hdl > 120) {
    errors.hdl = "HDL is required for PREVENT-ASCVD.";
  }

  if (
    Number.isFinite(totalChol) &&
    Number.isFinite(hdl) &&
    hdl >= totalChol
  ) {
    errors.hdl = "HDL should be lower than total cholesterol.";
  }

  return errors;
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

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [copyStatus, setCopyStatus] = useState("");

  const screeningErrors = useMemo(() => validateScreeningInputs(form), [form]);
  const preventErrors = useMemo(() => validatePreventInputs(form), [form]);

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

  const preventRisk = useMemo(() => {
    if (Object.keys(preventErrors).length > 0) return null;

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
  }, [form, preventErrors]);

  const preventCategory = riskCat(preventRisk);

  const derived = useMemo(() => {
    const age = parseNum(form.age) ?? 0;
    const sbp = parseNum(form.sbp);
    const dbp = parseNum(form.dbp);
    const bmi = parseNum(form.bmi);
    const packYears = parseNum(form.packYears);

    const screenings = [];
    const vaccines = [];
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

    vaccines.push("Influenza annually");
    vaccines.push("COVID-19 per CDC guidance");
    vaccines.push("Tdap every 10 years");
    if (age >= 50) vaccines.push("Shingles vaccine");
    if (age >= 65) vaccines.push("Pneumococcal vaccine");

    if (preventRisk != null) {
      careGaps.push(`10-year PREVENT-ASCVD risk: ${preventRisk}% (${preventCategory.label})`);
    } else {
      careGaps.push(
        "PREVENT-ASCVD risk not calculated: additional inputs required (BMI, eGFR, lipids, diabetes, smoking, BP treatment, lipid therapy)."
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
      steps.push(`Recommended vaccines: ${derived.vaccines.join(", ")}.`);
    }
    if (derived.counseling.length > 0) {
      steps.push(`Lifestyle support topics to discuss: ${derived.counseling.join(", ")}.`);
    }

    const intro =
      preventRisk != null
        ? `Estimated 10-year PREVENT-ASCVD risk: ${preventRisk}% (${preventCategory.label}).`
        : "PREVENT-ASCVD risk is not calculated yet because more data is needed.";

    return { intro, steps };
  }, [screeningErrors, derived, preventRisk, preventCategory.label]);

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
    lines.push("");

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
  }, [preventRisk, preventCategory.label, derived, patientSummary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("Results copied.");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Copy failed. Select the text below and copy manually.");
    }
  };

  const riskBadge = getRiskBadgeStyle(preventCategory.label);

  const mergedError = (name) => screeningErrors[name] || preventErrors[name];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.pageBg} 0%, #f7fafc 100%)`,
        padding: "24px 16px 40px",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
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
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.72 }}>
            Clinical Decision Support
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "6px" }}>
            Preventive Health Decision Tool
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.86 }}>
            Minimal inputs can generate preventive screenings; complete inputs generate PREVENT-ASCVD risk.
          </div>
        </div>

        <div className="print-card" style={{ ...cardStyle(), marginBottom: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px 14px", fontSize: "13px", color: COLORS.textSoft }}>
            <div><strong style={{ color: COLORS.heading }}>Version:</strong> {APP_VERSION}</div>
            <div><strong style={{ color: COLORS.heading }}>Reviewed:</strong> {APP_LAST_REVIEWED}</div>
            <div><strong style={{ color: COLORS.heading }}>Risk engine:</strong> {RISK_ENGINE_LABEL}</div>
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button type="button" onClick={handleReset} style={buttonStyle("default")}>Reset Form</button>
          <button type="button" onClick={handlePrint} style={buttonStyle("primary")}>Print / Export Summary</button>
          <button type="button" onClick={handleCopy} style={buttonStyle("accent")}>Copy Results</button>
          {copyStatus && <span style={{ alignSelf: "center", fontSize: "13px", color: COLORS.primary, fontWeight: 700 }}>{copyStatus}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "18px", alignItems: "start" }}>
          <div className="no-print" style={cardStyle()}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.heading, marginBottom: "16px" }}>
              Patient Inputs
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle()}>Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} style={fieldStyle(!!mergedError("age"))} />
                {mergedError("age") && <div style={errorStyle()}>{mergedError("age")}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Sex</label>
                <select name="sex" value={form.sex} onChange={handleChange} style={fieldStyle(!!mergedError("sex"))}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {mergedError("sex") && <div style={errorStyle()}>{mergedError("sex")}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Systolic BP</label>
                <input type="number" name="sbp" value={form.sbp} onChange={handleChange} style={fieldStyle(!!mergedError("sbp"))} />
                {mergedError("sbp") && <div style={errorStyle()}>{mergedError("sbp")}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Diastolic BP</label>
                <input type="number" name="dbp" value={form.dbp} onChange={handleChange} style={fieldStyle(!!mergedError("dbp"))} />
                {mergedError("dbp") && <div style={errorStyle()}>{mergedError("dbp")}</div>}
              </div>

              <div>
                <label style={labelStyle()}>BMI</label>
                <input type="number" name="bmi" value={form.bmi} onChange={handleChange} style={fieldStyle(!!preventErrors.bmi)} />
                {preventErrors.bmi && <div style={errorStyle()}>{preventErrors.bmi}</div>}
              </div>

              <div>
                <label style={labelStyle()}>eGFR</label>
                <input type="number" name="egfr" value={form.egfr} onChange={handleChange} style={fieldStyle(!!preventErrors.egfr)} />
                {preventErrors.egfr && <div style={errorStyle()}>{preventErrors.egfr}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Smoking</label>
                <select name="smoking" value={form.smoking} onChange={handleChange} style={fieldStyle(!!mergedError("smoking"))}>
                  <option value="">Select</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
                {mergedError("smoking") && <div style={errorStyle()}>{mergedError("smoking")}</div>}
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
                    ...fieldStyle(!!screeningErrors.packYears),
                    background: form.smoking !== "Y" ? "#f2f5f8" : "#fff",
                  }}
                />
                {screeningErrors.packYears && <div style={errorStyle()}>{screeningErrors.packYears}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Diabetes</label>
                <select name="diabetes" value={form.diabetes} onChange={handleChange} style={fieldStyle(!!preventErrors.diabetes)}>
                  <option value="">Select</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
                {preventErrors.diabetes && <div style={errorStyle()}>{preventErrors.diabetes}</div>}
              </div>

              <div>
                <label style={labelStyle()}>BP treatment</label>
                <select name="bpTreated" value={form.bpTreated} onChange={handleChange} style={fieldStyle(!!preventErrors.bpTreated)}>
                  <option value="">Select</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
                {preventErrors.bpTreated && <div style={errorStyle()}>{preventErrors.bpTreated}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Lipid-lowering therapy</label>
                <select name="lipidLowering" value={form.lipidLowering} onChange={handleChange} style={fieldStyle(!!preventErrors.lipidLowering)}>
                  <option value="">Select</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
                {preventErrors.lipidLowering && <div style={errorStyle()}>{preventErrors.lipidLowering}</div>}
              </div>

              <div>
                <label style={labelStyle()}>Total cholesterol</label>
                <input type="number" name="totalChol" value={form.totalChol} onChange={handleChange} style={fieldStyle(!!preventErrors.totalChol)} />
                {preventErrors.totalChol && <div style={errorStyle()}>{preventErrors.totalChol}</div>}
              </div>

              <div>
                <label style={labelStyle()}>HDL cholesterol</label>
                <input type="number" name="hdl" value={form.hdl} onChange={handleChange} style={fieldStyle(!!preventErrors.hdl)} />
                {preventErrors.hdl && <div style={errorStyle()}>{preventErrors.hdl}</div>}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "18px" }}>
            <div className="print-card" style={cardStyle(COLORS.cardSoft)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.heading }}>
                  Risk Overview
                </div>
                <span
                  style={{
                    ...getRiskBadgeStyle(preventCategory.label),
                    borderRadius: "999px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {preventCategory.label}
                </span>
              </div>

              <div style={{ fontSize: "32px", fontWeight: 800, color: COLORS.primaryDark, lineHeight: 1 }}>
                {preventRisk != null ? `${preventRisk}%` : "—"}
              </div>

              <div style={{ marginTop: "8px", fontWeight: 700, color: COLORS.heading }}>
                PREVENT-ASCVD 10-Year Risk
              </div>

              <div style={{ marginTop: "8px", fontSize: "13px", color: COLORS.textSoft }}>
                {preventRisk != null
                  ? `${preventCategory.label} risk (${preventCategory.range})`
                  : "Additional PREVENT inputs are needed for risk calculation."}
              </div>
            </div>

            <div className="print-card" style={cardStyle(COLORS.accentSoft)}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.accent, marginBottom: "10px" }}>
                Patient-Friendly Summary
              </div>
              <p style={{ marginTop: 0, color: COLORS.text }}>{patientSummary.intro}</p>
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {patientSummary.steps.map((item, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="no-print" style={cardStyle()}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.heading, marginBottom: "10px" }}>
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
          <div style={{ fontSize: "18px", fontWeight: 800, color: COLORS.heading, marginBottom: "14px" }}>
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
                <div style={{ fontSize: "15px", fontWeight: 800, color: COLORS.heading, marginBottom: "8px" }}>
                  {section.title}
                </div>
                <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                  {section.items.length
                    ? section.items.map((item, i) => <li key={i} style={{ marginBottom: "6px" }}>{item}</li>)
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
              <div style={{ fontSize: "15px", fontWeight: 800, color: COLORS.heading, marginBottom: "8px" }}>
                Suggested Orders / Actions
              </div>
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {derived.orders.length
                  ? derived.orders.map((item, i) => <li key={i} style={{ marginBottom: "6px" }}>{item}</li>)
                  : <li>No actions yet.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "12px", color: COLORS.textSoft, marginTop: "16px" }}>
          Clinical decision support only. Partial inputs support screening output; full PREVENT inputs are needed for risk calculation.
        </div>
      </div>
    </div>
  );
}