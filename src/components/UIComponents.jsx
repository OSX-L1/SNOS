import React, { useState } from 'react';
import { Icons } from './Icons.jsx';
import { formatCurrency } from '../config.js';

export const AdminInput = ({ label, value, onChange, unit, step = 1, theme }) => (
    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block ml-1">{label}</label><div className="relative"><input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} step={step} className={`input-apple w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-700 ${theme.inputRing}`} /><span className="absolute right-3 top-3 text-sm font-bold text-slate-400">{unit}</span></div></div>
);

export const AdminTextInput = ({ label, value, onChange, theme }) => (
    <div><label className="text-xs font-bold text-slate-400 mb-1.5 block ml-1">{label}</label><div className="relative"><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={`input-apple w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-700 ${theme.inputRing}`} /></div></div>
);

export const AdminToggle = ({ label, value, onChange, theme }) => (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm"><span className="text-sm font-bold text-slate-700">{label}</span><button onClick={() => onChange(!value)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${value ? theme.toggleActive : 'bg-slate-200'}`}><span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${value ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
);

export const NavButton = ({ active, onClick, icon, label, theme }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-300 group py-1 ${active ? theme.activeTab : theme.inactiveTab}`}>{icon}<span className={`text-[11px] font-bold mt-0.5 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span></button>
);

export const DynamicListManager = ({ title, items = [], onUpdate, theme, defaultUnit = 'บาท', showUnitSelect = false, itemLabel = 'รายการ' }) => {
    const [newItem, setNewItem] = useState({ label: '', price: '', unit: defaultUnit });
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (!newItem.label || !newItem.price) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        const price = parseFloat(newItem.price);
        if (isNaN(price)) return alert('ราคาต้องเป็นตัวเลข');
        
        const nextId = 'item_custom_' + Date.now();
        const updated = [...items, { id: nextId, label: newItem.label, price, unit: showUnitSelect ? newItem.unit : defaultUnit }];
        
        onUpdate(updated);
        setNewItem({ label: '', price: '', unit: defaultUnit });
        setIsAdding(false);
    };

    const handleRemove = (id) => {
        if (window.confirm(`ต้องการลบ${itemLabel}นี้ใช่หรือไม่?`)) {
            onUpdate(items.filter(item => item.id !== id));
        }
    };

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider m-0 flex items-center gap-2">
                    <Icons.Box size={16} className={theme.icon} /> {title}
                </h3>
                <button onClick={() => setIsAdding(!isAdding)} className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${theme.btnSecondary}`}>
                    {isAdding ? <Icons.X size={14}/> : <Icons.Plus size={14}/>} เพิ่ม{itemLabel}
                </button>
            </div>
            
            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-scale-in">
                    <div className="space-y-3">
                        <div><label className="text-[10px] font-bold text-slate-500 block mb-1">ชื่อ{itemLabel}</label><input type="text" value={newItem.label} onChange={e => setNewItem({...newItem, label: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="เช่น รุ่นมาตรฐาน..." /></div>
                        <div className="flex gap-2">
                            <div className="flex-1"><label className="text-[10px] font-bold text-slate-500 block mb-1">ราคา</label><input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300" placeholder="ราคา..." /></div>
                            {showUnitSelect ? (
                                <div className="flex-1"><label className="text-[10px] font-bold text-slate-500 block mb-1">หน่วยคำนวณ</label><select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"><option value="เมตร">ต่อเมตร</option><option value="ชุด">ต่อชุด</option></select></div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-end"><span className="text-sm font-bold text-slate-500 p-2.5 bg-slate-100 rounded-lg border border-transparent">/ {defaultUnit}</span></div>
                            )}
                        </div>
                        <button onClick={handleAdd} className={`w-full py-2.5 mt-2 rounded-lg font-bold text-xs shadow-sm ${theme.btnPrimary}`}>บันทึก{itemLabel}</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {items && items.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            <span className="text-[10px] text-slate-400">ราคา: {formatCurrency(item.price)} {showUnitSelect ? `/ ${item.unit}` : `/ ${defaultUnit}`}</span>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Icons.Trash2 size={16} /></button>
                    </div>
                ))}
                {(!items || items.length === 0) && (
                    <div className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">ไม่มีข้อมูล{itemLabel}</div>
                )}
            </div>
        </div>
    );
};
