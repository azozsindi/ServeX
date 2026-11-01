import React, { useState } from 'react';
import { FEE_CATEGORIES } from '../data/initialData';
import { FeeCategory } from '../types';
import { 
  Calculator, 
  Share2, 
  CheckCircle, 
  HelpCircle, 
  Building2, 
  UserCheck, 
  FileText, 
  Plus, 
  Trash2, 
  DollarSign, 
  PhoneCall, 
  Printer, 
  Sparkles,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';

interface FeeCalculatorProps {
  defaultOfficeFee?: number;
  officeName?: string;
}

type CalculatorMode = 'commercial' | 'sponsorship' | 'iqama' | 'single' | 'custom';

interface CustomItem {
  id: string;
  name: string;
  entity: string;
  amount: number;
}

export default function FeeCalculator({ defaultOfficeFee = 150, officeName = 'مكتب الخدمات العامة' }: FeeCalculatorProps) {
  const [activeMode, setActiveMode] = useState<CalculatorMode>('commercial');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  // ==========================================
  // 1. New Commercial Registration State
  // ==========================================
  const [crType, setCrType] = useState<'main' | 'branch'>('main'); // Main (200/yr) vs Branch (100/yr)
  const [crYears, setCrYears] = useState<number>(1); // 1-5 years
  const [tradeNameType, setTradeNameType] = useState<'system' | 'custom'>('system'); // System free (0) vs Custom reserved (1000)
  const [includeChamber, setIncludeChamber] = useState<boolean>(true);
  const [chamberFeePerYear, setChamberFeePerYear] = useState<number>(200); // 200-500 SAR
  const [includeBalady, setIncludeBalady] = useState<boolean>(false);
  const [baladyFee, setBaladyFee] = useState<number>(500); // Municipal license
  const [crOfficeCommission, setCrOfficeCommission] = useState<number>(defaultOfficeFee || 200);

  // CR Calculations
  const crMinistryFee = (crType === 'main' ? 200 : 100) * crYears;
  const crChamberTotal = includeChamber ? chamberFeePerYear * crYears : 0;
  const crNameFee = tradeNameType === 'custom' ? 1000 : 0;
  const crBaladyTotal = includeBalady ? baladyFee : 0;
  const crGovTotal = crMinistryFee + crChamberTotal + crNameFee + crBaladyTotal;
  const crGrandTotal = crGovTotal + crOfficeCommission;

  // ==========================================
  // 2. Sponsorship Transfer State (نقل كفالة عامل)
  // ==========================================
  const [transferCount, setTransferCount] = useState<number>(1); // 1st (2000), 2nd (4000), 3rd+ (6000)
  const [qiwaTier, setQiwaTier] = useState<number>(1000); // 1000 for micro/class A, 1500 for other
  const [workPermitStatus, setWorkPermitStatus] = useState<'valid' | 'expired_full' | 'expired_small' | 'expired_custom'>('valid');
  const [workPermitMonths, setWorkPermitMonths] = useState<number>(3); // 700/mo
  const [iqamaStatus, setIqamaStatus] = useState<'valid' | 'expired_normal' | 'expired_penalty'>('valid');
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(false);
  const [insuranceEstimate, setInsuranceEstimate] = useState<number>(450);
  const [sponsorshipOfficeFee, setSponsorshipOfficeFee] = useState<number>(defaultOfficeFee || 300);

  // Sponsorship Calculations
  const jawazatTransferFee = transferCount === 1 ? 2000 : transferCount === 2 ? 4000 : 6000;
  const qiwaPlatformFee = qiwaTier;
  
  let workPermitFee = 0;
  if (workPermitStatus === 'expired_full') {
    workPermitFee = 8400; // Standard annual expat levy
  } else if (workPermitStatus === 'expired_small') {
    workPermitFee = 100; // Small exempt enterprise
  } else if (workPermitStatus === 'expired_custom') {
    workPermitFee = workPermitMonths * 700;
  }

  let iqamaRenewalFee = 0;
  if (iqamaStatus === 'expired_normal') {
    iqamaRenewalFee = 650;
  } else if (iqamaStatus === 'expired_penalty') {
    iqamaRenewalFee = 650 + 500; // 650 renewal + 500 late penalty
  }

  const insuranceFee = includeInsurance ? insuranceEstimate : 0;
  const sponsorshipGovTotal = jawazatTransferFee + qiwaPlatformFee + workPermitFee + iqamaRenewalFee + insuranceFee;
  const sponsorshipGrandTotal = sponsorshipGovTotal + sponsorshipOfficeFee;

  // ==========================================
  // 3. Iqama & Labor Renewals State
  // ==========================================
  const [iqamaYears, setIqamaYears] = useState<number>(1);
  const [workerCategory, setWorkerCategory] = useState<'commercial' | 'domestic'>('commercial');
  const [includeWorkPermitLevy, setIncludeWorkPermitLevy] = useState<boolean>(true);
  const [permitLevyType, setPermitLevyType] = useState<'standard' | 'exempt'>('standard');
  const [includeMedicalInsurance, setIncludeMedicalInsurance] = useState<boolean>(true);
  const [medicalEstimate, setMedicalEstimate] = useState<number>(450);
  const [includeExitReentry, setIncludeExitReentry] = useState<'none' | 'single' | 'multi'>('none');
  const [iqamaOfficeCommission, setIqamaOfficeCommission] = useState<number>(defaultOfficeFee || 150);

  // Iqama calculations
  const iqamaFeeGov = (workerCategory === 'commercial' ? 650 : 600) * iqamaYears;
  const workLevyFeeGov = (workerCategory === 'commercial' && includeWorkPermitLevy) 
    ? (permitLevyType === 'standard' ? 8400 : 100) * iqamaYears 
    : 0;
  const medicalFeeGov = (workerCategory === 'commercial' && includeMedicalInsurance) ? medicalEstimate * iqamaYears : 0;
  const exitReentryFeeGov = includeExitReentry === 'single' ? 200 : includeExitReentry === 'multi' ? 500 : 0;
  const iqamaGovTotal = iqamaFeeGov + workLevyFeeGov + medicalFeeGov + exitReentryFeeGov;
  const iqamaGrandTotal = iqamaGovTotal + iqamaOfficeCommission;

  // ==========================================
  // 4. Single Service Catalog State (Original)
  // ==========================================
  const [categories] = useState<FeeCategory[]>(FEE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(FEE_CATEGORIES[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleOfficeFee, setSingleOfficeFee] = useState<number>(defaultOfficeFee || 100);

  const activeCategory = categories.find(c => c.id === selectedCategory);
  const activeService = activeCategory?.services.find(s => s.id === selectedServiceId) || activeCategory?.services[0];

  const singleBaseFee = activeService?.baseFee || 0;
  const singleMultiplier = activeService?.variableMultiplier || 0;
  let singleGovTotal = singleBaseFee;
  if (activeService?.id === 'transfer-sponsorship') {
    singleGovTotal = singleQty === 1 ? 2000 : singleQty === 2 ? 4000 : 6000;
  } else if (singleMultiplier > 0) {
    singleGovTotal = singleBaseFee + (singleMultiplier * (singleQty - 1));
  }
  const singleGrandTotal = singleGovTotal + singleOfficeFee;

  // ==========================================
  // 5. Custom Quotation Builder State
  // ==========================================
  const [customItems, setCustomItems] = useState<CustomItem[]>([
    { id: '1', name: 'رسوم سداد تفويض إلكتروني / عقد', entity: 'منصة قوى / مساند', amount: 150 },
    { id: '2', name: 'رسوم فحص طبي وتصديق طلب', entity: 'وزارة الصحة / أبشر', amount: 200 }
  ]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemEntity, setNewItemEntity] = useState<string>('');
  const [newItemAmount, setNewItemAmount] = useState<number>(100);
  const [customOfficeFee, setCustomOfficeFee] = useState<number>(defaultOfficeFee || 200);

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return;
    const newItem: CustomItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      entity: newItemEntity.trim() || 'جهة حكومية',
      amount: Math.max(0, newItemAmount)
    };
    setCustomItems([...customItems, newItem]);
    setNewItemName('');
    setNewItemEntity('');
    setNewItemAmount(100);
  };

  const handleDeleteCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  const customGovTotal = customItems.reduce((acc, item) => acc + item.amount, 0);
  const customGrandTotal = customGovTotal + customOfficeFee;

  // ==========================================
  // Text Generator for WhatsApp Invoice
  // ==========================================
  const generateInvoiceText = () => {
    const dateStr = new Date().toLocaleDateString('ar-SA');
    let text = `*🧾 بيان وتفصيل تكاليف المعاملة الحكومية*\n`;
    text += `*📍 ${officeName}*\n`;
    text += `*التاريخ:* ${dateStr}\n`;
    if (clientName.trim()) {
      text += `*العميل الكريم:* ${clientName.trim()}\n`;
    }
    text += `-------------------------------------------\n`;

    if (activeMode === 'commercial') {
      text += `*📌 المعاملة: إصدار سجل تجاري جديد*\n`;
      text += `• نوع السجل: ${crType === 'main' ? 'سجل رئيسي' : 'سجل فرعي'} (${crYears} ${crYears === 1 ? 'سنة' : 'سنوات'})\n`;
      text += `• رسوم وزارة التجارة: ${crMinistryFee} ريال\n`;
      if (includeChamber) text += `• اشتراك الغرفة التجارية: ${crChamberTotal} ريال (${chamberFeePerYear} ريال/سنة)\n`;
      text += `• حجز الاسم التجاري: ${crNameFee === 0 ? 'مجاني (مقترح من النظام)' : '1000 ريال (اسم تجاري خاص)'}\n`;
      if (includeBalady) text += `• رخصة بلدي الفورية (تقديري): ${crBaladyTotal} ريال\n`;
      text += `• العنوان الوطني وتأسيس ملف العمل: 0 ريال (تأسيس مجاني فوري)\n`;
      text += `-------------------------------------------\n`;
      text += `*🏛️ مجموع الرسوم والمدفوعات الحكومية:* ${crGovTotal} ريال\n`;
      text += `*💼 أتعاب وسعي إنجاز المكتب:* ${crOfficeCommission} ريال\n`;
      text += `===========================================\n`;
      text += `*💰 الإجمالي المطلوب تحويله:* *${crGrandTotal} ريال سعودي*\n`;
    } 
    else if (activeMode === 'sponsorship') {
      text += `*📌 المعاملة: نقل كفالة عامل (خدمات مقيم)*\n`;
      text += `• رسوم الجوازات (المرة ${transferCount === 1 ? 'الأولى' : transferCount === 2 ? 'الثانية' : 'الثالثة فأكثر'}): ${jawazatTransferFee} ريال\n`;
      text += `• رسوم منصة قوى (نقل موظف): ${qiwaPlatformFee} ريال\n`;
      if (workPermitFee > 0) {
        text += `• رخصة العمل والمقابل المالي: ${workPermitFee} ريال (${workPermitStatus === 'expired_full' ? 'سنة كاملة' : workPermitStatus === 'expired_small' ? 'منشأة صغيرة مستثناة' : `${workPermitMonths} أشهر`})\n`;
      } else {
        text += `• رخصة العمل: سارية (0 ريال)\n`;
      }
      if (iqamaRenewalFee > 0) {
        text += `• تجديد الإقامة المنتهية: ${iqamaRenewalFee} ريال ${iqamaStatus === 'expired_penalty' ? '(شامل غرامة التأخير)' : ''}\n`;
      } else {
        text += `• الإقامة: سارية (0 ريال)\n`;
      }
      if (includeInsurance) {
        text += `• وثيقة التأمين الطبي (تقديري): ${insuranceFee} ريال\n`;
      }
      text += `-------------------------------------------\n`;
      text += `*🏛️ مجموع الرسوم الحكومية ومنصة قوى:* ${sponsorshipGovTotal} ريال\n`;
      text += `*💼 أتعاب وسعي إنجاز المكتب:* ${sponsorshipOfficeFee} ريال\n`;
      text += `===========================================\n`;
      text += `*💰 الإجمالي المطلوب تحويله:* *${sponsorshipGrandTotal} ريال سعودي*\n`;
    }
    else if (activeMode === 'iqama') {
      text += `*📌 المعاملة: تجديد وإصدار إقامة وعمالة*\n`;
      text += `• نوع العمالة: ${workerCategory === 'commercial' ? 'عمالة تجارية منشآت' : 'عمالة منزلية'}\n`;
      text += `• رسوم تجديد الإقامة (${iqamaYears} سنة): ${iqamaFeeGov} ريال\n`;
      if (workLevyFeeGov > 0) {
        text += `• كرت العمل والمقابل المالي: ${workLevyFeeGov} ريال\n`;
      }
      if (medicalFeeGov > 0) {
        text += `• التأمين الطبي السنوي: ${medicalFeeGov} ريال\n`;
      }
      if (exitReentryFeeGov > 0) {
        text += `• تأشيرة خروج وعودة (${includeExitReentry === 'single' ? 'مفردة' : 'متعددة'}): ${exitReentryFeeGov} ريال\n`;
      }
      text += `-------------------------------------------\n`;
      text += `*🏛️ مجموع الرسوم الحكومية الرسمية:* ${iqamaGovTotal} ريال\n`;
      text += `*💼 أتعاب ومصروفات المكتب:* ${iqamaOfficeCommission} ريال\n`;
      text += `===========================================\n`;
      text += `*💰 الإجمالي المطلوب تحويله:* *${iqamaGrandTotal} ريال سعودي*\n`;
    }
    else if (activeMode === 'single') {
      text += `*📌 المعاملة:* ${activeService?.name || 'خدمة حكومية'}\n`;
      text += `• التصنيف: ${activeCategory?.name || ''}\n`;
      if (activeService?.variablesLabel) {
        text += `• الكمية / المدة: ${singleQty}\n`;
      }
      text += `-------------------------------------------\n`;
      text += `*🏛️ الرسوم الحكومية المستحقة:* ${singleGovTotal} ريال\n`;
      text += `*💼 أتعاب وسعي المكتب:* ${singleOfficeFee} ريال\n`;
      text += `===========================================\n`;
      text += `*💰 الإجمالي المطلوب تحويله:* *${singleGrandTotal} ريال سعودي*\n`;
    }
    else {
      text += `*📌 المعاملة: عرض سعر مخصص*\n`;
      customItems.forEach((item, index) => {
        text += `${index + 1}. ${item.name} (${item.entity}): ${item.amount} ريال\n`;
      });
      text += `-------------------------------------------\n`;
      text += `*🏛️ مجموع بنود الرسوم والمصاريف:* ${customGovTotal} ريال\n`;
      text += `*💼 أتعاب وإشراف المكتب:* ${customOfficeFee} ريال\n`;
      text += `===========================================\n`;
      text += `*💰 الإجمالي المطلوب تحويله:* *${customGrandTotal} ريال سعودي*\n`;
    }

    text += `\n_يرجى مراجعة وتأكيد السداد وتزويدنا بإيصال التحويل لنبدأ بالإجراء الفوري. شكراً لثقتكم_ 🙏✨`;
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateInvoiceText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(generateInvoiceText());
    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    }
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white/90 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-2xl shadow-md shrink-0">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                حاسبة المصاريف والتكاليف الحكومية
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  شاملة ومحدثة
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حساب دقيق لرسوم فتح السجل التجاري، نقل كفالة عامل، تجديد الإقامات مع تفنيد الرسوم الحكومية وأتعاب المكتب
              </p>
            </div>
          </div>

          {/* Quick Client Info for WhatsApp Quote */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#152033] p-2 rounded-xl border border-slate-200/60 dark:border-white/5">
            <input
              type="text"
              placeholder="اسم العميل (اختياري)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none w-32 focus:border-amber-500"
            />
            <input
              type="tel"
              placeholder="رقم الجوال (05xxxxxxxx)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 outline-none w-36 font-mono focus:border-amber-500 text-left"
              dir="ltr"
            />
          </div>
        </div>

        {/* Tab Switcher - Horizontal Scroll on Mobile */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 border-b border-slate-150 dark:border-white/5">
          <button
            onClick={() => setActiveMode('commercial')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeMode === 'commercial'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>🏢 فتح سجل تجاري جديد</span>
          </button>

          <button
            onClick={() => setActiveMode('sponsorship')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeMode === 'sponsorship'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>🔄 نقل كفالة عامل (خدمات مقيم)</span>
          </button>

          <button
            onClick={() => setActiveMode('iqama')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeMode === 'iqama'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>🪪 تجديد وإصدار إقامة وعمالة</span>
          </button>

          <button
            onClick={() => setActiveMode('single')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeMode === 'single'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>⚡ الخدمات الفردية السريعة</span>
          </button>

          <button
            onClick={() => setActiveMode('custom')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeMode === 'custom'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>📝 حاسبة وعرض سعر حر</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator Inputs on Right, Live Cost Summary on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* RIGHT / MAIN CONTENT: Interactive Wizard Configuration   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* ================== MODE 1: COMMERCIAL REGISTRATION ================== */}
          {activeMode === 'commercial' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  <span>تحديد تفاصيل السجل التجاري الجديد</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختر مواصفات السجل والاشتراكات المقترنة لوزارة التجارة والغرفة التجارية والبلدية
                </p>
              </div>

              {/* 1. CR Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. نوع السجل التجاري:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCrType('main')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      crType === 'main'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">سجل تجاري رئيسي</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">200 ريال / سنة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCrType('branch')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      crType === 'branch'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">سجل تجاري فرعي</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">100 ريال / سنة</div>
                  </button>
                </div>
              </div>

              {/* 2. Years */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. مدة صلاحية السجل التجاري:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setCrYears(year)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        crYears === year
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {year} {year === 1 ? 'سنة' : 'سنوات'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Trade Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. حجز الاسم التجاري:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeNameType('system')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      tradeNameType === 'system'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>اسم مقترح من النظام</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">مجاني</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">توليد تلقائي فوري مطابق للأنشطة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeNameType('custom')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      tradeNameType === 'custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>اسم تجاري خاص / مميز</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">1,000 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">اسم خاص محجوز مسبقاً بوزارة التجارة</div>
                  </button>
                </div>
              </div>

              {/* 4. Chamber of Commerce */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeChamber}
                      onChange={(e) => setIncludeChamber(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>اشتراك الغرفة التجارية (إلزامي للسجل)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    {includeChamber ? `${chamberFeePerYear * crYears} ريال` : 'مستثنى'}
                  </span>
                </div>
                {includeChamber && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-400">الاشتراك السنوي:</span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={chamberFeePerYear}
                      onChange={(e) => setChamberFeePerYear(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-center font-mono font-bold outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ريال / سنة (حسب فئة النشاط)</span>
                  </div>
                )}
              </div>

              {/* 5. Balady Municipal License (Optional) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeBalady}
                      onChange={(e) => setIncludeBalady(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>إضافة رخصة بلدية فورية للمحل / المقر (بلدي)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    {includeBalady ? `${baladyFee} ريال` : 'بدون رخصة حالياً'}
                  </span>
                </div>
                {includeBalady && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-400">الرسوم التقديرية للبلدية:</span>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={baladyFee}
                      onChange={(e) => setBaladyFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-center font-mono font-bold outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ريال (تتحدد حسب مساحة ونوع النشاط)</span>
                  </div>
                )}
              </div>

              {/* Included Free Automatic Services */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  <span>خدمات تأسيسية مندرجة تلقائياً (0 ريال):</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-5">
                  <div>✓ فتح ملف وزارة الموارد البشرية والعمل</div>
                  <div>✓ تسجيل وتفعيل التأمينات الاجتماعية</div>
                  <div>✓ تسجيل العنوان الوطني للمنشأة (سبل)</div>
                  <div>✓ إصدار الرقم الضريبي والزكاة والجمارك</div>
                </div>
              </div>

              {/* Office Commission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وسعي مكتب الخدمات العامة (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={crOfficeCommission}
                    onChange={(e) => setCrOfficeCommission(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* ================== MODE 2: SPONSORSHIP TRANSFER ================== */}
          {activeMode === 'sponsorship' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-amber-500" />
                  <span>حساب مصاريف نقل كفالة عامل (خدمات مقيم)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تحديد رسوم الجوازات حسب عدد مرات النقل، منصة قوى، رخصة العمل، الإقامة، والتأمين الطبي
                </p>
              </div>

              {/* 1. Jawazat Transfer Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. رسوم الجوازات (عدد مرات النقل السابقة للعامل):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTransferCount(1)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      transferCount === 1
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">نقل للمرة الأولى</div>
                    <div className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-1">2,000 ريال</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferCount(2)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      transferCount === 2
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">نقل للمرة الثانية</div>
                    <div className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-1">4,000 ريال</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferCount(3)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      transferCount >= 3
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">المرة الثالثة فأكثر</div>
                    <div className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-1">6,000 ريال</div>
                  </button>
                </div>
              </div>

              {/* 2. Qiwa Platform Transfer Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. رسوم منصة قوى لنقل خدمة الموظف:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQiwaTier(1000)}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      qiwaTier === 1000
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>منشآت صغيرة جداً (فئة أ)</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">1,000 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">منشأة 1-5 موظفين</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQiwaTier(1500)}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      qiwaTier === 1500
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>المنشآت الأخرى / متوسطة</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">1,500 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">منشآت فئة ب وما فوق</div>
                  </button>
                </div>
              </div>

              {/* 3. Work Permit / Expat Levy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. حالة رخصة العمل / المقابل المالي (كرت العمل):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkPermitStatus('valid')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      workPermitStatus === 'valid'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ✓ رخصة العمل سارية (0 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkPermitStatus('expired_full')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      workPermitStatus === 'expired_full'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية - سنة عمالة زائدة (8,400 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkPermitStatus('expired_small')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      workPermitStatus === 'expired_small'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منشأة صغيرة مستثناة (100 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkPermitStatus('expired_custom')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      workPermitStatus === 'expired_custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية لعدة أشهر (700 ريال / شهر)
                  </button>
                </div>

                {workPermitStatus === 'expired_custom' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">حدد عدد الأشهر المنتهية:</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={workPermitMonths}
                      onChange={(e) => setWorkPermitMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-xs bg-white dark:bg-[#0c1322] border border-amber-300 dark:border-amber-600 rounded-lg p-1.5 text-center font-mono font-bold outline-none"
                    />
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      = {workPermitMonths * 700} ريال
                    </span>
                  </div>
                )}
              </div>

              {/* 4. Iqama Validity Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  4. حالة صلاحية الإقامة (الجوازات):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIqamaStatus('valid')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      iqamaStatus === 'valid'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ✓ الإقامة سارية (0 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIqamaStatus('expired_normal')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      iqamaStatus === 'expired_normal'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية - تجديد (650 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIqamaStatus('expired_penalty')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      iqamaStatus === 'expired_penalty'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية + غرامة (1,150 ريال)
                  </button>
                </div>
              </div>

              {/* 5. Medical Insurance (Council of Health Insurance) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>إضافة تأمين طبي تقديري للمقيم (مجلس الضمان الصحي)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    {includeInsurance ? `${insuranceEstimate} ريال` : 'غير مشمول'}
                  </span>
                </div>
                {includeInsurance && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-400">التأمين الطبي المتوقع:</span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={insuranceEstimate}
                      onChange={(e) => setInsuranceEstimate(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-lg p-1.5 text-center font-mono font-bold outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ريال (يختلف حسب سن العامل وفئة الشبكة)</span>
                  </div>
                )}
              </div>

              {/* Sponsorship Office Commission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وسعي مكتب الخدمات لمتابعة النقل (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={sponsorshipOfficeFee}
                    onChange={(e) => setSponsorshipOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* ================== MODE 3: IQAMA & LABOR RENEWALS ================== */}
          {activeMode === 'iqama' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" />
                  <span>حاسبة تجديد وإصدار الإقامات وتأشيرات العمل</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تجديد إقامة العمالة المنزلية أو التجارية، المقابل المالي، والتأشيرات
                </p>
              </div>

              {/* Worker Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. تصنيف المقيم / العامل:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWorkerCategory('commercial')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      workerCategory === 'commercial'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">عمالة شركات ومؤسسات (قطاع خاص)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">650 ريال إقامة + رخصة العمل والتأمين</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkerCategory('domestic')}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      workerCategory === 'domestic'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">عمالة منزلية (سائق، عاملة، راعي)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">600 ريال سنوي (معفى من كرت العمل)</div>
                  </button>
                </div>
              </div>

              {/* Years */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. عدد سنوات التجديد:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setIqamaYears(year)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        iqamaYears === year
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {year} {year === 1 ? 'سنة' : 'سنوات'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Permit for Commercial */}
              {workerCategory === 'commercial' && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeWorkPermitLevy}
                        onChange={(e) => setIncludeWorkPermitLevy(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <span>تجديد رخصة العمل والمقابل المالي السنوي</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                      {includeWorkPermitLevy ? `${workLevyFeeGov} ريال` : 'سارية مسبقاً'}
                    </span>
                  </div>

                  {includeWorkPermitLevy && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPermitLevyType('standard')}
                        className={`p-2 rounded-lg text-xs font-bold border text-right ${
                          permitLevyType === 'standard'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        منشأة عادية (8,400 ريال/سنة)
                      </button>

                      <button
                        type="button"
                        onClick={() => setPermitLevyType('exempt')}
                        className={`p-2 rounded-lg text-xs font-bold border text-right ${
                          permitLevyType === 'exempt'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        منشأة صغيرة مستثناة (100 ريال/سنة)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Exit and Reentry Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تأشيرة خروج وعودة مقترنة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludeExitReentry('none')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      includeExitReentry === 'none'
                        ? 'border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    بدون خروج وعودة
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncludeExitReentry('single')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      includeExitReentry === 'single'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    مفردة (شهرين 200 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncludeExitReentry('multi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      includeExitReentry === 'multi'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    متعددة (3 أشهر 500 ريال)
                  </button>
                </div>
              </div>

              {/* Office Commission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وسعي مكتب الخدمات (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={iqamaOfficeCommission}
                    onChange={(e) => setIqamaOfficeCommission(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* ================== MODE 4: SINGLE SERVICE CATALOG ================== */}
          {activeMode === 'single' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>دليل الرسوم الفردية السريعة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختر الخدمة من الدليل الرسمي لحساب الرسوم وسعي المكتب فوراً
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. تصنيف الخدمة:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap -mx-1 px-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 min-h-[38px] flex items-center justify-center cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm border border-amber-400/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#1a263b] dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. اسم الخدمة الحكومية:
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setSingleQty(1);
                  }}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 transition"
                >
                  {activeCategory?.services.map((serv) => (
                    <option key={serv.id} value={serv.id}>
                      {serv.name} ({serv.baseFee} ريال)
                    </option>
                  ))}
                </select>
              </div>

              {activeService?.variablesLabel && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    3. {activeService.variablesLabel}:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={singleQty}
                      onChange={(e) => setSingleQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 text-center text-xs rounded-xl border border-slate-200 bg-slate-50 p-2 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                    />
                    <span className="text-xs text-slate-400">
                      ({activeService.id === 'transfer-sponsorship' ? 'المرة 1 بـ 2000، 2 بـ 4000، 3 بـ 6000' : `الضرب × ${activeService.variableMultiplier} لكل وحدة إضافية`})
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب ومصروفات المكتب (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={singleOfficeFee}
                    onChange={(e) => setSingleOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>

              {activeService?.description && (
                <div className="bg-slate-50 dark:bg-[#152033] p-3 rounded-xl border border-slate-200/50 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  💡 {activeService.description}
                </div>
              )}
            </div>
          )}

          {/* ================== MODE 5: CUSTOM QUOTATION BUILDER ================== */}
          {activeMode === 'custom' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span>حاسبة حرة وتفصيل فاتورة مخصصة لأي معاملة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  أضف أي عدد من بنود الرسوم والمصاريف بحرية تامة لإنشاء عرض سعر احترافي
                </p>
              </div>

              {/* Add Custom Item Form */}
              <div className="bg-slate-50 dark:bg-[#152033] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  إضافة بند تكلفة / رسوم جديد:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="اسم البند أو الخدمة (مثل: شطب سجل تجاري)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="الجهة (الجوازات، وزارة التجارة، بلدي)"
                      value={newItemEntity}
                      onChange={(e) => setNewItemEntity(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="المبلغ (ريال)"
                      min="0"
                      value={newItemAmount || ''}
                      onChange={(e) => setNewItemAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 outline-none font-mono font-bold focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة البند إلى القائمة</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  البنود المضافة ({customItems.length}):
                </div>
                {customItems.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-[#152033] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    لا توجد بنود مضافة حالياً. أضف بنود المعاملة بالأعلى.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {customItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                            <div className="text-[10px] text-slate-400">{item.entity}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black text-slate-800 dark:text-white">
                            {item.amount} <span className="text-[10px] font-normal text-slate-400">ريال</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="حذف البند"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Office Commission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={customOfficeFee}
                    onChange={(e) => setCustomOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* LEFT: Live Cost Summary & WhatsApp Invoice Exporter       */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white/90 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-wider uppercase block">
                  كشف حساب فوري
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ملخص المصاريف والأتعاب
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            {/* Itemized Table Breakdown */}
            <div className="space-y-2 text-xs">
              {/* COMMERCIAL SUMMARY */}
              {activeMode === 'commercial' && (
                <>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>رسوم وزارة التجارة ({crYears} سنة):</span>
                    <span className="font-mono font-bold">{crMinistryFee} ريال</span>
                  </div>

                  {includeChamber && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>اشتراك الغرفة التجارية ({crYears} سنة):</span>
                      <span className="font-mono font-bold">{crChamberTotal} ريال</span>
                    </div>
                  )}

                  {crNameFee > 0 && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>حجز اسم تجاري خاص:</span>
                      <span className="font-mono font-bold">{crNameFee} ريال</span>
                    </div>
                  )}

                  {includeBalady && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>رخصة بلدية (بلدي):</span>
                      <span className="font-mono font-bold">{crBaladyTotal} ريال</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 py-1">
                    <span>ملف العمل والتأمينات والعنوان الوطني:</span>
                    <span className="font-bold">مجاني (0 ريال)</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-bold pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span>إجمالي الرسوم الحكومية الرسمية:</span>
                    <span className="font-mono">{crGovTotal} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold py-1">
                    <span>أتعاب وسعي مكتب الخدمات:</span>
                    <span className="font-mono">{crOfficeCommission} ريال</span>
                  </div>
                </>
              )}

              {/* SPONSORSHIP SUMMARY */}
              {activeMode === 'sponsorship' && (
                <>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>رسوم الجوازات (نقل خدمات للمرة {transferCount}):</span>
                    <span className="font-mono font-bold">{jawazatTransferFee} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>رسوم منصة قوى لنقل موظف:</span>
                    <span className="font-mono font-bold">{qiwaPlatformFee} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>المقابل المالي / كرت العمل:</span>
                    <span className="font-mono font-bold">{workPermitFee} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>تجديد الإقامة (الجوازات):</span>
                    <span className="font-mono font-bold">{iqamaRenewalFee} ريال</span>
                  </div>

                  {includeInsurance && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>التأمين الطبي التقديري:</span>
                      <span className="font-mono font-bold">{insuranceFee} ريال</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-bold pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span>إجمالي الرسوم الحكومية ومنصة قوى:</span>
                    <span className="font-mono">{sponsorshipGovTotal} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold py-1">
                    <span>أتعاب وسعي مكتب الخدمات:</span>
                    <span className="font-mono">{sponsorshipOfficeFee} ريال</span>
                  </div>
                </>
              )}

              {/* IQAMA SUMMARY */}
              {activeMode === 'iqama' && (
                <>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>رسوم تجديد الإقامة ({iqamaYears} سنة):</span>
                    <span className="font-mono font-bold">{iqamaFeeGov} ريال</span>
                  </div>

                  {workLevyFeeGov > 0 && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>المقابل المالي وكرت العمل:</span>
                      <span className="font-mono font-bold">{workLevyFeeGov} ريال</span>
                    </div>
                  )}

                  {medicalFeeGov > 0 && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>التأمين الطبي السنوي:</span>
                      <span className="font-mono font-bold">{medicalFeeGov} ريال</span>
                    </div>
                  )}

                  {exitReentryFeeGov > 0 && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                      <span>تأشيرة خروج وعودة:</span>
                      <span className="font-mono font-bold">{exitReentryFeeGov} ريال</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-bold pt-2 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span>إجمالي الرسوم الحكومية:</span>
                    <span className="font-mono">{iqamaGovTotal} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold py-1">
                    <span>أتعاب وسعي مكتب الخدمات:</span>
                    <span className="font-mono">{iqamaOfficeCommission} ريال</span>
                  </div>
                </>
              )}

              {/* SINGLE SUMMARY */}
              {activeMode === 'single' && (
                <>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>الرسوم الحكومية المستحقة:</span>
                    <span className="font-mono font-bold">{singleGovTotal} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold py-1">
                    <span>أتعاب وسعي مكتب الخدمات:</span>
                    <span className="font-mono">{singleOfficeFee} ريال</span>
                  </div>
                </>
              )}

              {/* CUSTOM SUMMARY */}
              {activeMode === 'custom' && (
                <>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 py-1">
                    <span>مجموع بنود الرسوم والمصاريف ({customItems.length}):</span>
                    <span className="font-mono font-bold">{customGovTotal} ريال</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-bold py-1">
                    <span>أتعاب وإشراف مكتب الخدمات:</span>
                    <span className="font-mono">{customOfficeFee} ريال</span>
                  </div>
                </>
              )}
            </div>

            {/* GRAND TOTAL HIGHLIGHT CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                المبلغ الإجمالي النهائي المطلوب من العميل:
              </span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {activeMode === 'commercial' && crGrandTotal}
                {activeMode === 'sponsorship' && sponsorshipGrandTotal}
                {activeMode === 'iqama' && iqamaGrandTotal}
                {activeMode === 'single' && singleGrandTotal}
                {activeMode === 'custom' && customGrandTotal}{' '}
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">ريال سعودي</span>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Copy */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  copySuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-black text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950'
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 animate-bounce" />
                    <span>تم نسخ نص الفاتورة بنجاح! جاهزة للصق في الواتساب</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>نسخ الفاتورة بتنسيق الواتساب</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                <span>إرسال مباشر للواتساب {clientPhone ? `(${clientPhone})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>طباعة كشف التكاليف</span>
              </button>
            </div>
          </div>

          {/* Practical Tips for Public Service Offices */}
          <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-400">
              <HelpCircle className="h-4 w-4" />
              <span>نصائح هامة لمكاتب الخدمات العامة:</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
              <li>
                <strong>في فتح السجل التجاري:</strong> تأكد من تفعيل العنوان الوطني الموحد وتوثيق العقد عبر قوى لحماية حقوق المنشأة وتفادي تعليق الخدمات.
              </li>
              <li>
                <strong>في نقل كفالة العامل:</strong> تنقل الخدمات عبر منصة قوى أولاً بالموافقة، ثم يتم سداد رسوم الجوازات (2000/4000/6000) عبر نظام سداد، وتوثيق العقد إلكترونياً.
              </li>
              <li>
                <strong>فصل المصاريف:</strong> ننصح دائماً بإرسال تفنيد الرسوم الحكومية المستقلة عن أتعاب وسعي المكتب لتجنب أي سوء تفاهم مع العميل حول أين تصرف مبالغه.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
