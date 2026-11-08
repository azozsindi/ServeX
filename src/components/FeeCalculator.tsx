import React, { useState, useEffect } from 'react';
import { 
  ServiceFeeItem, 
  SavedQuote, 
  QuoteItem 
} from '../types';
import { DEFAULT_VERIFIED_SERVICES } from '../data/defaultServices';
import { 
  uploadQuoteToCloud, 
  fetchQuotesFromCloud, 
  deleteQuoteFromCloud,
  uploadServiceFeeToCloud,
  fetchServiceFeesFromCloud
} from '../firebase';
import QuotePreviewModal from './fee-calculator/QuotePreviewModal';
import PriceManagementModal from './fee-calculator/PriceManagementModal';
import QuotesHistoryModal from './fee-calculator/QuotesHistoryModal';

import { 
  Calculator, 
  Building2, 
  UserCheck, 
  Layers, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Settings, 
  History, 
  Printer, 
  Share2, 
  PhoneCall, 
  CheckCircle, 
  HelpCircle, 
  DollarSign, 
  Plus, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Tag, 
  Percent,
  Calendar,
  User,
  Phone
} from 'lucide-react';

interface FeeCalculatorProps {
  defaultOfficeFee?: number;
  officeName?: string;
  isLoggedIn?: boolean;
  workspaceId?: string;
}

type CalculatorTab = 'commercial' | 'sponsorship' | 'iqama' | 'work_permit' | 'single' | 'custom';

