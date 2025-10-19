import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { IdentityBasicsStep } from "./wizard-steps/IdentityBasicsStep";
import { LegalCareStatusStep } from "./wizard-steps/LegalCareStatusStep";
import { KeyContactsStep } from "./wizard-steps/KeyContactsStep";
import { HealthWellbeingStep } from "./wizard-steps/HealthWellbeingStep";
import { EducationStep } from "./wizard-steps/EducationStep";
import { SafeguardingStep } from "./wizard-steps/SafeguardingStep";
import { CulturePreferencesStep } from "./wizard-steps/CulturePreferencesStep";
import { DocumentsConsentsStep } from "./wizard-steps/DocumentsConsentsStep";
import { SystemAssignmentStep } from "./wizard-steps/SystemAssignmentStep";

// Full form schema
const youngPersonSchema = z.object({
  // Identity & Basics
  profilePhoto: z.any().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  preferredName: z.string().max(100).optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  pronouns: z.string().optional(),
  gender: z.string().optional(),
  ethnicity: z.string().optional(),
  primaryLanguage: z.string().optional(),
  interpreterRequired: z.boolean().default(false),
  nationality: z.string().optional(),
  photoConsent: z.enum(["yes", "no", "not_obtained"]).optional(),

  // Legal & Care Status
  placementType: z.string().min(1, "Placement type is required"),
  placementStartDate: z.string().min(1, "Placement start date is required"),
  placementAddress: z.string().min(1, "Placement address is required").max(500),
  placementRoadName: z.string().min(1, "Road name is required").max(200),
  placementPostcode: z.string()
    .min(1, "Postcode is required")
    .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode format"),
  legalStatus: z.string().min(1, "Legal status is required"),
  lookedAfterChild: z.boolean().default(false),
  iroName: z.string().optional(),
  nextLacReviewDate: z.string().optional(),
  courtOrders: z.string().optional(),

  // Key Contacts
  socialWorkerName: z.string().min(1, "Social worker name is required"),
  socialWorkerEmail: z.string().email("Invalid email").min(1, "Social worker email is required"),
  socialWorkerPhone: z.string().optional(),
  keyWorkerId: z.string().min(1, "Key worker is required"),
  gpPractice: z.string().optional(),
  schoolCollege: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactNotes: z.string().optional(),

  // Health & Wellbeing
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  allergies: z.array(z.string()).optional(),
  mentalHealthSupport: z.boolean().default(false),
  mentalHealthService: z.string().optional(),
  mentalHealthWorker: z.string().optional(),
  mentalHealthNextAppointment: z.string().optional(),
  disabilityNeeds: z.array(z.string()).optional(),

  // Education
  educationSetting: z.string().optional(),
  yearGroup: z.string().optional(),
  ehcpStatus: z.enum(["yes", "no", "pending"]).optional(),
  ehcpReviewDate: z.string().optional(),
  attendanceConcerns: z.boolean().default(false),
  attendanceDescription: z.string().optional(),

  // Safeguarding
  knownRisks: z.array(z.string()).optional(),
  triggers: z.string().optional(),
  protectiveFactors: z.string().optional(),
  initialRiskSummary: z.string().min(20, "Must be at least 20 characters").max(400, "Must be less than 400 characters"),

  // Culture & Preferences
  religion: z.string().optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  activitiesInterests: z.array(z.string()).optional(),
  communicationPreferences: z.array(z.string()).optional(),

  // Documents & Consents
  documents: z.array(z.object({
    type: z.string(),
    file: z.any(),
    expiryDate: z.string().optional(),
  })).optional(),
  dataSharingConsent: z.string().optional(),
  dataSharingNotes: z.string().optional(),

  // System & Assignment
  assignedTeam: z.string().optional(),
  visibility: z.string().default("all_staff"),
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().optional(),
});

type YoungPersonFormValues = z.infer<typeof youngPersonSchema>;

