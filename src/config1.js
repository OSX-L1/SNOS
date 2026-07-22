export const THEMES = {
    default: { id: 'default', name: 'มาตรฐาน (Sunny Red)', bgApp: 'bg-[#f8fafc]', textMain: 'text-slate-800', textSub: 'text-slate-500', primary: 'text-red-600', icon: 'text-red-500', btnPrimary: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-red-200', btnSecondary: 'bg-white text-slate-700 border-red-100 hover:bg-red-50', bgSoft: 'bg-red-50', border: 'border-red-100', activeTab: 'text-red-600 bg-red-50 shadow-md -translate-y-2', inactiveTab: 'text-gray-400 hover:text-red-500 hover:bg-red-50/50 hover:-translate-y-1', cardBorder: 'border-white hover:border-red-200', inputRing: 'focus:ring-red-100', highlight: 'text-red-600', logoFilter: 'none', toggleActive: 'bg-red-500' },
    apple: { id: 'apple', name: 'Apple Premium (Silver/Bronze)', bgApp: 'bg-[#F5F5F7]', textMain: 'text-[#1D1D1F]', textSub: 'text-[#86868b]', primary: 'text-[#1D1D1F]', icon: 'text-[#86868b]', btnPrimary: 'bg-[#1D1D1F] hover:bg-[#333333] text-white shadow-gray-300', btnSecondary: 'bg-white text-[#1D1D1F] border-gray-200 hover:bg-gray-50', bgSoft: 'bg-[#E5E5EA]', border: 'border-gray-200', activeTab: 'text-[#1D1D1F] bg-white shadow-lg -translate-y-2 ring-1 ring-black/5', inactiveTab: 'text-[#86868b] hover:text-[#1D1D1F] hover:bg-white/50 hover:-translate-y-1', cardBorder: 'border-white/60 hover:border-[#BF9B30]/30', inputRing: 'focus:ring-gray-200', highlight: 'text-[#9A8453]', logoFilter: 'grayscale(20%)', toggleActive: 'bg-[#1D1D1F]' }
};

export const YOUR_FIREBASE_CONFIG = { apiKey: "AIzaSyCsi2LJcpVAiFBXnmc5XgiIt3UlNFeo2lI", authDomain: "sn2026-9e19e.firebaseapp.com", projectId: "sn2026-9e19e", storageBucket: "sn2026-9e19e.firebasestorage.app", messagingSenderId: "45923511775", appId: "1:45923511775:web:04eca2038d60bfa393a86a", measurementId: "G-PZ1GJM6VHC" };

export const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount);
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const DEFAULT_CONFIG = { 
    logoUrl: 'https://img2.pic.in.th/SUNNY-LOGO54c76f9eedf06c96.png', 
    companyName: 'SUNNY BLIND SYSTEM', 
    companyDesc: 'จำหน่ายและติดตั้งผ้าม่าน มู่ลี่ วอลเปเปอร์', 
    companyContact: 'โทร: 02-123-4567', 
    hardwarePrice: 1956, 
    topRailPrice: 200, 
    bottomRailPrice: 150, 
    slingPrice: 138, 
    fabricFactor: 1.2, 
    aluminumWoodPrice: 675,
    alumDiscountStandard1: 60,
    alumDiscountStandard2: 5,
    alumDiscountChain: 60,
    alumDiscountChain2: 0,
    woodenTypes: [
        { id: 'wood_basswood', label: 'BASSWOOD', price: 789 },
        { id: 'wood_fauxwood', label: 'FAUX WOOD', price: 750 }
    ],
    pvcTypes: [
        { id: 'pvc_85_solid', label: 'ใบ 8.5cm แบบทึบ', price: 320 },
        { id: 'pvc_85_japan', label: 'ใบ 8.5cm ญี่ปุ่น', price: 699 },
        { id: 'pvc_10_solid', label: 'ใบ 10cm แบบทึบ', price: 290 },
        { id: 'pvc_10_japan', label: 'ใบ 10cm ญี่ปุ่น', price: 699 },
        { id: 'pvc_euro_la', label: 'ใบ 12.3cm ยูโร LA', price: 730 },
        { id: 'pvc_euro_lb', label: 'ใบ 12.3cm ยูโร LB', price: 730 },
        { id: 'pvc_euro_zigzag', label: 'ใบ 12.3cm ยูโร สลับฟันปลา', price: 730 }
    ],
    customRails: [
        { id: 'rail_hospital', label: 'รางโรงพยาบาล', price: 185, unit: 'เมตร' },
        { id: 'rail_hospital_tape', label: 'รางโรงพยาบาลลอนเทป', price: 260, unit: 'เมตร' },
        { id: 'rail_ceiling_bracket', label: 'แป๊ดยึดเพดาน', price: 110, unit: 'ชุด' },
        { id: 'rail_tes_white_black', label: 'รางลอนเทป TES ขาว/ดำ', price: 185, unit: 'เมตร' },
        { id: 'rail_tes_wood', label: 'รางลอนเทป TES ลายไม้', price: 195, unit: 'เมตร' },
        { id: 'rail_nano', label: 'รางลอนเทป NANO', price: 220, unit: 'เมตร' },
        { id: 'rail_m_manual', label: 'ราง M (มือดึง)', price: 130, unit: 'เมตร' },
        { id: 'rail_m_cord', label: 'ราง M (เชือกดึง)', price: 150, unit: 'เมตร' },
    ],
    showExternal: true, 
    showInternal: true, 
    showWooden: true, 
    showAluminum: true, 
    showPVC: true,
    showRail: true, 
    railPassword: '1988',
    theme: 'default' 
};

export let db = null; 
export let auth = null; 
export let appId = 'sunny-blind-system';

try { 
    let finalConfig = YOUR_FIREBASE_CONFIG; 
    if (typeof window.__firebase_config !== 'undefined' && window.__firebase_config) { 
        try { const envConfig = JSON.parse(window.__firebase_config); if (Object.keys(envConfig).length > 0) finalConfig = envConfig; } catch(e){} 
    } 
    if (typeof window.__app_id !== 'undefined') appId = window.__app_id; 
    if (typeof window.firebase !== 'undefined') { 
        if (!window.firebase.apps.length) window.firebase.initializeApp(finalConfig); 
        auth = window.firebase.auth(); 
        db = window.firebase.firestore(); 
    } 
} catch (e) { console.error(e); }