export default function FeeCalculator({ 
  defaultOfficeFee = 150, 
  officeName = 'مكتب الخدمات العامة الموحد',
  isLoggedIn = false,
  workspaceId = 'ws-main'
}: FeeCalculatorProps) {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<CalculatorTab>('commercial');

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Global Tax & Discount Setting
  const [applyVat, setApplyVat] = useState<boolean>(false); // 15% on office fee only
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  // Modals Visibility
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isPriceManageOpen, setIsPriceManageOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [currentQuoteForPreview, setCurrentQuoteForPreview] = useState<SavedQuote | null>(null);

  // Copy success indicator
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // =========================================================================
  // Services & Quotes Persistent State (LocalStorage + Cloud)
  // =========================================================================
  const [services, setServices] = useState<ServiceFeeItem[]>(() => {
    const saved = localStorage.getItem('s_calc_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved services:', e);
      }
    }
    return DEFAULT_VERIFIED_SERVICES;
  });

  const [quotesHistory, setQuotesHistory] = useState<SavedQuote[]>(() => {
    const saved = localStorage.getItem('s_calc_quotes_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved quotes history:', e);
      }
    }
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('s_calc_services', JSON.stringify(services));
    } catch (e) {
      console.error('Could not save services to localStorage', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('s_calc_quotes_history', JSON.stringify(quotesHistory));
    } catch (e) {
      console.error('Could not save quotes history to localStorage', e);
    }
  }, [quotesHistory]);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchQuotesFromCloud().then((cloudQuotes) => {
        if (cloudQuotes && cloudQuotes.length > 0) {
          const ids = new Set(cloudQuotes.map(q => q.id));
          setQuotesHistory(prev => {
            const merged = [...cloudQuotes, ...prev.filter(q => !ids.has(q.id))];
            return merged;
          });
        }
      }).catch(err => console.info('Cloud quotes sync info:', err));

      fetchServiceFeesFromCloud().then((cloudServices) => {
        if (cloudServices && cloudServices.length > 0) {
          setServices(cloudServices as ServiceFeeItem[]);
        }
      }).catch(err => console.info('Cloud services sync info:', err));
    }
  }, [isLoggedIn]);

  // =========================================================================
  // 1. Commercial Registration (فتح سجل تجاري جديد) State
  // =========================================================================
  const [crType, setCrType] = useState<'main' | 'branch'>('main'); // main 200, branch 100
  const [crYears, setCrYears] = useState<number>(1); // 1-5
  const [tradeNameType, setTradeNameType] = useState<'system' | 'custom'>('system'); // 0 vs 1000
  const [chamberClass, setChamberClass] = useState<number>(200); // 200 (4th), 300 (3rd), 500 (2nd), 1000 (1st), 2000 (special)
  const [includeChamber, setIncludeChamber] = useState<boolean>(true);
  const [includeBalady, setIncludeBalady] = useState<boolean>(false);
  const [baladyFee, setBaladyFee] = useState<number>(500);
  const [crOfficeCommission, setCrOfficeCommission] = useState<number>(defaultOfficeFee || 200);

  // =========================================================================
  // 2. Worker Sponsorship Transfer (نقل خدمات عامل) State
  // =========================================================================
  const [sponsorshipWorkerCount, setSponsorshipWorkerCount] = useState<number>(1);
  const [transferTimes, setTransferTimes] = useState<number>(1); // 1st (2000), 2nd (4000), 3rd+ (6000)
  const [qiwaTierFee, setQiwaTierFee] = useState<number>(1000); // 1000 for Class A (1-5), 1500 for Class B, 2000 for large
  const [sponsorshipWorkPermit, setSponsorshipWorkPermit] = useState<'valid' | 'expired_full' | 'expired_small' | 'expired_custom'>('valid');
  const [sponsorshipWorkPermitMonths, setSponsorshipWorkPermitMonths] = useState<number>(3);
  const [sponsorshipIqama, setSponsorshipIqama] = useState<'valid' | 'expired_normal' | 'expired_penalty'>('valid');
  const [sponsorshipInsurance, setSponsorshipInsurance] = useState<boolean>(false);
  const [sponsorshipInsuranceFee, setSponsorshipInsuranceFee] = useState<number>(450);
  const [sponsorshipFeeMode, setSponsorshipFeeMode] = useState<'per_worker' | 'lump_sum'>('per_worker');
  const [sponsorshipOfficeFee, setSponsorshipOfficeFee] = useState<number>(defaultOfficeFee || 300);

  // =========================================================================
  // 3. Iqama Issuance & Renewal (إصدار وتجديد الإقامات) State
  // =========================================================================
  const [iqamaAction, setIqamaAction] = useState<'renewal' | 'issuance'>('renewal');
  const [iqamaWorkerCount, setIqamaWorkerCount] = useState<number>(1);
  const [iqamaSector, setIqamaSector] = useState<'commercial' | 'domestic'>('commercial');
  const [iqamaDurationMonths, setIqamaDurationMonths] = useState<number>(12); // 3, 6, 9, 12, 24
  const [iqamaIncludePermit, setIqamaIncludePermit] = useState<boolean>(true);
  const [iqamaPermitType, setIqamaPermitType] = useState<'surplus' | 'equal' | 'exempt'>('surplus'); // 800/mo, 700/mo, 100/yr
  const [iqamaInsurance, setIqamaInsurance] = useState<boolean>(true);
  const [iqamaInsuranceFee, setIqamaInsuranceFee] = useState<number>(450);
  const [iqamaExitReentry, setIqamaExitReentry] = useState<'none' | 'single' | 'multi'>('none');
  const [iqamaOfficeFee, setIqamaOfficeFee] = useState<number>(defaultOfficeFee || 150);

  // =========================================================================
  // 4. Work Permits & Expat Levies (رخص العمل والمقابل المالي) State
  // =========================================================================
  const [wpWorkerCount, setWpWorkerCount] = useState<number>(1);
  const [wpDurationMonths, setWpDurationMonths] = useState<number>(12); // 3, 6, 9, 12
  const [wpLevyType, setWpLevyType] = useState<'surplus' | 'equal' | 'exempt'>('surplus'); // 800/mo, 700/mo, exempt 100
  const [wpIncludeProfessionChange, setWpIncludeProfessionChange] = useState<boolean>(false);
  const [wpOfficeFee, setWpOfficeFee] = useState<number>(defaultOfficeFee || 150);

  // =========================================================================
  // 5. Single Fast Services Catalog State
  // =========================================================================
  const [selectedSingleServiceId, setSelectedSingleServiceId] = useState<string>(services[0]?.id || '');
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleCustomOfficeFee, setSingleCustomOfficeFee] = useState<number>(defaultOfficeFee || 100);

  // =========================================================================
  // 6. Custom Quotation Builder State (الحاسبة الحرة)
  // =========================================================================
  const [customItems, setCustomItems] = useState<QuoteItem[]>([
    {
      id: 'c-1',
      name: 'رسوم سداد تفويض إلكتروني / عقد عمل',
      entity: 'منصة قوى / مساند',
      quantity: 1,
      unitGovernmentFee: 150,
      totalGovernmentFee: 150,
      unitOfficeFee: 100,
      totalOfficeFee: 100,
      discount: 0
    },
    {
      id: 'c-2',
      name: 'رسوم تصديق مستندات ومراجعة طلب',
      entity: 'الغرفة التجارية / أبشر',
      quantity: 1,
      unitGovernmentFee: 35,
      totalGovernmentFee: 35,
      unitOfficeFee: 50,
      totalOfficeFee: 50,
      discount: 0
    }
  ]);
  const [newCustomName, setNewCustomName] = useState<string>('');
  const [newCustomEntity, setNewCustomEntity] = useState<string>('');
  const [newCustomGovFee, setNewCustomGovFee] = useState<number>(100);
  const [newCustomOfficeFee, setNewCustomOfficeFee] = useState<number>(100);
  const [newCustomQty, setNewCustomQty] = useState<number>(1);
  const [customGlobalOfficeFee, setCustomGlobalOfficeFee] = useState<number>(0);

  // =========================================================================
  // DYNAMIC CALCULATIONS & BREAKDOWN GENERATORS
  // =========================================================================

  // Generate Current Quote Object based on the active tab
  const buildCurrentQuote = (): SavedQuote => {
    const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 7);
    const validUntil = validUntilDate.toISOString().split('T')[0];

    let items: QuoteItem[] = [];
    let serviceTitle = '';

    // 1. COMMERCIAL REGISTRATION
    if (activeTab === 'commercial') {
      serviceTitle = `إصدار سجل تجاري ${crType === 'main' ? 'رئيسي' : 'فرعي'} (${crYears} ${crYears === 1 ? 'سنة' : 'سنوات'})`;
      
      const ministryFeePerYear = crType === 'main' ? 200 : 100;
      items.push({
        id: 'cr-ministry',
        name: `رسوم السجل التجاري (${crType === 'main' ? 'رئيسي' : 'فرعي'})`,
        entity: 'وزارة التجارة / المركز السعودي للأعمال',
        quantity: crYears,
        unitGovernmentFee: ministryFeePerYear,
        totalGovernmentFee: ministryFeePerYear * crYears,
        unitOfficeFee: crOfficeCommission,
        totalOfficeFee: crOfficeCommission,
        discount: 0
      });

      if (includeChamber) {
        items.push({
          id: 'cr-chamber',
          name: `اشتراك الغرفة التجارية السنوي`,
          entity: 'اتحاد الغرف السعودية',
          quantity: crYears,
          unitGovernmentFee: chamberClass,
          totalGovernmentFee: chamberClass * crYears,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (tradeNameType === 'custom') {
        items.push({
          id: 'cr-name',
          name: 'حجز اسم تجاري خاص / مميز',
          entity: 'وزارة التجارة',
          quantity: 1,
          unitGovernmentFee: 1000,
          totalGovernmentFee: 1000,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (includeBalady) {
        items.push({
          id: 'cr-balady',
          name: 'رخصة نشاط تجاري فورية (بلدي)',
          entity: 'وزارة البلديات والإسكان',
          quantity: 1,
          unitGovernmentFee: baladyFee,
          totalGovernmentFee: baladyFee,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      // Free automatic foundation files
      items.push({
        id: 'cr-bundle-free',
        name: 'التأسيس التلقائي (ملف العمل، التأمينات، الرقم الضريبي، العنوان الوطني)',
        entity: 'الربط الحكومي الموحد (SBC)',
        quantity: 1,
        unitGovernmentFee: 0,
        totalGovernmentFee: 0,
        unitOfficeFee: 0,
        totalOfficeFee: 0,
        discount: 0,
        notes: 'مشمول ومفعل مجاناً وفورياً عبر المركز السعودي للأعمال'
      });
    }

    // 2. SPONSORSHIP TRANSFER
    else if (activeTab === 'sponsorship') {
      serviceTitle = `نقل كفالة عمالة (${sponsorshipWorkerCount} ${sponsorshipWorkerCount === 1 ? 'عامل' : 'عمال'}) - المرة ${transferTimes === 1 ? 'الأولى' : transferTimes === 2 ? 'الثانية' : 'الثالثة فأكثر'}`;
      
      const jawazatPerWorker = transferTimes === 1 ? 2000 : transferTimes === 2 ? 4000 : 6000;
      const totalOffice = sponsorshipFeeMode === 'per_worker' 
        ? sponsorshipOfficeFee * sponsorshipWorkerCount 
        : sponsorshipOfficeFee;

      items.push({
        id: 'sp-jawazat',
        name: `رسوم الجوازات لنقل الخدمات (المرة ${transferTimes === 1 ? 'الأولى' : transferTimes === 2 ? 'الثانية' : 'الثالثة فأكثر'})`,
        entity: 'المديرية العامة للجوازات',
        quantity: sponsorshipWorkerCount,
        unitGovernmentFee: jawazatPerWorker,
        totalGovernmentFee: jawazatPerWorker * sponsorshipWorkerCount,
        unitOfficeFee: sponsorshipFeeMode === 'per_worker' ? sponsorshipOfficeFee : totalOffice,
        totalOfficeFee: totalOffice,
        discount: 0
      });

      items.push({
        id: 'sp-qiwa',
        name: `رسوم منصة قوى لنقل موظف`,
        entity: 'منصة قوى (وزارة الموارد البشرية)',
        quantity: sponsorshipWorkerCount,
        unitGovernmentFee: qiwaTierFee,
        totalGovernmentFee: qiwaTierFee * sponsorshipWorkerCount,
        unitOfficeFee: 0,
        totalOfficeFee: 0,
        discount: 0
      });

      if (sponsorshipWorkPermit === 'expired_full') {
        items.push({
          id: 'sp-permit-full',
          name: 'المقابل المالي وكرت العمل المتأخر (سنة كاملة)',
          entity: 'وزارة الموارد البشرية',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: 9700,
          totalGovernmentFee: 9700 * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      } else if (sponsorshipWorkPermit === 'expired_small') {
        items.push({
          id: 'sp-permit-small',
          name: 'رخصة العمل للمنشآت الصغيرة المستثناة (سنة)',
          entity: 'وزارة الموارد البشرية',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: 100,
          totalGovernmentFee: 100 * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      } else if (sponsorshipWorkPermit === 'expired_custom') {
        const permitCost = sponsorshipWorkPermitMonths * 700;
        items.push({
          id: 'sp-permit-custom',
          name: `المقابل المالي المتأخر (${sponsorshipWorkPermitMonths} أشهر)`,
          entity: 'وزارة الموارد البشرية',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: permitCost,
          totalGovernmentFee: permitCost * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (sponsorshipIqama === 'expired_normal') {
        items.push({
          id: 'sp-iqama-renew',
          name: 'تجديد الإقامة المنتهية (سنة)',
          entity: 'المديرية العامة للجوازات',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: 650,
          totalGovernmentFee: 650 * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      } else if (sponsorshipIqama === 'expired_penalty') {
        items.push({
          id: 'sp-iqama-penalty',
          name: 'تجديد الإقامة المنتهية + غرامة التأخير (1,150 ريال)',
          entity: 'المديرية العامة للجوازات',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: 1150,
          totalGovernmentFee: 1150 * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (sponsorshipInsurance) {
        items.push({
          id: 'sp-insurance',
          name: 'وثيقة التأمين الطبي للمقيم (تقديري)',
          entity: 'مجلس الضمان الصحي',
          quantity: sponsorshipWorkerCount,
          unitGovernmentFee: sponsorshipInsuranceFee,
          totalGovernmentFee: sponsorshipInsuranceFee * sponsorshipWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }
    }

    // 3. IQAMA ISSUANCE & RENEWAL
    else if (activeTab === 'iqama') {
      const durLabel = iqamaDurationMonths === 3 ? 'ربع سنوي (3 أشهر)' 
        : iqamaDurationMonths === 6 ? 'نصف سنوي (6 أشهر)' 
        : iqamaDurationMonths === 9 ? '9 أشهر' 
        : iqamaDurationMonths === 24 ? 'سنتين' 
        : 'سنة كاملة';

      serviceTitle = `${iqamaAction === 'issuance' ? 'إصدار' : 'تجديد'} إقامة (${iqamaWorkerCount} ${iqamaWorkerCount === 1 ? 'عامل' : 'عمال'}) - ${durLabel}`;

      const baseAnnualGov = iqamaSector === 'commercial' ? 650 : 600;
      const factor = iqamaDurationMonths / 12;
      const iqamaGovPerWorker = Math.round(baseAnnualGov * factor);

      items.push({
        id: 'iq-base',
        name: `رسوم ${iqamaAction === 'issuance' ? 'إصدار' : 'تجديد'} الإقامة (${durLabel})`,
        entity: 'المديرية العامة للجوازات',
        quantity: iqamaWorkerCount,
        unitGovernmentFee: iqamaGovPerWorker,
        totalGovernmentFee: iqamaGovPerWorker * iqamaWorkerCount,
        unitOfficeFee: iqamaOfficeFee,
        totalOfficeFee: iqamaOfficeFee * iqamaWorkerCount,
        discount: 0
      });

      if (iqamaSector === 'commercial' && iqamaIncludePermit) {
        let annualPermit = iqamaPermitType === 'surplus' ? 9700 : iqamaPermitType === 'equal' ? 8500 : 100;
        let permitPerWorker = Math.round(annualPermit * factor);

        items.push({
          id: 'iq-permit',
          name: `رخصة العمل والمقابل المالي (${durLabel})`,
          entity: 'وزارة الموارد البشرية (قوى)',
          quantity: iqamaWorkerCount,
          unitGovernmentFee: permitPerWorker,
          totalGovernmentFee: permitPerWorker * iqamaWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (iqamaSector === 'commercial' && iqamaInsurance) {
        items.push({
          id: 'iq-insurance',
          name: 'وثيقة التأمين الطبي السنوي',
          entity: 'مجلس الضمان الصحي',
          quantity: iqamaWorkerCount,
          unitGovernmentFee: iqamaInsuranceFee,
          totalGovernmentFee: iqamaInsuranceFee * iqamaWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (iqamaExitReentry !== 'none') {
        const exitFee = iqamaExitReentry === 'single' ? 200 : 500;
        items.push({
          id: 'iq-exit',
          name: `تأشيرة خروج وعودة (${iqamaExitReentry === 'single' ? 'مفردة' : 'متعددة'})`,
          entity: 'المديرية العامة للجوازات',
          quantity: iqamaWorkerCount,
          unitGovernmentFee: exitFee,
          totalGovernmentFee: exitFee * iqamaWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }
    }

    // 4. WORK PERMITS & EXPAT LEVY
    else if (activeTab === 'work_permit') {
      const durLabel = wpDurationMonths === 3 ? '3 أشهر (ربع سنوي)' 
        : wpDurationMonths === 6 ? '6 أشهر (نصف سنوي)' 
        : wpDurationMonths === 9 ? '9 أشهر' 
        : 'سنة كاملة (12 شهراً)';

      serviceTitle = `رخص العمل والمقابل المالي (${wpWorkerCount} عمال) - ${durLabel}`;

      let annualFee = wpLevyType === 'surplus' ? 9700 : wpLevyType === 'equal' ? 8500 : 100;
      let factor = wpDurationMonths / 12;
      let permitCost = Math.round(annualFee * factor);

      items.push({
        id: 'wp-levy',
        name: `المقابل المالي ورخصة العمل (${wpLevyType === 'surplus' ? 'عمالة فائضة 800/ش' : wpLevyType === 'equal' ? 'عمالة مساوية 700/ش' : 'منشأة صغيرة مستثناة'}) - ${durLabel}`,
        entity: 'وزارة الموارد البشرية والتنمية الاجتماعية (قوى)',
        quantity: wpWorkerCount,
        unitGovernmentFee: permitCost,
        totalGovernmentFee: permitCost * wpWorkerCount,
        unitOfficeFee: wpOfficeFee,
        totalOfficeFee: wpOfficeFee * wpWorkerCount,
        discount: 0
      });

      if (wpIncludeProfessionChange) {
        items.push({
          id: 'wp-prof',
          name: 'رسوم تعديل المهنة بالجوازات',
          entity: 'المديرية العامة للجوازات',
          quantity: wpWorkerCount,
          unitGovernmentFee: 1000,
          totalGovernmentFee: 1000 * wpWorkerCount,
          unitOfficeFee: 50,
          totalOfficeFee: 50 * wpWorkerCount,
          discount: 0
        });
      }
    }

    // 5. SINGLE FAST SERVICE
    else if (activeTab === 'single') {
      const srv = services.find(s => s.id === selectedSingleServiceId) || services[0];
      serviceTitle = srv ? `${srv.name} (عدد ${singleQty})` : 'خدمة حكومية';

      let govFeeTotal = (srv?.governmentFee || 0) * singleQty;
      let officeTotal = singleCustomOfficeFee * singleQty;

      items.push({
        id: srv?.id || 'single-1',
        name: srv?.name || 'خدمة حكومية',
        entity: srv?.entity || 'الجهات الحكومية',
        quantity: singleQty,
        unitGovernmentFee: srv?.governmentFee || 0,
        totalGovernmentFee: govFeeTotal,
        unitOfficeFee: singleCustomOfficeFee,
        totalOfficeFee: officeTotal,
        discount: 0,
        notes: srv?.description
      });
    }

    // 6. CUSTOM QUOTE BUILDER
    else {
      serviceTitle = 'عرض سعر ومصاريف مخصصة';
      items = customItems.map(item => ({ ...item }));
    }

    // Calculate totals
    const totalGovernmentFees = items.reduce((acc, it) => acc + it.totalGovernmentFee, 0);
    const totalOfficeFees = items.reduce((acc, it) => acc + it.totalOfficeFee, 0) + (activeTab === 'custom' ? customGlobalOfficeFee : 0);
    const totalDiscount = Math.max(0, globalDiscount);

    // VAT 15% applies strictly to office commission (under Saudi ZATCA regulations)
    const vatRate = applyVat ? 15 : 0;
    const vatAmount = applyVat ? Math.round(totalOfficeFees * 0.15) : 0;

    const grandTotal = Math.max(0, totalGovernmentFees + totalOfficeFees + vatAmount - totalDiscount);

    return {
      id: `qt-${Date.now()}`,
      quoteNumber,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceType: activeTab,
      serviceTitle,
      items,
      totalGovernmentFees,
      totalOfficeFees,
      totalDiscount,
      vatRate,
      vatAmount,
      grandTotal,
      status: 'pending_payment',
      createdAt: today,
      validUntil,
      responsibleEmployee: 'الموظف المختص',
      workspaceId,
      notes: quoteNotes.trim()
    };
  };

  // Live Calculated Quote for Current Tab
  const liveQuote = buildCurrentQuote();

  // =========================================================================
  // ACTIONS & HANDLERS
  // =========================================================================

  const handleOpenPreview = () => {
    setCurrentQuoteForPreview(liveQuote);
    setIsPreviewOpen(true);
  };

  const handleSaveQuoteToHistory = (quoteToSave: SavedQuote) => {
    const updated = [quoteToSave, ...quotesHistory.filter(q => q.id !== quoteToSave.id)];
    setQuotesHistory(updated);
    if (isLoggedIn) {
      uploadQuoteToCloud(quoteToSave).catch(e => console.error('Cloud quote save err:', e));
    }
  };

  const handleUpdateQuoteStatus = (quoteId: string, newStatus: SavedQuote['status']) => {
    const updated = quotesHistory.map(q => q.id === quoteId ? { ...q, status: newStatus } : q);
    setQuotesHistory(updated);
    const changed = updated.find(q => q.id === quoteId);
    if (changed && isLoggedIn) {
      uploadQuoteToCloud(changed).catch(e => console.error('Cloud status update err:', e));
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    const updated = quotesHistory.filter(q => q.id !== quoteId);
    setQuotesHistory(updated);
    if (isLoggedIn) {
      deleteQuoteFromCloud(quoteId).catch(e => console.error('Cloud delete quote err:', e));
    }
  };

  const handleCopyWhatsAppInvoice = () => {
    let t = `*🧾 بيان وتفصيل تكاليف المعاملة الحكومية*\n`;
    t += `*📍 ${officeName}*\n`;
    t += `*التاريخ:* ${liveQuote.createdAt}\n`;
    if (clientName.trim()) t += `*العميل الكريم:* ${clientName.trim()}\n`;
    t += `*نوع المعاملة:* ${liveQuote.serviceTitle}\n`;
    t += `-------------------------------------------\n`;

    liveQuote.items.forEach((item, idx) => {
      t += `${idx + 1}. *${item.name}*\n`;
      t += `   • الجهة: ${item.entity}\n`;
      if (item.quantity > 1) t += `   • الكمية: ${item.quantity}\n`;
      t += `   • الرسوم الحكومية: ${item.totalGovernmentFee.toLocaleString()} ريال\n`;
      if (item.totalOfficeFee > 0) t += `   • أتعاب المكتب: ${item.totalOfficeFee.toLocaleString()} ريال\n`;
    });

    t += `-------------------------------------------\n`;
    t += `🏛️ *إجمالي الرسوم الحكومية الرسمية:* ${liveQuote.totalGovernmentFees.toLocaleString()} ريال\n`;
    t += `💼 *إجمالي أتعاب وإشراف المكتب:* ${liveQuote.totalOfficeFees.toLocaleString()} ريال\n`;
    if (liveQuote.totalDiscount > 0) {
      t += `🏷️ *الخصم المطبق:* -${liveQuote.totalDiscount.toLocaleString()} ريال\n`;
    }
    if (liveQuote.vatAmount > 0) {
      t += `📊 *ضريبة القيمة المضافة (15% على الأتعاب):* +${liveQuote.vatAmount.toLocaleString()} ريال\n`;
    }
    t += `===========================================\n`;
    t += `💰 *المبلغ النهائي الإجمالي المطلوب:* *${liveQuote.grandTotal.toLocaleString()} ريال سعودي*\n`;
    t += `===========================================\n\n`;
    t += `_يرجى مراجعة وتأكيد السداد وتزويدنا بإشعار التحويل لنباشر الإجراء الفوري. شكراً لثقتكم_ 🙏✨`;

    navigator.clipboard.writeText(t);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleOpenWhatsAppDirect = () => {
    let t = `*🧾 بيان وتفصيل تكاليف المعاملة الحكومية*\n`;
    t += `*📍 ${officeName}*\n`;
    if (clientName.trim()) t += `*العميل الكريم:* ${clientName.trim()}\n`;
    t += `*نوع المعاملة:* ${liveQuote.serviceTitle}\n`;
    t += `-------------------------------------------\n`;
    t += `🏛️ *إجمالي الرسوم الحكومية:* ${liveQuote.totalGovernmentFees.toLocaleString()} ريال\n`;
    t += `💼 *إجمالي أتعاب وسعي المكتب:* ${liveQuote.totalOfficeFees.toLocaleString()} ريال\n`;
    if (liveQuote.totalDiscount > 0) t += `🏷️ *الخصم:* -${liveQuote.totalDiscount.toLocaleString()} ريال\n`;
    if (liveQuote.vatAmount > 0) t += `📊 *الضريبة 15%:* +${liveQuote.vatAmount.toLocaleString()} ريال\n`;
    t += `💰 *الإجمالي النهائي المطلوب:* *${liveQuote.grandTotal.toLocaleString()} ريال سعودي*\n`;

    const encoded = encodeURIComponent(t);
    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) cleanPhone = '966' + cleanPhone.substring(1);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Custom Items Management
  const handleAddCustomItem = () => {
    if (!newCustomName.trim()) return;
    const qty = Math.max(1, newCustomQty);
    const govFee = Math.max(0, newCustomGovFee);
    const officeFee = Math.max(0, newCustomOfficeFee);

    const newItem: QuoteItem = {
      id: `cust-${Date.now()}`,
      name: newCustomName.trim(),
      entity: newCustomEntity.trim() || 'جهة حكومية',
      quantity: qty,
      unitGovernmentFee: govFee,
      totalGovernmentFee: govFee * qty,
      unitOfficeFee: officeFee,
      totalOfficeFee: officeFee * qty,
      discount: 0
    };

    setCustomItems([...customItems, newItem]);
    setNewCustomName('');
    setNewCustomEntity('');
    setNewCustomGovFee(100);
    setNewCustomOfficeFee(100);
    setNewCustomQty(1);
  };

  const handleDeleteCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-white/90 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 rounded-2xl shadow-md shrink-0">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  حاسبة المصاريف والتكاليف الحكومية وعروض الأسعار
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  معتمدة ومحدثة 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حساب الرسوم الرسمية (التجارة، قوى، الجوازات، بلدي، التأمينات) وإصدار عروض أسعار للعملاء
              </p>
            </div>
          </div>

          {/* Quick Header Actions: History & Price Management */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#152033] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <History className="h-4 w-4 text-amber-500" />
              <span>سجل العمليات ({quotesHistory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPriceManageOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Settings className="h-4 w-4" />
              <span>إدارة الأسعار والتحقق</span>
            </button>
          </div>
        </div>

        {/* Client Inputs Bar */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500 shrink-0" />
            <input
              type="text"
              placeholder="اسم العميل (مثال: عبدالله الراجحي)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-500 shrink-0" />
            <input
              type="tel"
              placeholder="رقم جوال العميل (05xxxxxxxx)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none font-mono focus:border-amber-500 text-left"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
              />
              <span>ضريبة 15% (على الأتعاب)</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">خصم:</span>
              <input
                type="number"
                min="0"
                step="25"
                placeholder="0"
                value={globalDiscount || ''}
                onChange={(e) => setGlobalDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-center font-mono font-bold text-rose-600 dark:text-rose-400 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Calculator Modes Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 border-b border-slate-150 dark:border-white/5">
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'commercial'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>🏢 فتح سجل تجاري</span>
          </button>

          <button
            onClick={() => setActiveTab('sponsorship')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'sponsorship'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>🔄 نقل خدمات عامل</span>
          </button>

          <button
            onClick={() => setActiveTab('iqama')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'iqama'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>🪪 إصدار وتجديد الإقامات</span>
          </button>

          <button
            onClick={() => setActiveTab('work_permit')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'work_permit'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>💼 رخص العمل والمقابل المالي</span>
          </button>

          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'single'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>⚡ الخدمات الفردية السريعة</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>📝 حاسبة وعرض سعر حر</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Setup on Right (7 Cols), Summary Sheet on Left (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Configurations                                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* TAB 1: COMMERCIAL REGISTRATION */}
          {activeTab === 'commercial' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  <span>تحديد مواصفات وتكاليف السجل التجاري الجديد</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب رسوم وزارة التجارة، الغرفة التجارية حسب الفئة، حجز الاسم ورخصة بلدي
                </p>
              </div>

              {/* CR Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. نوع السجل التجاري:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCrType('main')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
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
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
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

              {/* Years */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. مدة صلاحية السجل:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setCrYears(yr)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        crYears === yr
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {yr} {yr === 1 ? 'سنة' : 'سنوات'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trade Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  3. حجز الاسم التجاري:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeNameType('system')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      tradeNameType === 'system'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>اسم مقترح من النظام</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">مجاني 0 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">توليد تلقائي فوري مطابق للنشاط</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeNameType('custom')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      tradeNameType === 'custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>اسم تجاري خاص / مميز</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">1,000 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">اسم خاص محجوز مسبقاً بالتجارة</div>
                  </button>
                </div>
              </div>

              {/* Chamber of Commerce Subscription */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeChamber}
                      onChange={(e) => setIncludeChamber(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>اشتراك الغرفة التجارية (إلزامي للسجل)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    {includeChamber ? `${chamberClass * crYears} ريال` : 'غير مشمول'}
                  </span>
                </div>

                {includeChamber && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                    {[
                      { label: 'الدرجة 4', fee: 200 },
                      { label: 'الدرجة 3', fee: 300 },
                      { label: 'الدرجة 2', fee: 500 },
                      { label: 'الدرجة 1', fee: 1000 },
                      { label: 'ممتازة', fee: 2000 }
                    ].map((item) => (
                      <button
                        key={item.fee}
                        type="button"
                        onClick={() => setChamberClass(item.fee)}
                        className={`p-2 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                          chamberClass === item.fee
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="text-[10px] font-mono mt-0.5">{item.fee} ر/سنة</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Municipal License (Balady) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBalady}
                      onChange={(e) => setIncludeBalady(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>إضافة رخصة بلدية فورية للمحل / المقر (بلدي)</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    {includeBalady ? `${baladyFee} ريال` : 'بدون رخصة'}
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
                      className="w-28 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-center font-mono font-bold outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ريال (تتحدد حسب مساحة ونوع المحل واللوحة)</span>
                  </div>
                )}
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

          {/* TAB 2: SPONSORSHIP TRANSFER */}
          {activeTab === 'sponsorship' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-amber-500" />
                  <span>حساب مصاريف نقل كفالة عمالة (خدمات مقيم وقوى)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تحديد رسوم الجوازات حسب مرات النقل، عدد العمال، قوى، رخص العمل، والإقامة
                </p>
              </div>

              {/* Worker Count & Transfer Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عدد العمال المطلوب نقلهم:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={sponsorshipWorkerCount}
                    onChange={(e) => setSponsorshipWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-xs rounded-xl border border-slate-200 bg-slate-50 dark:bg-[#152033] dark:border-white/10 p-2.5 font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رسوم الجوازات (عدد مرات النقل):
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { times: 1, label: 'أولى', fee: 2000 },
                      { times: 2, label: 'ثانية', fee: 4000 },
                      { times: 3, label: 'ثالثة+', fee: 6000 }
                    ].map((item) => (
                      <button
                        key={item.times}
                        type="button"
                        onClick={() => setTransferTimes(item.times)}
                        className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                          transferTimes === item.times
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>{item.label}</div>
                        <div className="text-[10px] font-mono">{item.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Qiwa Platform Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  رسوم منصة قوى لنقل موظف:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tier: 1000, label: 'فئة أ (1-5 عمال)', fee: 1000 },
                    { tier: 1500, label: 'فئة ب (6-49 عامل)', fee: 1500 },
                    { tier: 2000, label: 'فئة ج / كبيرة (50+)', fee: 2000 }
                  ].map((item) => (
                    <button
                      key={item.tier}
                      type="button"
                      onClick={() => setQiwaTierFee(item.tier)}
                      className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                        qiwaTierFee === item.tier
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-0.5">{item.fee} ريال</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Permit Levy Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  حالة رخصة العمل / المقابل المالي:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSponsorshipWorkPermit('valid')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      sponsorshipWorkPermit === 'valid'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ✓ رخصة العمل سارية (0 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipWorkPermit('expired_full')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      sponsorshipWorkPermit === 'expired_full'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية - سنة عمالة فائضة (9,700 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipWorkPermit('expired_small')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      sponsorshipWorkPermit === 'expired_small'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منشأة صغيرة مستثناة (100 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipWorkPermit('expired_custom')}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer ${
                      sponsorshipWorkPermit === 'expired_custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    منتهية لعدة أشهر (700 ريال / شهر)
                  </button>
                </div>
              </div>

              {/* Iqama Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  حالة هوية مقيم / الإقامة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSponsorshipIqama('valid')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      sponsorshipIqama === 'valid'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    سارية (0 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipIqama('expired_normal')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      sponsorshipIqama === 'expired_normal'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    تجديد (650 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipIqama('expired_penalty')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      sponsorshipIqama === 'expired_penalty'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    تجديد + غرامة (1,150)
                  </button>
                </div>
              </div>

              {/* Medical Insurance */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sponsorshipInsurance}
                    onChange={(e) => setSponsorshipInsurance(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>إضافة التأمين الطبي التقديري للمقيم</span>
                </label>
                {sponsorshipInsurance && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={sponsorshipInsuranceFee}
                      onChange={(e) => setSponsorshipInsuranceFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl p-1.5 text-center font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400">ريال/عامل</span>
                  </div>
                )}
              </div>

              {/* Office Commission Mode & Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>أتعاب وسعي مكتب الخدمات:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSponsorshipFeeMode('per_worker')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                        sponsorshipFeeMode === 'per_worker' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      لكل عامل
                    </button>
                    <button
                      type="button"
                      onClick={() => setSponsorshipFeeMode('lump_sum')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                        sponsorshipFeeMode === 'lump_sum' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      مقطوعة للطلب
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={sponsorshipOfficeFee}
                    onChange={(e) => setSponsorshipOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">
                    {sponsorshipFeeMode === 'per_worker' ? 'ريال / عامل' : 'ريال إجمالي'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IQAMA ISSUANCE & RENEWAL */}
          {activeTab === 'iqama' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" />
                  <span>حاسبة تجديد وإصدار الإقامات وتأشيرات العمل</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تجديد الإقامات، المقابل المالي، التأمين الطبي، وتأشيرات الخروج والعودة
                </p>
              </div>

              {/* Action: Issuance vs Renewal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIqamaAction('renewal')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    iqamaAction === 'renewal'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20 font-black'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تجديد إقامة قائمة
                </button>

                <button
                  type="button"
                  onClick={() => setIqamaAction('issuance')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    iqamaAction === 'issuance'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20 font-black'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  إصدار إقامة جديدة
                </button>
              </div>

              {/* Sector & Worker Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    قطاع العمالة:
                  </label>
                  <select
                    value={iqamaSector}
                    onChange={(e) => setIqamaSector(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] p-2.5 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="commercial">قطاع خاص تجاري (650 ريال + كرت العمل)</option>
                    <option value="domestic">عمالة منزلية (600 ريال - بدون كرت عمل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عدد العمالة المشمولة:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={iqamaWorkerCount}
                    onChange={(e) => setIqamaWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-xs rounded-xl border border-slate-200 bg-slate-50 dark:bg-[#152033] dark:border-white/10 p-2.5 font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Duration Options */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  مدة التجديد المعتمدة:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { m: 3, label: '3 أشهر' },
                    { m: 6, label: '6 أشهر' },
                    { m: 9, label: '9 أشهر' },
                    { m: 12, label: 'سنة' },
                    { m: 24, label: 'سنتين' }
                  ].map((dur) => (
                    <button
                      key={dur.m}
                      type="button"
                      onClick={() => setIqamaDurationMonths(dur.m)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        iqamaDurationMonths === dur.m
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-100 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Permit Levy (Commercial only) */}
              {iqamaSector === 'commercial' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={iqamaIncludePermit}
                        onChange={(e) => setIqamaIncludePermit(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                      />
                      <span>تجديد رخصة العمل والمقابل المالي</span>
                    </label>
                  </div>

                  {iqamaIncludePermit && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { type: 'surplus', label: 'عمالة فائضة (800/ش)' },
                        { type: 'equal', label: 'عمالة مساوية (700/ش)' },
                        { type: 'exempt', label: 'منشأة معفاة (100/س)' }
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setIqamaPermitType(item.type as any)}
                          className={`p-2 rounded-xl text-xs font-bold border text-center ${
                            iqamaPermitType === item.type
                              ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Exit Reentry */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تأشيرة خروج وعودة مقترنة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIqamaExitReentry('none')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                      iqamaExitReentry === 'none'
                        ? 'border-slate-700 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    بدون خروج وعودة
                  </button>

                  <button
                    type="button"
                    onClick={() => setIqamaExitReentry('single')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                      iqamaExitReentry === 'single'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    مفردة (200 ريال)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIqamaExitReentry('multi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold ${
                      iqamaExitReentry === 'multi'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    متعددة (500 ريال)
                  </button>
                </div>
              </div>

              {/* Office Commission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وسعي المكتب لكل عامل (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={iqamaOfficeFee}
                    onChange={(e) => setIqamaOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال / عامل</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORK PERMITS & EXPAT LEVIES (NEW DEDICATED TAB) */}
          {activeTab === 'work_permit' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-500" />
                  <span>حاسبة رخص العمل والمقابل المالي الرسمية (منصة قوى)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب المقابل المالي لفترات مرنة (3، 6، 9، 12 شهر) للمنشآت الفائضة والمعفاة
                </p>
              </div>

              {/* Number of Workers & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عدد العمال:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={wpWorkerCount}
                    onChange={(e) => setWpWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-xs rounded-xl border border-slate-200 bg-slate-50 dark:bg-[#152033] dark:border-white/10 p-2.5 font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    مدة رخصة العمل:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { m: 3, l: '3 أشهر' },
                      { m: 6, l: '6 أشهر' },
                      { m: 9, l: '9 أشهر' },
                      { m: 12, l: 'سنة' }
                    ].map((dur) => (
                      <button
                        key={dur.m}
                        type="button"
                        onClick={() => setWpDurationMonths(dur.m)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                          wpDurationMonths === dur.m
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dur.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expat Levy Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  فئة المقابل المالي في قوى:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWpLevyType('surplus')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      wpLevyType === 'surplus'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">عمالة فائضة عن السعوديين</div>
                    <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-1">800 ريال / شهر</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">9,700 ريال سنوياً مع كرت العمل</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWpLevyType('equal')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      wpLevyType === 'equal'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">عمالة مساوية أو أقل</div>
                    <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-1">700 ريال / شهر</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">8,500 ريال سنوياً مع كرت العمل</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWpLevyType('exempt')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      wpLevyType === 'exempt'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">منشأة صغيرة مستثناة</div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">100 ريال / سنة</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">إعفاء من المقابل المالي حتى 4 عمال</div>
                  </button>
                </div>
              </div>

              {/* Include Profession Change */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wpIncludeProfessionChange}
                    onChange={(e) => setWpIncludeProfessionChange(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>إضافة رسوم تعديل مهنة عامل بالجوازات (1,000 ريال)</span>
                </label>
              </div>

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وسعي المكتب لكل عامل (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={wpOfficeFee}
                    onChange={(e) => setWpOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال / عامل</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SINGLE FAST SERVICES CATALOG */}
          {activeTab === 'single' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>دليل الخدمات الفردية السريعة والرسوم الحكومية</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  اختر الخدمة من الدليل المعتمد مع إمكانية تعديل الكمية وأتعاب المكتب فوراً
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  اختر الخدمة الحكومية:
                </label>
                <select
                  value={selectedSingleServiceId}
                  onChange={(e) => {
                    setSelectedSingleServiceId(e.target.value);
                    const chosen = services.find(s => s.id === e.target.value);
                    if (chosen) setSingleCustomOfficeFee(chosen.defaultOfficeFee);
                  }}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-semibold transition"
                >
                  {services.filter(s => s.isActive).map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — ({srv.governmentFee} ريال - {srv.entity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Details Card */}
              {(() => {
                const srv = services.find(s => s.id === selectedSingleServiceId) || services[0];
                return srv ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{srv.name}</span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {srv.governmentFee} ريال
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      الجهة: {srv.entity} | المصدر: {srv.officialSource}
                    </div>
                    {srv.description && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200 dark:border-white/5">
                        💡 {srv.description}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الكمية / عدد المعاملات:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={singleQty}
                    onChange={(e) => setSingleQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    أتعاب المكتب لكل معاملة (SAR):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={singleCustomOfficeFee}
                    onChange={(e) => setSingleCustomOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM QUOTATION BUILDER */}
          {activeTab === 'custom' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span>حاسبة حرة وتفصيل كشف تكاليف مخصص</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  أضف أي عدد من بنود الرسوم والمصاريف والأتعاب بحرية تامة لأي معاملة خاصة
                </p>
              </div>

              {/* Add Custom Item Box */}
              <div className="bg-slate-50 dark:bg-[#152033] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  إضافة بند تكلفة / خدمة جديد:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="اسم الخدمة (مثل: شطب سجل تجاري)"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="الجهة الحكومية"
                      value={newCustomEntity}
                      onChange={(e) => setNewCustomEntity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="الرسم الحكومي"
                      min="0"
                      value={newCustomGovFee || ''}
                      onChange={(e) => setNewCustomGovFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 font-mono font-bold text-slate-800 dark:text-white outline-none text-center"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="أتعاب المكتب"
                      min="0"
                      value={newCustomOfficeFee || ''}
                      onChange={(e) => setNewCustomOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 font-mono font-bold text-amber-600 dark:text-amber-400 outline-none text-center"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      placeholder="الكمية"
                      min="1"
                      value={newCustomQty}
                      onChange={(e) => setNewCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 font-mono font-bold text-slate-800 dark:text-white outline-none text-center"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
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
                  <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 dark:bg-[#152033] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                    لا توجد بنود مضافة حالياً.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400">{item.entity} (الكمية: {item.quantity})</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left font-mono">
                            <span className="text-[11px] text-slate-400 block font-sans">حكومي + أتعاب:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {(item.totalGovernmentFee + item.totalOfficeFee).toLocaleString()} ريال
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes Box */}
          <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-4 shadow-sm border border-slate-200/50 dark:border-white/5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات وشروط خاصة بعرض السعر (تظهر في الفاتورة):
            </label>
            <textarea
              rows={2}
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="مثال: يرجى سداد رسوم الغرفة التجارية أولاً ليتسنى لنا إنهاء الطلب فوراً..."
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Live Breakdown, Grand Total & Instant Export                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white/90 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-wider uppercase block">
                  كشف التكاليف المباشر
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ملخص الرسوم والأتعاب
                </h3>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            {/* Itemized Live Table Breakdown */}
            <div className="space-y-2 text-xs divide-y divide-slate-150 dark:divide-white/5">
              {liveQuote.items.map((it) => (
                <div key={it.id} className="pt-2 flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{it.name}</span>
                    <span className="block text-[10px] text-slate-400">{it.entity}</span>
                  </div>
                  <div className="text-left font-mono font-bold">
                    <div>{it.totalGovernmentFee.toLocaleString()} <span className="text-[10px] text-slate-400">رسم</span></div>
                    {it.totalOfficeFee > 0 && (
                      <div className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                        +{it.totalOfficeFee.toLocaleString()} <span className="text-[9px]">سعي</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Summary Sheet */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                <span>إجمالي الرسوم الحكومية الرسمية:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {liveQuote.totalGovernmentFees.toLocaleString()} ريال
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                <span>إجمالي أتعاب وإشراف المكتب:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {liveQuote.totalOfficeFees.toLocaleString()} ريال
                </span>
              </div>

              {liveQuote.totalDiscount > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-sans font-bold">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono">
                    -{liveQuote.totalDiscount.toLocaleString()} ريال
                  </span>
                </div>
              )}

              {liveQuote.vatAmount > 0 && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                  <span>ضريبة القيمة المضافة (15% على الأتعاب):</span>
                  <span className="font-mono font-bold">
                    +{liveQuote.vatAmount.toLocaleString()} ريال
                  </span>
                </div>
              )}
            </div>

            {/* Grand Total Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-center space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                المبلغ الإجمالي النهائي المطلوب من العميل:
              </span>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {liveQuote.grandTotal.toLocaleString()}{' '}
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">ريال سعودي</span>
              </div>
            </div>

            {/* Instant Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>معاينة وتصدير عرض السعر الرسمي (PDF)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppInvoice}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  copySuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>تم نسخ نص الفاتورة للواتساب!</span>
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
                onClick={handleOpenWhatsAppDirect}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <PhoneCall className="h-4 w-4" />
                <span>إرسال مباشر للواتساب {clientPhone ? `(${clientPhone})` : ''}</span>
              </button>
            </div>
          </div>

          {/* Public Services Tips */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-400">
              <HelpCircle className="h-4 w-4" />
              <span>تعليمات وضوابط مكتب الخدمات العامة:</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
              <li>
                <strong>فصل الرسوم:</strong> يتم تبيان الرسوم الحكومية المستقلة عن أتعاب المكتب لضمان الشفافية والمصداقية مع العميل.
              </li>
              <li>
                <strong>المقابل المالي:</strong> رخص العمل في قوى تدفع وفق الفترات النظامية (3، 6، 9، 12 شهر) مع إعفاء المنشآت الصغيرة المستوفية لتفرغ المالك.
              </li>
              <li>
                <strong>ضريبة القيمة المضافة:</strong> تُحسب ضريبة 15% على أتعاب وسعي المكتب فقط للمنشآت المسجلة في ZATCA.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODALS                                                              */}
      {/* ========================================================================= */}

      {/* 1. Quote Official Preview Modal */}
      {isPreviewOpen && currentQuoteForPreview && (
        <QuotePreviewModal
          quote={currentQuoteForPreview}
          officeName={officeName}
          onClose={() => setIsPreviewOpen(false)}
          onSaveQuote={handleSaveQuoteToHistory}
        />
      )}

      {/* 2. Admin Price Management Modal */}
      {isPriceManageOpen && (
        <PriceManagementModal
          services={services}
          onUpdateServices={setServices}
          onResetToDefaults={() => setServices(DEFAULT_VERIFIED_SERVICES)}
          onClose={() => setIsPriceManageOpen(false)}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* 3. Quotes History Modal */}
      {isHistoryOpen && (
        <QuotesHistoryModal
          quotes={quotesHistory}
          onSelectQuote={(q) => {
            setCurrentQuoteForPreview(q);
            setIsHistoryOpen(false);
            setIsPreviewOpen(true);
          }}
          onUpdateQuoteStatus={handleUpdateQuoteStatus}
          onDeleteQuote={handleDeleteQuote}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}
