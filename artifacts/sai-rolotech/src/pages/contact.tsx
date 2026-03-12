import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Phone, MapPin, Mail, MessageCircle, Loader2, CheckCircle, ExternalLink, FileText, Shield, Navigation } from "lucide-react";
import { useState } from "react";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { SiWhatsapp, SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";

const enquirySchema = insertLeadSchema.extend({
  name: insertLeadSchema.shape.name.min(2, "Name is required"),
  phone: insertLeadSchema.shape.phone.min(10, "Valid phone number required"),
});

type EnquiryValues = z.infer<typeof enquirySchema>;

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", phone: "", location: "", interest: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: EnquiryValues) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Enquiry Sent", description: "We'll get back to you soon." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const socials = [
    { icon: SiWhatsapp, label: "WhatsApp", url: "https://wa.me/919090486262", color: "text-emerald-500" },
    { icon: SiFacebook, label: "Facebook", url: "https://facebook.com/sairolotech", color: "text-blue-600" },
    { icon: SiInstagram, label: "Instagram", url: "https://instagram.com/sairolotech", color: "text-pink-500" },
    { icon: SiYoutube, label: "YouTube", url: "https://youtube.com/@sairolotech", color: "text-red-500" },
  ];

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-contact-title">
          <Phone className="w-5 h-5 text-primary" />
          Contact Us
        </h1>
        <p className="text-sm text-muted-foreground">Get in touch with Sai Rolotech</p>
      </div>

      <Card className="p-4 mb-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Phone & WhatsApp</p>
              <a href="tel:+919090486262" className="text-sm text-primary font-medium" data-testid="link-phone">
                +91 9090-486-262
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Address</p>
              <p className="text-sm text-muted-foreground" data-testid="text-address">
                Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi - 110041
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Email</p>
              <a href="mailto:sairolotech@gmail.com" className="text-sm text-primary font-medium" data-testid="link-email">
                sairolotech@gmail.com
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Link href="/super-navigation" data-testid="link-super-navigation">
        <Card className="p-4 mb-4 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">How to Reach / कैसे पहुंचें</p>
              <p className="text-xs text-muted-foreground">Step-by-step from Mundka Metro → Factory</p>
            </div>
            <ExternalLink className="w-4 h-4 text-primary shrink-0" />
          </div>
        </Card>
      </Link>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-md bg-card border border-card-border"
            data-testid={`link-social-${s.label.toLowerCase()}`}
          >
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </a>
        ))}
      </div>

      {submitted ? (
        <Card className="p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-1" data-testid="text-enquiry-success">Enquiry Received</h3>
          <p className="text-sm text-muted-foreground mb-4">Our team will contact you shortly.</p>
          <Button variant="outline" onClick={() => setSubmitted(false)} data-testid="button-send-another">
            Send Another Enquiry
          </Button>
        </Card>
      ) : (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-4" data-testid="text-enquiry-form">Quick Enquiry</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} data-testid="input-contact-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" type="tel" {...field} data-testid="input-contact-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} data-testid="input-contact-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interested In (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., POP Channel Machine" {...field} data-testid="input-contact-interest" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-enquiry">
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><MessageCircle className="w-4 h-4 mr-2" /> Send Enquiry</>
                )}
              </Button>
            </form>
          </Form>
        </Card>
      )}

      <div className="border-t pt-4 mt-4">
        <p className="text-[10px] text-muted-foreground text-center mb-2">Legal</p>
        <div className="flex justify-center gap-4">
          <Link href="/terms" className="text-xs text-primary flex items-center gap-1" data-testid="link-terms">
            <FileText className="w-3.5 h-3.5" /> Terms & Conditions
          </Link>
          <Link href="/privacy" className="text-xs text-primary flex items-center gap-1" data-testid="link-privacy">
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
