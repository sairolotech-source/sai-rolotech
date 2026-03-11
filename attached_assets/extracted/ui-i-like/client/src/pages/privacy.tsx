import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-sm" data-testid="text-privacy-title">Privacy Policy</h1>
      </div>

      <div className="px-4 pt-4 pb-8 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-xs text-muted-foreground mb-4" data-testid="text-effective-date">Effective Date: March 2026</p>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Sai Rolotech ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web platform.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-collected">Data Collected</h2>

        <h3 className="text-sm font-semibold mt-4 mb-1">Personal Information</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Company name (optional)</li>
          <li>GST number (optional)</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Purpose:</strong> Account creation, quotation generation, communication, and customer support.
        </p>

        <h3 className="text-sm font-semibold mt-4 mb-1">Financial Information</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Quotation amounts and purchase details</li>
          <li>EMI calculation inputs (machine price, down payment, interest rate)</li>
          <li>AMC subscription details</li>
          <li>Finance stage information (for loan tracking)</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Purpose:</strong> Machine quotation, finance illustration, AMC management. No direct payment card data is stored on our platform.
        </p>

        <h3 className="text-sm font-semibold mt-4 mb-1">Location Data</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Approximate location (city/state)</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Purpose:</strong> Connecting you with nearby service partners and dealers. Location is collected only with your consent.
        </p>

        <h3 className="text-sm font-semibold mt-4 mb-1">User-Generated Content</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Troubleshooting descriptions and YouTube video links</li>
          <li>Support ticket details</li>
          <li>Supplier reviews and ratings</li>
          <li>Service request descriptions</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Purpose:</strong> Service support, quality improvement, and community engagement.
        </p>

        <h3 className="text-sm font-semibold mt-4 mb-1">App Activity</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Lead tracking and quotation history</li>
          <li>Visit booking records</li>
          <li>AMC subscription activity</li>
          <li>Support ticket history</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-1">
          <strong>Purpose:</strong> CRM, automation, and improving your experience.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-usage">How We Use Your Data</h2>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>To provide and maintain our platform services</li>
          <li>To generate and deliver machine quotations</li>
          <li>To process and manage AMC subscriptions</li>
          <li>To connect you with service partners and suppliers</li>
          <li>To send transactional notifications via WhatsApp</li>
          <li>To improve our products and customer experience</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-security">Data Security</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your data is encrypted in transit and at rest. We use session-based authentication with secure cookies. Passwords are hashed using industry-standard algorithms. Database access is restricted and monitored. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-third-party">Third-Party Services</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We may share limited data with the following types of third-party services for core platform functionality:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
          <li><strong>Service Partners:</strong> Lead sharing for service coordination and support</li>
          <li><strong>WhatsApp (Meta):</strong> For transactional notifications and customer communication</li>
          <li><strong>Database Services:</strong> PostgreSQL for secure data storage</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          We do <strong>not</strong> sell your personal data to any third party. Data is shared only as necessary for core platform functionality.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-no-tracking">Advertising & Tracking</h2>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>We do <strong>not</strong> use advertising tracking</li>
          <li>We do <strong>not</strong> engage in third-party ad targeting</li>
          <li>We do <strong>not</strong> perform cross-app tracking</li>
          <li>No App Tracking Transparency (ATT) prompt is required as we do not track users across apps</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-user-rights">Your Rights</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You have the right to:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
          <li><strong>Access:</strong> Request a copy of your personal data held by us</li>
          <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
          <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          To exercise any of these rights, contact us at sairolotech@gmail.com or call +91 9090-486-262.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-retention">Data Retention</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We retain your personal data for as long as your account is active or as needed to provide you services. Lead and quotation data may be retained for business records and legal compliance. You may request deletion at any time.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-children">Children's Privacy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-changes">Changes to This Policy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the revised policy.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-contact">Contact Us</h2>
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
