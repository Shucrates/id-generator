export const TEMPLATES = [
  {
    id: "oscorp-staff",
    name: "Richard Parker ID from TASM",
    description: "Oscorp Industries official staff security badge layout matching Richard Parker ID from TASM.",
    category: "Oscorp Industries",
    cardWidth: 1515,
    cardHeight: 2400,
    exportScale: 1, // Full native resolution
    hasBackSide: true,
    hasCuttingGuides: true,
    hasQrCode: true,
    lanyardSlot: { enabled: false },
    theme: {
      primary: "#000000",
      secondary: "#000000",
      accent: "#000000",
      background: "#ffffff"
    },
    defaultValues: {
      companyName: "OSCORP",
      companySubtitle: "INDUSTRIES",
      name: "Richard Parker",
      roleLabel: "STAFF",
      idNumber: "A00473",
      department: "GENETICS LABORATORY",
      qrUrl: "https://oscorp.com/verify/A00473"
    },
    customPlaceholders: {
      name: "Add your name",
      photo: "Upload your image",
      qrUrl: "Add url to generate qr"
    },
    fields: [
      // --- FRONT SIDE ---
      {
        id: "companyName",
        type: "text",
        x: 319,
        y: 115,
        font: "800 52px 'Cinzel', 'Space Grotesk', sans-serif",
        color: "#000000",
        align: "center",
        userField: "companyName"
      },
      {
        id: "companySubtitle",
        type: "text",
        x: 319,
        y: 148,
        font: "600 13px 'Inter', sans-serif",
        color: "#000000",
        align: "center",
        userField: "companySubtitle",
        uppercase: true
      },
      {
        id: "roleLabel",
        type: "verticalText",
        x: 105,
        y: 240,
        font: "700 40px 'Playfair Display', 'Georgia', serif",
        color: "#000000",
        userField: "roleLabel",
        align: "center",
        uppercase: true
      },
      {
        id: "photo",
        type: "photo",
        x: 165,
        y: 220,
        width: 308,
        height: 380,
        clip: false,
        stroke: { color: "#000000", width: 4 }
      },
      {
        id: "idNumber",
        type: "verticalIdText",
        x: 535,
        y: 260,
        font: "600 24px 'Playfair Display', 'Georgia', serif",
        color: "#000000",
        userField: "idNumber",
        prefix: "No.",
        align: "center"
      },
      {
        id: "name",
        type: "text",
        x: 319,
        y: 675,
        font: "700 36px 'Playfair Display', 'Georgia', serif",
        color: "#000000",
        userField: "name",
        align: "center",
        placeholder: "Add your name"
      },
      {
        id: "underline",
        type: "shape",
        shapeType: "line",
        x: 80,
        y: 712,
        width: 478,
        height: 3,
        color: "#000000"
      },
      {
        id: "department",
        type: "text",
        x: 319,
        y: 765,
        font: "700 28px 'Playfair Display', 'Georgia', serif",
        color: "#000000",
        userField: "department",
        align: "center",
        uppercase: true
      },

      // --- BACK SIDE ---
      {
        id: "backMagneticStripe",
        type: "shape",
        side: "back",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: 110,
        height: 1000,
        color: "#000000"
      },
      {
        id: "backQR",
        type: "qr",
        side: "back",
        x: 239,
        y: 570,
        width: 160,
        height: 160,
        userField: "qrUrl",
        color: "#000000",
        placeholder: "Add url to generate qr"
      },
      {
        id: "backOscorpLogo",
        type: "text",
        side: "back",
        x: 319,
        y: 785,
        text: "OSCORP",
        font: "800 36px 'Cinzel', 'Space Grotesk', sans-serif",
        color: "#000000",
        align: "center"
      },
      {
        id: "backOscorpSubtitle",
        type: "text",
        side: "back",
        x: 319,
        y: 805,
        text: "INDUSTRIES",
        font: "600 11px 'Inter', sans-serif",
        color: "#000000",
        align: "center"
      }
    ]
  },
  {
    id: "loki-tva-id",
    name: "doomsday: loki tva id",
    description: "Time Variance Authority official identification card for Loki.",
    category: "Time Variance Authority",
    cardWidth: 1515,
    cardHeight: 2400,
    exportScale: 1,
    hasBackSide: true,
    hasCuttingGuides: false,
    hasQrCode: false,
    lanyardSlot: { enabled: false },
    theme: {
      primary: "#e88024",
      secondary: "#000000",
      accent: "#e88024",
      background: "#000000"
    },
    defaultValues: {
      name: "Loki",
      idNumber: "414-620701-401220"
    },
    customPlaceholders: {
      photo: "Upload your image"
    },
    fields: [
      {
        id: "photo",
        type: "photo",
        x: 366,
        y: 1097,
        width: 783,
        height: 1010,
        clip: false
      }
    ]
  }
];
