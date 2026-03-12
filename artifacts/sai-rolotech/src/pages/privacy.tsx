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
        <h1 className="font-bold text-sm" data-testid="text-privacy-title">Privacy Notice / गोपनीयता सूचना</h1>
      </div>

      <div className="px-4 pt-4 pb-8 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-xs text-muted-foreground mb-1" data-testid="text-effective-date">Effective Date: March 2026 | Version 1.0</p>
        <p className="text-[10px] text-muted-foreground mb-4">Compliant with Digital Personal Data Protection Act (DPDPA) 2023, India</p>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Sai Rolotech ("we", "our", "us") is committed to protecting your privacy and personal data. This Privacy Notice explains how we collect, use, disclose, and safeguard your information in compliance with India's Digital Personal Data Protection Act (DPDPA) 2023. By using our platform, you acknowledge this notice.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          साई रोलोटेक आपकी गोपनीयता और व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध है। यह गोपनीयता सूचना भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट (DPDPA) 2023 के अनुसार है।
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-controller">1. Data Controller / डेटा नियंत्रक</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>M/S Sai Rolotech (Data Fiduciary)</strong><br />
          Plot No 575/1 G.F, Mundka Industrial Area, New Delhi - 110041<br />
          Phone: +91 9090-486-262<br />
          Email: sairolotech@gmail.com<br />
          Web: www.sairolotech.com
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-collected">2. Categories of Data Collected / एकत्र किए गए डेटा की श्रेणियां</h2>

        <h3 className="text-sm font-semibold mt-4 mb-1">Personal Information</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Name / नाम</li>
          <li>Email address / ईमेल पता</li>
          <li>Phone number / फोन नंबर</li>
          <li>Company name (optional) / कंपनी का नाम (वैकल्पिक)</li>
          <li>GST number (optional) / GST नंबर (वैकल्पिक)</li>
          <li>Location (city/state) / स्थान (शहर/राज्य)</li>
        </ul>

        <h3 className="text-sm font-semibold mt-4 mb-1">Financial Information / वित्तीय जानकारी</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Quotation amounts and purchase details</li>
          <li>EMI calculation inputs (machine price, down payment, interest rate)</li>
          <li>AMC subscription details</li>
          <li>Finance stage information (for loan tracking)</li>
        </ul>

        <h3 className="text-sm font-semibold mt-4 mb-1">Technical Data / तकनीकी डेटा</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Device fingerprint (browser user agent)</li>
          <li>IP address (for consent records)</li>
          <li>Push notification subscription data</li>
          <li>Session information</li>
        </ul>

        <h3 className="text-sm font-semibold mt-4 mb-1">User-Generated Content</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Support ticket descriptions and images</li>
          <li>Supplier reviews and ratings</li>
          <li>Community posts and content</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-purpose">3. Purpose of Processing / प्रसंस्करण का उद्देश्य</h2>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li><strong>Service Delivery:</strong> Account management, quotation generation, AMC subscriptions</li>
          <li><strong>Communication:</strong> Order updates, service notifications, appointment reminders</li>
          <li><strong>Marketing (with consent):</strong> Promotional offers, new machine announcements, industry updates</li>
          <li><strong>Analytics (with consent):</strong> App usage analysis to improve user experience</li>
          <li><strong>Push Notifications (with consent):</strong> Real-time updates and offers</li>
          <li><strong>Legal Compliance:</strong> Regulatory requirements and audit records</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-consent">4. Consent / सहमति</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We collect your explicit consent for the following categories:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
          <li><strong>Push Notifications:</strong> Promotional, transactional, and reminder notifications</li>
          <li><strong>Marketing:</strong> Promotional emails and messages about products and offers</li>
          <li><strong>Analytics & Personalization:</strong> App usage analysis for experience improvement</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          You can manage your consent preferences at any time from <a href="/settings/notifications" className="text-primary hover:underline">Notification Preferences</a>.
          Consent is recorded with timestamp, IP address, user ID, and version number for audit purposes.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-retention">5. Data Retention / डेटा प्रतिधारण</h2>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li><strong>Account Data:</strong> Retained while your account is active, deleted upon request</li>
          <li><strong>Consent Records:</strong> Retained for 5 years for regulatory audit compliance</li>
          <li><strong>Quotation & Transaction Data:</strong> Retained for 7 years per tax/business requirements</li>
          <li><strong>Support Tickets:</strong> Retained for 3 years after resolution</li>
          <li><strong>Analytics Data:</strong> Aggregated and anonymized after 1 year</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-user-rights">6. Your Rights Under DPDPA 2023 / DPDPA 2023 के तहत आपके अधिकार</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          As a Data Principal under the DPDPA 2023, you have the following rights:
        </p>
        <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
          <li><strong>Right to Access (Section 11):</strong> Request information about your personal data being processed and a summary of such data. / अपने व्यक्तिगत डेटा के बारे में जानकारी का अनुरोध करें।</li>
          <li><strong>Right to Correction (Section 12):</strong> Request correction or completion of inaccurate or incomplete personal data. / गलत या अधूरे डेटा में सुधार का अनुरोध करें।</li>
          <li><strong>Right to Erasure (Section 12):</strong> Request deletion of your personal data when it is no longer necessary for the purpose it was collected. / जब आवश्यक न हो तो डेटा हटाने का अनुरोध करें।</li>
          <li><strong>Right to Nomination (Section 14):</strong> Nominate another person to exercise your rights in case of death or incapacity. / मृत्यु या अक्षमता की स्थिति में किसी अन्य व्यक्ति को नामित करें।</li>
          <li><strong>Right to Withdraw Consent (Section 6):</strong> Withdraw your consent at any time. This does not affect the lawfulness of processing before withdrawal. / किसी भी समय सहमति वापस लें।</li>
          <li><strong>Right to Grievance Redressal (Section 13):</strong> File a complaint with our Grievance Officer or the Data Protection Board of India. / शिकायत अधिकारी या डेटा संरक्षण बोर्ड से शिकायत करें।</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-grievance">7. Grievance Officer / शिकायत अधिकारी</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In accordance with DPDPA 2023 requirements, the following is our designated Grievance Officer:<br /><br />
          <strong>Name:</strong> Sai Rolotech Grievance Cell<br />
          <strong>Email:</strong> grievance@sairolotech.com<br />
          <strong>Phone:</strong> +91 9090-486-262<br />
          <strong>Address:</strong> Plot No 575/1 G.F, Mundka Industrial Area, New Delhi - 110041<br /><br />
          Response time: Within 30 days of receiving the grievance.<br />
          शिकायत प्राप्त होने के 30 दिनों के भीतर जवाब दिया जाएगा।
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          If unsatisfied with the resolution, you may approach the <strong>Data Protection Board of India</strong> as established under DPDPA 2023.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-data-security">8. Data Security / डेटा सुरक्षा</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your data is encrypted in transit and at rest. We use session-based authentication with secure cookies. Passwords are hashed using industry-standard algorithms. Database access is restricted and monitored. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-third-party">9. Third-Party Services</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We may share limited data with the following types of third-party services for core platform functionality:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
          <li><strong>Service Partners:</strong> Lead sharing for service coordination and support</li>
          <li><strong>WhatsApp (Meta):</strong> For transactional notifications and customer communication</li>
          <li><strong>Database Services:</strong> Firebase Firestore for secure data storage</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          We do <strong>not</strong> sell your personal data to any third party. Data is shared only as necessary for core platform functionality.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-no-tracking">10. Advertising & Tracking</h2>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>We do <strong>not</strong> use advertising tracking</li>
          <li>We do <strong>not</strong> engage in third-party ad targeting</li>
          <li>We do <strong>not</strong> perform cross-app tracking</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-children">11. Children's Privacy / बच्चों की गोपनीयता</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided data, contact us immediately.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-changes">12. Changes to This Notice / इस सूचना में परिवर्तन</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We may update this Privacy Notice from time to time. When the consent version changes, you will be asked to review and provide consent again. Changes will be posted on this page with an updated effective date and version number.
        </p>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-how-to-withdraw">13. How to Withdraw Consent / सहमति कैसे वापस लें</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You can withdraw your consent at any time by:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 mt-1">
          <li>Going to <a href="/settings/notifications" className="text-primary hover:underline">Settings → Notification Preferences</a> in the app</li>
          <li>Emailing us at sairolotech@gmail.com</li>
          <li>Calling +91 9090-486-262</li>
        </ul>

        <h2 className="text-base font-bold mt-6 mb-2" data-testid="heading-contact">14. Contact Us / हमसे संपर्क करें</h2>
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
