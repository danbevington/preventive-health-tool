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

export function riskCat(r) {
  if (r == null) return { label: "Not calculated", range: "" };
  if (r < 3) return { label: "Low", range: "<3%" };
  if (r < 5) return { label: "Borderline", range: "3–<5%" };
  if (r < 10) return { label: "Intermediate", range: "5–<10%" };
  return { label: "High", range: "≥10%" };
}