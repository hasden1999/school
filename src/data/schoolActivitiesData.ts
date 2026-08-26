export interface SchoolActivity {
  id: string;
  title: string;
  category: "science" | "sports" | "trips" | "honors" | "arts" | "workshops";
  categoryLabel: string;
  date: string;
  description: string;
  image: string;
  viewsCount?: number;
  likesCount?: number;
  badge?: string;
  location?: string;
  details?: string[];
}

export interface SchoolVideo {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  date: string;
  description: string;
  views: string;
  highlight?: string;
}

export interface SchoolFacility {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  iconName: string;
}

export interface SchoolStat {
  label: string;
  value: string;
  unit?: string;
  description: string;
  color: string;
}

export interface SchoolTestimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  badge: string;
}

export const SCHOOL_INFO = {
  name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
  tagline: "صرح تربوي وتعليمي رائد يصنع قادة المستقبل بالمعرفة والابتكار والقيم - تأسست سنة 2017",
  city: "بغداد",
  address: "بغداد - الكرخ - حي الجامعة - شارع الربيع",
  phone: "+964 770 123 4567",
  whatsapp: "+9647701234567",
  email: "info@al-maali-school.edu.iq",
  activeYear: "2024-2025",
  licenseNumber: "إجازة تأسيس وزارة التربية رقم 5120/ابتدائي",
  establishedYear: "2017",
  directorName: "إدارة مدرسة المعالي الأهلية الابتدائية المختلطة",
};

export const SCHOOL_STATS: SchoolStat[] = [
  {
    label: "نسبة النجاح الوزاري",
    value: "100%",
    unit: "توالي 7 سنوات",
    description: "في الامتحانات الوزارية للثالث متوسط والسادس الإعدادي",
    color: "text-brand-700",
  },
  {
    label: "الطلبة المتفوقين",
    value: "+1,250",
    unit: "طالب وطالبة",
    description: "معدلات امتياز وجوائز تفوق على مستوى المحافظة",
    color: "text-blue-700",
  },
  {
    label: "الكادر التدريسي النخبوي",
    value: "+50",
    unit: "أستاذ ومختص",
    description: "من حملة شهادات الماجستير والدكتوراه وأصحاب الخبرة الطويلة",
    color: "text-amber-600",
  },
  {
    label: "الجوائز والبطولات",
    value: "+45",
    unit: "كأس وميدالية",
    description: "في الأولمبيادات العلمية، البرمجة، والمسابقات الرياضية",
    color: "text-slate-800",
  },
];

