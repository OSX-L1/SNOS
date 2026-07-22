import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons.jsx';
import { formatCurrency, generateId } from '../config.js';
import { QuotationModal, BulkEditModal } from '../components/Modals.jsx';

export const CalculatorPage = ({ config, items, setItems, user, onLogin, userProfile, theme, aluminumPrices, db, appId }) => {
    const [calcMode, setCalcMode] = useState('external');
    const [alumSystem, setAlumSystem] = useState('standard');
    const [pvcType, setPvcType] = useState(''); 
    const [pvcOpenType, setPvcOpenType] = useState('side_1');
    const [pvcCustomPrice, setPvcCustomPrice] = useState('');
    const [railType, setRailType] = useState('');
    const [showQuote, setShowQuote] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({ width: '', height: '', price: '', qty: '1', side: 'ขวา', woodType: '' });
    const [useInstallFee, setUseInstallFee] = useState(false);
    const [installFee, setInstallFee] = useState('');
    const [useMotorFee, setUseMotorFee] = useState(false);
    const [motorFee, setMotorFee] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showBulkEdit, setShowBulkEdit] = useState(false); 

    const availableModes = useMemo(() => {
        const modes = [];
        if (config.showExternal) modes.push({ id: 'external', label: 'ม่านภายนอก', icon: <Icons.Sun size={24} /> });
        if (config.showInternal) modes.push({ id: 'internal', label: 'ม่านภายใน', icon: <Icons.Roller size={24} /> });
        if (config.showWooden) modes.push({ id: 'wooden', label: 'มู่ลี่ไม้', icon: <Icons.Blinds size={24} /> });
        if (config.showAluminum) modes.push({ id: 'aluminum', label: 'มู่ลี่อลูมิเนียม', icon: <Icons.Blinds size={24} /> });
        if (config.showPVC) modes.push({ id: 'pvc', label: 'ฉากกั้นห้อง PVC', icon: <Icons.Fold size={24} /> }); 
        if (config.showRail) modes.push({ id: 'rail', label: 'รางม่าน', icon: <Icons.Wrench size={24} /> });
        return modes;
    }, [config]);

    useEffect(() => { if (availableModes.length > 0 && !availableModes.find(m => m.id === calcMode)) setCalcMode(availableModes[0].id); }, [availableModes, calcMode]);
    useEffect(() => { if (errorMsg) setErrorMsg(''); }, [formData]);
    
    useEffect(() => {
        if (config.customRails && config.customRails.length > 0 && !railType && !editingId) {
            setRailType(config.customRails[0].id);
        }
        if (config.woodenTypes && config.woodenTypes.length > 0 && (!formData.woodType || !config.woodenTypes.find(w => w.id === formData.woodType)) && !editingId) {
            setFormData(prev => ({ ...prev, woodType: config.woodenTypes[0].id }));
        }
        if (config.pvcTypes && config.pvcTypes.length > 0 && (!pvcType || !config.pvcTypes.find(p => p.id === pvcType)) && !editingId) {
            setPvcType(config.pvcTypes[0].id);
        }
    }, [config.customRails, config.woodenTypes, config.pvcTypes, editingId]);

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const roundToStep = (val) => Math.round(val / 10) * 10;
    const getPvcCalcHeight = (h_m) => { if (h_m < 2.00) return 2.00; if (h_m <= 2.01) return 2.00; if (h_m <= 2.21) return 2.20; if (h_m <= 2.41) return 2.40; if (h_m <= 2.61) return 2.60; if (h_m <= 2.81) return 2.80; if (h_m <= 3.01) return 3.00; if (h_m <= 3.31) return 3.30; if (h_m <= 3.51) return 3.50; if (h_m <= 3.70) return 3.70; return h_m; };
    const getPvcCalcWidth = (w_m) => w_m < 1.00 ? 1.00 : w_m;

    const pvcOptionsWithCustom = [...(config.pvcTypes || []), { id: 'custom', label: 'กำหนดราคาเอง', price: 'manual' }];
    const pvcOpeningOptions = [ { id: 'side_1', label: 'เปิดข้าง 1 จุด' }, { id: 'side_2', label: 'เปิดข้าง 2 จุด' }, { id: 'center', label: 'เปิดกลาง' }, { id: 'center_3', label: 'เปิดกลาง 3 จุด' }, { id: 'center_4', label: 'เปิดกลาง 4 จุด' } ];
    
    const railOptions = config.customRails || [];
    const activeRail = railOptions.find(r => r.id === railType) || railOptions[0];

    const handleEdit = (item) => {
        if (item.rawParams) {
            const p = item.rawParams;
            setCalcMode(p.calcMode);
            setAlumSystem(p.alumSystem || 'standard');
            setPvcType(p.pvcType || (config.pvcTypes?.[0]?.id || ''));
            setPvcOpenType(p.pvcOpenType || 'side_1');
            setPvcCustomPrice(p.pvcCustomPrice || '');
            setRailType(p.railType || (railOptions[0]?.id || ''));
            setFormData(p.formData);
            setUseInstallFee(p.useInstallFee || false);
            setInstallFee(p.installFee || '');
            setUseMotorFee(p.useMotorFee || false);
            setMotorFee(p.motorFee || '');
        } else {
            setCalcMode(item.type);
            setFormData({ width: item.w_cm, height: item.h_cm, price: item.unitPrice, qty: item.qty, side: item.side, woodType: config.woodenTypes?.[0]?.id || '' });
        }
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ width: '', height: '', price: '', qty: '1', side: 'ขวา', woodType: config.woodenTypes?.[0]?.id || '' });
        setUseInstallFee(false); setInstallFee('');
        setUseMotorFee(false); setMotorFee('');
        setPvcCustomPrice('');
    };

    const calculateItem = () => {
        const qty = parseInt(formData.qty);
        if (!qty) return setErrorMsg('กรุณาระบุจำนวน');
        
        let installCost = useInstallFee && installFee ? parseFloat(installFee) || 0 : 0;
        let motorCost = useMotorFee && motorFee ? parseFloat(motorFee) || 0 : 0;
        let extraCost = installCost + motorCost;
        let extraTextArray = [];
        if (installCost > 0) extraTextArray.push(`ติดตั้ง ${formatCurrency(installCost)}`);
        if (motorCost > 0) extraTextArray.push(`มอเตอร์ ${formatCurrency(motorCost)}`);
        let extraText = extraTextArray.length > 0 ? ` + ${extraTextArray.join(' + ')}` : '';
        
        let price = 0; let totalPerUnit = 0; let details = {}; let typeName = "";
        let w_cm = parseFloat(formData.width) || 0;
        let h_cm = parseFloat(formData.height) || 0;

        const openingLabel = pvcOpeningOptions.find(o => o.id === pvcOpenType)?.label || pvcOpenType;

        let actualSide = formData.side;
        if (calcMode === 'pvc') { actualSide = openingLabel; } else if (calcMode === 'rail' && activeRail?.unit !== 'ชุด') { actualSide = (formData.side === 'ซ้าย' || formData.side === 'ขวา') ? 'เปิดข้าง' : formData.side; } else if (calcMode === 'rail' && activeRail?.unit === 'ชุด') { actualSide = '-'; } else { actualSide = (formData.side === 'เปิดข้าง' || formData.side === 'เปิดกลาง') ? 'ขวา' : formData.side; }

        if (calcMode === 'rail') {
            if (!activeRail) return setErrorMsg('ไม่พบข้อมูลรางม่าน กรุณาเพิ่มที่เมนูตั้งค่า');
            price = activeRail.price; typeName = activeRail.label;
            if (activeRail.unit === 'ชุด') {
                totalPerUnit = price + extraCost;
                details = { mainFormula: `${price} บาท x 1 ชุด = ${formatCurrency(price)}${extraText}`, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
            } else {
                if (!w_cm) return setErrorMsg('กรุณากรอกความกว้าง');
                const w_m = w_cm / 100; const pricePerSet = w_m * price; totalPerUnit = pricePerSet + extraCost;
                details = { mainFormula: `${w_m.toFixed(2)}m x ${formatCurrency(price)} = ${formatCurrency(pricePerSet)}${extraText}`, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
            }
        } else if (calcMode === 'pvc') {
            if (!w_cm || !h_cm) return setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
            const selectedPvc = pvcOptionsWithCustom.find(p => p.id === pvcType);
            if (!selectedPvc) return setErrorMsg('กรุณาเลือกประเภทฉาก PVC');
            let unitPrice = selectedPvc.price === 'manual' ? parseFloat(pvcCustomPrice) : selectedPvc.price;
            if (!unitPrice) return setErrorMsg('กรุณากรอกราคาต่อตารางหลา');
            const w_m_input = w_cm / 100; const h_m_input = h_cm / 100;
            const w_calc = getPvcCalcWidth(w_m_input); const h_calc = getPvcCalcHeight(h_m_input);
            const pricePerSet = w_calc * h_calc * 1.2 * unitPrice;
            totalPerUnit = pricePerSet + extraCost; price = unitPrice; typeName = `ฉากกั้นห้อง PVC (${selectedPvc.label}) - ${openingLabel}`;
            let formulaText = `${w_calc.toFixed(2)}m x ${h_calc.toFixed(2)}m x 1.2 x ${formatCurrency(unitPrice)} = ${formatCurrency(pricePerSet)}`;
            if (extraCost > 0) formulaText += `${extraText} = ${formatCurrency(totalPerUnit)}`;
            details = { mainFormula: formulaText, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
        } else if (calcMode === 'aluminum') {
            if (!w_cm || !h_cm) return setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
            if (alumSystem === 'wood_pattern') {
                const w_m = w_cm / 100; const h_m = h_cm / 100; const unitPrice = w_m * h_m * config.aluminumWoodPrice; price = unitPrice; totalPerUnit = unitPrice + extraCost; typeName = 'มู่ลี่อลูมิเนียม (ลายไม้)';
                let formulaText = `${w_m.toFixed(2)}m x ${h_m.toFixed(2)}m x ${config.aluminumWoodPrice} = ${formatCurrency(unitPrice)}`;
                if (extraCost > 0) formulaText += `${extraText} = ${formatCurrency(totalPerUnit)}`;
                details = { mainFormula: formulaText, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
            } else {
                if (!aluminumPrices || !aluminumPrices.table) return setErrorMsg('ไม่พบข้อมูลราคา (กรุณาอัปโหลดไฟล์ CSV)');
                const roundedW = roundToStep(w_cm); const roundedH = roundToStep(h_cm);
                let basePrice = aluminumPrices.table[roundedH]?.[roundedW] || 0;
                if (!basePrice) return setErrorMsg(`ไม่พบราคาสำหรับขนาด ${roundedW}x${roundedH} (ปัดเศษแล้ว)`);
                const dStd1 = config.alumDiscountStandard1 !== undefined ? config.alumDiscountStandard1 : 60; const dStd2 = config.alumDiscountStandard2 !== undefined ? config.alumDiscountStandard2 : 5; const dChain1 = config.alumDiscountChain !== undefined ? config.alumDiscountChain : 60; const dChain2 = config.alumDiscountChain2 !== undefined ? config.alumDiscountChain2 : 0;
                const multStd = (1 - (dStd1 / 100)) * (1 - (dStd2 / 100)); const multChain = (1 - (dChain1 / 100)) * (1 - (dChain2 / 100));
                let netPrice = alumSystem === 'standard' ? (basePrice * multStd) : (basePrice * multChain);
                let discountInfo = alumSystem === 'standard' ? `ลด ${dStd1}% + ${dStd2}%` : (dChain2 > 0 ? `ลด ${dChain1}% + ${dChain2}%` : `ลด ${dChain1}%`);
                typeName = `มู่ลี่อลูมิเนียม (${alumSystem === 'standard' ? 'ระบบธรรมดา' : 'ระบบโซ่วน'})`; price = netPrice; totalPerUnit = netPrice + extraCost; 
                let mainFormulaText = `ขนาด ${w_cm}x${h_cm} => ปัดเป็น ${roundedW}x${roundedH} = ${formatCurrency(basePrice)}`;
                if (extraCost > 0) mainFormulaText += ` (สุทธิ ${formatCurrency(netPrice)}${extraText})`;
                details = { mainFormula: mainFormulaText, sumFormula: `ราคาตาราง ${formatCurrency(basePrice)} (${discountInfo}) = ${formatCurrency(netPrice)} ${extraText} = ${formatCurrency(totalPerUnit)}` };
            }
        } else {
            if (!w_cm || !h_cm) return setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
            const w_m = w_cm / 100; const h_m = h_cm / 100;
            let pricing_w_m = w_m; let pricing_h_m = h_m; let formulaExtra = ""; let finalArea = 0;
            const baseFactor = calcMode === 'wooden' ? 1.2 : config.fabricFactor;
            if (calcMode === 'wooden') {
                 const selectedWood = config.woodenTypes?.find(w => w.id === formData.woodType) || config.woodenTypes?.[0];
                 if(!selectedWood) return setErrorMsg('ไม่พบข้อมูลชนิดไม้ กรุณาเพิ่มในตั้งค่าระบบ');
                 price = selectedWood.price;
                 if (w_cm < 80) { pricing_w_m = 0.80; formulaExtra += " (ขั้นต่ำ ก. 0.80)"; }
                 if (h_cm < 100) { pricing_h_m = 1.00; formulaExtra += " (ขั้นต่ำ ส. 1.00)"; }
                 finalArea = pricing_w_m * pricing_h_m * baseFactor; typeName = `มู่ลี่ไม้ (${selectedWood.label})`;
            } else {
                 price = parseFloat(formData.price);
                 let calculatedArea = w_m * h_m * baseFactor;
                 if (calculatedArea < 1.2) { finalArea = 1.2; formulaExtra += " (ขั้นต่ำ 1.20 ตร.ล.)"; } else { finalArea = calculatedArea; }
            }
            if (!price) return setErrorMsg('กรุณากรอกราคา');
            const fabricCostPerUnit = finalArea * price; 
            if (calcMode === 'wooden') { details = { mainFormula: `${pricing_w_m.toFixed(2)} * ${pricing_h_m.toFixed(2)} * ${baseFactor} * ${price} = ${fabricCostPerUnit.toFixed(2)}${formulaExtra}` }; } else { details = { mainFormula: `${w_m.toFixed(2)}m * ${h_m.toFixed(2)}m * ${baseFactor} = ${finalArea.toFixed(3)} ตร.ล. * ${price} = ${fabricCostPerUnit.toFixed(2)}${formulaExtra}` }; }
            
            if (calcMode === 'external') {
                const hw = config.hardwarePrice; const top = config.topRailPrice * w_m; const bot = config.bottomRailPrice * w_m; const sling = config.slingPrice * h_m;
                totalPerUnit = fabricCostPerUnit + hw + top + bot + sling + extraCost;
                let sumFormulaText = `${fabricCostPerUnit.toFixed(1)} + ${hw} + ${top.toFixed(0)} + ${bot.toFixed(0)} + ${sling.toFixed(1)}`;
                if (extraCost > 0) sumFormulaText += extraText; sumFormulaText += ` = ${totalPerUnit.toFixed(1)}`;
                details = { fabricFormula: details.mainFormula, topRailFormula: `${config.topRailPrice} * ${w_m.toFixed(2)} = ${top.toFixed(2)}`, bottomRailFormula: `${config.bottomRailPrice} * ${w_m.toFixed(2)} = ${bot.toFixed(2)}`, slingFormula: `${config.slingPrice} * ${h_m.toFixed(2)} = ${sling.toFixed(2)}`, hardwarePrice: hw, sumFormula: sumFormulaText };
                typeName = 'ม่านม้วนภายนอก';
            } else if (calcMode === 'internal') { typeName = 'ม่านม้วนภายใน'; totalPerUnit = fabricCostPerUnit + extraCost; if (extraCost > 0) details.mainFormula += `${extraText} = ${formatCurrency(totalPerUnit)}`; } else { totalPerUnit = fabricCostPerUnit + extraCost; if (extraCost > 0) details.mainFormula += `${extraText} = ${formatCurrency(totalPerUnit)}`; }
        }

        const rawParams = { calcMode, alumSystem, pvcType, pvcOpenType, pvcCustomPrice, railType, formData: { ...formData }, useInstallFee, installFee, useMotorFee, motorFee };
        const newItem = { id: editingId || generateId(), w_cm, h_cm, w_m: w_cm/100, h_m: h_cm/100, unitPrice: price, qty, side: formData.side, displaySide: actualSide, type: calcMode, typeName, totalPerUnit, grandTotal: totalPerUnit * qty, details, rawParams, installCost, motorCost };

        if (editingId) { setItems(items.map(item => item.id === editingId ? newItem : item)); setEditingId(null); } else { setItems([...items, newItem]); }
        setFormData(prev => ({ ...prev, width: '', height: '' }));
        setUseInstallFee(false); setInstallFee(''); setUseMotorFee(false); setMotorFee('');
        if(calcMode === 'pvc') setPvcCustomPrice('');
    };

    const recalculateItemWithPrice = (item, newPrice) => {
        if (!item.rawParams) return item; 
        const p = JSON.parse(JSON.stringify(item.rawParams));
        const calcMode = p.calcMode; const w_cm = parseFloat(p.formData.width) || 0; const h_cm = parseFloat(p.formData.height) || 0; const qty = parseInt(p.formData.qty) || 1; const w_m = w_cm / 100; const h_m = h_cm / 100;
        let installCost = p.useInstallFee ? (parseFloat(p.installFee) || 0) : 0; let motorCost = p.useMotorFee ? (parseFloat(p.motorFee) || 0) : 0; let extraCost = installCost + motorCost;
        let extraTextArray = []; if (installCost > 0) extraTextArray.push(`ติดตั้ง ${formatCurrency(installCost)}`); if (motorCost > 0) extraTextArray.push(`มอเตอร์ ${formatCurrency(motorCost)}`);
        let extraText = extraTextArray.length > 0 ? ` + ${extraTextArray.join(' + ')}` : '';
        let totalPerUnit = 0; let details = {}; let price = parseFloat(newPrice);
        if(isNaN(price)) return item; 

        const baseFactor = calcMode === 'wooden' ? 1.2 : config.fabricFactor;
        
        if (calcMode === 'external' || calcMode === 'internal') {
            let calculatedArea = w_m * h_m * baseFactor; let finalArea = calculatedArea < 1.2 ? 1.2 : calculatedArea; let formulaExtra = calculatedArea < 1.2 ? " (ขั้นต่ำ 1.20 ตร.ล.)" : "";
            const fabricCostPerUnit = finalArea * price; 
            details = { mainFormula: `${w_m.toFixed(2)}m * ${h_m.toFixed(2)}m * ${baseFactor} = ${finalArea.toFixed(3)} ตร.ล. * ${price} = ${fabricCostPerUnit.toFixed(2)}${formulaExtra}` };
            if (calcMode === 'external') {
                const hw = config.hardwarePrice; const top = config.topRailPrice * w_m; const bot = config.bottomRailPrice * w_m; const sling = config.slingPrice * h_m;
                totalPerUnit = fabricCostPerUnit + hw + top + bot + sling + extraCost;
                let sumFormulaText = `${fabricCostPerUnit.toFixed(1)} + ${hw} + ${top.toFixed(0)} + ${bot.toFixed(0)} + ${sling.toFixed(1)}`;
                if (extraCost > 0) sumFormulaText += extraText; sumFormulaText += ` = ${totalPerUnit.toFixed(1)}`;
                details = { ...details, topRailFormula: `${config.topRailPrice} * ${w_m.toFixed(2)} = ${top.toFixed(2)}`, bottomRailFormula: `${config.bottomRailPrice} * ${w_m.toFixed(2)} = ${bot.toFixed(2)}`, slingFormula: `${config.slingPrice} * ${h_m.toFixed(2)} = ${sling.toFixed(2)}`, hardwarePrice: hw, sumFormula: sumFormulaText };
            } else { totalPerUnit = fabricCostPerUnit + extraCost; if (extraCost > 0) details.mainFormula += `${extraText} = ${formatCurrency(totalPerUnit)}`; }
            p.formData.price = price.toString();
        } else if (calcMode === 'wooden') {
            let pricing_w_m = w_m < 0.80 ? 0.80 : w_m; let pricing_h_m = h_m < 1.00 ? 1.00 : h_m; let formulaExtra = "";
            if (w_cm < 80) formulaExtra += " (ขั้นต่ำ ก. 0.80)"; if (h_cm < 100) formulaExtra += " (ขั้นต่ำ ส. 1.00)";
            let finalArea = pricing_w_m * pricing_h_m * baseFactor; const fabricCostPerUnit = finalArea * price; 
            details = { mainFormula: `${pricing_w_m.toFixed(2)} * ${pricing_h_m.toFixed(2)} * ${baseFactor} * ${price} = ${fabricCostPerUnit.toFixed(2)}${formulaExtra}` };
            totalPerUnit = fabricCostPerUnit + extraCost; if (extraCost > 0) details.mainFormula += `${extraText} = ${formatCurrency(totalPerUnit)}`;
        } else if (calcMode === 'rail') {
            const selRail = railOptions.find(r => r.id === p.railType);
            if (selRail && selRail.unit === 'ชุด') { totalPerUnit = price + extraCost; details = { mainFormula: `${price} บาท x 1 ชุด = ${formatCurrency(price)}${extraText}`, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` }; } else { const pricePerSet = w_m * price; totalPerUnit = pricePerSet + extraCost; let formulaText = `${w_m.toFixed(2)}m x ${formatCurrency(price)} = ${formatCurrency(pricePerSet)}${extraText}`; details = { mainFormula: formulaText, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` }; }
        } else if (calcMode === 'pvc') {
            const w_calc = w_m < 1.00 ? 1.00 : w_m;
            const getPvcCalcHeight = (h) => { if (h < 2.00) return 2.00; if (h <= 2.01) return 2.00; if (h <= 2.21) return 2.20; if (h <= 2.41) return 2.40; if (h <= 2.61) return 2.60; if (h <= 2.81) return 2.80; if (h <= 3.01) return 3.00; if (h <= 3.31) return 3.30; if (h <= 3.51) return 3.50; if (h <= 3.70) return 3.70; return h; };
            const h_calc = getPvcCalcHeight(h_m); const pricePerSet = w_calc * h_calc * 1.2 * price; totalPerUnit = pricePerSet + extraCost;
            let formulaText = `${w_calc.toFixed(2)}m x ${h_calc.toFixed(2)}m x 1.2 x ${formatCurrency(price)} = ${formatCurrency(pricePerSet)}`;
            if (extraCost > 0) formulaText += `${extraText} = ${formatCurrency(totalPerUnit)}`;
            details = { mainFormula: formulaText, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
            p.pvcType = 'custom'; p.pvcCustomPrice = price.toString();
        } else if (calcMode === 'aluminum') {
            if (p.alumSystem === 'wood_pattern') {
                const unitPrice = w_m * h_m * price; totalPerUnit = unitPrice + extraCost;
                let formulaText = `${w_m.toFixed(2)}m x ${h_m.toFixed(2)}m x ${price} = ${formatCurrency(unitPrice)}`;
                if (extraCost > 0) formulaText += `${extraText} = ${formatCurrency(totalPerUnit)}`;
                details = { mainFormula: formulaText, sumFormula: `${formatCurrency(totalPerUnit)} x ${qty} ชุด = ${formatCurrency(totalPerUnit * qty)}` };
            } else { const netPrice = price; totalPerUnit = netPrice + extraCost; details = { mainFormula: `แก้ไขราคาแมนนวล = ${formatCurrency(netPrice)}`, sumFormula: `${formatCurrency(netPrice)} ${extraText} = ${formatCurrency(totalPerUnit)}` }; }
        }
        return { ...item, unitPrice: price, totalPerUnit, grandTotal: totalPerUnit * qty, details, rawParams: p };
    };

    const saveToHistory = async () => {
        if (!user) return onLogin();
        if (items.length === 0) return alert("ไม่มีรายการให้บันทึก");
        const name = window.prompt("ตั้งชื่อใบเสนอราคา:");
        if (!name) return;
        try {
            await db.collection('artifacts').doc(appId).collection('users').doc(user.uid).collection('quotations').add({ name, items, total: items.reduce((a,b)=>a+b.grandTotal,0), createdAt: new Date().toISOString() });
            alert("บันทึกเรียบร้อย!");
        } catch(e) { alert("บันทึกไม่สำเร็จ: " + e.message); }
    };

    const selectedWood = config.woodenTypes?.find(w => w.id === formData.woodType) || config.woodenTypes?.[0];

    return (
        <div className="pt-24 px-5 pb-40 fade-in">
            <div className="flex justify-between items-center mb-6"><h2 className={`text-2xl font-bold ${theme.textMain}`}>คำนวณราคา</h2>{items.length > 0 && <button onClick={saveToHistory} className={`text-xs font-bold px-4 py-2 rounded-xl flex gap-2 items-center shadow-sm hover:shadow-md transition-all active:scale-95 hover:-translate-y-0.5 ${theme.btnSecondary}`}><Icons.Save size={16}/> บันทึก</button>}</div>
            {availableModes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {availableModes.map(mode => (<button key={mode.id} onClick={() => { setCalcMode(mode.id); setEditingId(null); }} className={`bento-card relative overflow-hidden rounded-2xl p-3 flex flex-col items-center justify-center gap-2 h-auto py-2 border ${calcMode === mode.id ? `bg-white shadow-lg ring-1 ${theme.inputRing}` : 'bg-white border-white shadow-sm hover:shadow-md'}`}><div className={`p-1.5 rounded-full transition-colors ${calcMode === mode.id ? `${theme.bgSoft} ${theme.primary}` : `bg-slate-50 text-slate-400 group-hover:text-slate-600`}`}>{mode.icon}</div><span className={`text-[11px] font-bold transition-colors ${calcMode === mode.id ? theme.primary : theme.textSub}`}>{mode.label}</span>{calcMode === mode.id && <div className={`absolute inset-x-0 bottom-0 h-1 ${theme.toggleActive}`}></div>}</button>))}
                </div>
            ) : <div className="bg-white p-6 rounded-2xl text-center text-slate-400 border border-dashed border-slate-300 mb-6 font-bold">ปิดปรับปรุงระบบคำนวณชั่วคราว</div>}
            {availableModes.length > 0 && (
                <div className={`bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-6 mb-6 relative overflow-hidden scale-in ${editingId ? 'ring-2 ring-orange-400' : ''}`}>
                    {editingId && <div className="mb-4 text-xs font-bold text-orange-500 flex items-center gap-2 bg-orange-50 p-2 rounded-lg"><Icons.Edit size={14}/> กำลังแก้ไขรายการ</div>}
                    
                    {calcMode === 'rail' && (
                        <div className="mb-6 space-y-4">
                            {railOptions.length > 0 ? (
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>ประเภทราง</label>
                                    <select value={railType} onChange={(e) => setRailType(e.target.value)} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-3 font-bold text-slate-700`}>
                                        {railOptions.map(r => (<option key={r.id} value={r.id}>{r.label} ({r.price}/{r.unit})</option>))}
                                    </select>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">ยังไม่มีข้อมูลรางม่าน กรุณาเพิ่มที่หน้าตั้งค่าระบบ</div>
                            )}
                        </div>
                    )}
                    {calcMode === 'pvc' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>ประเภทใบ/ราคา</label>
                                <select value={pvcType} onChange={(e) => setPvcType(e.target.value)} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-3 font-bold text-slate-700`}>
                                    {pvcOptionsWithCustom.map(p => (<option key={p.id} value={p.id}>{p.label} {p.price !== 'manual' ? `(${p.price})` : ''}</option>))}
                                </select>
                            </div>
                            {(pvcOptionsWithCustom.find(p => p.id === pvcType)?.price === 'manual') && (
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>ระบุราคา (บาท/ตร.ล.)</label>
                                    <input type="number" value={pvcCustomPrice} onChange={(e) => setPvcCustomPrice(e.target.value)} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-3 font-bold text-xl text-slate-700`} placeholder="ระบุราคา..." />
                                </div>
                            )}
                            <div>
                                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>รูปแบบการเปิด</label>
                                <select value={pvcOpenType} onChange={(e) => setPvcOpenType(e.target.value)} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-3 font-bold text-slate-700`}>
                                    {pvcOpeningOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {calcMode === 'aluminum' && (<div className="mb-6"><label className={`text-xs font-bold uppercase tracking-wider mb-3 block ml-1 ${theme.textSub}`}>เลือกระบบ</label><div className={`flex flex-col gap-2`}><div className="flex gap-2"><button onClick={() => setAlumSystem('standard')} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${alumSystem === 'standard' ? `${theme.border} ${theme.bgSoft} ${theme.primary} shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>ธรรมดา (ลด {config.alumDiscountStandard1 !== undefined ? config.alumDiscountStandard1 : 60}%{config.alumDiscountStandard2 ? `+${config.alumDiscountStandard2}%` : ''})</button><button onClick={() => setAlumSystem('chain')} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${alumSystem === 'chain' ? `${theme.border} ${theme.bgSoft} ${theme.primary} shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>โซ่วน (ลด {config.alumDiscountChain !== undefined ? config.alumDiscountChain : 60}%{config.alumDiscountChain2 ? `+${config.alumDiscountChain2}%` : ''})</button></div><button onClick={() => setAlumSystem('wood_pattern')} className={`w-full py-3 rounded-xl border font-bold text-sm transition-all ${alumSystem === 'wood_pattern' ? `${theme.border} ${theme.bgSoft} ${theme.primary} shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}>ลายไม้ (ตร.ม. ละ {config.aluminumWoodPrice})</button></div></div>)}
                    
                    {calcMode === 'wooden' && (
                        <div className="mb-6">
                            <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ml-1 ${theme.textSub}`}>ชนิดไม้</label>
                            {config.woodenTypes && config.woodenTypes.length > 0 ? (
                                <div className={`flex flex-wrap gap-2 p-1.5 rounded-xl ${theme.bgSoft}`}>
                                    {config.woodenTypes.map(t => (
                                        <label key={t.id} className={`flex-1 min-w-[100px] cursor-pointer rounded-lg py-2.5 flex items-center justify-center transition-all ${formData.woodType === t.id ? 'bg-white shadow-sm font-bold' : 'font-medium opacity-60'} ${theme.textMain}`}>
                                            <input type="radio" name="woodType" value={t.id} checked={formData.woodType === t.id} onChange={handleInputChange} className="hidden" />
                                            <span className="text-xs text-center leading-tight px-1">{t.label}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">ยังไม่มีข้อมูลชนิดไม้ กรุณาเพิ่มที่หน้าตั้งค่าระบบ</div>
                            )}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>กว้าง (cm)</label>
                            <input type="number" name="width" value={formData.width} onChange={handleInputChange} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-4 font-bold text-xl ${theme.textMain} transition-all placeholder-slate-300 ${calcMode === 'rail' && activeRail?.unit === 'ชุด' ? 'opacity-50 pointer-events-none' : ''}`} placeholder={calcMode === 'rail' && activeRail?.unit === 'ชุด' ? '-' : '0'} />
                        </div>
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>สูง (cm) <span className="font-normal text-gray-300">(ถ้ามี)</span></label>
                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-4 font-bold text-xl ${theme.textMain} transition-all placeholder-slate-300 ${calcMode === 'rail' ? 'opacity-50 pointer-events-none' : ''}`} placeholder={calcMode === 'rail' ? '-' : '0'} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {calcMode !== 'aluminum' && calcMode !== 'pvc' && calcMode !== 'rail' && (
                            calcMode !== 'wooden' ? (
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>ราคาผ้า</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`input-apple w-full bg-white border ${theme.border} rounded-xl p-4 font-bold text-xl ${theme.textMain} transition-all placeholder-slate-300`} placeholder="฿" />
                                </div>
                            ) : (
                                <div>
                                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>ราคา/หน่วย</label>
                                    <div className={`w-full ${theme.bgSoft} border border-transparent rounded-xl p-4 font-bold text-xl flex items-center ${theme.textSub}`}>
                                        {formatCurrency(selectedWood ? selectedWood.price : 0)}
                                    </div>
                                </div>
                            )
                        )}
                        <div className={(calcMode === 'aluminum' || calcMode === 'pvc' || calcMode === 'rail') ? 'col-span-2' : ''}>
                            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${theme.textSub}`}>จำนวน</label>
                            <div className={`flex bg-white border ${theme.border} rounded-xl overflow-hidden h-[62px]`}>
                                <button onClick={() => setFormData(p => ({...p, qty: Math.max(1, parseInt(p.qty)-1 || 1).toString()}))} className={`px-5 font-bold text-xl transition-colors hover:bg-slate-50 ${theme.textSub}`}>-</button>
                                <input type="number" name="qty" value={formData.qty} onChange={handleInputChange} className={`w-full bg-transparent text-center font-bold text-xl focus:outline-none ${theme.textMain}`} />
                                <button onClick={() => setFormData(p => ({...p, qty: (parseInt(p.qty)+1 || 1).toString()}))} className={`px-5 font-bold text-xl transition-colors hover:bg-slate-50 ${theme.textSub}`}>+</button>
                            </div>
                        </div>
                    </div>

                    {calcMode !== 'pvc' && calcMode !== 'rail' && (<div className="mb-6"><label className={`text-xs font-bold uppercase tracking-wider mb-3 block ml-1 ${theme.textSub}`}>ตำแหน่งโซ่/สลิง</label><div className="flex gap-4">{['ซ้าย', 'ขวา'].map(s => (<label key={s} className={`flex-1 cursor-pointer border-2 rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${(formData.side === s || (s === 'ขวา' && (formData.side === 'เปิดข้าง' || formData.side === 'เปิดกลาง'))) ? `${theme.border} ${theme.bgSoft} ${theme.primary} shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}><input type="radio" name="side" value={s} checked={formData.side === s || (s === 'ขวา' && (formData.side === 'เปิดข้าง' || formData.side === 'เปิดกลาง'))} onChange={handleInputChange} className="hidden" /><span className="font-bold">{s}</span></label>))}</div></div>)}
                    {calcMode === 'rail' && activeRail?.unit !== 'ชุด' && (<div className="mb-6"><label className={`text-xs font-bold uppercase tracking-wider mb-3 block ml-1 ${theme.textSub}`}>รูปแบบการเปิด</label><div className="flex gap-4">{['เปิดกลาง', 'เปิดข้าง'].map(s => (<label key={s} className={`flex-1 cursor-pointer border-2 rounded-xl py-3 flex items-center justify-center gap-2 transition-all ${(formData.side === s || (s === 'เปิดข้าง' && (formData.side === 'ซ้าย' || formData.side === 'ขวา'))) ? `${theme.border} ${theme.bgSoft} ${theme.primary} shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}><input type="radio" name="side" value={s} checked={formData.side === s || (s === 'เปิดข้าง' && (formData.side === 'ซ้าย' || formData.side === 'ขวา'))} onChange={handleInputChange} className="hidden" /><span className="font-bold">{s}</span></label>))}</div></div>)}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className={`p-4 rounded-xl border border-slate-100 bg-slate-50 transition-all ${useInstallFee ? 'ring-1 ring-orange-100' : ''}`}>
                            <label className={`flex items-center gap-3 cursor-pointer ${theme.textMain} select-none`}>
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${useInstallFee ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                                    {useInstallFee && <Icon path={<polyline points="20 6 9 17 4 12"></polyline>} size={16} className="text-white stroke-2" />}
                                    <input type="checkbox" checked={useInstallFee} onChange={(e) => setUseInstallFee(e.target.checked)} className="hidden" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icons.Wrench size={18} className={useInstallFee ? 'text-orange-500' : 'text-slate-400'} />
                                    <span className={`font-bold text-sm ${useInstallFee ? 'text-slate-700' : 'text-slate-500'}`}>รวมค่าบริการติดตั้ง</span>
                                </div>
                            </label>
                            {useInstallFee && (
                                <div className="mt-3 animate-scale-in">
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="text-xs font-bold text-slate-400">ค่าติดตั้ง (ต่อชุด)</label>
                                    </div>
                                    <input type="number" value={installFee} onChange={(e) => setInstallFee(e.target.value)} className={`input-apple w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-700 ${theme.inputRing} placeholder-slate-300`} placeholder="ระบุราคา..." autoFocus />
                                </div>
                            )}
                        </div>
                        
                        <div className={`p-4 rounded-xl border border-slate-100 bg-slate-50 transition-all ${useMotorFee ? 'ring-1 ring-blue-100' : ''}`}>
                            <label className={`flex items-center gap-3 cursor-pointer ${theme.textMain} select-none`}>
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${useMotorFee ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                                    {useMotorFee && <Icon path={<polyline points="20 6 9 17 4 12"></polyline>} size={16} className="text-white stroke-2" />}
                                    <input type="checkbox" checked={useMotorFee} onChange={(e) => setUseMotorFee(e.target.checked)} className="hidden" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icons.Settings size={18} className={useMotorFee ? 'text-blue-500' : 'text-slate-400'} />
                                    <span className={`font-bold text-sm ${useMotorFee ? 'text-slate-700' : 'text-slate-500'}`}>เพิ่มระบบมอเตอร์</span>
                                </div>
                            </label>
                            {useMotorFee && (
                                <div className="mt-3 animate-scale-in">
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="text-xs font-bold text-slate-400">ค่ามอเตอร์ (ต่อชุด)</label>
                                    </div>
                                    <input type="number" value={motorFee} onChange={(e) => setMotorFee(e.target.value)} className={`input-apple w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-700 ${theme.inputRing} placeholder-slate-300`} placeholder="ระบุราคา..." autoFocus />
                                </div>
                            )}
                        </div>
                    </div>

                    {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-pulse border border-red-100"><Icons.AlertCircle size={20} /> {errorMsg}</div>}
                    
                    <div className="flex gap-3">
                        {editingId && (
                            <button onClick={cancelEdit} className={`flex-1 font-bold text-lg py-4 rounded-2xl border border-slate-200 text-slate-500 active:scale-95 transition-all flex justify-center items-center gap-2 hover:bg-slate-50`}>
                                ยกเลิก
                            </button>
                        )}
                        <button onClick={calculateItem} className={`flex-[2] font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 hover:-translate-y-1 ${editingId ? 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600' : theme.btnPrimary}`}>
                            {editingId ? <><Icons.CheckCircle size={24} /> บันทึกการแก้ไข</> : <><Icons.Plus size={24} /> เพิ่มรายการ</>}
                        </button>
                    </div>
                </div>
            )}
            {items.length > 0 && (<div className="space-y-4 pb-20"><div className="flex justify-between items-center px-4"><span className={`text-sm font-bold uppercase tracking-wider ${theme.textSub}`}>รายการ ({items.length})</span><div className="flex gap-2"><button onClick={() => setShowBulkEdit(true)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${theme.btnSecondary}`}><Icons.Edit size={14}/> แก้ไขราคา</button><button onClick={() => setItems([])} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${theme.btnSecondary}`}><Icons.Trash2 size={14}/> ล้าง</button></div></div>{items.map((item) => (<div key={item.id} className={`bg-white p-5 rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] relative group scale-in hover:scale-[1.02] transition-transform ${editingId === item.id ? 'ring-2 ring-orange-400 opacity-50' : ''}`}><div className="absolute top-4 right-4 flex gap-2"><button onClick={() => handleEdit(item)} disabled={!!editingId} className={`p-2 rounded-full transition-colors ${theme.textSub} hover:text-orange-500 hover:bg-orange-50 disabled:opacity-30`}><Icons.Edit size={18} /></button><button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} disabled={!!editingId} className={`p-2 rounded-full transition-colors ${theme.textSub} hover:${theme.primary} hover:${theme.bgSoft} disabled:opacity-30`}><Icons.X size={18} /></button></div><div className="flex items-center gap-3 mb-4"><div className={`p-2 rounded-xl ${theme.bgSoft} ${theme.primary}`}>{item.type === 'external' ? <Icons.Sun size={18} /> : item.type === 'wooden' ? <Icons.Blinds size={18} /> : item.type === 'aluminum' ? <Icons.Blinds size={18} /> : item.type === 'pvc' ? <Icons.Fold size={18} /> : item.type === 'rail' ? <Icons.Wrench size={18} /> : <Icons.Roller size={18} />}</div><span className={`text-sm font-bold ${theme.textMain}`}>{item.typeName}</span></div><div className="flex justify-between items-end"><div><div className={`text-lg font-bold font-mono tracking-tight ${theme.textMain}`}>{item.w_cm || '-'} <span className="text-slate-400 text-sm">x</span> {item.h_cm || '-'} <span className="text-xs text-slate-400 font-sans">cm</span></div><div className={`text-xs font-medium mt-1 inline-block px-2 py-1 rounded-md border border-slate-100 ${theme.textSub} ${theme.bgSoft}`}>จำนวน {item.qty} ชุด • {(item.type === 'pvc' || item.type === 'rail') ? '' : 'ปรับ'}{item.displaySide || item.side}</div></div><div className={`text-xl font-bold ${theme.highlight}`}>{formatCurrency(item.grandTotal)}</div></div></div>))}<button onClick={() => setShowQuote(true)} className={`w-full px-6 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 font-bold text-lg active:scale-95 transition-all mt-4 hover:-translate-y-1 ${theme.btnPrimary}`}><Icons.FileText size={24} /> สรุปราคา {formatCurrency(items.reduce((a,b) => a+b.grandTotal, 0))}</button></div>)}
            {showQuote && <QuotationModal items={items} onClose={() => setShowQuote(false)} config={config} userProfile={userProfile} theme={theme} />}
            {showBulkEdit && <BulkEditModal items={items} onSave={(newItems) => { setItems(newItems); setShowBulkEdit(false); }} onClose={() => setShowBulkEdit(false)} theme={theme} recalculateFn={recalculateItemWithPrice} />}
        </div>
    );
};
