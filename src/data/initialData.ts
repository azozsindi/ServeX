import { Platform, SavedTemplate, FeeCategory } from '../types';

export const INITIAL_PLATFORMS: Platform[] = [
  {
    id: 'absher-individuals',
    name: 'أبشر أفراد',
    url: 'https://www.absher.sa/',
    description: 'المنصة الوطنية لخدمات الأفراد الإلكترونية (الجوازات، المرور، الأحوال المدنية بمكتب الخدمات).',
    category: 'government',
    color: 'from-emerald-500 to-teal-600',
    order: 1
  },
  {
    id: 'absher-business',
    name: 'أبشر أعمال',
    url: 'https://business.absher.sa/',
    description: 'إنجاز المعاملات الخاصة بالمؤسسات والشركات المتوسطة والمنشآت بسهولة.',
    category: 'business',
    color: 'from-[#107c41] to-emerald-700',
    order: 2
  },
  {
    id: 'qiwa',
    name: 'منصة قوى',
    url: 'https://qiwa.sa/',
    description: 'المنصة الموحدة لخدمات قطاع العمل، توثيق العقود واللوائح، رخص العمل، ونقل الكفالات.',
    category: 'employment',
    color: 'from-sky-500 to-blue-600',
    order: 3
  },
  {
    id: 'najiz',
    name: 'ناجز القضائية',
    url: 'https://najiz.sa/',
    description: 'منصة الخدمات العدلية الإلكترونية لوزارة العدل (الوكالات، القضاء، التنفيذ، العقود).',
    category: 'justice',
    color: 'from-blue-600 to-indigo-700',
    order: 4
  },
  {
    id: 'muqeem',
    name: 'بوابة مقيم',
    url: 'https://muqeem.sa/',
    description: 'إدارة شؤون المقيمين الأجانب للشركات والمؤسسات، وإصدار تأشيرات خروج وعودة وإقامة.',
    category: 'government',
    color: 'from-indigo-500 to-purple-600',
    order: 5
  },
  {
    id: 'musaned',
    name: 'مساند للاستقدام',
    url: 'https://musaned.com.sa/',
    description: 'المنصة الرسمية الموحدة لاستقدام وتوظيف العمالة المنزلية والتحكم بالعقود والفيز.',
    category: 'employment',
    color: 'from-emerald-600 to-teal-700',
    order: 6
  },
  {
    id: 'nafadh',
    name: 'النفاذ الوطني الموحد',
    url: 'https://www.iam.gov.sa/',
    description: 'بوابة الهوية الوطنية والتحقق الرقمي الموحد لإصدار وتثبيت طلبات الدخول للمنصات الحكومية.',
    category: 'government',
    color: 'from-amber-600 to-emerald-700',
    order: 7
  },
  {
    id: 'gosi',
    name: 'التأمينات الاجتماعية (GOSI)',
    url: 'https://gosi.gov.sa/',
    description: 'حساب وإدارة الاشتراكات، تسجيل وإبعاد الموظفين وتفاصيل التعطل لساند.',
    category: 'government',
    color: 'from-blue-700 to-indigo-900',
    order: 8
  },
  {
    id: 'mudad',
    name: 'منصة مدد للأجور',
    url: 'https://mudad.com.sa/',
    description: 'نظام حماية الأجور، وتوثيق وإدارة الرواتب الشهرية والاشتراكات لوزارة الموارد البشرية.',
    category: 'business',
    color: 'from-slate-800 to-emerald-900',
    order: 9
  },
  {
    id: 'balady',
    name: 'منصة بلدي',
    url: 'https://balady.gov.sa/',
    description: 'بوابة الخدمات البلدية للرخص التجارية، الرخص الصحية، وتراخيص البناء للأنشطة.',
    category: 'government',
    color: 'from-teal-600 to-cyan-700',
    order: 10
  },
  {
    id: 'efaa',
    name: 'منصة إيفاء للمخالفات',
    url: 'https://efaa.sa/',
    description: 'المنصة الوطنية الموحدة للاستعلام عن المخالفات و سداد الغرامات المرورية والبلدية والأقسام الأخرى.',
    category: 'other',
    color: 'from-rose-550 to-red-700',
    order: 11
  },
  {
    id: 'commerce',
    name: 'وزارة التجارة',
    url: 'https://mc.gov.sa/',
    description: 'إصدار وتجديد السجلات التجارية للمؤسسات، وتعديل ونشر الأسماء والأنشطة الاقتصادية.',
    category: 'business',
    color: 'from-amber-550 to-yellow-700',
    order: 12
  },
  {
    id: 'zatca',
    name: 'منصة هيئة الزكاة والجمارك',
    url: 'https://zatca.gov.sa/',
    description: 'تقديم الإقرارات الضريبية للضريبة المضافة، الزكاة السنوية، وفسح الشحنات الجمركية.',
    category: 'business',
    color: 'from-slate-700 to-slate-900',
    order: 13
  },
  {
    id: 'sehaty',
    name: 'منصة صحتي الطبية',
    url: 'https://www.sehaty.sa/',
    description: 'استخراج وثائق الإجازات المرضية الموثقة، تحديث كشوف اللياقة، ومعلومات الفحص الفني والاستشارات الطبي.',
    category: 'other',
    color: 'from-pink-500 to-rose-650',
    order: 14
  },
  {
    id: 'spl',
    name: 'البريد السعودي - سبل',
    url: 'https://www.splonline.com.sa/',
    description: 'إدارة العنوان الوطني الموحد للعملاء والمنشآت وتأكيد الإرساليات وتخليص البعائث البريدية.',
    category: 'other',
    color: 'from-orange-550 to-blue-650',
    order: 15
  },
  {
    id: 'sbc',
    name: 'المركز السعودي للأعمال',
    url: 'https://www.sbc.gov.sa/',
    description: 'المنصة الرئيسية الموحدة لتسهيل تأسيس وبدء الأنشطة التجارية وتراخيص الجهات الحكومية كافة.',
    category: 'business',
    color: 'from-cyan-600 to-blue-700',
    order: 16
  },
  {
    id: 'citizen',
    name: 'بوابة حساب المواطن',
    url: 'https://www.ca.gov.sa/',
    description: 'بوابة تحديث البيانات، تقديم الاعتراضات والتحقق من الاستحقاق والدعم المالي المعتمد.',
    category: 'government',
    color: 'from-teal-600 to-indigo-850',
    order: 17
  },
  {
    id: 'hrsd',
    name: 'بوابة الموارد البشرية (HRSD)',
    url: 'https://hrsd.gov.sa/',
    description: 'الخدمات العامة للتنمية الاجتماعية، الضمان المطور، تفعيل بطاقات الدعم، ورعاية الأفراد.',
    category: 'government',
    color: 'from-emerald-700 to-green-700',
    order: 18
  },
  {
    id: 'enjaz',
    name: 'إنجاز - تفويض التأشيرات',
    url: 'https://visa.mofa.gov.sa/Services/PlatformServices',
    description: 'تقديم طلب التفويض على التأشيرة وتسديد رسوم التأشيرة الفردية والتأمين الصحي بالمملكة.',
    category: 'other',
    color: 'from-teal-500 to-emerald-600',
    order: 19
  },
  {
    id: 'etimad',
    name: 'منصة اعتماد المالية',
    url: 'https://etimad.sa/',
    description: 'متابعة المناقصات الحكومية، الدفع المالي للمقاولين والموردين، والاستخلاص المالي العام.',
    category: 'business',
    color: 'from-amber-700 to-orange-850',
    order: 20
  },
  {
    id: 'scfhs',
    name: 'هيئة التخصصات الصحية',
    url: 'https://www.scfhs.org.sa/',
    description: 'التصنيف المهني والترخيص لممارسي الصحة، الاستعلام عن كشوف العمل الطبية والتدريب.',
    category: 'other',
    color: 'from-emerald-700 to-blue-800',
    order: 21
  },
  {
    id: 'taqat',
    name: 'منصة طاقات للعمل',
    url: 'https://www.taqat.sa/',
    description: 'البوابة الوطنية للعمل والتدريب المهني للشباب السعودي وتوطين الوظائف بالمؤسسات.',
    category: 'employment',
    color: 'from-yellow-600 to-amber-700',
    order: 22
  },
  {
    id: 'visa-mofa',
    name: 'وزارة الخارجية - التأشيرات',
    url: 'https://visa.mofa.gov.sa/',
    description: 'طلبات تأشيرات الزيارات العائلية والشخصية، طلبات استقدام الأقارب وتصديق الخطابات الرسمية.',
    category: 'government',
    color: 'from-[#0a4d28] to-emerald-600',
    order: 23
  },
  {
    id: 'taradhi',
    name: 'منصة تراضى للمصالحة',
    url: 'https://taradhi.moj.gov.sa/',
    description: 'تسوية الخلافات الأسرية والتجارية العمالية، صياغة محاضر الصلح الموثقة كأوراق تنفيذية.',
    category: 'justice',
    color: 'from-sky-600 to-teal-700',
    order: 24
  },
  {
    id: 'fsc',
    name: 'اتحاد الغرف السعودية',
    url: 'https://fsc.org.sa/',
    description: 'المظلة الرسمية الوطنية لقطاع الأعمال والغرف التجارية، تنسيق المبادرات الاقتصادية واللجان الوطنية.',
    category: 'chamber',
    color: 'from-emerald-700 to-teal-850',
    order: 25
  },
  {
    id: 'fsc-attest',
    name: 'منصة تصديق اتحاد الغرف',
    url: 'https://attest.fsc.org.sa/',
    description: 'البوابة الموحدة للتحقق من صحة الوثائق والمحررات المصدقة إلكترونياً من كافة الغرف التجارية السعودية.',
    category: 'chamber',
    color: 'from-teal-600 to-emerald-800',
    order: 26
  },
  {
    id: 'chamber-riyadh',
    name: 'غرفة الرياض',
    url: 'https://www.chamber.sa/',
    description: 'خدمات مشتركي العاصمة الرياض: التصاديق الإلكترونية، الاشتراكات والانتساب، ومركز القانون وتطوير المنشآت.',
    category: 'chamber',
    color: 'from-amber-600 to-yellow-700',
    order: 27
  },
  {
    id: 'chamber-jeddah',
    name: 'غرفة جدة',
    url: 'https://www.jcci.org.sa/',
    description: 'بوابة الخدمات الإلكترونية لمشتركي غرفة جدة، إصدار وتجديد الاشتراكات، التصديق الإلكتروني، وتسوية النزاعات التجارية.',
    category: 'chamber',
    color: 'from-blue-600 to-cyan-700',
    order: 28
  },
  {
    id: 'chamber-asharqia',
    name: 'غرفة الشرقية',
    url: 'https://www.chamber.org.sa/',
    description: 'خدمات رجال وسيدات الأعمال بالمنطقة الشرقية: التصديق الإلكتروني، اشتراكات المنشآت، والوفود واللقاءات الاقتصادية.',
    category: 'chamber',
    color: 'from-emerald-600 to-teal-700',
    order: 29
  },
  {
    id: 'chamber-makkah',
    name: 'غرفة مكة المكرمة',
    url: 'https://makcci.org.sa/',
    description: 'الخدمات التجارية والاشتراكات والتصاديق لقطاع الأعمال بالعاصمة المقدسة وموسم الحج والعمرة.',
    category: 'chamber',
    color: 'from-teal-700 to-emerald-900',
    order: 30
  },
  {
    id: 'chamber-madinah',
    name: 'غرفة المدينة المنورة',
    url: 'https://mcci.org.sa/',
    description: 'بوابة المشتركين لخدمات الأعمال والتصديق الإلكتروني وتنمية الفرص الاستثمارية بمنطقة المدينة المنورة.',
    category: 'chamber',
    color: 'from-emerald-700 to-green-900',
    order: 31
  },
  {
    id: 'chamber-qassim',
    name: 'غرفة القصيم',
    url: 'https://qcci.org.sa/',
    description: 'منظومة خدمات المشتركين بمنطقة القصيم: التصديق الإلكتروني، إصدار الشهادات، وتنمية القطاعات التجارية والزراعية.',
    category: 'chamber',
    color: 'from-amber-700 to-yellow-800',
    order: 32
  },
  {
    id: 'chamber-abha',
    name: 'غرفة أبها (عسير)',
    url: 'https://abhachamber.com.sa/',
    description: 'خدمات التصديق الإلكتروني وتطوير الأعمال والاستثمار السياحي والصناعي بمنطقة عسير وأبها.',
    category: 'chamber',
    color: 'from-sky-700 to-blue-900',
    order: 33
  },
  {
    id: 'chamber-taif',
    name: 'غرفة الطائف',
    url: 'https://taifchamber.org.sa/',
    description: 'منصة خدمات المشتركين لمحافظة الطائف للتصاديق الإلكترونية، استخراج الشهادات، ورعاية المستثمرين ورواد الأعمال.',
    category: 'chamber',
    color: 'from-rose-600 to-pink-800',
    order: 34
  },
  {
    id: 'chamber-tabuk',
    name: 'غرفة تبوك',
    url: 'https://tcci.org.sa/',
    description: 'بوابة خدمات قطاع الأعمال والمستثمرين في منطقة تبوك ومشاريع الشمال الغربي والمشاريع الكبرى.',
    category: 'chamber',
    color: 'from-blue-700 to-indigo-800',
    order: 35
  },
  {
    id: 'chamber-jazan',
    name: 'غرفة جازان',
    url: 'https://jazancci.org.sa/',
    description: 'خدمات التجار والمستثمرين بالمنطقة الجنوبية: التصاديق الرقمية، العضويات، ومتابعة المشاريع الاقتصادية بمنطقة جازان.',
    category: 'chamber',
    color: 'from-teal-600 to-cyan-800',
    order: 36
  },
  {
    id: 'chamber-najran',
    name: 'غرفة نجران',
    url: 'https://najrancci.org.sa/',
    description: 'بوابة خدمات المشتركين الإلكترونية للتصاديق وخدمات الانتساب والتنمية الاستثمارية بمنطقة نجران.',
    category: 'chamber',
    color: 'from-amber-600 to-orange-800',
    order: 37
  },
  {
    id: 'chamber-hail',
    name: 'غرفة حائل',
    url: 'https://hailchamber.org.sa/',
    description: 'الخدمات الرقمية للمشتركين ورجال الأعمال في حائل: التصديق الإلكتروني، اللجان التجارية، والمعارض والفعاليات.',
    category: 'chamber',
    color: 'from-emerald-600 to-teal-800',
    order: 38
  },
  {
    id: 'chamber-ahsa',
    name: 'غرفة الأحساء',
    url: 'https://ahsaccci.org.sa/',
    description: 'بوابة خدمات المشتركين بمحافظة الأحساء، دعم رواد الأعمال، التصاديق الرقمية، والفرص الاستثمارية الواعدة.',
    category: 'chamber',
    color: 'from-green-700 to-emerald-900',
    order: 39
  },
  {
    id: 'chamber-jouf',
    name: 'غرفة الجوف',
    url: 'https://joufchamber.org.sa/',
    description: 'خدمات رجال الأعمال والمزارعين والمستثمرين بمنطقة الجوف وتسهيل المعاملات والتصديق الفوري للمنشآت.',
    category: 'chamber',
    color: 'from-teal-700 to-slate-800',
    order: 40
  },
  {
    id: 'chamber-nb',
    name: 'غرفة الحدود الشمالية',
    url: 'https://www.nbchamber.org.sa/',
    description: 'بوابة قطاع الأعمال في عرعر وطريف والمنطقة الشمالية للتصديق الإلكتروني وإدارة اشتراكات المنشآت.',
    category: 'chamber',
    color: 'from-indigo-600 to-blue-800',
    order: 41
  },
  {
    id: 'chamber-baha',
    name: 'غرفة الباحة',
    url: 'https://bahachamber.org.sa/',
    description: 'خدمات التجار والمنشآت بمنطقة الباحة: التصاديق المعتمدة، استشارات الاستثمار، ودعم المنشآت الصغيرة والمتوسطة.',
    category: 'chamber',
    color: 'from-emerald-600 to-green-800',
    order: 42
  },
  {
    id: 'chamber-yanbu',
    name: 'غرفة ينبع',
    url: 'https://ycci.org.sa/',
    description: 'خدمات قطاع التجارة والصناعة والاستثمار في ينبع الصناعية والبحرية والتصديق الإلكتروني للمنتسبين.',
    category: 'chamber',
    color: 'from-cyan-600 to-blue-800',
    order: 43
  },
  {
    id: 'chamber-hafr',
    name: 'غرفة حفر الباطن',
    url: 'https://hbcci.org.sa/',
    description: 'بوابة المشتركين الإلكترونية بحفر الباطن: التصديق الإلكتروني وإصدار الوثائق وخدمة المنتسبين للمنظومة التجارية.',
    category: 'chamber',
    color: 'from-amber-600 to-teal-800',
    order: 44
  },
  {
    id: 'chamber-onaizah',
    name: 'غرفة عنيزة',
    url: 'https://oncci.org.sa/',
    description: 'خدمات التجار والمستثمرين بمحافظة عنيزة، رعاية الفعاليات الاقتصادية، والتصديق الإلكتروني للوثائق والمحررات.',
    category: 'chamber',
    color: 'from-yellow-600 to-amber-800',
    order: 45
  },
  {
    id: 'chamber-kharj',
    name: 'غرفة الخرج',
    url: 'https://kcci.org.sa/',
    description: 'خدمات قطاع الأعمال في الخرج والدلم والمحافظات المجاورة، التصديق الإلكتروني والاشتراكات السنوية للمؤسسات.',
    category: 'chamber',
    color: 'from-emerald-600 to-teal-800',
    order: 46
  },
  {
    id: 'chamber-majmaah',
    name: 'غرفة المجمعة',
    url: 'https://majmaahchamber.org.sa/',
    description: 'خدمات المشتركين لمحافظة المجمعة والمراكز التابعة لها، التصاديق وإصدار الشهادات والتنمية الاقتصادية الواعدة.',
    category: 'chamber',
    color: 'from-blue-600 to-indigo-800',
    order: 47
  },
  {
    id: 'chamber-rass',
    name: 'غرفة الرس',
    url: 'https://rasschamber.org.sa/',
    description: 'الخدمات الإلكترونية لمشتركي غرفة الرس، التصديق الإلكتروني، وتطوير الأنشطة التجارية والاستثمارية بالمحافظة.',
    category: 'chamber',
    color: 'from-teal-600 to-emerald-700',
    order: 48
  },
  {
    id: 'chamber-gurayat',
    name: 'غرفة القريات',
    url: 'https://gurayatchamber.org.sa/',
    description: 'بوابة الخدمات والتصاديق الإلكترونية لرجال الأعمال والمستوردين بمحافظة القريات والمنافذ الحدودية الشمالية.',
    category: 'chamber',
    color: 'from-sky-600 to-teal-800',
    order: 49
  },
  {
    id: 'chamber-bisha',
    name: 'غرفة بيشة',
    url: 'https://bishacci.org.sa/',
    description: 'خدمات قطاع الأعمال في محافظة بيشة، التصاديق والاشتراكات وتنمية الفرص الاستثمارية الزراعية والتجارية.',
    category: 'chamber',
    color: 'from-amber-700 to-orange-900',
    order: 50
  }
];