export const SCHOOL_ACTIVITIES: SchoolActivity[] = [
  {
    id: "act-1",
    title: "المعرض السنوي للروبوتات والذكاء الاصطناعي 2024",
    category: "science",
    categoryLabel: "العلوم والابتكار",
    date: "15 تشرين الثاني 2024",
    description:
      "تألق طلاب نادي البرمجة والروبوت في تقديم مشاريع ذكية تشمل أذرع روبوتية صناعية، وأنظمة فرز النفايات الآلية بالذكاء الاصطناعي مع برمجة بلغة بايثون ومتحكمات أردوينو.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1420,
    likesCount: 384,
    badge: "المركز الأول علمياً",
    location: "القاعة المركزية للمختبرات الذكية",
    details: [
      "مشاركة أكثر من 60 طالباً من مختلف المراحل الدراسية",
      "عرض 18 مشروعاً ابتكارياً حائزاً على براءات تقديرية",
      "حضور لجان تحكيمية من أساتذة الجامعة التكنولوجية",
    ],
  },
  {
    id: "act-2",
    title: "حفل تكريم المتفوقين وخريجي السادس الإعدادي (دفعة قادة الغد)",
    category: "honors",
    categoryLabel: "التكريم والتفوق",
    date: "28 تشرين الأول 2024",
    description:
      "احتفلت المدرسة بتكريم أوائل المراحل الدراسية وخريجي السادس العلمي المتفوقين الحاصلين على معدلات 99% فما فوق بحضور أولياء الأمور ونخبة من الشخصيات الأكاديمية.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 2310,
    likesCount: 650,
    badge: "احتفال الفخر",
    location: "المسرح الكبير لمدرسة المعالي الأهلية",
    details: [
      "توزيع دروع التميز ومكافآت التفوق للطلبة الأوائل",
      "تكريم أولياء الأمور لجهودهم المستمرة في متابعة أبنائهم",
      "فقرات مسرحية وشعرية من إبداع طلاب المدرسة",
    ],
  },
  {
    id: "act-3",
    title: "نهائي بطولة دوري المعالي لكرة القدم وتتويج الأبطال",
    category: "sports",
    categoryLabel: "الأنشطة الرياضية",
    date: "10 تشرين الثاني 2024",
    description:
      "وسط أجواء حماسية مفعمة بالروح الرياضية، توج فريق الصف السادس الابتدائي (أ) بلقب دوري المعالي لكرة القدم بعد مباراة نهائية مثيرة مع فريق الخامس الابتدائي.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1890,
    likesCount: 490,
    badge: "كأس البطولة",
    location: "الملعب العشبي الأولمبي للمدرسة",
    details: [
      "مشاركة 12 فريقاً مدرسياً بإشراف طاقم تحكيمي معتمد",
      "تتويج أفضل لاعب وأفضل هداف وأحسن حارس مرمى",
      "عروض كشفية ورياضية مصاحبة للنهائي",
    ],
  },
  {
    id: "act-4",
    title: "تجارب الكيمياء الحيوية المتقدمة في المختبر التفاعلي",
    category: "science",
    categoryLabel: "العلوم والابتكار",
    date: "04 تشرين الثاني 2024",
    description:
      "جلسة عملية وتطبيقية لطلبة المرحلة الإعدادية لاستكشاف تفاعلات الأكسدة والاختزال، واستخلاص الحمض النووي (DNA) وفحص العينات المجهرية الرقمية بدقة عالية.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1120,
    likesCount: 295,
    badge: "تطبيق عملي",
    location: "مختبر الكيمياء والعلوم التطبيقية",
    details: [
      "تطبيق معايير السلامة المهنية والأمان المعملي بنسبة 100%",
      "استخدام المجاهر الإلكترونية الرقمية المتصلة بالشاشات الذكية",
      "توثيق النتائج ضمن تقارير التجارب التفاعلية للنظام",
    ],
  },
  {
    id: "act-5",
    title: "الرحلة الميدانية العلمية إلى المتحف الوطني والمرصد الفلكي",
    category: "trips",
    categoryLabel: "الرحلات والاستكشاف",
    date: "20 تشرين الأول 2024",
    description:
      "نظمت إدارة المدرسة رحلة استكشافية مثرية لطلاب المرحلة المتوسطة للتعرف على الحضارة البابلية والآشورية العريقة، تلتها زيارة للقبة الفلكية لمراقبة الأجرام السماوية.",
    image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1670,
    likesCount: 420,
    badge: "استكشاف ومعرفة",
    location: "المتحف العراقي الوطني والمرصد الفلكي",
    details: [
      "شرح تفصيلي من خبراء الآثار عن المكتشفات التاريخية",
      "جلسة رصد تفاعلية للكواكب والنجوم بالتلسكوب الحديث",
      "مسابقة بحثية سريعة وتوزيع جوائز للطلبة الفائزين",
    ],
  },
  {
    id: "act-6",
    title: "مهرجان الفنون والخط العربي والمناظرات الشعرية",
    category: "arts",
    categoryLabel: "الفنون والثقافة",
    date: "12 تشرين الأول 2024",
    description:
      "افتتحت المدرسة معرض اللوحات التشكيلية والخط العربي الكوفي والديواني، بمشاركة أعمال فنية راقية أنتجها طلابنا بإشراف كادر التربية الفنية المتميز.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1340,
    likesCount: 360,
    badge: "إبداع تشكيلي 🎨",
    location: "جناح المعارض الفنية والتشكيلية",
    details: [
      "عرض أكثر من 80 لوحة فنية ومخطوطة بالخط العربي الأصيل",
      "مناظرات شعرية وأدبية باللغة العربية الفصحى",
      "مزاد خيري تعود عوائده لدعم المبادرات المجتمعية",
    ],
  },
  {
    id: "act-7",
    title: "ورشة البرمجة وتطوير تطبيقات الموبايل لليافعين",
    category: "workshops",
    categoryLabel: "ورش العمل والتقنية",
    date: "05 تشرين الأول 2024",
    description:
      "دورة تدريبية مكثفة لتعليم طلاب المرحلة الإعدادية أساسيات تطوير التطبيقات، التفكير المنطقي، وتصميم واجهات المستخدم (UI/UX) باستخدام أحدث الأدوات التفاعلية.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 1530,
    likesCount: 410,
    badge: "جيل البرمجة 💻",
    location: "قاعة الحوسبة السحابية والمختبر البرمجي",
    details: [
      "بناء 10 نماذج لتطبيقات خدمية مصغرة من أفكار الطلاب",
      "منح شهادات مشاركة معتمدة لكافة المتدربين",
      "تأهيل الطلبة للمشاركة في الأولمبياد الوطني للمعلوماتية",
    ],
  },
  {
    id: "act-8",
    title: "بطولة الشطرنج الذهبية وتنمية التفكير الاستراتيجي",
    category: "sports",
    categoryLabel: "الأنشطة الرياضية",
    date: "25 أيلول 2024",
    description:
      "منافسات قوية وحماسية في بطولة الشطرنج المفتوحة بمشاركة نخبة من أذكى طلاب المدرسة، بهدف تنمية مهارات التخطيط الاستراتيجي وسرعة اتخاذ القرار.",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1200&auto=format&fit=crop",
    viewsCount: 980,
    likesCount: 310,
    badge: "دهاء وتخطيط",
    location: "قاعة الأنشطة الذهنية والرياضات الهادئة",
    details: [
      "نظام المنافسة السويسري على مدار 5 جولات حاسمة",
      "تتويج البطل بدرع الملك الذهبي",
      "إشراف بطل العراق للشطرنج على تحكيم المباريات",
    ],
  },
];