const steps = [
  { 
    id: 1, 
    title: "Identity & Basics", 
    component: IdentityBasicsStep,
    fields: ["firstName", "lastName", "dateOfBirth"]
  },
  { 
    id: 2, 
    title: "Legal & Care Status", 
    component: LegalCareStatusStep,
    fields: ["placementType", "placementStartDate", "placementAddress", "placementRoadName", "placementPostcode", "legalStatus"]
  },
  { 
    id: 3, 
    title: "Key Contacts", 
    component: KeyContactsStep,
    fields: ["socialWorkerName", "socialWorkerEmail", "keyWorkerId"]
  },
  { 
    id: 4, 
    title: "Health & Wellbeing", 
    component: HealthWellbeingStep,
    fields: []
  },
  { 
    id: 5, 
    title: "Education", 
    component: EducationStep,
    fields: []
  },
  { 
    id: 6, 
    title: "Safeguarding", 
    component: SafeguardingStep,
    fields: ["initialRiskSummary"]
  },
  { 
    id: 7, 
    title: "Culture & Preferences", 
    component: CulturePreferencesStep,
    fields: []
  },
  { 
    id: 8, 
    title: "Documents & Consents", 
    component: DocumentsConsentsStep,
    fields: []
  },
  { 
    id: 9, 
    title: "System & Assignment", 
    component: SystemAssignmentStep,
    fields: []
  },
];

