import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons.jsx';
import { formatCurrency, db, appId, DEFAULT_CONFIG, THEMES } from '../config.js';
import { AdminInput, AdminTextInput, AdminToggle, DynamicListManager } from './UIComponents.jsx';

export const QuotationModal = ({ items, onClose, config, userProfile, theme }) => {
    const [showVat, setShowVat] = useState(false);
    const [showMethod, setShowMethod] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [generating, setGenerating] = useState(false);
    const quoteRef = useRef(null);
    
    const displayCompanyName = userProfile?.shopName || config.companyName || 'SUNNY BLIND SYSTEM';
    const displayCompanyDesc = userProfile?.address || config.companyDesc || 'จำหน่ายและติดตั้งผ้าม่าน มู่ลี่ วอลเปเปอร์';
    const displayCompanyContact = userProfile?.phone || config.companyContact || 'โทร: 02-123-4567';
    
    const subtotal = items.reduce((sum, item) => sum + item.grandTotal, 0);
    const discountAmount = showDiscount ? (subtotal * (parseFloat(discountPercent) || 0) / 100) : 0;
    const totalAfterDiscount = subtotal - discountAmount;
    const vatAmount = showVat ? totalAfterDiscount * 0.07 : 0;
    const grandTotal = totalAfterDiscount + vatAmount;

    const generateCanvas = async () => {
        if (!quoteRef.current || !window.html2canvas) return null;
        const cloneContainer = document.createElement('div');
        cloneContainer.style.width = '210mm';
        cloneContainer.style.minHeight = '297mm';
        cloneContainer.style.position = 'fixed';
        cloneContainer.style.top = '-10000px';
        cloneContainer.style.left = '0';
        cloneContainer.style.zIndex = '-1';
        cloneContainer.style.background = 'white';
        document.body.appendChild(cloneContainer);

        const clone = quoteRef.current.cloneNode(true);
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        clone.style.padding = '15mm';
        clone.style.fontSize = '';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';
        clone.style.transform = 'none';

        const originalTextareas = quoteRef.current.querySelectorAll('textarea');
        const clonedTextareas = clone.querySelectorAll('textarea');
        originalTextareas.forEach((orig, index) => {
            const cloned = clonedTextareas[index];
            if (cloned) {
                const div = document.createElement('div');
                div.style.cssText = window.getComputedStyle(orig).cssText;
                div.style.height = 'auto';
                div.style.minHeight = orig.style.height;
                div.style.resize = 'none';
                div.style.overflow = 'visible';
                div.style.whiteSpace = 'pre-wrap';
                div.style.border = '1px solid #e2e8f0';
                div.innerText = orig.value;
                if (cloned.parentNode) cloned.parentNode.replaceChild(div, cloned);
            }
        });

        const originalInputs = quoteRef.current.querySelectorAll('input[type="text"]');
        const clonedInputs = clone.querySelectorAll('input[type="text"]');
        originalInputs.forEach((orig, index) => {
            if (clonedInputs[index]) clonedInputs[index].setAttribute('value', orig.value);
        });

        cloneContainer.appendChild(clone);

        try {
            const canvas = await window.html2canvas(clone, { scale: 2, useCORS: true, windowWidth: 1280, width: 794 });
            document.body.removeChild(cloneContainer);
            return canvas;
        } catch (error) {
            console.error("Capture failed:", error);
            document.body.removeChild(cloneContainer);
            return null;
        }
    };

    const handleDownloadPDF = async () => {
        setGenerating(true);
        const canvas = await generateCanvas();
        if (!canvas) { setGenerating(false); return; }
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Quotation_${Date.now()}.pdf`);
        setGenerating(false);
    };

    const handleSaveImage = async () => {
        setGenerating(true);
        const canvas = await generateCanvas();
        if (!canvas) { setGenerating(false); return; }
        const link = document.createElement('a');
        link.download = `Quotation_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        setGenerating(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4 fade-in">
            <div className={`bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                <div className="p-4 border-b flex flex-wrap justify-between items-center bg-slate-50/80 backdrop-blur-sm gap-4">
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${theme.textMain}`}><Icons.FileText size={24} className={theme.icon} /> ใบเสนอราคาตัวอย่าง</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className={`flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-gray-300 transition-all select-none hover:-translate-y-0.5 ${theme.textMain}`}><input type="checkbox" checked={showVat} onChange={() => setShowVat(!showVat)} className="w-4 h-4 rounded border-gray-300" /><span className="text-sm font-bold">VAT 7%</span></label>
                        <label className={`flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-gray-300 transition-all select-none hover:-translate-y-0.5 ${theme.textMain}`}><input type="checkbox" checked={showMethod} onChange={() => setShowMethod(!showMethod)} className="w-4 h-4 rounded border-gray-300" /><span className="text-sm font-bold">วิธีคำนวณ</span></label>
                        <label className={`flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-gray-300 transition-all select-none hover:-translate-y-0.5 ${theme.textMain}`}>
                            <input type="checkbox" checked={showDiscount} onChange={() => setShowDiscount(!showDiscount)} className="w-4 h-4 rounded border-gray-300" />
                            <span className="text-sm font-bold">ส่วนลด %</span>
                        </label>
                        {showDiscount && (
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                                <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="w-12 text-sm font-bold text-right outline-none" placeholder="0" />
                                <span className="text-sm font-bold ml-1">%</span>
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors hover:scale-110"><Icons.X size={24} /></button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 bg-slate-100 p-4 md:p-8 flex justify-center">
                    <div ref={quoteRef} className="a4-paper relative flex flex-col shadow-xl">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <img src={config.logoUrl} className="h-20 w-auto object-contain" alt="Company Logo" onError={(e) => e.target.style.display = 'none'} />
                                <div><h1 className="text-2xl font-bold text-slate-800">{displayCompanyName}</h1><p className="text-sm text-slate-500">{displayCompanyDesc}</p><p className="text-sm text-slate-500">{displayCompanyContact}</p></div>
                            </div>
                            <div className="text-right"><div className="text-3xl font-bold text-red-100 uppercase tracking-widest mb-2">Quotation</div><div className="text-sm font-bold text-slate-600">ใบเสนอราคา</div><div className="text-sm text-slate-500 mt-1">วันที่: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
                        </div>
                        <div className="border-t-2 border-b-2 border-slate-100 py-4 mb-6 flex gap-4">
                            <div className="w-1/3"><label className="text-xs font-bold text-slate-400 block mb-1">ลูกค้า (Customer):</label><textarea rows="3" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400 placeholder-slate-300 resize-none" placeholder="ระบุชื่อลูกค้า..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
                            <div className="w-2/3"><label className="text-xs font-bold text-slate-400 block mb-1">ที่อยู่ (Address):</label><textarea rows="3" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-slate-400 placeholder-slate-300 resize-none" placeholder="ระบุที่อยู่..." value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} /></div>
                        </div>
                        <table className="w-full text-sm mb-auto">
                            <thead><tr className="bg-red-600 text-white"><th className="py-2 px-3 text-center w-12 rounded-tl-lg">ลำดับ</th><th className="py-2 px-3 text-left">รายการสินค้า</th><th className="py-2 px-3 text-center whitespace-nowrap">ขนาด (cm)</th><th className="py-2 px-3 text-center">ปรับ / เปิด</th><th className="py-2 px-3 text-center">จำนวน</th><th className="py-2 px-3 text-right">ราคา/หน่วย</th><th className="py-2 px-3 text-right rounded-tr-lg">รวมเงิน</th></tr></thead>
                            <tbody className="text-slate-700">{items.map((item, index) => (<React.Fragment key={item.id}><tr className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-3 text-center font-medium text-slate-400">{index + 1}</td><td className="py-3 px-3"><div className="font-bold">{item.typeName}</div>{(item.installCost > 0 || item.motorCost > 0) && (<div className="text-[11px] text-slate-500 font-normal mt-0.5 space-y-0.5">{item.installCost > 0 && <div className="text-orange-600 font-semibold">+ ค่าติดตั้ง: {formatCurrency(item.installCost)}/ชุด</div>}{item.motorCost > 0 && <div className="text-blue-600 font-semibold">+ ระบบมอเตอร์: {formatCurrency(item.motorCost)}/ชุด</div>}</div>)}</td><td className="py-3 px-3 text-center font-mono text-xs whitespace-nowrap">{item.w_cm} x {item.h_cm}</td><td className="py-3 px-3 text-center">{item.displaySide || item.side}</td><td className="py-3 px-3 text-center">{item.qty}</td><td className="py-3 px-3 text-right font-mono">{formatCurrency(item.totalPerUnit)}</td><td className="py-3 px-3 text-right font-bold">{formatCurrency(item.grandTotal)}</td></tr>{showMethod && (<tr className="bg-slate-50 border-b border-slate-100"><td colSpan="7" className="py-2 px-4 text-xs text-slate-500"><div className="font-bold text-slate-700 mb-1">วิธีคำนวณ:</div><ul className="list-disc list-inside space-y-0.5"><li>ผ้า: {item.details.fabricFormula}</li>{item.type === 'external' && (<><li>รางบน: {item.details.topRailFormula}</li><li>รางล่าง: {item.details.bottomRailFormula}</li><li>สลิง: {item.details.slingFormula}</li><li>อุปกรณ์: {formatCurrency(item.details.hardwarePrice)}</li><li className="font-bold text-red-600">รวมต่อชุด: {item.details.sumFormula}</li></>)}{item.type !== 'external' && <li>{item.details.mainFormula}</li>}</ul></td></tr>)}</React.Fragment>))}</tbody>
                        </table>
                        <div className="mt-8 flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-slate-600"><span>รวมเป็นเงิน</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
                                {showDiscount && <div className="flex justify-between text-red-500"><span>ส่วนลด {discountPercent}%</span><span className="font-bold">-{formatCurrency(discountAmount)}</span></div>}
                                {showDiscount && <div className="flex justify-between text-slate-600"><span>หลังหักส่วนลด</span><span className="font-bold">{formatCurrency(totalAfterDiscount)}</span></div>}
                                {showVat && (<div className="flex justify-between text-slate-600"><span>ภาษีมูลค่าเพิ่ม 7%</span><span className="font-bold">{formatCurrency(vatAmount)}</span></div>)}
                                <div className="flex justify-between text-lg font-bold text-red-600 border-t-2 border-red-200 pt-2 mt-2"><span>จำนวนเงินทั้งสิ้น</span><span>{formatCurrency(grandTotal)}</span></div>
                            </div>
                        </div>
                        <div className="mt-12 flex justify-between text-center"><div className="mt-8"><div className="w-40 border-b border-slate-300 mb-2"></div><p className="text-xs text-slate-400">ผู้เสนอราคา</p></div><div className="mt-8"><div className="w-40 border-b border-slate-300 mb-2"></div><p className="text-xs text-slate-400">ผู้อนุมัติสั่งซื้อ</p></div></div>
                    </div>
                </div>
                <div className="p-5 bg-white border-t flex flex-col md:flex-row gap-4">
                    <button onClick={handleDownloadPDF} disabled={generating} className={`flex-1 ${theme.btnPrimary} py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md text-base transition-colors hover:-translate-y-1 disabled:opacity-50`}>{generating ? 'กำลังสร้าง PDF...' : <><Icons.Download size={20} /> ดาวน์โหลด PDF (A4)</>}</button>
                    <button onClick={handleSaveImage} disabled={generating} className={`flex-1 ${theme.btnSecondary} py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md text-base transition-colors hover:-translate-y-1 disabled:opacity-50`}>{generating ? 'กำลังบันทึก...' : <><Icons.Image size={20} /> บันทึกเป็นรูปภาพ</>}</button>
                </div>
            </div>
        </div>
    );
};

export const ProfileModal = ({ user, userProfile, onClose, onLogout, onLoad, onSaveProfile, theme }) => {
    const [savedQuotes, setSavedQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ displayName: userProfile?.displayName || user.displayName, shopName: userProfile?.shopName || '', address: userProfile?.address || '', phone: userProfile?.phone || '', photoURL: userProfile?.photoURL || user.photoURL });

     useEffect(() => {
        if (!db) return;
        const q = db.collection('artifacts').doc('sunny-blind-system').collection('users').doc(user.uid).collection('quotations'); 
        const unsub = q.onSnapshot(snap => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setSavedQuotes(data);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const deleteQuote = async (e, id) => { e.stopPropagation(); if(!window.confirm("ต้องการลบรายการนี้?")) return; try { await db.collection('artifacts').doc('sunny-blind-system').collection('users').doc(user.uid).collection('quotations').doc(id).delete(); } catch(e) { alert(e.message); } };
    const handleSave = () => { onSaveProfile(editData); setIsEditing(false); };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-4 fade-in">
            <div className={`${theme.bgApp} rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] slide-up`}>
                <div className={`p-5 border-b ${theme.border} flex justify-between items-center bg-white/50 backdrop-blur-md`}><h3 className={`font-bold text-lg flex items-center gap-2 ${theme.textMain}`}><Icons.User size={24} className={theme.icon} /> โปรไฟล์ของฉัน</h3><button onClick={onClose} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors"><Icons.X size={20} className={theme.textSub} /></button></div>
                <div className="p-6 flex flex-col items-center bg-white relative">
                    <div className="absolute top-4 right-4 z-20"><button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full ${theme.bgSoft} ${theme.textSub} hover:${theme.primary} transition-colors`}>{isEditing ? <Icons.X size={18} /> : <Icons.Edit size={18} />}</button></div>
                    <img src={isEditing ? editData.photoURL : (userProfile?.photoURL || user.photoURL)} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 object-cover" />
                    {!isEditing ? (<><h2 className={`text-xl font-bold ${theme.textMain}`}>{userProfile?.displayName || user.displayName}</h2>{userProfile?.shopName && <p className={`text-sm font-bold mt-1 ${theme.highlight}`}>{userProfile.shopName}</p>}<p className={`text-sm mt-1 ${theme.textSub}`}>{user.email}</p><button onClick={onLogout} className={`mt-6 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors ${theme.bgSoft} ${theme.primary}`}><Icons.LogOut size={16} /> ออกจากระบบ</button></>) : (<div className="w-full space-y-3 mt-2"><AdminTextInput label="ชื่อที่แสดง" value={editData.displayName} onChange={v => setEditData({...editData, displayName: v})} theme={theme} /><AdminTextInput label="ชื่อร้านค้า" value={editData.shopName} onChange={v => setEditData({...editData, shopName: v})} theme={theme} /><AdminTextInput label="ที่อยู่ร้าน" value={editData.address} onChange={v => setEditData({...editData, address: v})} theme={theme} /><AdminTextInput label="เบอร์โทรศัพท์" value={editData.phone} onChange={v => setEditData({...editData, phone: v})} theme={theme} /><AdminTextInput label="URL รูปโปรไฟล์" value={editData.photoURL} onChange={v => setEditData({...editData, photoURL: v})} theme={theme} /><button onClick={handleSave} className={`w-full font-bold py-2 rounded-xl mt-2 ${theme.btnPrimary}`}>บันทึกข้อมูล</button></div>)}
                </div>
                {!isEditing && (<div className="flex-1 overflow-y-auto p-5"><h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ml-1 ${theme.textSub}`}>ประวัติใบเสนอราคา ({savedQuotes.length})</h4>{loading ? <p className={`text-center text-sm py-10 ${theme.textSub}`}>กำลังโหลด...</p> : (<div className="space-y-3">{savedQuotes.length === 0 && <div className={`text-center py-10 text-sm bg-white rounded-2xl border border-dashed ${theme.border} ${theme.textSub}`}>ไม่มีประวัติการบันทึก</div>}{savedQuotes.map(q => (<div key={q.id} onClick={() => onLoad(q.items)} className={`bg-white p-4 rounded-2xl shadow-sm border border-white cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 group ${theme.cardBorder}`}><div className="flex justify-between items-start"><div><h3 className={`font-bold text-sm transition-colors ${theme.textMain} group-hover:${theme.highlight}`}>{q.name || 'ไม่มีชื่อ'}</h3><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] px-2 py-0.5 rounded-md ${theme.bgSoft} ${theme.textSub}`}>{new Date(q.createdAt).toLocaleDateString('th-TH')}</span><span className={`text-[10px] ${theme.textSub}`}>{q.items.length} รายการ</span></div></div><div className="flex flex-col items-end gap-2"><span className={`font-bold text-sm ${theme.highlight}`}>{formatCurrency(q.total)}</span><button onClick={(e) => deleteQuote(e, q.id)} className={`p-1.5 rounded-lg transition-colors ${theme.textSub} hover:${theme.primary} hover:${theme.bgSoft}`}><Icons.Trash2 size={16} /></button></div></div></div>))}</div>)}</div>)}
            </div>
        </div>
    );
};

export const AdminModal = ({ isOpen, onClose, isLoggedIn, setLoggedIn, config, onSave, theme, onSaveAluminum, aluminumPrices }) => {
    const [passcode, setPasscode] = useState('');
    const [editConfig, setEditConfig] = useState(config);
    const [msg, setMsg] = useState('');
    const [activeAdminTab, setActiveAdminTab] = useState('general');
    const fileInputRef = useRef(null);
    
    const handleLogin = () => { if (passcode === '1988') { setLoggedIn(true); setMsg(''); } else setMsg('รหัสผ่านไม่ถูกต้อง'); };
    const handleReset = () => { if (window.confirm('ต้องการรีเซ็ตค่าทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) setEditConfig(DEFAULT_CONFIG); };
    
    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        window.Papa.parse(file, {
            complete: (results) => {
                const rawData = results.data;
                const header = rawData[0];
                if (!header) return alert('ไฟล์ CSV ไม่ถูกต้อง');
                const widths = header.slice(1).map(h => parseInt(h)); 
                const table = {};
                for (let i = 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    if (row.length < 2) continue; 
                    const height = parseInt(row[0]);
                    if (isNaN(height)) continue;
                    table[height] = {};
                    for (let j = 1; j < row.length; j++) {
                        const price = parseInt(row[j]);
                        if (!isNaN(price) && widths[j-1]) { table[height][widths[j-1]] = price; }
                    }
                }
                onSaveAluminum({ widths, table });
            }
        });
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'ร้านค้า', icon: <Icons.Settings size={16} /> },
        { id: 'menus', label: 'เมนูระบบ', icon: <Icons.CheckCircle size={16} /> },
        { id: 'formulas', label: 'ราคากลาง', icon: <Icons.Calculator size={16} /> },
        { id: 'products', label: 'ฐานข้อมูลสินค้า', icon: <Icons.Box size={16} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 fade-in">
            <div className={`bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] scale-in`}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                    <h3 className={`font-bold text-lg ${theme.textMain} flex items-center gap-2`}><Icons.Wrench className={theme.icon} size={24}/> ตั้งค่าระบบ</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Icons.X size={24} className="text-slate-400" /></button>
                </div>
                
                {!isLoggedIn ? (
                    <div className="p-8 text-center flex-1 flex flex-col justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100"><Icons.Lock size={36} className="text-slate-400" /></div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">เข้าสู่ระบบหลังบ้าน</h2>
                        <p className="text-sm text-slate-500 mb-8">กรุณากรอกรหัสผ่านเพื่อเข้าจัดการระบบ</p>
                        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="รหัสผ่าน" className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xl font-bold mb-4 tracking-widest ${theme.inputRing}`} />
                        {msg && <p className="text-red-500 text-sm mb-4 font-bold animate-pulse">{msg}</p>}
                        <button onClick={handleLogin} className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-95 ${theme.btnPrimary}`}>เข้าสู่ระบบ</button>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex overflow-x-auto gap-2 p-3 bg-slate-50 border-b border-slate-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-inner">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveAdminTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeAdminTab === tab.id ? `${theme.btnPrimary} shadow-md` : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:-translate-y-0.5'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto bg-slate-50/50">
                            {activeAdminTab === 'general' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                            <Icons.Image size={18} className="text-blue-500"/>
                                            <h4 className="font-bold text-slate-700">การแสดงผล</h4>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 mb-1.5 block ml-1">เลือกธีมสี (Theme)</label>
                                            <select value={editConfig.theme} onChange={(e) => setEditConfig({...editConfig, theme: e.target.value})} className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 ${theme.inputRing}`}>
                                                {Object.values(THEMES).map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                            </select>
                                        </div>
                                        <AdminTextInput label="ลิงก์รูปโลโก้ (URL)" value={editConfig.logoUrl} onChange={(v) => setEditConfig({...editConfig, logoUrl: v})} theme={theme} />
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                            <Icons.FileText size={18} className="text-green-500"/>
                                            <h4 className="font-bold text-slate-700">ข้อมูลอ้างอิงใบเสนอราคา</h4>
                                        </div>
                                        <AdminTextInput label="ชื่อร้าน/บริษัท" value={editConfig.companyName} onChange={(v) => setEditConfig({...editConfig, companyName: v})} theme={theme} />
                                        <AdminTextInput label="รายละเอียด/ที่อยู่" value={editConfig.companyDesc} onChange={(v) => setEditConfig({...editConfig, companyDesc: v})} theme={theme} />
                                        <AdminTextInput label="เบอร์โทรติดต่อ" value={editConfig.companyContact} onChange={(v) => setEditConfig({...editConfig, companyContact: v})} theme={theme} />
                                    </div>
                                </div>
                            )}

                            {activeAdminTab === 'menus' && (
                                <div className="animate-fade-in">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                                            <Icons.CheckCircle size={18} className="text-purple-500"/>
                                            <h4 className="font-bold text-slate-700">เปิด-ปิด เมนูคำนวณ</h4>
                                        </div>
                                        <AdminToggle label="ม่านภายนอก" value={editConfig.showExternal} onChange={v => setEditConfig({...editConfig, showExternal: v})} theme={theme} />
                                        <AdminToggle label="ม่านภายใน" value={editConfig.showInternal} onChange={v => setEditConfig({...editConfig, showInternal: v})} theme={theme} />
                                        <AdminToggle label="มู่ลี่ไม้" value={editConfig.showWooden} onChange={v => setEditConfig({...editConfig, showWooden: v})} theme={theme} />
                                        <AdminToggle label="มู่ลี่อลูมิเนียม" value={editConfig.showAluminum} onChange={v => setEditConfig({...editConfig, showAluminum: v})} theme={theme} />
                                        <AdminToggle label="ฉากกั้นห้อง PVC" value={editConfig.showPVC} onChange={v => setEditConfig({...editConfig, showPVC: v})} theme={theme} />
                                        <AdminToggle label="รางม่าน" value={editConfig.showRail} onChange={v => setEditConfig({...editConfig, showRail: v})} theme={theme} />
                                    </div>
                                </div>
                            )}

                            {activeAdminTab === 'formulas' && (
                                <div className="space-y-6 animate-fade-in pb-4">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                            <Icons.Sun size={18} className="text-orange-500"/>
                                            <h4 className="font-bold text-slate-700">ราคากลางม่านม้วน (External)</h4>
                                        </div>
                                        <AdminInput label="ราคาอุปกรณ์ภายนอก" value={editConfig.hardwarePrice} onChange={(v) => setEditConfig({...editConfig, hardwarePrice: v})} unit="บาท" theme={theme} />
                                        <AdminInput label="ราคารางบน" value={editConfig.topRailPrice} onChange={(v) => setEditConfig({...editConfig, topRailPrice: v})} unit="บาท" theme={theme} />
                                        <AdminInput label="ราคารางล่าง" value={editConfig.bottomRailPrice} onChange={(v) => setEditConfig({...editConfig, bottomRailPrice: v})} unit="บาท" theme={theme} />
                                        <AdminInput label="ราคาสลิงข้าง" value={editConfig.slingPrice} onChange={(v) => setEditConfig({...editConfig, slingPrice: v})} unit="บาท" theme={theme} />
                                        <AdminInput label="ตัวคูณสูตรผ้า (เผื่อระยะม้วน)" value={editConfig.fabricFactor} onChange={(v) => setEditConfig({...editConfig, fabricFactor: v})} unit="เท่า" step={0.1} theme={theme} />
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                            <Icons.Blinds size={18} className="text-slate-500"/>
                                            <h4 className="font-bold text-slate-700">ส่วนลดมู่ลี่อลูมิเนียม</h4>
                                        </div>
                                        <AdminInput label="ส่วนลดระบบธรรมดา ขั้นที่ 1 (%)" value={editConfig.alumDiscountStandard1 !== undefined ? editConfig.alumDiscountStandard1 : 60} onChange={(v) => setEditConfig({...editConfig, alumDiscountStandard1: v})} unit="%" theme={theme} />
                                        <AdminInput label="ส่วนลดระบบธรรมดา ขั้นที่ 2 (%)" value={editConfig.alumDiscountStandard2 !== undefined ? editConfig.alumDiscountStandard2 : 5} onChange={(v) => setEditConfig({...editConfig, alumDiscountStandard2: v})} unit="%" theme={theme} />
                                        <AdminInput label="ส่วนลดระบบโซ่วน ขั้นที่ 1 (%)" value={editConfig.alumDiscountChain !== undefined ? editConfig.alumDiscountChain : 60} onChange={(v) => setEditConfig({...editConfig, alumDiscountChain: v})} unit="%" theme={theme} />
                                        <AdminInput label="ส่วนลดระบบโซ่วน ขั้นที่ 2 (%)" value={editConfig.alumDiscountChain2 !== undefined ? editConfig.alumDiscountChain2 : 0} onChange={(v) => setEditConfig({...editConfig, alumDiscountChain2: v})} unit="%" theme={theme} />
                                        <div className="pt-2 border-t border-slate-100 mt-2">
                                            <AdminInput label="ราคาลายไม้ (ต่อ ตร.ม.)" value={editConfig.aluminumWoodPrice} onChange={(v) => setEditConfig({...editConfig, aluminumWoodPrice: v})} unit="บาท" theme={theme} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeAdminTab === 'products' && (
                                <div className="space-y-6 animate-fade-in pb-10">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                                            <Icons.Upload size={18} className="text-blue-500"/>
                                            <h4 className="font-bold text-slate-700">อัปโหลดตารางราคาอลูมิเนียม</h4>
                                        </div>
                                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
                                            <p className="text-xs font-bold text-slate-500 mb-3">{aluminumPrices ? '✅ มีข้อมูลตารางราคาในระบบแล้ว' : '❌ ยังไม่มีข้อมูลตารางราคา'}</p>
                                            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleCSVUpload} />
                                            <button onClick={() => fileInputRef.current.click()} className="text-xs bg-white border border-slate-300 px-4 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-2 mx-auto shadow-sm transition-all active:scale-95">
                                                <Icons.Upload size={14} /> อัปโหลดไฟล์ CSV ใหม่
                                            </button>
                                            <p className="text-[10px] text-slate-400 mt-3">* แถวแรก=ความกว้าง (ซม.), คอลัมน์แรก=ความสูง (ซม.)</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <DynamicListManager title="หมวดหมู่ มู่ลี่ไม้ (Wooden)" items={editConfig.woodenTypes} onUpdate={newItems => setEditConfig({...editConfig, woodenTypes: newItems})} theme={theme} defaultUnit="ตร.ล." itemLabel="รุ่นไม้" />
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <DynamicListManager title="หมวดหมู่ ฉากกั้นห้อง PVC" items={editConfig.pvcTypes} onUpdate={newItems => setEditConfig({...editConfig, pvcTypes: newItems})} theme={theme} defaultUnit="ตร.ล." itemLabel="รุ่นใบ PVC" />
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <DynamicListManager title="หมวดหมู่ รางม่าน" items={editConfig.customRails} onUpdate={newItems => setEditConfig({...editConfig, customRails: newItems})} theme={theme} showUnitSelect={true} itemLabel="รางม่าน" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)] z-10">
                            <div className="flex gap-3 mb-3">
                                <button onClick={handleReset} className="p-4 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm bg-white" title="รีเซ็ตค่าเริ่มต้น"><Icons.RotateCcw size={20} /></button>
                                <button onClick={() => onSave(editConfig)} className={`flex-1 font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${theme.btnPrimary}`}>
                                    <Icons.Save size={20} /> บันทึกการตั้งค่า
                                </button>
                            </div>
                            <button onClick={() => setLoggedIn(false)} className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                                <Icons.LogOut size={14} /> ล็อกเอาต์ออกจากระบบหลังบ้าน
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const BulkEditModal = ({ items, onSave, onClose, theme, recalculateFn }) => {
    const [editedItems, setEditedItems] = useState(items.map(item => ({...item, editPrice: item.unitPrice})));
    const [globalPrice, setGlobalPrice] = useState('');

    const handlePriceChange = (id, newPrice) => {
        setEditedItems(prev => prev.map(item => item.id === id ? { ...item, editPrice: newPrice } : item));
    };

    const handleApplyGlobal = () => {
        if(!globalPrice) return;
        setEditedItems(prev => prev.map(item => ({ ...item, editPrice: globalPrice })));
    };

    const handleSave = () => {
        const finalItems = editedItems.map(item => {
            const price = parseFloat(item.editPrice);
            if (!isNaN(price) && price !== item.unitPrice) {
                return recalculateFn(items.find(i => i.id === item.id), price);
            }
            return items.find(i => i.id === item.id);
        });
        onSave(finalItems);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 fade-in">
            <div className={`bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                <div className="p-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Icons.Edit size={24} className={theme.icon} /> แก้ไขราคาต้นทุน/ราคาผ้า</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Icons.X size={24} /></button>
                </div>
                <div className="p-4 bg-orange-50 border-b border-orange-100 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-orange-600 block mb-1">เปลี่ยนราคาทุกรายการเป็น:</label>
                        <input type="number" value={globalPrice} onChange={e => setGlobalPrice(e.target.value)} className="w-full bg-white border border-orange-200 rounded-lg p-2.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="ระบุราคาใหม่..." />
                    </div>
                    <button onClick={handleApplyGlobal} className={`w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap`}>ใช้กับทั้งหมด</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {editedItems.map((item, index) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 gap-4">
                            <div className="flex-1">
                                <div className="font-bold text-sm">{index + 1}. {item.typeName}</div>
                                <div className="text-xs text-slate-500 mt-1">ขนาด: {item.w_cm}x{item.h_cm} cm | จำนวน: {item.qty} ชุด</div>
                                <div className="text-xs text-slate-400 mt-1">ยอดรวมเดิม: {formatCurrency(items.find(i => i.id === item.id)?.grandTotal)}</div>
                            </div>
                            <div className="w-full sm:w-1/3">
                                <label className="text-xs font-bold text-slate-400 block mb-1">ราคาต่อหน่วย/ราคาผ้า</label>
                                <input 
                                    type="number" 
                                    value={item.editPrice || ''} 
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)} 
                                    className={`input-apple w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-lg text-right ${theme.inputRing}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-5 bg-white border-t flex gap-3">
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors`}>ยกเลิก</button>
                    <button onClick={handleSave} className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-md transition-colors ${theme.btnPrimary}`}>คำนวณใหม่และบันทึก</button>
                </div>
            </div>
        </div>
    );
};
