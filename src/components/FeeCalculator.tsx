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
  Phone,
  Plane,
  Home,
  Car,
  Store,
  Users2,
  ArrowRight,
  Send,
  Download,
  Copy,
  Receipt
} from 'lucide-react';

interface FeeCalculatorProps {
  defaultOfficeFee?: number;
  officeName?: string;
  isLoggedIn?: boolean;
  workspaceId?: string;
  onConvertToTask?: (task: any) => void;
}

type CalculatorTab = 
  | 'commercial' 
  | 'sponsorship' 
  | 'iqama' 
  | 'work_permit' 
  | 'dependents' 
  | 'visas' 
  | 'domestic' 
  | 'traffic' 
  | 'balady' 
  | 'single' 
  | 'custom';

export default function FeeCalculator({ 
  defaultOfficeFee = 150, 
  officeName = 'مكتب الخدمات العامة الموحد',
  isLoggedIn = false,
  workspaceId = 'ws-main',
  onConvertToTask
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

  // Scoped quotes history for strict workspace isolation (new accounts start at 0)
  const scopedQuotesHistory = workspaceId === 'ws-main'
    ? quotesHistory.filter(q => !q.workspaceId || q.workspaceId === 'ws-main')
    : quotesHistory.filter(q => q.workspaceId === workspaceId);

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
  // 5. Dependents & Family Levy (المقابل المالي للمرافقين والتابعين) State
  // =========================================================================
  const [depCount, setDepCount] = useState<number>(2);
  const [depMonths, setDepMonths] = useState<number>(12); // 1-24 months (400 SAR/month/dependent)
  const [depIncludeSponsorIqama, setDepIncludeSponsorIqama] = useState<boolean>(true); // 650 SAR
  const [depOfficeFee, setDepOfficeFee] = useState<number>(defaultOfficeFee || 150);

  // =========================================================================
  // 6. Visas (تأشيرات الخروج والعودة والزيارة والخروج النهائي) State
  // =========================================================================
  const [visaType, setVisaType] = useState<'exit_single' | 'exit_multi' | 'final_exit' | 'visit_ext'>('exit_single');
  const [visaWorkerCount, setVisaWorkerCount] = useState<number>(1);
  const [visaSingleMonths, setVisaSingleMonths] = useState<number>(2); // 2 months base 200, +100/month after
  const [visaMultiMonths, setVisaMultiMonths] = useState<number>(3); // 3 months base 500, +200/month after
  const [visaVisitDurationMonths, setVisaVisitDurationMonths] = useState<number>(1); // 1-6 months (100 SAR/month)
  const [visaIncludeInsurance, setVisaIncludeInsurance] = useState<boolean>(true);
  const [visaInsuranceFee, setVisaInsuranceFee] = useState<number>(85);
  const [visaOfficeFee, setVisaOfficeFee] = useState<number>(defaultOfficeFee || 100);

  // =========================================================================
  // 7. Domestic Workers & Musaned (العمالة المنزلية ومنصة مساند) State
  // =========================================================================
  const [domesticService, setDomesticService] = useState<'recruitment_visa' | 'transfer' | 'renewal'>('recruitment_visa');
  const [domesticWorkerCount, setDomesticWorkerCount] = useState<number>(1);
  const [domesticTransferTimes, setDomesticTransferTimes] = useState<number>(1); // 1st (2000), 2nd (4000), 3rd+ (6000)
  const [domesticIncludeInsurance, setDomesticIncludeInsurance] = useState<boolean>(true);
  const [domesticInsuranceFee, setDomesticInsuranceFee] = useState<number>(450);
  const [domesticLatePenalty, setDomesticLatePenalty] = useState<boolean>(false); // 500 SAR if late
  const [domesticOfficeFee, setDomesticOfficeFee] = useState<number>(defaultOfficeFee || 200);

  // =========================================================================
  // 8. Traffic & Vehicles (المرور ورخص السير ونقل الملكية) State
  // =========================================================================
  const [trafficService, setTrafficService] = useState<'vehicle_renewal' | 'ownership_transfer' | 'license_renewal' | 'lost_damaged'>('vehicle_renewal');
  const [vehicleType, setVehicleType] = useState<'private' | 'pickup' | 'heavy' | 'motorcycle'>('private');
  const [vehicleLateYears, setVehicleLateYears] = useState<number>(0); // 100 SAR/year penalty
  const [trafficIncludeInspection, setTrafficIncludeInspection] = useState<boolean>(false);
  const [trafficInspectionFee, setTrafficInspectionFee] = useState<number>(115);
  const [licenseDuration, setLicenseDuration] = useState<number>(10); // 2 (80), 5 (200), 10 (400)
  const [licenseIncludeMedical, setLicenseIncludeMedical] = useState<boolean>(true);
  const [licenseMedicalFee, setLicenseMedicalFee] = useState<number>(100);
  const [trafficOfficeFee, setTrafficOfficeFee] = useState<number>(defaultOfficeFee || 150);

  // =========================================================================
  // 9. Balady & Commercial Municipal Licenses (رخص البلدية وإشغال المتاجر واللوحات) State
  // =========================================================================
  const [baladyArea, setBaladyArea] = useState<number>(50); // m²
  const [baladyRatePerMeter, setBaladyRatePerMeter] = useState<number>(10); // 10 SAR/m²/year
  const [baladyYears, setBaladyYears] = useState<number>(1); // 1-5 years
  const [baladySignboardType, setBaladySignboardType] = useState<'illuminated' | 'regular' | 'none'>('illuminated');
  const [baladySignboardArea, setBaladySignboardArea] = useState<number>(4); // m² (200 SAR/m² illuminated, 100 regular)
  const [baladyWorkersCount, setBaladyWorkersCount] = useState<number>(2);
  const [baladyIncludeHealthCert, setBaladyIncludeHealthCert] = useState<boolean>(true); // 60 SAR per worker
  const [baladyIncludeCivilDefense, setBaladyIncludeCivilDefense] = useState<boolean>(true); // 150 SAR (Salamah)
  const [baladyIncludeWasteFee, setBaladyIncludeWasteFee] = useState<boolean>(true); // 250 SAR/year
  const [baladyOfficeFee, setBaladyOfficeFee] = useState<number>(defaultOfficeFee || 350);

  // Conversion feedback
  const [convertedTaskSuccess, setConvertedTaskSuccess] = useState<boolean>(false);

  // =========================================================================
  // 10. Single Fast Services Catalog State
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

    // 5. DEPENDENTS & FAMILY LEVY
    else if (activeTab === 'dependents') {
      serviceTitle = `المقابل المالي للمرافقين والتابعين (${depCount} مرافقين - ${depMonths} شهراً)`;
      const totalLevy = depCount * depMonths * 400;

      items.push({
        id: 'dep-levy',
        name: `المقابل المالي للتابعين والمرافقين (${depCount} أفراد × ${depMonths} شهر × 400 ريال)`,
        entity: 'المديرية العامة للجوازات / وزارة المالية',
        quantity: depCount,
        unitGovernmentFee: depMonths * 400,
        totalGovernmentFee: totalLevy,
        unitOfficeFee: depOfficeFee,
        totalOfficeFee: depOfficeFee,
        discount: 0,
        notes: 'الاستحقاق الشهري النظامي 400 ريال لكل مرافق أو تابع'
      });

      if (depIncludeSponsorIqama) {
        items.push({
          id: 'dep-sponsor-iqama',
          name: 'تجديد إقامة الكفيل / المستضيف رب الأسرة (سنة)',
          entity: 'المديرية العامة للجوازات',
          quantity: 1,
          unitGovernmentFee: 650,
          totalGovernmentFee: 650,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }
    }

    // 6. VISAS (EXIT/RE-ENTRY, FINAL EXIT, VISIT EXTENSION)
    else if (activeTab === 'visas') {
      if (visaType === 'exit_single') {
        const extraMonths = Math.max(0, visaSingleMonths - 2);
        const feePerPerson = 200 + extraMonths * 100;
        serviceTitle = `تأشيرة خروج وعودة مفردة (${visaWorkerCount} عمال - مدة ${visaSingleMonths} شهر)`;

        items.push({
          id: 'visa-single',
          name: `رسوم خروج وعودة مفردة (${visaSingleMonths} شهر: 200 ريال لأول شهرين + ${extraMonths * 100} ريال إضافية)`,
          entity: 'المديرية العامة للجوازات',
          quantity: visaWorkerCount,
          unitGovernmentFee: feePerPerson,
          totalGovernmentFee: feePerPerson * visaWorkerCount,
          unitOfficeFee: visaOfficeFee,
          totalOfficeFee: visaOfficeFee * visaWorkerCount,
          discount: 0
        });
      } else if (visaType === 'exit_multi') {
        const extraMonths = Math.max(0, visaMultiMonths - 3);
        const feePerPerson = 500 + extraMonths * 200;
        serviceTitle = `تأشيرة خروج وعودة متعددة (${visaWorkerCount} عمال - مدة ${visaMultiMonths} شهر)`;

        items.push({
          id: 'visa-multi',
          name: `رسوم خروج وعودة متعددة (${visaMultiMonths} شهر: 500 ريال لأول 3 أشهر + ${extraMonths * 200} ريال إضافية)`,
          entity: 'المديرية العامة للجوازات',
          quantity: visaWorkerCount,
          unitGovernmentFee: feePerPerson,
          totalGovernmentFee: feePerPerson * visaWorkerCount,
          unitOfficeFee: visaOfficeFee,
          totalOfficeFee: visaOfficeFee * visaWorkerCount,
          discount: 0
        });
      } else if (visaType === 'final_exit') {
        serviceTitle = `تأشيرة خروج نهائي (${visaWorkerCount} عمال)`;

        items.push({
          id: 'visa-final',
          name: 'إصدار تأشيرة خروج نهائي (مجانية نظامياً مع سريان الإقامة)',
          entity: 'المديرية العامة للجوازات',
          quantity: visaWorkerCount,
          unitGovernmentFee: 0,
          totalGovernmentFee: 0,
          unitOfficeFee: visaOfficeFee,
          totalOfficeFee: visaOfficeFee * visaWorkerCount,
          discount: 0,
          notes: 'يشترط سريان الإقامة وخلو السجل من المخالفات المرورية'
        });
      } else {
        // visit extension
        const govFeePerPerson = visaVisitDurationMonths * 100;
        serviceTitle = `تمديد تأشيرة زيارة عائلية/تجارية (${visaWorkerCount} أفراد - مدة ${visaVisitDurationMonths} شهر)`;

        items.push({
          id: 'visa-visit-ext',
          name: `رسوم الجوازات لتمديد الزيارة (${visaVisitDurationMonths} شهر × 100 ريال)`,
          entity: 'المديرية العامة للجوازات',
          quantity: visaWorkerCount,
          unitGovernmentFee: govFeePerPerson,
          totalGovernmentFee: govFeePerPerson * visaWorkerCount,
          unitOfficeFee: visaOfficeFee,
          totalOfficeFee: visaOfficeFee * visaWorkerCount,
          discount: 0
        });

        if (visaIncludeInsurance) {
          items.push({
            id: 'visa-visit-ins',
            name: `وثيقة تأمين تمديد الزيارة المعتمدة (مجلس الضمان الصحي)`,
            entity: 'شركات التأمين الصحي المعتمدة',
            quantity: visaWorkerCount,
            unitGovernmentFee: visaInsuranceFee,
            totalGovernmentFee: visaInsuranceFee * visaWorkerCount,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      }
    }

    // 7. DOMESTIC WORKERS & MUSANED
    else if (activeTab === 'domestic') {
      if (domesticService === 'recruitment_visa') {
        serviceTitle = `إصدار تأشيرة استقدام عمالة منزلية مساند (${domesticWorkerCount} تأشيرة)`;

        items.push({
          id: 'dom-jawazat-visa',
          name: 'رسوم التأشيرة الحكومية (الجوازات)',
          entity: 'وزارة الخارجية / الجوازات',
          quantity: domesticWorkerCount,
          unitGovernmentFee: 2000,
          totalGovernmentFee: 2000 * domesticWorkerCount,
          unitOfficeFee: domesticOfficeFee,
          totalOfficeFee: domesticOfficeFee * domesticWorkerCount,
          discount: 0
        });

        items.push({
          id: 'dom-musaned-fee',
          name: 'رسوم خدمة منصة مساند الحكومية',
          entity: 'منصة مساند (وزارة الموارد البشرية)',
          quantity: domesticWorkerCount,
          unitGovernmentFee: 172.5,
          totalGovernmentFee: 172.5 * domesticWorkerCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });

        if (domesticIncludeInsurance) {
          items.push({
            id: 'dom-insurance',
            name: 'وثيقة التأمين الإلزامي على عقود العمالة المنزلية (سنتين)',
            entity: 'شركات التأمين المعتمدة عبر مساند',
            quantity: domesticWorkerCount,
            unitGovernmentFee: domesticInsuranceFee,
            totalGovernmentFee: domesticInsuranceFee * domesticWorkerCount,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      } else if (domesticService === 'transfer') {
        const transferGov = domesticTransferTimes === 1 ? 2000 : domesticTransferTimes === 2 ? 4000 : 6000;
        serviceTitle = `نقل كفالة عمالة منزلية (${domesticWorkerCount} أفراد - المرة ${domesticTransferTimes === 1 ? 'الأولى' : domesticTransferTimes === 2 ? 'الثانية' : 'الثالثة فأكثر'})`;

        items.push({
          id: 'dom-transfer',
          name: `رسوم نقل خدمات عامل منزلي (المرة ${domesticTransferTimes === 1 ? 'الأولى' : domesticTransferTimes === 2 ? 'الثانية' : 'الثالثة فأكثر'})`,
          entity: 'المديرية العامة للجوازات',
          quantity: domesticWorkerCount,
          unitGovernmentFee: transferGov,
          totalGovernmentFee: transferGov * domesticWorkerCount,
          unitOfficeFee: domesticOfficeFee,
          totalOfficeFee: domesticOfficeFee * domesticWorkerCount,
          discount: 0
        });
      } else {
        // renewal
        serviceTitle = `تجديد إقامة عمالة منزلية (${domesticWorkerCount} أفراد)`;

        items.push({
          id: 'dom-renew',
          name: 'رسوم تجديد إقامة عمالة منزلية سنوية (الجوازات)',
          entity: 'المديرية العامة للجوازات',
          quantity: domesticWorkerCount,
          unitGovernmentFee: 600,
          totalGovernmentFee: 600 * domesticWorkerCount,
          unitOfficeFee: domesticOfficeFee,
          totalOfficeFee: domesticOfficeFee * domesticWorkerCount,
          discount: 0
        });

        if (domesticLatePenalty) {
          items.push({
            id: 'dom-penalty',
            name: 'غرامة تأخير تجديد الإقامة المنتهية (500 ريال)',
            entity: 'المديرية العامة للجوازات',
            quantity: domesticWorkerCount,
            unitGovernmentFee: 500,
            totalGovernmentFee: 500 * domesticWorkerCount,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      }
    }

    // 8. TRAFFIC & VEHICLE REGISTRATIONS
    else if (activeTab === 'traffic') {
      if (trafficService === 'vehicle_renewal') {
        const typeLabel = vehicleType === 'private' ? 'خصوصي' : vehicleType === 'pickup' ? 'نقل خاص' : vehicleType === 'heavy' ? 'نقل عام' : 'دراجة نارية';
        const fee3Years = vehicleType === 'private' ? 300 : vehicleType === 'pickup' ? 600 : vehicleType === 'heavy' ? 1200 : 300;
        serviceTitle = `تجديد رخصة سير مركبة (${typeLabel}) - 3 سنوات`;

        items.push({
          id: 'trf-renewal',
          name: `رسوم تجديد استمارة السير (${typeLabel} لمدة 3 سنوات)`,
          entity: 'الإدارة العامة للمرور',
          quantity: 1,
          unitGovernmentFee: fee3Years,
          totalGovernmentFee: fee3Years,
          unitOfficeFee: trafficOfficeFee,
          totalOfficeFee: trafficOfficeFee,
          discount: 0
        });

        if (vehicleLateYears > 0) {
          items.push({
            id: 'trf-late',
            name: `غرامة تطويف / تأخير تجديد الاستمارة (${vehicleLateYears} ${vehicleLateYears === 1 ? 'سنة' : 'سنوات'} × 100 ريال)`,
            entity: 'الإدارة العامة للمرور',
            quantity: vehicleLateYears,
            unitGovernmentFee: 100,
            totalGovernmentFee: vehicleLateYears * 100,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }

        if (trafficIncludeInspection) {
          items.push({
            id: 'trf-mvpi',
            name: 'رسوم الفحص الفني الدوري الشامل (MVPI)',
            entity: 'مراكز الفحص الفني الدوري',
            quantity: 1,
            unitGovernmentFee: trafficInspectionFee,
            totalGovernmentFee: trafficInspectionFee,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      } else if (trafficService === 'ownership_transfer') {
        const typeLabel = vehicleType === 'private' ? 'خصوصي' : 'نقل خاص';
        const trfFee = vehicleType === 'private' ? 150 : 300;
        serviceTitle = `نقل ملكية مركبة ومبايعة (${typeLabel})`;

        items.push({
          id: 'trf-own-gov',
          name: `رسوم المرور لنقل ملكية المركبة (${typeLabel})`,
          entity: 'الإدارة العامة للمرور',
          quantity: 1,
          unitGovernmentFee: trfFee,
          totalGovernmentFee: trfFee,
          unitOfficeFee: trafficOfficeFee,
          totalOfficeFee: trafficOfficeFee,
          discount: 0
        });

        items.push({
          id: 'trf-absher-tamm',
          name: 'رسوم خدمة مبايعة المركبات عبر منصة أبشر / تم المعتمدة',
          entity: 'منصة أبشر / تم (علم)',
          quantity: 1,
          unitGovernmentFee: 230,
          totalGovernmentFee: 230,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });

        if (trafficIncludeInspection) {
          items.push({
            id: 'trf-own-mvpi',
            name: 'رسوم الفحص الدوري لسلامة المركبة',
            entity: 'مراكز الفحص الفني الدوري',
            quantity: 1,
            unitGovernmentFee: trafficInspectionFee,
            totalGovernmentFee: trafficInspectionFee,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      } else if (trafficService === 'license_renewal') {
        const licCost = licenseDuration === 2 ? 80 : licenseDuration === 5 ? 200 : 400;
        serviceTitle = `تجديد رخصة القيادة (${licenseDuration} سنوات)`;

        items.push({
          id: 'trf-lic-gov',
          name: `رسوم المرور لتجديد رخصة القيادة (${licenseDuration} سنوات)`,
          entity: 'الإدارة العامة للمرور',
          quantity: 1,
          unitGovernmentFee: licCost,
          totalGovernmentFee: licCost,
          unitOfficeFee: trafficOfficeFee,
          totalOfficeFee: trafficOfficeFee,
          discount: 0
        });

        if (licenseIncludeMedical) {
          items.push({
            id: 'trf-lic-med',
            name: 'تقرير الفحص الطبي الإلكتروني (إفادة / أبشر)',
            entity: 'المراكز والمستوصفات الطبية المعتمدة',
            quantity: 1,
            unitGovernmentFee: licenseMedicalFee,
            totalGovernmentFee: licenseMedicalFee,
            unitOfficeFee: 0,
            totalOfficeFee: 0,
            discount: 0
          });
        }
      } else {
        // Lost/Damaged
        serviceTitle = 'إصدار بدل فاقد / تالف لرخصة القيادة أو السير';

        items.push({
          id: 'trf-lost',
          name: 'رسوم المرور لإصدار بدل فاقد / تالف',
          entity: 'الإدارة العامة للمرور',
          quantity: 1,
          unitGovernmentFee: 100,
          totalGovernmentFee: 100,
          unitOfficeFee: trafficOfficeFee,
          totalOfficeFee: trafficOfficeFee,
          discount: 0
        });
      }
    }

    // 9. BALADY & MUNICIPAL COMMERCIAL LICENSES
    else if (activeTab === 'balady') {
      serviceTitle = `إصدار وتجديد رخصة بلدية فورية (${baladyArea}م² - ${baladyYears} ${baladyYears === 1 ? 'سنة' : 'سنوات'})`;
      const storeAreaFee = Math.round(baladyArea * baladyRatePerMeter * baladyYears);

      items.push({
        id: 'bld-area',
        name: `رسوم إشغال مساحة المتجر (${baladyArea} م² × ${baladyRatePerMeter} ريال/م² × ${baladyYears} سنة)`,
        entity: 'وزارة البلديات والإسكان (منصة بلدي)',
        quantity: 1,
        unitGovernmentFee: storeAreaFee,
        totalGovernmentFee: storeAreaFee,
        unitOfficeFee: baladyOfficeFee,
        totalOfficeFee: baladyOfficeFee,
        discount: 0
      });

      if (baladySignboardType !== 'none' && baladySignboardArea > 0) {
        const signRate = baladySignboardType === 'illuminated' ? 200 : 100;
        const signTotal = Math.round(baladySignboardArea * signRate * baladyYears);
        items.push({
          id: 'bld-sign',
          name: `رسوم اللوحة الإعلانية (${baladySignboardType === 'illuminated' ? 'مضيئة' : 'غير مضيئة'} بمساحة ${baladySignboardArea} م² × ${signRate} ريال)`,
          entity: 'أمانة المنطقة / منصة بلدي',
          quantity: 1,
          unitGovernmentFee: signTotal,
          totalGovernmentFee: signTotal,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (baladyIncludeWasteFee) {
        items.push({
          id: 'bld-waste',
          name: `رسوم جمع ونقل النفايات البلدية (${baladyYears} سنة)`,
          entity: 'الأمانة والبلدية التابعة',
          quantity: 1,
          unitGovernmentFee: 250 * baladyYears,
          totalGovernmentFee: 250 * baladyYears,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (baladyIncludeCivilDefense) {
        items.push({
          id: 'bld-salamah',
          name: 'تقرير وشهادة سلامة الدفاع المدني الفورية',
          entity: 'المديرية العامة للدفاع المدني (سلامة)',
          quantity: 1,
          unitGovernmentFee: 150,
          totalGovernmentFee: 150,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }

      if (baladyIncludeHealthCert && baladyWorkersCount > 0) {
        items.push({
          id: 'bld-health',
          name: `إصدار الشهادات الصحية للعاملين (${baladyWorkersCount} عمال × 60 ريال)`,
          entity: 'منصة بلدي - الشهادات الصحية',
          quantity: baladyWorkersCount,
          unitGovernmentFee: 60,
          totalGovernmentFee: 60 * baladyWorkersCount,
          unitOfficeFee: 0,
          totalOfficeFee: 0,
          discount: 0
        });
      }
    }

    // 10. SINGLE FAST SERVICE
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
              <span>سجل العمليات ({scopedQuotesHistory.length})</span>
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
            onClick={() => setActiveTab('dependents')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'dependents'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users2 className="h-4 w-4" />
            <span>👨‍👩‍👧‍👦 رسوم التابعين والمرافقين</span>
          </button>

          <button
            onClick={() => setActiveTab('visas')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'visas'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>✈️ تأشيرات خروج وزيارة</span>
          </button>

          <button
            onClick={() => setActiveTab('domestic')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'domestic'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>🏠 العمالة المنزلية (مساند)</span>
          </button>

          <button
            onClick={() => setActiveTab('traffic')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'traffic'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="h-4 w-4" />
            <span>🚗 المرور ورخص السير</span>
          </button>

          <button
            onClick={() => setActiveTab('balady')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-black transition shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'balady'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>🏪 رخص بلدي واللوحات</span>
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

          {/* TAB: DEPENDENTS & FAMILY LEVY */}
          {activeTab === 'dependents' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-amber-500" />
                  <span>حاسبة المقابل المالي للتابعين والمرافقين (الجوازات)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب المقابل المالي للمرافقين والتابعين (400 ريال شهرياً لكل مرافق) ومتبقي سريان الإقامة
                </p>
              </div>

              {/* Dependents Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. عدد التابعين والمرافقين:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDepCount(num)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        depCount === num
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {num} {num === 1 ? 'مرافق' : 'مرافقين'}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 mr-auto">
                    <span className="text-xs text-slate-400">تخصيص:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={depCount}
                      onChange={(e) => setDepCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-xs bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1.5 text-center font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Months Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. عدد الأشهر المستحقة (حتى نهاية الإقامة أو التجديد):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { m: 3, label: '3 أشهر (ربع سنوي)' },
                    { m: 6, label: '6 أشهر (نصف سنوي)' },
                    { m: 9, label: '9 أشهر' },
                    { m: 12, label: '12 شهر (سنة كاملة)' },
                    { m: 24, label: '24 شهر (سنتين)' }
                  ].map((item) => (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setDepMonths(item.m)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                        depMonths === item.m
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{(item.m * 400).toLocaleString()} ريال/فرد</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">أو حدد عدد أشهر دقيق:</span>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={depMonths}
                    onChange={(e) => setDepMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-xs bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-center font-mono font-bold text-amber-600 dark:text-amber-400 outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-slate-400">شهر استحقاق</span>
                </div>
              </div>

              {/* Formula Preview Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-amber-900 dark:text-amber-200">
                  <span className="font-bold">معادلة الحساب النظامية: </span>
                  <span className="font-mono">{depCount} مرافقين × {depMonths} شهر × 400 ريال شهرياً</span>
                </div>
                <div className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                  = {(depCount * depMonths * 400).toLocaleString()} ريال سعودي
                </div>
              </div>

              {/* Include Sponsor Iqama Renewal */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                    تجديد إقامة الكفيل / المستضيف رب الأسرة
                  </label>
                  <span className="text-[11px] text-slate-400">
                    إضافة رسوم الجوازات السنوية لرب الأسرة (650 ريال)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={depIncludeSponsorIqama}
                  onChange={(e) => setDepIncludeSponsorIqama(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                />
              </div>

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={depOfficeFee}
                    onChange={(e) => setDepOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VISAS (EXIT/RE-ENTRY & VISIT EXTENSION) */}
          {activeTab === 'visas' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Plane className="h-5 w-5 text-amber-500" />
                  <span>تأشيرات الخروج والعودة والنهائي وتمديد الزيارة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب الرسوم الرسمية للتأشيرات وفق المدد المحددة مع التأمين الطبي للزيارات
                </p>
              </div>

              {/* Visa Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. نوع التأشيرة أو المعاملة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisaType('exit_single')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      visaType === 'exit_single'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>خروج وعودة مفردة</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">تبدأ من 200 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">200 ريال لأول شهرين + 100 ريال لكل شهر إضافي</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisaType('exit_multi')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      visaType === 'exit_multi'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>خروج وعودة متعددة</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">تبدأ من 500 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">500 ريال لأول 3 أشهر + 200 ريال لكل شهر إضافي</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisaType('final_exit')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      visaType === 'final_exit'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>تأشيرة خروج نهائي</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">مجانية 0 ريال</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">رسم حكومي مجاني أثناء سريان الإقامة (تحتسب الأتعاب فقط)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisaType('visit_ext')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      visaType === 'visit_ext'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex justify-between">
                      <span>تمديد تأشيرة زيارة عائلية</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">100 ريال / شهر</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">تمديد عبر أبشر أفراد + وثيقة التأمين الطبي الإلزامية</div>
                  </button>
                </div>
              </div>

              {/* Number of Workers / People */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. عدد الأفراد أو العمال:
                </label>
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {[1, 2, 3, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setVisaWorkerCount(count)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                          visaWorkerCount === count
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {count} {count === 1 ? 'عامل' : 'عمال'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={visaWorkerCount}
                    onChange={(e) => setVisaWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-xs bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-center font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Duration Options depending on Visa Type */}
              {visaType === 'exit_single' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    3. مدة تأشيرة الخروج والعودة المفردة:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { m: 1, label: 'شهر واحد (200 ريال)' },
                      { m: 2, label: 'شهرين (200 ريال)' },
                      { m: 3, label: '3 أشهر (300 ريال)' },
                      { m: 6, label: '6 أشهر (600 ريال)' }
                    ].map((item) => (
                      <button
                        key={item.m}
                        type="button"
                        onClick={() => setVisaSingleMonths(item.m)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                          visaSingleMonths === item.m
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visaType === 'exit_multi' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    3. مدة تأشيرة الخروج والعودة المتعددة:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { m: 3, label: '3 أشهر (500 ريال)' },
                      { m: 6, label: '6 أشهر (1,100 ريال)' },
                      { m: 9, label: '9 أشهر (1,700 ريال)' },
                      { m: 12, label: 'سنة كاملة (2,300 ريال)' }
                    ].map((item) => (
                      <button
                        key={item.m}
                        type="button"
                        onClick={() => setVisaMultiMonths(item.m)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                          visaMultiMonths === item.m
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visaType === 'visit_ext' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      3. مدة تمديد الزيارة المطلوبة:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setVisaVisitDurationMonths(m)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                            visaVisitDurationMonths === m
                              ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                              : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div>{m} {m === 1 ? 'شهر واحد' : m === 2 ? 'شهرين' : '3 أشهر'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{m * 100} ريال بالجوازات</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Medical Insurance for Visit */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                        إدراج وثيقة التأمين الطبي لتمديد الزيارة
                      </label>
                      <span className="text-[11px] text-slate-400">
                        إلزامي بالربط الآلي مع مجلس الضمان الصحي
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={visaInsuranceFee}
                        onChange={(e) => setVisaInsuranceFee(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={!visaIncludeInsurance}
                        className="w-20 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-white outline-none disabled:opacity-50"
                      />
                      <input
                        type="checkbox"
                        checked={visaIncludeInsurance}
                        onChange={(e) => setVisaIncludeInsurance(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب لكل تأشيرة / فرد (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={visaOfficeFee}
                    onChange={(e) => setVisaOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOMESTIC WORKERS & MUSANED */}
          {activeTab === 'domestic' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Home className="h-5 w-5 text-amber-500" />
                  <span>العمالة المنزلية ومنصة مساند (للأفراد)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب تكاليف تأشيرات الاستقدام، نقل الكفالة للأفراد، وتجديد إقامات السائقين والخدم
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. نوع خدمة العمالة المنزلية:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDomesticService('recruitment_visa')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      domesticService === 'recruitment_visa'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">إصدار تأشيرة استقدام</div>
                    <div className="text-[11px] text-slate-400 mt-1">2,000 ريال تأشيرة + 172.5 مساند + التأمين</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDomesticService('transfer')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      domesticService === 'transfer'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">نقل كفالة عامل منزلي</div>
                    <div className="text-[11px] text-slate-400 mt-1">نقل خدمات (2000 / 4000 / 6000 ريال)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDomesticService('renewal')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      domesticService === 'renewal'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">تجديد إقامة سنوية</div>
                    <div className="text-[11px] text-slate-400 mt-1">600 ريال بالجوازات (معفى من كرت العمل)</div>
                  </button>
                </div>
              </div>

              {/* Workers Count */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. عدد العمالة المنزلية:
                </label>
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setDomesticWorkerCount(count)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                          domesticWorkerCount === count
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {count} {count === 1 ? 'عامل' : 'عمال'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={domesticWorkerCount}
                    onChange={(e) => setDomesticWorkerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-xs bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-center font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Recruitment Details */}
              {domesticService === 'recruitment_visa' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                        وثيقة التأمين الإلزامي على عقود العمالة المنزلية (سنتين)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        مطلوبة نظامياً لحماية حقوق صاحب العمل والعامل
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="25"
                        value={domesticInsuranceFee}
                        onChange={(e) => setDomesticInsuranceFee(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={!domesticIncludeInsurance}
                        className="w-20 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-white outline-none disabled:opacity-50"
                      />
                      <input
                        type="checkbox"
                        checked={domesticIncludeInsurance}
                        onChange={(e) => setDomesticIncludeInsurance(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Times */}
              {domesticService === 'transfer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    3. عدد مرات نقل الخدمات السابقة للعامل:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { times: 1, fee: 2000, label: 'المرة الأولى (2,000 ريال)' },
                      { times: 2, fee: 4000, label: 'المرة الثانية (4,000 ريال)' },
                      { times: 3, fee: 6000, label: 'المرة الثالثة فأكثر (6,000 ريال)' }
                    ].map((item) => (
                      <button
                        key={item.times}
                        type="button"
                        onClick={() => setDomesticTransferTimes(item.times)}
                        className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                          domesticTransferTimes === item.times
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Renewal Penalty */}
              {domesticService === 'renewal' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                      احتساب غرامة تأخير تجديد الإقامة (500 ريال)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      تُفرض في حال مضي أكثر من 3 أيام على تاريخ انتهاء الإقامة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={domesticLatePenalty}
                    onChange={(e) => setDomesticLatePenalty(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                  />
                </div>
              )}

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب لكل معاملة (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={domesticOfficeFee}
                    onChange={(e) => setDomesticOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRAFFIC & VEHICLE REGISTRATIONS */}
          {activeTab === 'traffic' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Car className="h-5 w-5 text-amber-500" />
                  <span>رسوم المرور ورخص السير ونقل الملكية (أبشر / تم)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب تكاليف تجديد الاستمارات، مبايعة المركبات، رخص القيادة، وفحص النظر والدوري
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. نوع معاملة المرور:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'vehicle_renewal', label: 'تجديد استمارة المركبة' },
                    { id: 'ownership_transfer', label: 'نقل ملكية مركبة' },
                    { id: 'license_renewal', label: 'تجديد رخصة القيادة' },
                    { id: 'lost_damaged', label: 'بدل فاقد / تالف' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTrafficService(s.id as any)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                        trafficService === s.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type (if renewal or transfer) */}
              {(trafficService === 'vehicle_renewal' || trafficService === 'ownership_transfer') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    2. نوع المركبة واستخدامها:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'private', label: 'سيارة خصوصي', fee: '300 ريال / 3 سنوات' },
                      { id: 'pickup', label: 'نقل خاص (ونيت/بيك آب)', fee: '600 ريال / 3 سنوات' },
                      { id: 'heavy', label: 'نقل عام / شاحنة', fee: '1,200 ريال / 3 سنوات' },
                      { id: 'motorcycle', label: 'دراجة نارية', fee: '300 ريال / 3 سنوات' }
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleType(v.id as any)}
                        className={`p-2.5 rounded-xl text-right text-xs font-bold transition cursor-pointer border ${
                          vehicleType === v.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div>{v.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{v.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Late Penalty for Registration Renewal */}
              {trafficService === 'vehicle_renewal' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        تطويف الاستمارة (سنوات التأخير المنتهية):
                      </label>
                      <span className="text-[11px] text-slate-400">
                        100 ريال غرامة عن كل سنة تطويف بعد انتهاء المهلة (60 يوماً)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setVehicleLateYears(y)}
                          className={`w-9 h-8 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                            vehicleLateYears === y
                              ? 'bg-rose-500 text-white font-black'
                              : 'bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Periodic Inspection MVPI */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                        إدراج رسوم الفحص الفني الدوري للسيارات (MVPI)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        115 ريال شامل الضريبة لسلامة المركبة
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={trafficIncludeInspection}
                      onChange={(e) => setTrafficIncludeInspection(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Ownership Transfer Specifics */}
              {trafficService === 'ownership_transfer' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    مشتملات مبايعة ونقل الملكية الحكومية:
                  </div>
                  <ul className="text-[11px] text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5">
                    <li>رسوم المرور الرسمية ({vehicleType === 'private' ? '150 ريال للخصوصي' : '300 ريال للنقل الخاص'}).</li>
                    <li>رسوم منصة أبشر / تم الإلكترونية للتحقق ونقل القيد (230 ريال).</li>
                  </ul>
                </div>
              )}

              {/* Driver License Renewal Specifics */}
              {trafficService === 'license_renewal' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      2. مدة سريان رخصة القيادة:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { yrs: 2, fee: 80, label: 'سنتين (80 ريال)' },
                        { yrs: 5, fee: 200, label: '5 سنوات (200 ريال)' },
                        { yrs: 10, fee: 400, label: '10 سنوات (400 ريال)' }
                      ].map((item) => (
                        <button
                          key={item.yrs}
                          type="button"
                          onClick={() => setLicenseDuration(item.yrs)}
                          className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                            licenseDuration === item.yrs
                              ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                              : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                        إدراج فحص النظر والتقرير الطبي (منصة إفادة)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        100 ريال تقديري لدى المراكز الطبية المعتمدة
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={licenseIncludeMedical}
                      onChange={(e) => setLicenseIncludeMedical(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب على المعاملة (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={trafficOfficeFee}
                    onChange={(e) => setTrafficOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BALADY & MUNICIPAL COMMERCIAL LICENSES */}
          {activeTab === 'balady' && (
            <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
              <div className="border-b border-slate-150 dark:border-white/5 pb-3">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-500" />
                  <span>رخص البلدية وإشغال المتاجر واللوحات (منصة بلدي)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  حساب رسوم إشغال المتاجر، اللوحات الإعلانية المضيئة، الدفاع المدني والشهادات الصحية
                </p>
              </div>

              {/* Store Area & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    1. مساحة المحل التجاري (م²):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={baladyArea}
                      onChange={(e) => setBaladyArea(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">م²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    2. مدة سريان رخصة بلدي:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setBaladyYears(yr)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                          baladyYears === yr
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-100 dark:bg-[#152033] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {yr} {yr === 1 ? 'سنة' : 'سنوات'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signboard details */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  3. نوع ومواصفات اللوحة الإعلانية للمحل:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'illuminated', label: 'لوحة مضيئة', fee: '200 ريال / م²' },
                    { id: 'regular', label: 'لوحة غير مضيئة', fee: '100 ريال / م²' },
                    { id: 'none', label: 'بدون لوحة', fee: '0 ريال' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setBaladySignboardType(s.id as any)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                        baladySignboardType === s.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div>{s.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{s.fee}</div>
                    </button>
                  ))}
                </div>

                {baladySignboardType !== 'none' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">مساحة اللوحة الإعلانية:</span>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={baladySignboardArea}
                      onChange={(e) => setBaladySignboardArea(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-20 text-xs bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">متر مربع</span>
                  </div>
                )}
              </div>

              {/* Addons Checkboxes */}
              <div className="space-y-2 pt-1">
                {/* Waste */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                      رسوم جمع ونظافة النفايات البلدية
                    </label>
                    <span className="text-[11px] text-slate-400">
                      250 ريال سنوياً تفرضها الأمانة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={baladyIncludeWasteFee}
                    onChange={(e) => setBaladyIncludeWasteFee(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                  />
                </div>

                {/* Civil Defense Salamah */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                      شهادة سلامة الدفاع المدني الفورية (منصة سلامة)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      150 ريال للأنشطة غير الخطرة والمحلات الصغيرة
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={baladyIncludeCivilDefense}
                    onChange={(e) => setBaladyIncludeCivilDefense(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                  />
                </div>

                {/* Health Certs */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer">
                      الشهادات الصحية للعاملين في الأنشطة الغذائية والمهنية
                    </label>
                    <span className="text-[11px] text-slate-400">
                      60 ريال لكل عامل عبر منصة بلدي
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={baladyWorkersCount}
                      onChange={(e) => setBaladyWorkersCount(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={!baladyIncludeHealthCert}
                      className="w-16 text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-white outline-none disabled:opacity-50"
                    />
                    <input
                      type="checkbox"
                      checked={baladyIncludeHealthCert}
                      onChange={(e) => setBaladyIncludeHealthCert(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 h-5 w-5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Office Fee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أتعاب وإشراف المكتب على رخصة بلدي (SAR):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={baladyOfficeFee}
                    onChange={(e) => setBaladyOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono font-bold transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
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
              {onConvertToTask && (
                <button
                  type="button"
                  onClick={() => {
                    const taskPlatform = 
                      activeTab === 'domestic' ? 'musaned' :
                      activeTab === 'sponsorship' || activeTab === 'work_permit' ? 'qiwa' :
                      activeTab === 'balady' ? 'balady' :
                      activeTab === 'traffic' ? 'absher' :
                      activeTab === 'commercial' ? 'wzara' : 'jawazat';

                    const newTask = {
                      id: `task-${Date.now()}`,
                      title: liveQuote.serviceTitle,
                      clientName: clientName.trim() || 'عميل حاسبة الرسوم',
                      clientPhone: clientPhone.trim() || undefined,
                      platformId: taskPlatform,
                      feeAmount: liveQuote.grandTotal,
                      status: 'pending' as const,
                      createdAt: new Date().toISOString(),
                      notes: `معاملة مُنشأة آلياً من حاسبة الرسوم الحكومية.\n• الرسوم الحكومية: ${liveQuote.totalGovernmentFees.toLocaleString()} ريال\n• أتعاب المكتب: ${liveQuote.totalOfficeFees.toLocaleString()} ريال${liveQuote.vatAmount > 0 ? `\n• الضريبة: ${liveQuote.vatAmount.toLocaleString()} ريال` : ''}${liveQuote.totalDiscount > 0 ? `\n• الخصم: -${liveQuote.totalDiscount.toLocaleString()} ريال` : ''}\n• الإجمالي النهائي: ${liveQuote.grandTotal.toLocaleString()} ريال\n${quoteNotes ? `• ملاحظات: ${quoteNotes}` : ''}`,
                      workspaceId
                    };
                    onConvertToTask(newTask);
                    setConvertedTaskSuccess(true);
                    setTimeout(() => setConvertedTaskSuccess(false), 3000);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    convertedTaskSuccess
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>
                    {convertedTaskSuccess
                      ? '✓ تم تحويل الحسبة إلى معاملة رسمية فوراً!'
                      : 'تحويل الحسبة إلى معاملة رسمية وتتبعها 🚀'}
                  </span>
                </button>
              )}

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
          quotes={scopedQuotesHistory}
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