export const NewYoungPersonWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<YoungPersonFormValues>({
    resolver: zodResolver(youngPersonSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      dateOfBirth: "",
      pronouns: "",
      gender: "",
      ethnicity: "",
      primaryLanguage: "",
      nationality: "",
      interpreterRequired: false,
      placementType: "",
      placementStartDate: "",
      placementAddress: "",
      placementRoadName: "",
      placementPostcode: "",
      legalStatus: "",
      lookedAfterChild: false,
      iroName: "",
      nextLacReviewDate: "",
      courtOrders: "",
      socialWorkerName: "",
      socialWorkerEmail: "",
      socialWorkerPhone: "",
      keyWorkerId: "",
      gpPractice: "",
      schoolCollege: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      emergencyContactNotes: "",
      mentalHealthSupport: false,
      mentalHealthService: "",
      mentalHealthWorker: "",
      mentalHealthNextAppointment: "",
      educationSetting: "",
      yearGroup: "",
      attendanceConcerns: false,
      attendanceDescription: "",
      triggers: "",
      protectiveFactors: "",
      initialRiskSummary: "",
      religion: "",
      assignedTeam: "",
      visibility: "all_staff",
      internalNotes: "",
      medicalConditions: [],
      medications: [],
      allergies: [],
      disabilityNeeds: [],
      knownRisks: [],
      dietaryRequirements: [],
      activitiesInterests: [],
      communicationPreferences: [],
      tags: [],
      documents: [],
    },
  });

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = async () => {
    // Validate only current step's required fields before proceeding
    const currentStepFields = steps[currentStep - 1].fields;
    const isValid = currentStepFields.length === 0 || await form.trigger(currentStepFields as any);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      await saveYoungPerson(values, true);
      toast.success("Draft saved successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: YoungPersonFormValues) => {
    setIsSubmitting(true);
    try {
      await saveYoungPerson(values, false);
      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveYoungPerson = async (values: YoungPersonFormValues, isDraft: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Upload profile photo if provided
    let photoUrl = null;
    if (values.profilePhoto && values.profilePhoto[0]) {
      const file = values.profilePhoto[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('young-person-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path instead of generating a signed URL
      // Signed URLs will be generated on-demand when displaying photos
      photoUrl = fileName;
    }

    // Insert young person
    const { data: youngPerson, error: insertError } = await supabase
      .from("young_people")
      .insert({
        user_id: user.id,
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth,
        preferred_name: values.preferredName || null,
        pronouns: values.pronouns || null,
        gender: values.gender || null,
        ethnicity: values.ethnicity || null,
        primary_language: values.primaryLanguage || null,
        interpreter_required: values.interpreterRequired,
        nationality: values.nationality || null,
        photo_consent: values.photoConsent || null,
        photo_url: photoUrl,
        placement_type: values.placementType,
        placement_start_date: values.placementStartDate || null,
        placement_address: values.placementAddress,
        placement_road_name: values.placementRoadName,
        placement_postcode: values.placementPostcode,
        legal_status: values.legalStatus,
        looked_after_child: values.lookedAfterChild,
        iro_name: values.iroName || null,
        next_lac_review_date: values.nextLacReviewDate || null,
        court_orders: values.courtOrders || null,
        social_worker_name: values.socialWorkerName,
        social_worker_email: values.socialWorkerEmail,
        social_worker_phone: values.socialWorkerPhone || null,
        key_worker_id: values.keyWorkerId || null,
        gp_practice: values.gpPractice || null,
        school_college: values.schoolCollege || null,
        medical_conditions: values.medicalConditions || [],
        allergies: values.allergies || [],
        mental_health_support: values.mentalHealthSupport,
        mental_health_service: values.mentalHealthService || null,
        mental_health_worker: values.mentalHealthWorker || null,
        mental_health_next_appointment: values.mentalHealthNextAppointment || null,
        disability_needs: values.disabilityNeeds || [],
        education_setting: values.educationSetting || null,
        year_group: values.yearGroup || null,
        ehcp_status: values.ehcpStatus || null,
        ehcp_review_date: values.ehcpReviewDate || null,
        attendance_concerns: values.attendanceConcerns,
        attendance_description: values.attendanceDescription || null,
        known_risks: values.knownRisks || [],
        triggers: values.triggers || null,
        protective_factors: values.protectiveFactors || null,
        initial_risk_summary: values.initialRiskSummary,
        religion: values.religion || null,
        dietary_requirements: values.dietaryRequirements || [],
        activities_interests: values.activitiesInterests || [],
        communication_preferences: values.communicationPreferences || [],
        assigned_team: values.assignedTeam || null,
        visibility: values.visibility,
        tags: values.tags || [],
        internal_notes: values.internalNotes || null,
        draft: isDraft,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    if (!youngPerson) throw new Error("Failed to create young person");

    // Insert medications
    if (values.medications && values.medications.length > 0) {
      const medications = values.medications.map(med => ({
        young_person_id: youngPerson.id,
        medication_name: med.name,
        dosage: med.dosage || null,
        frequency: med.frequency || null,
        notes: med.notes || null,
      }));

      const { error: medError } = await supabase
        .from("young_person_medications")
        .insert(medications);

      if (medError) throw medError;
    }

    // Insert emergency contact if provided
    if (values.emergencyContactName) {
      const { error: contactError } = await supabase
        .from("young_person_contacts")
        .insert({
          young_person_id: youngPerson.id,
          contact_name: values.emergencyContactName,
          relationship: values.emergencyContactRelationship || null,
          phone: values.emergencyContactPhone || null,
          notes: values.emergencyContactNotes || null,
          is_emergency: true,
        });

      if (contactError) throw contactError;
    }

    // Upload and track documents
    if (values.documents && values.documents.length > 0) {
      for (const doc of values.documents) {
        if (doc.file && doc.file[0]) {
          const file = doc.file[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${youngPerson.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('young-person-documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { error: docError } = await supabase
            .from("young_person_documents")
            .insert({
              young_person_id: youngPerson.id,
              document_type: doc.type,
              file_path: fileName,
              file_name: file.name,
              expiry_date: doc.expiryDate || null,
            });

          if (docError) throw docError;
        }
      }
    }

    return youngPerson;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">
                {steps[currentStep - 1].title}
              </h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CurrentStepComponent form={form} />

              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t sticky bottom-0 bg-card pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  Create Profile
                </Button>
              )}
            </div>
          </form>
        </Form>
        </CardContent>
      </Card>
    </div>
  );
};
