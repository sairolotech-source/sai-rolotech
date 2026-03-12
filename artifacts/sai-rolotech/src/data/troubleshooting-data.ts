export interface TroubleshootingProblem {
  id: string;
  titleHi: string;
  titleEn: string;
  causeHi: string;
  causeEn: string;
  solutionHi: string;
  solutionEn: string;
}

export interface MachineCategory {
  id: string;
  nameHi: string;
  nameEn: string;
  icon: string;
  problems: TroubleshootingProblem[];
}

export const troubleshootingData: MachineCategory[] = [
  {
    id: "roll-forming",
    nameHi: "रोल फॉर्मिंग मशीन",
    nameEn: "Roll Forming Machine",
    icon: "factory",
    problems: [
      {
        id: "rf-material-feeding",
        titleHi: "मटेरियल फीडिंग समस्या",
        titleEn: "Material Feeding Issue",
        causeHi: "• कॉइल सही से लोड नहीं हुआ\n• डीकॉइलर का टेंशन कम या ज़्यादा है\n• गाइड रोलर्स एलाइन नहीं हैं\n• कॉइल की चौड़ाई ग़लत है",
        causeEn: "• Coil not loaded properly\n• Decoiler tension too low or too high\n• Guide rollers are misaligned\n• Incorrect coil width",
        solutionHi: "• कॉइल को सही पोज़ीशन में रीलोड करें\n• डीकॉइलर टेंशन एडजस्ट करें\n• गाइड रोलर्स को रीअलाइन करें\n• कॉइल स्पेसिफिकेशन चेक करें (चौड़ाई, मोटाई)",
        solutionEn: "• Reload coil in correct position\n• Adjust decoiler tension properly\n• Realign guide rollers\n• Verify coil specifications (width, thickness)",
      },
      {
        id: "rf-roll-misalignment",
        titleHi: "रोल मिसएलाइनमेंट",
        titleEn: "Roll Misalignment",
        causeHi: "• रोलर्स ठीक से टाइट नहीं हैं\n• शाफ़्ट बियरिंग घिस गई है\n• रोलर सेटिंग बदल गई है\n• फ़ाउंडेशन लेवल नहीं है",
        causeEn: "• Rollers not tightened properly\n• Shaft bearings are worn out\n• Roller settings have shifted\n• Foundation is not level",
        solutionHi: "• सभी रोलर बोल्ट्स चेक करें और टाइट करें\n• घिसी हुई बियरिंग बदलें\n• रोलर गैप को फीलर गेज से रीसेट करें\n• मशीन बेस लेवलिंग चेक करें",
        solutionEn: "• Check and tighten all roller bolts\n• Replace worn out bearings\n• Reset roller gap using feeler gauge\n• Check machine base leveling",
      },
      {
        id: "rf-uneven-profile",
        titleHi: "असमान प्रोफ़ाइल शेप",
        titleEn: "Uneven Profile Shape",
        causeHi: "• रोलर गैप बराबर नहीं है\n• शीट की मोटाई स्पेक से अलग है\n• रोलर्स घिस गए हैं\n• फीडिंग स्पीड बहुत ज़्यादा है",
        causeEn: "• Roller gap is uneven\n• Sheet thickness differs from spec\n• Rollers are worn out\n• Feeding speed is too high",
        solutionHi: "• दोनों साइड का रोलर गैप बराबर करें\n• इनपुट शीट की मोटाई वेरिफ़ाई करें\n• घिसे हुए रोलर्स बदलें या रीग्राइंड करें\n• फीडिंग स्पीड कम करें",
        solutionEn: "• Equalize roller gap on both sides\n• Verify input sheet thickness\n• Replace or regrind worn rollers\n• Reduce feeding speed",
      },
      {
        id: "rf-motor-overheating",
        titleHi: "मोटर ओवरहीटिंग",
        titleEn: "Motor Overheating",
        causeHi: "• मोटर पर ओवरलोड है\n• वेंटिलेशन/कूलिंग सही नहीं है\n• बेल्ट बहुत टाइट है\n• वोल्टेज फ़्लक्चुएशन हो रहा है\n• बियरिंग जाम हो रही है",
        causeEn: "• Motor is overloaded\n• Ventilation/cooling is inadequate\n• Belt is too tight\n• Voltage fluctuation\n• Bearing is jammed",
        solutionHi: "• लोड कम करें या बड़ी मोटर लगाएँ\n• मोटर के आसपास हवा का रास्ता खुला रखें\n• बेल्ट टेंशन सही करें\n• वोल्टेज स्टेबलाइज़र लगाएँ\n• बियरिंग चेक करें और ग्रीस करें",
        solutionEn: "• Reduce load or install higher capacity motor\n• Ensure proper airflow around motor\n• Adjust belt tension correctly\n• Install voltage stabilizer\n• Check and grease bearings",
      },
      {
        id: "rf-noise-vibration",
        titleHi: "शोर / कंपन (Noise & Vibration)",
        titleEn: "Noise / Vibration",
        causeHi: "• बियरिंग घिस गई या टूट गई है\n• गियर या चेन लूज़ है\n• फ़ाउंडेशन बोल्ट ढीले हैं\n• रोलर्स में अनबैलेंस है\n• लूब्रिकेशन की कमी है",
        causeEn: "• Bearings are worn or broken\n• Gear or chain is loose\n• Foundation bolts are loose\n• Rollers are unbalanced\n• Lack of lubrication",
        solutionHi: "• ख़राब बियरिंग तुरंत बदलें\n• गियर/चेन टाइट करें या बदलें\n• फ़ाउंडेशन बोल्ट कसें\n• रोलर बैलेंसिंग करवाएँ\n• सभी मूविंग पार्ट्स को लूब्रिकेट करें",
        solutionEn: "• Replace damaged bearings immediately\n• Tighten or replace gear/chain\n• Tighten foundation bolts\n• Get roller balancing done\n• Lubricate all moving parts",
      },
      {
        id: "rf-hydraulic-pressure",
        titleHi: "हाइड्रोलिक प्रेशर ड्रॉप",
        titleEn: "Hydraulic Pressure Drop",
        causeHi: "• हाइड्रोलिक ऑइल कम है\n• ऑइल लीकेज हो रहा है (पाइप/सील से)\n• पंप ख़राब हो रहा है\n• फ़िल्टर ब्लॉक है\n• रिलीफ़ वाल्व सेटिंग ग़लत है",
        causeEn: "• Hydraulic oil level is low\n• Oil leakage from pipes/seals\n• Pump is malfunctioning\n• Filter is blocked\n• Relief valve setting is incorrect",
        solutionHi: "• हाइड्रोलिक ऑइल टॉप अप करें\n• सभी कनेक्शन और सील चेक करें, लीकेज बंद करें\n• पंप की सर्विसिंग करवाएँ\n• फ़िल्टर साफ़ करें या बदलें\n• रिलीफ़ वाल्व प्रेशर सही सेट करें",
        solutionEn: "• Top up hydraulic oil\n• Check all connections and seals, fix leakages\n• Get pump serviced\n• Clean or replace filter\n• Set relief valve pressure correctly",
      },
      {
        id: "rf-sheet-scratching",
        titleHi: "शीट स्क्रैचिंग / सरफ़ेस डिफ़ेक्ट",
        titleEn: "Sheet Scratching / Surface Defect",
        causeHi: "• रोलर सतह पर खरोंच या गड्ढे हैं\n• गाइड में बर्र (burr) है\n• शीट में पहले से दाग़/ज़ंग है\n• लूब्रिकेशन नहीं है\n• मेटल चिप्स फँसे हैं",
        causeEn: "• Roller surface has scratches or pitting\n• Burr on guide edges\n• Sheet has pre-existing marks/rust\n• No lubrication applied\n• Metal chips are stuck",
        solutionHi: "• रोलर सतह को पॉलिश करें या बदलें\n• गाइड एज़ को डीबर करें\n• इनपुट शीट क्वालिटी चेक करें\n• रोलर पर हल्का लूब्रिकेशन लगाएँ\n• मशीन रोज़ साफ़ करें, चिप्स निकालें",
        solutionEn: "• Polish or replace roller surface\n• Deburr guide edges\n• Check input sheet quality\n• Apply light lubrication on rollers\n• Clean machine daily, remove chips",
      },
    ],
  },
];