export const INITIAL_TEMPLATES: SavedTemplate[] = [
  {
    id: 't1',
    title: 'طلب الأوراق لـ معاملة استقدام',
    content: 'السلام عليكم ورحمة الله وبركاته.\nعزيزي العميل، للبدء بإجراءات الاستقدام عبر مساند يرجى تزويدنا بالمتطلبات التالية:\n- صورة الهوية الوطنية / الإقامة الكفيل.\n- تعريف بالراتب أو كشف حساب بنكي.\n- دفع الرسوم الحكومية (الفيزا).\nشاكرين لتعاونك.',
    category: 'طلبات العناية بالعميل'
  },
  {
    id: 't2',
    title: 'تأكيد إنجاز المعاملة جاهزة',
    content: 'أهلاً بك عميلنا الكريم.\nسعدنا بخدمتك في مكتبنا، نفيدك بأنه تم بنجاح إنجاز معاملتكم الخاصة بـ (اسم الخدمة والمنصة) وصارت جاهزة الآن.\nشاكرين لثقتك بنا ونطمح لخدمتك دائماً.',
    category: 'تأكيد وإنجاز'
  },
  {
    id: 't3',
    title: 'رسالة سداد الرسوم الحكومية',
    content: 'مرحباً عزيزي العميل.\nيرجى التكرم بسداد الفاتورة الحكومية بالبيانات الدقيقة التالية لتسهيل إنجاز معاملتك:\n- اسم الخدمة:\n- رقم المفوتر:\n- رقم السداد:\n- المبلغ المطلوب ورسوم المكتب:\nالرجاء إرسال إيصال السداد فور الانتهاء.',
    category: 'فواتير وسداد'
  },
  {
    id: 't4',
    title: 'متطلبات السجل التجاري',
    content: 'المحترم عميلنا العزيز،\nلخدمة استخراج السجل التجاري في وزارة التجارة نأمل إرسال:\n- الاسم التجاري المقترح:\n- التخصص أو النشاط الدقيق:\n- الهوية الوطنية وتاريخ الميلاد:\n- العنوان الوطني للنشاط:\nوسنقوم بالتحضير ومباشرة الإجراء فوراً.',
    category: 'طلبات العناية بالعميل'
  }
];

