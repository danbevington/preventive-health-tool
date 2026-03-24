export function buildStatinPathway(form, preventRisk) {
  const age = Number(form.age || 0);
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

  // =========================
  // SECONDARY PREVENTION
  // =========================
  if (knownAscvd) {
    pathway = "Secondary prevention";

    recommendation = "High-intensity statin unless contraindicated";
    goal = veryHighRisk ? "LDL-C <55 mg/dL" : "LDL-C <70 mg/dL";

    notes.push("Consider ezetimibe/PCSK9 if LDL-C above goal.");
    return { pathway, recommendation, goal, enhancers, notes };
  }

  // =========================
  // LDL ≥190 (Severe hypercholesterolemia)
  // =========================
  if (ldl >= 190) {
    pathway = "Severe hypercholesterolemia";

    recommendation = "High-intensity statin";
    goal = "≥50% LDL-C reduction and LDL-C <100 mg/dL";

    notes.push("Evaluate for familial hypercholesterolemia.");
    notes.push("Add ezetimibe/PCSK9 if not at goal.");

    return { pathway, recommendation, goal, enhancers, notes };
  }

  // =========================
  // DIABETES PATHWAY
  // =========================
  if (diabetes && age >= 40 && age <= 75) {
    pathway = "Diabetes (primary prevention)";

    recommendation = "At least moderate-intensity statin";

    if (preventRisk >= 20) {
      recommendation = "High-intensity statin recommended";
    } else if (preventRisk >= 7.5) {
      recommendation = "Consider high-intensity statin";
    }

    goal = "≥30–50% LDL-C reduction (≥50% if higher risk)";

    notes.push("Consider high-intensity statin if multiple risk factors.");

    // continue to enhancers (do not return yet)
  }

  // =========================
  // PRIMARY PREVENTION (PREVENT RISK)
  // =========================
  if (!knownAscvd && ldl < 190 && !diabetes) {
    pathway = "Primary prevention (PREVENT-based)";

    if (preventRisk == null) {
      recommendation = "Complete PREVENT inputs required";
      goal = "Pending risk calculation";
      return { pathway, recommendation, goal, enhancers, notes };
    }

    if (preventRisk >= 20) {
      recommendation = "High-intensity statin recommended";
      goal = "≥50% LDL-C reduction";
    } else if (preventRisk >= 7.5) {
      recommendation = "Moderate- to high-intensity statin reasonable";
      goal = "≥30–50% LDL-C reduction";
    } else if (preventRisk >= 5) {
      recommendation = "Consider statin after shared decision-making";
      goal = "Risk-based LDL-C reduction";
    } else {
      recommendation = "Lifestyle-first management";
      goal = "Risk-based LDL-C reduction";
    }
  }

  // =========================
  // RISK ENHANCERS
  // =========================
  if (ldl >= 160) enhancers.push("LDL-C ≥160 mg/dL");
  if (tg >= 175) enhancers.push("Triglycerides ≥175 mg/dL");
  if (apob >= 130) enhancers.push("ApoB ≥130 mg/dL");
  if (lpa >= 50) enhancers.push("Lp(a) ≥50 mg/dL");

  // =========================
  // CAC GUIDANCE (VERY IMPORTANT)
  // =========================
  if (cac === 0 && preventRisk >= 5 && preventRisk < 20) {
    notes.push("CAC = 0 may support deferring statin (if no high-risk features).");
  }

  if (cac > 0 && cac < 100) {
    enhancers.push(`CAC 1–99 (favors statin)`);
  }

  if (cac >= 100 || cac >= 75) {
    enhancers.push(`CAC ≥100 (strong statin indication)`);
    notes.push("CAC ≥100 strongly supports statin therapy.");
  }

  // =========================
  // TRIGLYCERIDES
  // =========================
  if (tg >= 500) {
    notes.push("Evaluate severe hypertriglyceridemia (pancreatitis risk).");
  }

  return { pathway, recommendation, goal, enhancers, notes };
}