export const SCHOOL_VIDEOS: SchoolVideo[] = [
  {
    id: "vid-1",
    title: "فيلم وثائقي: يوم في رحاب مدرسة المعالي الأهلية الابتدائية المختلطة",
    category: "جولة تعريفية",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "03:45",
    date: "تشرين الثاني 2024",
    description: "جولة مرئية مشوقة تأخذكم داخل القاعات التفاعلية والمختبرات الذكية والملاعب وتوثق تفاعل التلاميذ مع كوادرهم التعليمية.",
    views: "8.4k مشاهدة",
    highlight: "الأكثر مشاهدة",
  },
  {
    id: "vid-2",
    title: "تغطية حفل تخرج دفعة التميز والتفوق وتكريم الأوائل",
    category: "حفلات وتكريم",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "04:12",
    date: "تشرين الأول 2024",
    description: "لحظات مؤثرة ومشاعر فخر واعتزاز بتتويج ثمرة تعب تلاميذنا المتفوقين بحضور أولياء الأمور الكرام.",
    views: "6.1k مشاهدة",
    highlight: "فيديو مميز",
  },
  {
    id: "vid-3",
    title: "مشاريع الروبوتات والذكاء الاصطناعي من فكرة إلى واقع 🤖",
    category: "الابتكار والعلوم",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "02:30",
    date: "تشرين الثاني 2024",
    description: "استعراض عملي لأبرز ابتكارات الطلاب الروبوتية وطرق برمجتها وتشغيلها في مسابقات التحدي.",
    views: "4.9k مشاهدة",
    highlight: "تكنولوجيا وإبداع ⚡",
  },
  {
    id: "vid-4",
    title: "ملخص أهداف ونهائي بطولة دوري كرة القدم المدرسي",
    category: "الرياضة واللياقة",
    thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "03:15",
    date: "تشرين الثاني 2024",
    description: "شاهد أجمل الأهداف والمهارات الفردية والاحتفالات الكروية في نهائي كأس المعالي.",
    views: "5.7k مشاهدة",
    highlight: "أجواء حماسية 🔥",
  },
];