export const FEE_CATEGORIES: FeeCategory[] = [
  {
    id: 'g-iqama',
    name: 'الجوازات والإقامة',
    services: [
      {
        id: 'iqa-renew',
        name: 'تجديد الإقامة (عمالة تجارية)',
        categoryId: 'g-iqama',
        baseFee: 650,
        description: 'رسوم تجديد الإقامة للموظف في القطاع الخاص لمدة سنة (تختلف نسبة رخصة العمل حسب المنشأة).',
        variablesLabel: 'عدد السنوات',
        variableMultiplier: 650
      },
      {
        id: 'iqa-domestic',
        name: 'تجديد إقامة عمالة منزلية (سائق، عاملة)',
        categoryId: 'g-iqama',
        baseFee: 600,
        description: 'رسوم تجديد الإقامة سنوية للعمالة المنزلية بالمملكة.',
        variablesLabel: 'عدد العمالة المشمولة',
        variableMultiplier: 600
      },
      {
        id: 'exit-reentry-single',
        name: 'تأشيرة خروج وعودة مفردة',
        categoryId: 'g-iqama',
        baseFee: 200,
        description: 'تأشيرة خروج وعودة مفردة لمدة شهرين كحد أقصى.',
        variablesLabel: 'أشهر إضافية (أكثر من شهرين)',
        variableMultiplier: 100
      },
      {
        id: 'exit-reentry-multi',
        name: 'تأشيرة خروج وعودة متعددة',
        categoryId: 'g-iqama',
        baseFee: 500,
        description: 'تأشيرة خروج وعودة متعددة لمدة 3 أشهر.',
        variablesLabel: 'أشهر إضافية (أكثر من 3 أشهر)',
        variableMultiplier: 200
      },
      {
        id: 'transfer-sponsorship',
        name: 'نقل كفالة / خدمات المقيم',
        categoryId: 'g-iqama',
        baseFee: 2000,
        description: 'رسوم نقل الكفالة للمرة الأولى (الثانية 4000 ريال، الثالثة 6000 ريال).',
        variablesLabel: 'رقم المرة (1 لـ 2000، 2 لـ 4000، 3 لـ 6000)',
        variableMultiplier: 2000,
        fixedExtraFee: 0
      }
    ]
  },
  {
    id: 'g-traffic',
    name: 'المرور والقيادة',
    services: [
      {
        id: 'license-renew',
        name: 'تجديد رخصة القيادة السنوية',
        categoryId: 'g-traffic',
        baseFee: 40,
        description: 'تكلفة رخصة السائق الخصوصي أو العمومي هي 40 ريالاً عن كل سنة.',
        variablesLabel: 'عدد السنوات المقترحة',
        variableMultiplier: 40
      },
      {
        id: 'car-renew',
        name: 'تجديد استمارة المركبة (رخصة السير)',
        categoryId: 'g-traffic',
        baseFee: 100,
        description: 'رسوم تجديد الإستمارة السنوية للمركبة الخصوصي.',
        variablesLabel: 'عدد السنوات المطلوب',
        variableMultiplier: 100
      },
      {
        id: 'passports-saudi',
        name: 'إصدار/تجديد جواز السفر السعودي',
        categoryId: 'g-traffic',
        baseFee: 300,
        description: 'إصدار الجواز لمدة 5 سنوات بـ 300 ريال، ولمدة 10 سنوات بـ 600 ريال.',
        variablesLabel: 'صلاحية الجواز (اكتب 1 لـ 5 سنوات، 2 لـ 10 سنوات)',
        variableMultiplier: 300
      }
    ]
  },
  {
    id: 'g-business',
    name: 'السجلات والشركات',
    services: [
      {
        id: 'comm-main',
        name: 'إصدار سجل تجاري رئيسي',
        categoryId: 'g-business',
        baseFee: 200,
        description: '200 ريال سنوياً لطلب إصدار أو تجديد السجل التجاري الرئيسي للمنشأة.',
        variablesLabel: 'عدد سنوات السجل',
        variableMultiplier: 200
      },
      {
        id: 'comm-branch',
        name: 'إصدار سجل تجاري فرعي',
        categoryId: 'g-business',
        baseFee: 100,
        description: '100 ريال سنوياً لإصدار أو تجديد سجل تجاري فرعي.',
        variablesLabel: 'عدد السنوات للسجل الفرعي',
        variableMultiplier: 100
      }
    ]
  }
];
