// ===============================
// AHA PREVENT-ASCVD ENGINE (JS)
// ===============================

export const PREVENT = {
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

// ===============================
// MAIN CALCULATION
// ===============================
export function calcPreventAscvd({
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
    !Number.isFinite(age) ||
    !Number.isFinite(sbp) ||
    !Number.isFinite(totalC) ||
    !Number.isFinite(hdlC) ||
    !Number.isFinite(egfr) ||
    !Number.isFinite(bmi) ||
    !["female", "male"].includes(sex)
  ) {
    return null;
  }

  const c = PREVENT[sex];

  // ===============================
  // UNIT CONVERSION
  // ===============================
  const toMmol = (mg) => mg / 38.67;

  const nonHdl = totalC - hdlC;

  // ===============================
  // CENTERING / SCALING (AHA STYLE)
  // ===============================
  const ageScaled = (age - 55) / 10;

  const nonHdlScaled = toMmol(nonHdl) - 3.5;
  const hdlScaled = (toMmol(hdlC) - 1.3) / 0.3;

  const sbpLow = (Math.min(sbp, 110) - 110) / 20;
  const sbpHigh = (Math.max(sbp, 110) - 130) / 20;

  const bmiLow = (Math.min(bmi, 30) - 25) / 5;
  const bmiHigh = (Math.max(bmi, 30) - 30) / 5;

  const egfrLow = (Math.min(egfr, 60) - 60) / -15;
  const egfrHigh = (Math.max(egfr, 60) - 90) / -15;

  const dmVal = dm ? 1 : 0;
  const smokeVal = smoking ? 1 : 0;
  const bpVal = bpTx ? 1 : 0;
  const statinVal = statin ? 1 : 0;

  // ===============================
  // LINEAR PREDICTOR (LP)
  // ===============================
  const lp =
    c.age * ageScaled +
    c.nonHdlC * nonHdlScaled +
    c.hdlC * hdlScaled +
    c.sbpLt110 * sbpLow +
    c.sbpGte110 * sbpHigh +
    c.dm * dmVal +
    c.smoking * smokeVal +
    c.bmiLt30 * bmiLow +
    c.bmiGte30 * bmiHigh +
    c.egfrLt60 * egfrLow +
    c.egfrGte60 * egfrHigh +
    c.bpTx * bpVal +
    c.statin * statinVal +

    // INTERACTIONS
    c.bpTxSbpGte110 * (bpVal * sbpHigh) +
    c.statinNonHdlC * (statinVal * nonHdlScaled) +
    c.ageNonHdlC * (ageScaled * nonHdlScaled) +
    c.ageHdlC * (ageScaled * hdlScaled) +
    c.ageSbpGte110 * (ageScaled * sbpHigh) +
    c.ageDm * (ageScaled * dmVal) +
    c.ageSmoking * (ageScaled * smokeVal) +
    c.ageBmiGte30 * (ageScaled * bmiHigh) +
    c.ageEgfrLt60 * (ageScaled * egfrLow) +
    c.constant;

  // ===============================
  // LOGISTIC TRANSFORMATION
  // ===============================
  const risk = Math.exp(lp) / (1 + Math.exp(lp));

  return Math.round(risk * 1000) / 10; // 1 decimal %
}

// ===============================
// RISK CATEGORIES (PREVENT-ALIGNED)
// ===============================
export function riskCat(r) {
  if (r == null) return { label: "Not calculated", range: "" };

  if (r < 5) return { label: "Low", range: "<5%" };
  if (r < 7.5) return { label: "Borderline", range: "5–<7.5%" };
  if (r < 20) return { label: "Intermediate", range: "7.5–<20%" };

  return { label: "High", range: "≥20%" };
}