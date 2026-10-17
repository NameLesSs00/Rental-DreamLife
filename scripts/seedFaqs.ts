const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwNzVjZDNlLTBhZjEtNDU3OS1mMzQwLTA4ZGYyODVjZWJmMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6InN1cGVyYWRtaW5AcHJvcGVydHltYW5hZ2VtZW50LmNvbSIsInVzZXJJZCI6IjAwNzVjZDNlLTBhZjEtNDU3OS1mMzQwLTA4ZGYyODVjZWJmMSIsInVzZXJOYW1lIjoic3VwZXJhZG1pbiIsImZ1bGxOYW1lIjoiU3VwZXIgQWRtaW4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJTdXBlckFkbWluIiwiZXhwIjoxNzkyMjMxMDUwLCJpc3MiOiJQcm9wZXJ0eU1hbmFnZW1lbnRBUEkiLCJhdWQiOiJQcm9wZXJ0eU1hbmFnZW1lbnRDbGllbnRzIn0.Xb80BN5lSGVgQEWPFmXr2jpVLoXgIBUOD7NA6COHkuU";
const BASE_URL = "https://rentall.runasp.net";

interface FaqPayload {
  question: {
    en: string;
    ar: string;
    de: string;
    fr: string;
    ru: string;
  };
  answer: {
    en: string;
    ar: string;
    de: string;
    fr: string;
    ru: string;
  };
  displayOrder: number;
  isPublished: boolean;
}