export const SCHOOL_FACILITIES: SchoolFacility[] = [
  {
    id: "fac-1",
    title: "المختبرات العلمية الذكية",
    subtitle: "تجهيزات ألمانية متطورة وشاشات تفاعلية",
    description:
      "مختبرات متكاملة للكيمياء والفيزياء والأحياء مجهزة بأحدث أدوات الفحص المجهري، ومجسات الاستشعار، ومعدات السلامة الفائقة لضمان التعلم بالممارسة الحية.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop",
    features: ["مجاهر رقمية عالية الدقة", "شاشات عرض ذكية 4K", "معدات أمان وحماية متطورة", "تجارب كيميائية بإشراف دقيق"],
    iconName: "FlaskConical",
  },
  {
    id: "fac-2",
    title: "قاعات الحوسبة ونادي الروبوتات",
    subtitle: "بيئة تكنولوجية متكاملة لبرمجة المستقبل",
    description:
      "محطات عمل متطورة متصلة بشبكة ألياف ضوئية فائقة السرعة، مجهزة بمجموعات أردوينو وروبوتات VEX وطابعات ثلاثية الأبعاد.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop",
    features: ["أجهزة حاسوب بمعالجات حديثة", "طابعات 3D لنمذجة المشاريع", "مجموعات روبوتات VEX التعليمية", "إنترنت فايبر فائق السرعة"],
    iconName: "Cpu",
  },
  {
    id: "fac-3",
    title: "المدينة الرياضية والملاعب المغلقة",
    subtitle: "عقل سليم في جسم رياضي سليم",
    description:
      "ملاعب عشب صناعي معتمدة دولياً، صالة رياضية مغلقة متعددة الأغراض لكرة السلة والكرة الطائرة، ومضمار جري آمن.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
    features: ["ملعب كرة قدم عشب صناعي معتمد", "صالة مغلقة مكيفة متعددة الأنشطة", "مدربون رياضيون محترفون", "معدات لياقة بدنية لليافعين"],
    iconName: "Trophy",
  },
  {
    id: "fac-4",
    title: "المسرح الكبير وقاعة المؤتمرات",
    subtitle: "منصة تنمي ثقة الطالب والخطابة والتعبير",
    description:
      "مسرح مجهز بأحدث أنظمة الصوت والإضاءة المسرحية الاحترافية يتسع لأكثر من 400 شخص لاحتضان الفعاليات والمؤتمرات وحفلات التكريم.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop",
    features: ["أنظمة صوتية Surround معزولة", "شاشات عرض عملاقة LED", "مقاعد مريحة تتسع لـ 400 زائر", "كواليس ومرافق تجهيز مسرحي"],
    iconName: "Sparkles",
  },
  {
    id: "fac-5",
    title: "المكتبة المركزية وواحة القراءة",
    subtitle: "آلاف العناوين والمراجع والمصادر الرقمية",
    description:
      "بيئة هادئة ومحفزة على المطالعة والبحث العلمي تحتوي على كتب أدبية وعلمية وتاريخية مع اشتراكات في قواعد بيانات عالمية.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop",
    features: ["أكثر من 5000 كتاب ومرجع", "منصة بحث رقمية للكتب الإلكترونية", "جلسات قراءة فردية وجماعية مريحة", "أجواء دراسية هادئة ومعقمة"],
    iconName: "BookOpen",
  },
  {
    id: "fac-6",
    title: "الكافتيريا الصحية والوجبات المتوازنة",
    subtitle: "تغذية صحية برقابة طبية مستمرة",
    description:
      "مطبخ عصري يقدم وجبات ومشروبات صحية خاضعة لأعلى معايير النظافة والرقابة الصحية لدعم النشاط والتركيز الذهني للطلاب.",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?q=80&w=1000&auto=format&fit=crop",
    features: ["وجبات طازجة ومكونات عضوية", "خلو تام من المشروبات الغازية والوجبات الضارة", "جلسات استراحة داخلية وخارجية جميلة", "فحص طبي دوري لمقدمي الطعام"],
    iconName: "HeartPulse",
  },
];

