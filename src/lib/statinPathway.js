export function buildStatinPathway(form, preventRisk) {
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

  if (cac === 0) notes.push("CAC = 0 may support deferring statin in selected primary prevention cases.");
  if (cac >= 100) notes.push("CAC supports stronger statin consideration.");
  if (tg >= 500) notes.push("Evaluate severe hypertriglyceridemia management.");

  return { pathway, recommendation, goal, enhancers, notes };
}