import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Briefcase, MapPin, IndianRupee, Clock, Wrench,
  ChevronRight, X, Send, Loader2, CheckCircle2
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  department: string;
  experience: string;
  skills: string[];
  location: string;
  salaryRange: string;
  category: "general" | "roll_forming";
}

const JOBS: JobListing[] = [
  {
    id: "lathe-operator",
    title: "Lathe Machine Operator",
    department: "Production",
    experience: "2-5 years",
    skills: ["Lathe operation", "Blueprint reading", "Precision measurement", "Tool setting"],
    location: "Mundka, New Delhi",
    salaryRange: "₹15,000 - ₹25,000/month",
    category: "general",
  },
  {
    id: "shaper-operator",
    title: "Shaper Machine Operator",
    department: "Production",
    experience: "1-3 years",
    skills: ["Shaper machine operation", "Metal shaping", "Surface finishing", "Dimensional accuracy"],
    location: "Mundka, New Delhi",
    salaryRange: "₹12,000 - ₹22,000/month",
    category: "general",
  },
  {
    id: "welder",
    title: "Welder (MIG/TIG/Arc)",
    department: "Fabrication",
    experience: "2-5 years",
    skills: ["MIG welding", "TIG welding", "Arc welding", "Structural welding", "Blueprint reading"],
    location: "Mundka, New Delhi",
    salaryRange: "₹15,000 - ₹28,000/month",
    category: "general",
  },
  {
    id: "cnc-operator",
    title: "CNC Operator",
    department: "Production",
    experience: "3-6 years",
    skills: ["CNC programming", "G-code", "CAD/CAM", "Precision machining", "Quality control"],
    location: "Mundka, New Delhi",
    salaryRange: "₹20,000 - ₹35,000/month",
    category: "general",
  },
  {
    id: "vmc-operator",
    title: "VMC Operator",
    department: "Production",
    experience: "2-5 years",
    skills: ["VMC operation", "Tool management", "Program editing", "Quality inspection"],
    location: "Mundka, New Delhi",
    salaryRange: "₹18,000 - ₹30,000/month",
    category: "general",
  },
  {
    id: "mechanical-technician",
    title: "Technical/Mechanical Technician",
    department: "Maintenance",
    experience: "1-4 years",
    skills: ["Mechanical repair", "Preventive maintenance", "Troubleshooting", "Electrical basics"],
    location: "Mundka, New Delhi",
    salaryRange: "₹14,000 - ₹24,000/month",
    category: "general",
  },
  {
    id: "shutter-operator",
    title: "Shutter Operator",
    department: "Roll Forming",
    experience: "1-3 years",
    skills: ["Roll forming machine operation", "Shutter patti profiling", "Coil loading", "Quality check"],
    location: "Mundka, New Delhi",
    salaryRange: "₹15,000 - ₹25,000/month",
    category: "roll_forming",
  },
  {
    id: "false-ceiling-operator",
    title: "False Ceiling Operator",
    department: "Roll Forming",
    experience: "1-3 years",
    skills: ["False ceiling machine operation", "POP/Gypsum channel profiling", "Profile measurement", "Machine maintenance"],
    location: "Mundka, New Delhi",
    salaryRange: "₹15,000 - ₹25,000/month",
    category: "roll_forming",
  },
];

function JobCard({ job, onApply }: { job: JobListing; onApply: (job: JobListing) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="p-4 mb-3" data-testid={`card-job-${job.id}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm" data-testid={`text-job-title-${job.id}`}>{job.title}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Briefcase className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{job.department}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {job.category === "roll_forming" ? "Roll Forming" : "General"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{job.experience}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <IndianRupee className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">{job.salaryRange}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
              {skill}
            </Badge>
          ))}
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={() => onApply(job)}
          data-testid={`button-apply-${job.id}`}
        >
          Apply Now
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Card>
    </motion.div>
  );
}

function ApplicationModal({
  job,
  onClose,
}: {
  job: JobListing;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const applyMutation = useMutation({
    mutationFn: async (data: {
      jobTitle: string;
      jobCategory: string;
      applicantName: string;
      phone: string;
      experience: string;
    }) => {
      await apiRequest("POST", "/api/job-applications", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      import("@/lib/google-analytics").then((m) => m.trackJobApply(job.title));
      toast({ title: "Application submitted!" });
    },
    onError: () => {
      toast({ title: "Failed to submit application", variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !experience.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    applyMutation.mutate({
      jobTitle: job.title,
      jobCategory: job.category === "roll_forming" ? "Roll Forming Machine Operators" : "Machine Operators",
      applicantName: name.trim(),
      phone: phone.trim(),
      experience: experience.trim(),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="modal-apply"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold">Apply for Job</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent" data-testid="button-close-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Application Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We will review your application and contact you soon.
            </p>
            <Button onClick={onClose} data-testid="button-done">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="applicant-name" className="text-xs font-medium">Full Name *</Label>
              <Input
                id="applicant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                data-testid="input-applicant-name"
              />
            </div>

            <div>
              <Label htmlFor="applicant-phone" className="text-xs font-medium">Phone Number *</Label>
              <Input
                id="applicant-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                data-testid="input-applicant-phone"
              />
            </div>

            <div>
              <Label htmlFor="applicant-experience" className="text-xs font-medium">Years of Experience *</Label>
              <Input
                id="applicant-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3 years"
                data-testid="input-applicant-experience"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={applyMutation.isPending}
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Jobs() {
  const [, setLocation] = useLocation();
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  const generalJobs = JOBS.filter((j) => j.category === "general");
  const rollFormingJobs = JOBS.filter((j) => j.category === "roll_forming");

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-jobs-title">Jobs & Careers</h1>
            <p className="text-xs text-muted-foreground">Browse open positions at Sai Rolotech</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5" />
            <h2 className="text-sm font-bold">We're Hiring!</h2>
          </div>
          <p className="text-xs text-white/80">
            Join our team of skilled professionals. We offer competitive salaries, growth opportunities, and a great work environment.
          </p>
        </div>
      </div>

      <div className="px-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-sm font-bold" data-testid="text-section-general">Machine Operator Jobs</h2>
            <Badge variant="secondary" className="text-[10px]">{generalJobs.length} open</Badge>
          </div>
          {generalJobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={setSelectedJob} />
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-cyan-500 rounded-full" />
            <h2 className="text-sm font-bold" data-testid="text-section-roll-forming">Roll Forming Machine Jobs</h2>
            <Badge variant="secondary" className="text-[10px]">{rollFormingJobs.length} open</Badge>
          </div>
          {rollFormingJobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={setSelectedJob} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <ApplicationModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