export const SCHOOL_TESTIMONIALS: SchoolTestimonial[] = [
  {
    id: "test-1",
    name: "د. حيدر الموسوي",
    role: "ولي أمر الطالب (كرار) - السادس الابتدائي",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    content:
      "المتابعة اليومية عبر المنظومة والإشعارات الفورية للدرجات والحضور أعطتنا راحة بال تامة. الكادر التدريسي على أعلى مستوى من الكفاءة والأخلاق ونشاطات مدرسة المعالي صقلت شخصية ابني بشكل ملحوظ.",
    rating: 5,
    badge: "ولي أمر متميز",
  },
  {
    id: "test-2",
    name: "م. رائد الجبوري",
    role: "ولي أمر الطالب (مصطفى) - الرابع الابتدائي",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    content:
      "نادي الروبوتات والأنشطة العلمية في مدرسة المعالي الأهلية نقل تفكير ابني إلى مرحلة الابتكار. الشفافية في رصد الدرجات والتواصل المستمر من الإدارة نموذج يحتذى به في التعليم العراقي.",
    rating: 5,
    badge: "ولي أمر",
  },
  {
    id: "test-3",
    name: "يوسف عمار شاكر",
    role: "طالب متفوق - الأول على المدرسة بالمرحلة الابتدائية",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    content:
      "الفضل لله ثم لكادر مدرسة المعالي الأهلية الابتدائية المختلطة الذين كانوا سنداً لنا طوال العام الدراسي بتأسيس علمي وقيمي متميز.",
    rating: 5,
    badge: "تلميذ متفوق",
  },
];

export const SCHOOL_ANNOUNCEMENTS = [
  "فتح باب التسجيل للعام الدراسي 2024-2025 لجميع المراحل الدراسية مع خصم 15% للتسجيل المبكر للأخوة.",
  "حصول مدرستنا على المركز الأول في بطولة أولمبياد الرياضيات والفيزياء لمدارس بغداد الكرخ.",
  "انطلاق فعاليات الأسبوع العلمي وتجارب الذكاء الاصطناعي يوم الأحد القادم في المختبرات الذكية.",
  "موعد التصفيات النهائية لدوري كرة القدم المدرسي يوم الخميس في الملعب العشبي.",
];

export const PORTAL_ROLES = [
  {
    role: "ADMIN",
    roleLabel: "مدير المدرسة والإدارة",
    desc: "صلاحيات كاملة لإدارة الكادر، الحسابات، جداول الحصص، رصد الدرجات، والتقارير اليومية.",
    badge: "لوحة الإدارة",
    color: "bg-brand-700 hover:bg-brand-800",
    path: "/login",
  },
  {
    role: "TEACHER",
    roleLabel: "الكادر التدريسي (الأستاذ)",
    desc: "رصد الحضور الذكي للحصة الأولى، كتابة التقارير اليومية والواجبات، وإدخال درجات الطلاب.",
    badge: "بوابة المعلم",
    color: "bg-blue-700 hover:bg-blue-800",
    path: "/login",
  },
  {
    role: "STUDENT",
    roleLabel: "الطالب وولي الأمر",
    desc: "متابعة السعي السنوي، تقارير الحضور والغياب، الواجبات اليومية، والوصولات المالية المعتمدة.",
    badge: "بوابة الطالب",
    color: "bg-slate-800 hover:bg-slate-900",
    path: "/login",
  },
];

export const DEMO_CREDENTIALS = PORTAL_ROLES;