const faqsToSeed: FaqPayload[] = [
  {
    question: {
      en: "What types of properties do you offer?",
      ar: "ما هي أنواع العقارات التي تقدمونها؟",
      de: "Welche Arten von Immobilien bieten Sie an?",
      fr: "Quels types de propriétés proposez-vous ?",
      ru: "Какие типы недвижимости вы предлагаете?",
    },
    answer: {
      en: "We offer a wide range of properties including luxury villas, modern apartments, chalets, and studios across prime locations in Hurghada and the Red Sea.",
      ar: "نقدم مجموعة واسعة من العقارات بما في ذلك الفيلات الفاخرة، والشقق الحديثة، والشاليهات، والاستوديوهات في أفضل المواقع في الغردقة والبحر الأحمر.",
      de: "Wir bieten eine breite Palette von Immobilien an, darunter Luxusvillen, moderne Apartments, Chalets und Studios an erstklassigen Standorten in Hurghada und am Roten Meer.",
      fr: "Nous proposons une large gamme de propriétés, notamment des villas de luxe, des appartements modernes, des chalets et des studios dans les meilleurs emplacements d'Hurghada et de la mer Rouge.",
      ru: "Мы предлагаем широкий выбор недвижимости, включая роскошные виллы, современные апартаменты, шале и студии в лучших районах Хургады и на побережье Красного моря.",
    },
    displayOrder: 1,
    isPublished: true,
  },
  {
    question: {
      en: "Can you help me find a property within my budget?",
      ar: "هل يمكنكم مساعدتي في العثور على عقار يناسب ميزانيتي؟",
      de: "Können Sie mir helfen, eine Immobilie innerhalb meines Budgets zu finden?",
      fr: "Pouvez-vous m'aider à trouver une propriété correspondant à mon budget ?",
      ru: "Можете ли вы помочь мне найти недвижимость в рамках моего бюджета?",
    },
    answer: {
      en: "Yes, our team works closely with you to understand your budget and find the best properties that deliver exceptional quality and value.",
      ar: "نعم، يعمل فريقنا عن كثب معك لفهم ميزانيتك والعثور على أفضل العقارات التي توفر جودة وقيمة استثنائية.",
      de: "Ja, unser Team arbeitet eng mit Ihnen zusammen, um Ihr Budget zu verstehen und die besten Immobilien mit außergewöhnlicher Qualität und Wert zu finden.",
      fr: "Oui, notre équipe travaille en étroite collaboration avec vous pour comprendre votre budget et trouver les meilleures propriétés offrant une qualité et une valeur exceptionnelles.",
      ru: "Да, наша команда тесно сотрудничает с вами, чтобы понять ваш бюджет и подобрать лучшие объекты недвижимости, сочетающие исключительное качество и выгодную цену.",
    },
    displayOrder: 2,
    isPublished: true,
  },
  {
    question: {
      en: "Do you offer both buying and renting services?",
      ar: "هل تقدمون خدمات البيع والإيجار معاً؟",
      de: "Bieten Sie sowohl Kauf- als auch Mietservices an?",
      fr: "Proposez-vous des services d'achat et de location ?",
      ru: "Предоставляете ли вы услуги как покупки, так и аренды?",
    },
    answer: {
      en: "Yes, we provide full-service solutions for both short/long-term renting and property buying across Hurghada and coastal destinations.",
      ar: "نعم، نقدم حلولاً متكاملة لكل من الإيجار قصير وطويل الأجل وشراء العقارات في جميع أنحاء الغردقة والوجهات الساحلية.",
      de: "Ja, wir bieten umfassende Lösungen sowohl für die kurz- und langfristige Vermietung als auch für den Kauf von Immobilien in Hurghada und an Küstenzielen.",
      fr: "Oui, nous proposons des solutions complètes pour la location à court et long terme ainsi que pour l'achat de biens immobiliers à Hurghada et dans les destinations côtières.",
      ru: "Да, мы предоставляем полный спектр услуг как по краткосрочной и долгосрочной аренде, так и по покупке недвижимости в Хургаде и на побережье.",
    },
    displayOrder: 3,
    isPublished: true,
  },
  {
    question: {
      en: "Can I contact you for more details about a specific property?",
      ar: "هل يمكنني التواصل معكم للحصول على مزيد من التفاصيل حول عقار معين؟",
      de: "Kann ich Sie für weitere Details zu einer bestimmten Immobilie kontaktieren?",
      fr: "Puis-je vous contacter pour plus de détails sur une propriété spécifique ?",
      ru: "Могу ли я связаться с вами для получения подробной информации о конкретном объекте?",
    },
    answer: {
      en: "Yes! You can contact us anytime via our contact form, phone, or WhatsApp to receive full details, photos, and personalized advice.",
      ar: "نعم! يمكنك التواصل معنا في أي وقت عبر نموذج الاتصال أو الهاتف أو واتساب لتلقي كافة التفاصيل والصور والاستشارات الشخصية.",
      de: "Ja! Sie können uns jederzeit über unser Kontaktformular, per Telefon oder WhatsApp kontaktieren, um vollständige Details, Fotos und persönliche Beratung zu erhalten.",
      fr: "Oui ! Vous pouvez nous contacter à tout moment via notre formulaire de contact, par téléphone ou par WhatsApp pour obtenir tous les détails, des photos et des conseils personnalisés.",
      ru: "Да! Вы можете связаться с нами в любое время через форму обратной связи, по телефону или в WhatsApp, чтобы получить полную информацию, фотографии и персональную консультацию.",
    },
    displayOrder: 4,
    isPublished: true,
  },
  {
    question: {
      en: "Can I visit a property before making a decision?",
      ar: "هل يمكنني زيارة العقار قبل اتخاذ القرار؟",
      de: "Kann ich eine Immobilie vor einer Entscheidung besichtigen?",
      fr: "Puis-je visiter une propriété avant de prendre une décision ?",
      ru: "Могу ли я осмотреть недвижимость перед принятием решения?",
    },
    answer: {
      en: "Certainly. We arrange scheduled in-person property tours as well as virtual walkthroughs so you can inspect every detail before deciding.",
      ar: "بالتأكيد. نقوم بترتيب جولات عقارية مجدولة شخصياً بالإضافة إلى جولات افتراضية حتى تتمكن من معاينة كل التفاصيل قبل اتخاذ القرار.",
      de: "Sicherlich. Wir organisieren geplante Besichtigungstouren vor Ort sowie virtuelle Rundgänge, damit Sie jedes Detail vor Ihrer Entscheidung prüfen können.",
      fr: "Certainement. Nous organisons des visites sur place programmées ainsi que des visites virtuelles afin que vous puissiez examiner chaque détail avant de décider.",
      ru: "Конечно. Мы организуем запланированные личные просмотры недвижимости, а также виртуальные туры, чтобы вы могли изучить каждую деталь перед принятием решения.",
    },
    displayOrder: 5,
    isPublished: true,
  },
];

async function seed() {
  console.log("Checking existing FAQs...");
  const getRes = await fetch(`${BASE_URL}/api/faqs?PageNumber=1&PageSize=50`);
  const getData = await getRes.json();
  console.log("Current FAQs count:", getData?.data?.items?.length ?? 0);

  for (const faq of faqsToSeed) {
    console.log(`Creating FAQ [Order ${faq.displayOrder}]: ${faq.question.en}`);
    const postRes = await fetch(`${BASE_URL}/api/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(faq),
    });

    const postData = await postRes.json();
    console.log("Status:", postRes.status, "Response:", JSON.stringify(postData));
    if (!postRes.ok) {
      console.error("Failed to seed FAQ:", faq.question.en, postData);
    }
  }

  console.log("\nVerifying seeded FAQs...");
  const verifyRes = await fetch(`${BASE_URL}/api/faqs?PageNumber=1&PageSize=50`);
  const verifyData = await verifyRes.json();
  console.log("Total FAQs now:", verifyData?.data?.items?.length ?? 0);
  console.log(JSON.stringify(verifyData?.data?.items, null, 2));
}

seed().catch(console.error);
