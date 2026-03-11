import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-sm" data-testid="text-terms-title">Terms & Conditions</h1>
      </div>

      <div className="px-4 pt-4 pb-8 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-xs text-muted-foreground mb-4" data-testid="text-effective-date">Effective Date: March 2026</p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-platform-role">Platform Role</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sai Rolotech is a digital industrial marketplace and ecosystem platform for roll forming machines, spare parts, AMC services, supplier connections, and related industrial tools. The platform connects buyers, vendors, service partners, and the Sai Rolotech manufacturing team.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-user-accounts">User Accounts</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          By creating an account, you agree to provide accurate information including your name, phone number, and email address. You are responsible for maintaining the security of your account credentials. Sai Rolotech reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-pricing">Pricing Policy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All prices displayed on the platform are indicative and subject to change. Final pricing will be confirmed through a signed quotation. All prices are exclusive of GST (18%) unless explicitly stated otherwise. Machine prices vary based on model, number of rolls, automation level (Raw/Semi-Automatic/Automatic), and tier (Basic/Medium/Advance). Transportation, packaging, and installation charges are additional.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-payment">Payment Terms</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Standard payment structure: 50% advance with confirmed order, 30% on work progress, and 20% balance at the time of machine delivery. Order once booked/confirmed cannot be cancelled. Any advance paid will be forfeited if the buyer fails to take delivery within one month of the stipulated time after machines are ready for dispatch.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-delivery">Delivery & Warranty</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Machine delivery time is typically 20 to 60 days from order confirmation. Trial material arrangement is the responsibility of the buyer. Machine rolls warranty varies by tier: Basic (1 year), Medium (2 years), Advance (3+2 = 5 years). Truck loading charges, packaging, and transportation are extra.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-dealer">Dealer Policy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Channel partner and dealer margins may be included in quoted prices as applicable. Dealer commissions and margins are governed by separate dealer agreements. Unauthorized resale or representation of Sai Rolotech products is prohibited.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-loan">Loan & EMI Disclaimer</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          EMI calculations displayed on this platform are for illustration purposes only and do not constitute a loan offer or guarantee. Actual loan terms, interest rates, and eligibility are determined by the respective financing institution. Sai Rolotech is not a financial institution and does not provide loans directly. Finance stage tracking is for internal CRM purposes and does not guarantee loan approval.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-amc">AMC Policy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Annual Maintenance Contract (AMC) coverage is subject to the plan selected (Basic/Standard/Premium). AMC subscriptions are created in pending status and activated upon payment confirmation. AMC does not cover damage caused by misuse, unauthorized modifications, or natural disasters. Service visits are scheduled as per the plan terms and availability.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-supplier">Supplier Marketplace</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sai Rolotech acts as a marketplace connecting buyers with third-party suppliers. While we verify supplier credentials, Sai Rolotech is not responsible for the quality, delivery, or performance of products sold by third-party suppliers. Disputes between buyers and suppliers should be resolved directly between the parties.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-ip">Intellectual Property</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All content, designs, machine specifications, pricing data, and brand materials on this platform are the intellectual property of M/S Sai Rolotech. Unauthorized reproduction, distribution, or commercial use is strictly prohibited.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-limitation">Limitation of Liability</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sai Rolotech shall not be liable for any indirect, incidental, or consequential damages arising from the use of this platform. The platform is provided "as is" without warranties of any kind. Maximum liability is limited to the amount paid for the specific service or product in question.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-jurisdiction">Jurisdiction</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          These terms and conditions are governed by the laws of India. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-contact">Contact</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          M/S Sai Rolotech<br />
          Plot No 575/1 G.F, Mundka Industrial Area, New Delhi - 110041<br />
          Phone: +91 9090-486-262<br />
          Email: sairolotech@gmail.com<br />
          Web: www.sairolotech.com
        </p>
      </div>
    </div>
  );
}
