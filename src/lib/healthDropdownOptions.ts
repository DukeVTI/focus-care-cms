// Top 20 condition lists per the Health & Wellbeing spec

export const physicalHealthConditions = [
  "Asthma",
  "Allergies (Hay Fever/Food)",
  "Eczema/Dermatitis",
  "Diabetes (Type 1/2)",
  "Epilepsy",
  "Chronic Pain",
  "Migraines",
  "Irritable Bowel Syndrome (IBS)",
  "Severe Acne",
  "Hearing/Vision Impairment",
  "High Blood Pressure",
  "Autoimmune Disorder",
  "Sleep Disorder",
  "Physical Disability",
  "Long-term Injury",
  "Contagious Illness (specify)",
  "Iron Deficiency",
  "Chronic Fatigue",
  "Gynaecological Condition (specify)",
  "Other",
];

export const substanceMisuseOptions = [
  "Cannabis",
  "Alcohol",
  "Nicotine/Vaping (High Use)",
  "Powder Cocaine",
  "Ecstasy (MDMA)",
  "Ketamine",
  "Solvents/Inhalants (Glue/Gas/Aerosols)",
  "Benzodiazepines (e.g., Xanax)",
  "New/Synthetic Psychoactive Substances (NPS)",
  "Amphetamines",
  "Heroin",
  "Crack Cocaine",
  "Fentanyl/Other Opiates",
  "Codeine/Prescription Misuse",
  "Volatile Substance Use",
  "Steroids",
  "Hallucinogens",
  "Laughing Gas (Nitrous Oxide)",
  "Multiple Substances (Polydrug Use)",
  "Other",
];

export const mentalHealthConditions = [
  "Depression",
  "Generalised Anxiety Disorder (GAD)",
  "Social Anxiety",
  "Eating Disorder (Specify: Anorexia/Bulimia/BED)",
  "Self-Harm/Suicidal Ideation",
  "Post-Traumatic Stress Disorder (PTSD)",
  "Obsessive-Compulsive Disorder (OCD)",
  "Attention Deficit Hyperactivity Disorder (ADHD)",
  "Autism Spectrum Disorder (ASD)",
  "Psychosis/Schizophrenia",
  "Bipolar Disorder",
  "Borderline Personality Disorder (BPD)",
  "Conduct Disorder",
  "Phobias (Specific/Social)",
  "Unspecified Emotional Disorder",
  "Attachment Disorder",
  "Adjustment Disorder",
  "Dissociative Disorder",
  "Tics/Tourette's Syndrome",
  "Other",
];

export const visitTypeOptions = [
  { value: "gp", label: "GP" },
  { value: "hospital", label: "Hospital" },
  { value: "dental", label: "Dental" },
  { value: "optician", label: "Optician" },
];

export const severityLabels: Record<number, string> = {
  1: "Low Impact / Well Controlled",
  2: "Mild Impact",
  3: "Moderate Impact",
  4: "Significant Impact",
  5: "Severe Impact / Crisis",
};

export const categoryLabels: Record<string, string> = {
  physical: "Physical Health Conditions",
  substance: "Substance Misuse",
  mental_health: "Mental Health Conditions",
};

export const categoryOptions: Record<string, string[]> = {
  physical: physicalHealthConditions,
  substance: substanceMisuseOptions,
  mental_health: mentalHealthConditions,
};
