import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertServiceRequestSchema } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Wrench, Phone, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const serviceFormSchema = insertServiceRequestSchema.extend({
  clientName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  machineType: z.string().min(1, "Machine type is required"),
  problem: z.string().min(10, "Please describe the problem"),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function Service() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      clientName: "",
      phone: "",
      machineType: "",
      problem: "",
      urgency: "normal",
      status: "pending",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceFormValues) =>
      apiRequest("POST", "/api/service-requests", data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      toast({
        title: "Request Submitted",
        description: "Our service team will contact you shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="pb-24 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold mb-2" data-testid="text-success-title">Request Submitted</h2>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm" data-testid="text-success-desc">
          Our service team will contact you within 2 hours during business hours.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-new-request">
            New Request
          </Button>
          <Button asChild data-testid="button-call-support">
            <a href="tel:+919090486262">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-service-title">
          <Wrench className="w-5 h-5 text-primary" />
          Service Request
        </h1>
        <p className="text-sm text-muted-foreground">Report a machine issue and get expert support</p>
      </div>

      <Card className="p-4 mb-4 bg-amber-500/5 border-amber-500/10">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1">Need urgent help?</p>
            <p className="text-xs text-muted-foreground mb-2">Call our service hotline for immediate assistance</p>
            <Button size="sm" variant="outline" asChild data-testid="button-urgent-call">
              <a href="tel:+919090486262">
                <Phone className="w-4 h-4 mr-1" />
                +91 9090-486-262
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <Card className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} data-testid="input-service-name" />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" type="tel" {...field} data-testid="input-service-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="machineType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-machine-type">
                        <SelectValue placeholder="Select machine type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="POP Channel">POP Channel Machine</SelectItem>
                      <SelectItem value="Shutter Patti">Shutter Patti Machine</SelectItem>
                      <SelectItem value="C-Channel">C-Channel Machine</SelectItem>
                      <SelectItem value="T-Grid">T-Grid Machine</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-urgency">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent - Machine Down</SelectItem>
                      <SelectItem value="scheduled">Scheduled Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the Problem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the issue with your machine..."
                      className="resize-none min-h-[100px]"
                      {...field}
                      data-testid="textarea-problem"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-service"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 mr-2" />
                Submit Service Request
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
