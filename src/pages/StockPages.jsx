import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons.jsx';

export const WoodStockChecker = ({ theme, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1132498145&single=true&output=csv';

    const sizeMap = [
        { label: '4.0 ft', keys: ['4ft', '4.0', '4.00'] },
        { label: '4.5 ft', keys: ['4.5ft', '4.5', '4.50'] },
        { label: '5.0 ft', keys: ['5ft', '5.0', '5.00'] },
        { label: '5.5 ft', keys: ['5.5ft', '5.5', '5.50'] },
        { label: '6.0 ft', keys: ['6ft', '6.0', '6.00'] },
        { label: '6.5 ft', keys: ['6.5ft', '6.5', '6.50'] },
        { label: '7.0 ft', keys: ['7ft', '7.0', '7.00'] },
        { label: '8.0 ft', keys: ['8ft', '8.0', '8.00'] }
    ];

    useEffect(() => {
        setLoading(true);
        window.Papa.parse(SHEET_URL, {
            download: true,
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const mergedData = preprocessData(results.data);
                setData(mergedData);
                setLoading(false);
            },
            error: (err) => {
                console.error(err);
                setError('ไม่สามารถดึงข้อมูลสต็อกได้');
                setLoading(false);
            }
        });
    }, []);

    const preprocessData = (rows) => {
        if (!rows || rows.length < 2) return [];
        let headerRowIndex = -1;
        let codeIdx = -1;
        let nameIdx = -1;
        const columnIndices = {};
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const row = rows[i].map(c => String(c).trim().toLowerCase());
            const hasSize = row.some(c => c.includes('4ft') || c.includes('4.0'));
            const hasCode = row.some(c => c === 'code' || c === 'รหัส' || c.includes('รหัสสินค้า') || c.includes('code'));
            if (hasSize || hasCode) {
                headerRowIndex = i;
                codeIdx = row.findIndex(c => c === 'code' || c === 'รหัส' || c.includes('code') || c.includes('รหัสสินค้า'));
                if (codeIdx === -1) codeIdx = 0;
                nameIdx = row.findIndex(c => c === 'name' || c === 'ชื่อ' || c.includes('name') || c.includes('ชื่อสินค้า'));
                if (nameIdx === -1 || nameIdx === codeIdx) nameIdx = codeIdx + 1;
                sizeMap.forEach(size => {
                    const idx = row.findIndex(cell => size.keys.some(k => cell.replace(/\s/g,'').includes(k)));
                    if (idx !== -1) columnIndices[size.label] = idx;
                });
                break;
            }
        }
        if (headerRowIndex === -1) {
            headerRowIndex = 0; codeIdx = 0; nameIdx = 1;
            let currentDataCol = 2;
            sizeMap.forEach(size => {
                if (columnIndices[size.label] === undefined) {
                    columnIndices[size.label] = currentDataCol++;
                }
            });
        }
        const processed = [];
        let currentRow = null;
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue;
            const rawCode = row[codeIdx];
            const rawName = row[nameIdx];
            if (rawCode && String(rawCode).trim().length > 0) {
                currentRow = { code: String(rawCode).trim(), name: rawName ? String(rawName).trim() : '', stock: {} };
                sizeMap.forEach(size => {
                    const colIdx = columnIndices[size.label];
                    if (colIdx !== undefined && colIdx < row.length) {
                        const val = parseFloat(String(row[colIdx]).replace(/,/g, ''));
                        currentRow.stock[size.label] = !isNaN(val) ? val : 0;
                    } else { currentRow.stock[size.label] = 0; }
                });
                processed.push(currentRow);
            } else if (currentRow) {
                 sizeMap.forEach(size => {
                    const colIdx = columnIndices[size.label];
                    if (colIdx !== undefined && colIdx < row.length) {
                        const val = parseFloat(String(row[colIdx]).replace(/,/g, ''));
                        if (!isNaN(val)) currentRow.stock[size.label] += val;
                    }
                });
            }
        }
        return processed;
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length > 1) {
            const lower = val.toLowerCase();
            setSuggestions(data.filter(item => item.code.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower)).slice(0, 10));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (item) => {
        setSearchQuery(item.code);
        setSearchResult(item);
        setError('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const query = searchQuery.trim().toLowerCase();
        let found = data.find(item => item.code.toLowerCase() === query);
        if (!found) found = data.find(item => item.code.toLowerCase().includes(query));
        if (found) { setSearchResult(found); setError(''); }
        else { setSearchResult(null); setError(`ไม่พบรหัส: ${searchQuery}`); }
        setShowSuggestions(false);
    };

    return (
        <div className="pt-20 px-5 pb-40 fade-in h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className={`p-2 rounded-full border bg-white ${theme.border} ${theme.textSub}`}><Icons.ChevronDown className="rotate-90" size={20} /></button><h2 className={`text-xl font-bold ${theme.textMain}`}>เช็คสต็อกมู่ลี่ไม้</h2></div>
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${theme.border} mb-6 relative`}>
                <form onSubmit={handleSearch} className="relative">
                    <input type="text" value={searchQuery} onChange={handleInputChange} onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)} placeholder="พิมพ์รหัสสินค้า (เช่น B35-36)" className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-lg ${theme.textMain} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100`} />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Box size={24} /></div>
                    <button type="submit" className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-sm transition-colors ${theme.btnPrimary} flex items-center justify-center`} disabled={loading}>{loading ? '...' : 'ค้นหา'}</button>
                </form>
                <button onClick={() => setShowAll(true)} disabled={loading || data.length === 0} className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-colors border ${theme.border} ${theme.textSub} bg-white flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50`}><Icons.FileText size={16}/> ดูตารางสต็อกทั้งหมด ({data.length})</button>
                {showSuggestions && suggestions.length > 0 && (<div className="absolute top-16 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto">{suggestions.map((item, idx) => (<div key={idx} onClick={() => handleSuggestionClick(item)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"><div className="flex flex-col"><span className="font-bold text-slate-700">{item.code}</span><span className="text-[10px] text-slate-400">{item.name}</span></div><span className="text-xs text-slate-400">เลือก</span></div>))}</div>)}
                {error && <div className="mt-3 text-red-500 text-sm font-bold flex items-center gap-2"><Icons.AlertCircle size={16}/> {error}</div>}
            </div>
            {showAll && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 fade-in">
                    <div className={`bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                         <div className="p-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md"><h3 className="font-bold text-lg">สต็อกทั้งหมด ({data.length})</h3><button onClick={() => setShowAll(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Icons.X size={24} /></button></div>
                         <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm border-collapse border border-slate-200">
                                <thead className="bg-slate-100 sticky top-0 shadow-sm z-10 text-slate-600"><tr><th className="p-3 text-left bg-slate-100 min-w-[150px] border border-slate-300">สินค้า (รหัส/ชื่อ)</th>{sizeMap.map((col, i) => <th key={i} className="p-3 text-center whitespace-nowrap bg-slate-100 border border-slate-300">{col.label}</th>)}</tr></thead>
                                <tbody className="divide-y divide-slate-100">{data.filter(item => item.name !== 'Unknown').map((item, i) => (<tr key={i} className="hover:bg-slate-50 transition-colors"><td className="p-3 border border-slate-200 align-top"><div className="text-lg font-black text-slate-800 font-mono tracking-tight">{item.code}</div><div className="text-xs text-slate-500 mt-0.5">{item.name}</div></td>{sizeMap.map((col, j) => { const val = item.stock[col.label]; const hasStock = val > 0; return <td key={j} className={`p-3 text-center border border-slate-200 align-middle ${hasStock ? 'text-green-600 font-bold bg-green-50/20' : 'bg-red-50/10'}`}>{hasStock ? val : <span className="text-red-500 text-[10px] font-bold">สินค้าหมด</span>}</td> })}</tr>))}</tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}
            {searchResult && (
                <div className="animate-scale-in">
                    <div className={`bg-white rounded-[2rem] overflow-hidden shadow-lg border ${theme.border}`}>
                        <div className={`${theme.bgSoft} p-5 border-b border-white/50`}><h3 className={`text-4xl font-black ${theme.textMain} font-mono tracking-tight`}>{searchResult.code}</h3><p className={`text-sm ${theme.textSub} mt-2 font-medium`}>{searchResult.name}</p></div>
                        <div className="p-5 grid grid-cols-3 gap-3">{sizeMap.map((col, i) => { const val = searchResult.stock[col.label]; const hasStock = val > 0; return (<div key={i} className={`relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${hasStock ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}><div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ความกว้าง</span><span className={`w-2 h-2 rounded-full ${hasStock ? 'bg-green-500' : 'bg-slate-300'}`}></span></div><div className="text-lg font-bold text-slate-700">{col.label}</div><div className="mt-3 flex items-end justify-between">{hasStock ? <span className="text-3xl font-black tracking-tighter text-slate-800">{val}</span> : <span className="text-lg font-bold text-red-500">สินค้าหมด</span>}</div></div>) })}</div>
                        {showDebug && <div className="p-4 bg-slate-800 text-white text-xs"><pre>{JSON.stringify(searchResult, null, 2)}</pre></div>}
                        <div className="text-center p-2"><button onClick={() => setShowDebug(!showDebug)} className="text-[10px] text-slate-400 underline">{showDebug ? 'Hide' : 'Debug'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RollerStockChecker = ({ theme, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1019928538&single=true&output=csv';

    useEffect(() => { setLoading(true); window.Papa.parse(SHEET_URL, { download: true, header: false, skipEmptyLines: true, complete: (res) => { setData(res.data); setLoading(false); }, error: () => setLoading(false) }); }, []);
    const handleInputChange = (e) => { const val = e.target.value; setSearchQuery(val); if (val.length > 1) { const lower = val.toLowerCase(); setSuggestions(data.filter(row => String(row[0]).toLowerCase().includes(lower)).slice(0, 10)); setShowSuggestions(true); } else { setSuggestions([]); setShowSuggestions(false); } };
    const handleSearch = (e) => { e.preventDefault(); const found = data.find(row => String(row[0]).toLowerCase().includes(searchQuery.toLowerCase())); if(found){ setSearchResult(found); setError(''); } else { setSearchResult(null); setError('ไม่พบ'); } setShowSuggestions(false); };

    return (
        <div className="pt-20 px-5 pb-40 fade-in h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className={`p-2 rounded-full border bg-white ${theme.border} ${theme.textSub}`}><Icons.ChevronDown className="rotate-90" size={20} /></button><h2 className={`text-xl font-bold ${theme.textMain}`}>เช็คสต็อกม่านม้วน</h2></div>
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${theme.border} mb-6 relative`}><form onSubmit={handleSearch} className="relative"><input type="text" value={searchQuery} onChange={handleInputChange} onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)} placeholder="พิมพ์รหัสสินค้า..." className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-lg ${theme.textMain} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100`} /><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Box size={24} /></div><button type="submit" className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-sm transition-colors ${theme.btnPrimary} flex items-center justify-center`} disabled={loading}>{loading ? '...' : 'ค้นหา'}</button></form>
            <button onClick={() => setShowAll(true)} disabled={loading || data.length === 0} className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-colors border ${theme.border} ${theme.textSub} bg-white flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50`}><Icons.FileText size={16}/> ดูตารางสต็อกทั้งหมด ({data.length})</button>
            {showSuggestions && suggestions.length > 0 && (<div className="absolute top-16 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto">{suggestions.map((row, idx) => (<div key={idx} onClick={() => { setSearchQuery(row[0]); setSearchResult(row); setShowSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"><div className="flex flex-col"><span className="font-bold text-slate-700">{row[0]}</span><span className="text-[10px] text-slate-400">{row[1]}</span></div></div>))}</div>)}{error && <div className="mt-3 text-red-500 text-sm font-bold flex items-center gap-2"><Icons.AlertCircle size={16}/> {error}</div>}</div>
            {showAll && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 fade-in">
                    <div className={`bg-white rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                         <div className="p-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md"><h3 className="font-bold text-lg">สต็อกทั้งหมด ({data.length})</h3><button onClick={() => setShowAll(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Icons.X size={24} /></button></div>
                         <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm border-collapse border border-slate-200">
                                <thead className="bg-slate-100 sticky top-0 shadow-sm z-10 text-slate-600"><tr><th className="p-3 text-left bg-slate-100 border border-slate-300">รหัสสินค้า</th><th className="p-3 text-left bg-slate-100 border border-slate-300">ชื่อสินค้า</th><th className="p-3 text-right bg-slate-100 border border-slate-300">คงเหลือ</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{data.map((row, i) => { const qty = parseFloat(row[2]); const hasStock = qty > 0; return (<tr key={i} className="hover:bg-slate-50 transition-colors"><td className="p-3 font-bold text-slate-700 font-mono border border-slate-200">{row[0]}</td><td className="p-3 text-slate-600 border border-slate-200">{row[1]}</td><td className={`p-3 text-right font-bold border border-slate-200 ${hasStock ? 'text-green-600' : 'bg-red-50/20'}`}>{hasStock ? row[2] : <span className="text-red-500 text-xs font-bold">สินค้าหมด</span>}</td></tr>)})}</tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}
            {searchResult && (
                <div className="animate-scale-in">
                    <div className={`bg-white rounded-[2rem] overflow-hidden shadow-lg border ${theme.border} text-center p-8`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textSub} mb-2`}>สินค้า</h3>
                        <div className={`text-3xl font-bold ${theme.textMain} mb-6`}>{searchResult[1]}</div>
                        <div className="w-full h-px bg-slate-100 mb-6"></div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textSub} mb-2`}>จำนวนคงเหลือ</h3>
                        {parseFloat(searchResult[2]) > 0 ? <div className={`text-6xl font-black ${theme.highlight}`}>{searchResult[2]}</div> : <div className="text-4xl font-bold text-red-500">สินค้าหมด</div>}
                        <div className="mt-2 text-sm text-slate-400">หน่วย (ถ้ามี)</div>
                        {showDebug && <div className="mt-8 p-4 bg-slate-800 text-white text-xs text-left"><pre>{JSON.stringify(searchResult, null, 2)}</pre></div>}
                        <button onClick={() => setShowDebug(!showDebug)} className="mt-4 text-[10px] text-slate-300 underline">{showDebug ? 'Hide' : 'Debug'}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AluminumStockChecker = ({ theme, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1880232984&single=true&output=csv';

    useEffect(() => { setLoading(true); window.Papa.parse(SHEET_URL, { download: true, header: false, skipEmptyLines: true, complete: (res) => { setData(res.data); setLoading(false); }, error: () => setLoading(false) }); }, []);
    const handleInputChange = (e) => { const val = e.target.value; setSearchQuery(val); if (val.length > 1) { const lower = val.toLowerCase(); setSuggestions(data.filter(row => String(row[0]).toLowerCase().includes(lower)).slice(0, 10)); setShowSuggestions(true); } else { setSuggestions([]); setShowSuggestions(false); } };
    const handleSearch = (e) => { e.preventDefault(); const found = data.find(row => String(row[0]).toLowerCase().includes(searchQuery.toLowerCase())); if(found){ setSearchResult(found); setError(''); } else { setSearchResult(null); setError('ไม่พบ'); } setShowSuggestions(false); };

    return (
        <div className="pt-20 px-5 pb-40 fade-in h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className={`p-2 rounded-full border bg-white ${theme.border} ${theme.textSub}`}><Icons.ChevronDown className="rotate-90" size={20} /></button><h2 className={`text-xl font-bold ${theme.textMain}`}>เช็คสต็อกมู่ลี่อลูมิเนียม</h2></div>
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${theme.border} mb-6 relative`}><form onSubmit={handleSearch} className="relative"><input type="text" value={searchQuery} onChange={handleInputChange} onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)} placeholder="พิมพ์รหัสสินค้า..." className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-lg ${theme.textMain} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100`} /><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Box size={24} /></div><button type="submit" className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-sm transition-colors ${theme.btnPrimary} flex items-center justify-center`} disabled={loading}>{loading ? '...' : 'ค้นหา'}</button></form>
            <button onClick={() => setShowAll(true)} disabled={loading || data.length === 0} className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-colors border ${theme.border} ${theme.textSub} bg-white flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50`}><Icons.FileText size={16}/> ดูตารางสต็อกทั้งหมด ({data.length})</button>
            {showSuggestions && suggestions.length > 0 && (<div className="absolute top-16 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto">{suggestions.map((row, idx) => (<div key={idx} onClick={() => { setSearchQuery(row[0]); setSearchResult(row); setShowSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"><div className="flex flex-col"><span className="font-bold text-slate-700">{row[0]}</span><span className="text-[10px] text-slate-400">{row[1]}</span></div></div>))}</div>)}{error && <div className="mt-3 text-red-500 text-sm font-bold flex items-center gap-2"><Icons.AlertCircle size={16}/> {error}</div>}</div>
            {showAll && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 fade-in">
                    <div className={`bg-white rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                         <div className="p-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md"><h3 className="font-bold text-lg">สต็อกทั้งหมด ({data.length})</h3><button onClick={() => setShowAll(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Icons.X size={24} /></button></div>
                         <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm border-collapse border border-slate-200">
                                <thead className="bg-slate-100 sticky top-0 shadow-sm z-10 text-slate-600"><tr><th className="p-3 text-left bg-slate-100 border border-slate-300">รหัสสินค้า</th><th className="p-3 text-left bg-slate-100 border border-slate-300">ชื่อสินค้า</th><th className="p-3 text-right bg-slate-100 border border-slate-300">คงเหลือ</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">{data.map((row, i) => { const qty = parseFloat(row[2]); const hasStock = qty > 0; return (<tr key={i} className="hover:bg-slate-50 transition-colors"><td className="p-3 font-bold text-slate-700 font-mono border border-slate-200">{row[0]}</td><td className="p-3 text-slate-600 border border-slate-200">{row[1]}</td><td className={`p-3 text-right font-bold border border-slate-200 ${hasStock ? 'text-green-600' : 'bg-red-50/20'}`}>{hasStock ? row[2] : <span className="text-red-500 text-xs font-bold">สินค้าหมด</span>}</td></tr>)})}</tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}
            {searchResult && (
                <div className="animate-scale-in">
                    <div className={`bg-white rounded-[2rem] overflow-hidden shadow-lg border ${theme.border} text-center p-8`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textSub} mb-2`}>สินค้า</h3>
                        <div className={`text-3xl font-bold ${theme.textMain} mb-6`}>{searchResult[1]}</div>
                        <div className="w-full h-px bg-slate-100 mb-6"></div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textSub} mb-2`}>จำนวนคงเหลือ</h3>
                        {parseFloat(searchResult[2]) > 0 ? <div className={`text-6xl font-black ${theme.highlight}`}>{searchResult[2]}</div> : <div className="text-4xl font-bold text-red-500">สินค้าหมด</div>}
                        <div className="mt-2 text-sm text-slate-400">หน่วย (ถ้ามี)</div>
                        {showDebug && <div className="mt-8 p-4 bg-slate-800 text-white text-xs text-left"><pre>{JSON.stringify(searchResult, null, 2)}</pre></div>}
                        <button onClick={() => setShowDebug(!showDebug)} className="mt-4 text-[10px] text-slate-300 underline">{showDebug ? 'Hide' : 'Debug'}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const PVCStockChecker = ({ theme, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQz2OtjzRBmeUmLOTSgJ-Bt2woZPiR9QyzvIWcBXacheG3IplefFZE66yWYE43qVRQo2DAOPu9UClh5/pub?gid=1230787558&single=true&output=csv';
    const heightColumns = ['2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.30', '3.50', '3.70', '3.75'];

    useEffect(() => { setLoading(true); window.Papa.parse(SHEET_URL, { download: true, header: false, skipEmptyLines: true, complete: (results) => { setData(preprocessData(results.data)); setLoading(false); }, error: () => { setError('ไม่สามารถดึงข้อมูลสต็อกได้'); setLoading(false); } }); }, []);

    const preprocessData = (rows) => {
        if (!rows || rows.length < 2) return [];
        let headerRowIndex = -1; let codeIdx = -1; let nameIdx = -1; let heightStartIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
            const row = rows[i].map(cell => String(cell).trim().toLowerCase());
            const hIdx = row.findIndex(c => c.includes('2.00') || c.includes('ความสูง'));
            const cIdx = row.findIndex(c => c === 'code' || c === 'รหัส' || c.includes('product code') || c.includes('รหัสสินค้า'));
            if (hIdx !== -1 || cIdx !== -1) {
                headerRowIndex = i; heightStartIdx = hIdx !== -1 ? hIdx : 2; codeIdx = cIdx !== -1 ? cIdx : 0;
                const nIdx = row.findIndex(c => c === 'name' || c === 'ชื่อ' || c.includes('product name') || c.includes('ชื่อสินค้า'));
                nameIdx = nIdx !== -1 ? nIdx : (codeIdx === 0 ? 1 : 0);
                if (nameIdx === codeIdx) nameIdx = codeIdx + 1;
                break;
            }
        }
        if (headerRowIndex === -1) { console.warn("No header detected, using fallback indices."); headerRowIndex = 0; codeIdx = 0; nameIdx = 1; heightStartIdx = 2; }
        const processed = []; let currentRow = null;
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i]; if (!row || row.length < 2) continue;
            const rawCode = row[codeIdx]; const rawName = row[nameIdx];
            if (rawCode && String(rawCode).trim().length > 0) {
                currentRow = { code: String(rawCode).trim(), name: rawName ? String(rawName).trim() : 'Unknown', stock: {} };
                heightColumns.forEach((hKey, index) => {
                    const colIdx = heightStartIdx + index;
                    if (colIdx < row.length) { const valStr = String(row[colIdx] || '').replace(/,/g, '').trim(); const val = parseFloat(valStr); currentRow.stock[hKey] = !isNaN(val) ? val : 0; } else { currentRow.stock[hKey] = 0; }
                });
                processed.push(currentRow);
            } else if (currentRow) {
                 heightColumns.forEach((hKey, index) => {
                    const colIdx = heightStartIdx + index;
                    if (colIdx < row.length) { const valStr = String(row[colIdx] || '').replace(/,/g, '').trim(); const val = parseFloat(valStr); if (!isNaN(val)) { currentRow.stock[hKey] = (currentRow.stock[hKey] || 0) + val; } }
                });
            }
        }
        return processed;
    };

    const handleInputChange = (e) => { const val = e.target.value; setSearchQuery(val); if (val.length > 1) { const lower = val.toLowerCase(); setSuggestions(data.filter(item => item.code.toLowerCase().includes(lower) || item.name.toLowerCase().includes(lower)).slice(0, 10)); setShowSuggestions(true); } else { setSuggestions([]); setShowSuggestions(false); } };
    const handleSearch = (e) => { e.preventDefault(); const query = searchQuery.toLowerCase(); let found = data.find(item => item.code.toLowerCase() === query); if (!found) found = data.find(item => item.code.toLowerCase().includes(query)); if(found) { setSearchResult(found); setError(''); } else { setSearchResult(null); setError('ไม่พบข้อมูล'); } setShowSuggestions(false); };

    return (
        <div className="pt-20 px-5 pb-40 fade-in h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className={`p-2 rounded-full border bg-white ${theme.border} ${theme.textSub}`}><Icons.ChevronDown className="rotate-90" size={20} /></button><h2 className={`text-xl font-bold ${theme.textMain}`}>เช็คสต็อกฉาก PVC</h2></div>
            <div className={`bg-white rounded-[2rem] p-6 shadow-sm border ${theme.border} mb-6 relative`}>
                <form onSubmit={handleSearch} className="relative"><input type="text" value={searchQuery} onChange={handleInputChange} onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)} placeholder="พิมพ์รหัสสินค้า..." className={`input-apple w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 font-bold text-lg ${theme.textMain} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100`} /><div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Box size={24} /></div><button type="submit" className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-sm transition-colors ${theme.btnPrimary} flex items-center justify-center`} disabled={loading}>{loading ? '...' : 'ค้นหา'}</button></form>
                <button onClick={() => setShowAll(true)} disabled={loading || data.length === 0} className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-colors border ${theme.border} ${theme.textSub} bg-white flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50`}><Icons.FileText size={16}/> ดูตารางสต็อกทั้งหมด ({data.length})</button>
                {showSuggestions && suggestions.length > 0 && (<div className="absolute top-16 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto">{suggestions.map((item, idx) => (<div key={idx} onClick={() => { setSearchQuery(item.code); setSearchResult(item); setShowSuggestions(false); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"><div className="flex flex-col"><span className="font-bold text-slate-700">{item.code}</span><span className="text-[10px] text-slate-400">{item.name}</span></div></div>))}</div>)}
                {error && <div className="mt-3 text-red-500 text-sm font-bold flex items-center gap-2"><Icons.AlertCircle size={16}/> {error}</div>}
            </div>
            {showAll && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 fade-in">
                    <div className={`bg-white rounded-[2rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in ${theme.textMain}`}>
                         <div className="p-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md"><h3 className="font-bold text-lg">สต็อกทั้งหมด ({data.length})</h3><button onClick={() => setShowAll(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Icons.X size={24} /></button></div>
                         <div className="flex-1 overflow-auto p-0">
                            <table className="w-full text-sm border-collapse border border-slate-200">
                                <thead className="bg-slate-100 sticky top-0 shadow-sm z-10 text-slate-600"><tr><th className="p-3 text-left bg-slate-100 min-w-[150px] border border-slate-300">สินค้า (รหัส/ชื่อ)</th>{heightColumns.map((h, i) => <th key={i} className="p-3 text-center whitespace-nowrap bg-slate-100 border border-slate-300">{h} ม.</th>)}</tr></thead>
                                <tbody className="divide-y divide-slate-100">{data.filter(item => item.name !== 'Unknown').map((item, i) => (<tr key={i} className="hover:bg-slate-50 transition-colors"><td className="p-3 border border-slate-200 align-top"><div className="text-lg font-black text-slate-800 font-mono tracking-tight">{item.code}</div><div className="text-xs text-slate-500 mt-0.5">{item.name}</div></td>{heightColumns.map((hKey, j) => { const val = item.stock[hKey]; const hasStock = val > 0; return <td key={j} className={`p-3 text-center border border-slate-200 align-middle ${hasStock ? 'text-green-600 font-bold bg-green-50/20' : 'bg-red-50/10'}`}>{hasStock ? val : <span className="text-red-500 text-[10px] font-bold">สินค้าหมด</span>}</td> })}</tr>))}</tbody>
                            </table>
                         </div>
                    </div>
                </div>
            )}
            {searchResult && (
                <div className="animate-scale-in">
                    <div className={`bg-white rounded-[2rem] overflow-hidden shadow-lg border ${theme.border}`}>
                        <div className={`${theme.bgSoft} p-5 border-b border-white/50`}><h3 className={`text-4xl font-black ${theme.textMain} font-mono tracking-tight`}>{searchResult.code}</h3><p className={`text-sm ${theme.textSub} mt-2 font-medium`}>{searchResult.name}</p></div>
                        <div className="p-5 grid grid-cols-3 gap-3">{heightColumns.map((hKey, index) => { const val = searchResult.stock[hKey]; const hasStock = val > 0; return (<div key={index} className={`relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${hasStock ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}><div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ความสูง</span><span className={`w-2 h-2 rounded-full ${hasStock ? 'bg-green-500' : 'bg-slate-300'}`}></span></div><div className="text-lg font-bold text-slate-700">{hKey} ม.</div><div className="mt-3 flex items-end justify-between">{hasStock ? <span className="text-3xl font-black tracking-tighter text-slate-800">{val}</span> : <span className="text-lg font-bold text-red-500">สินค้าหมด</span>}</div></div>) })}</div>
                        {showDebug && <div className="p-4 bg-slate-800 text-white text-xs overflow-x-auto"><pre>{JSON.stringify(searchResult, null, 2)}</pre></div>}
                        <div className="text-center p-2"><button onClick={() => setShowDebug(!showDebug)} className="text-[10px] text-slate-400 underline">{showDebug ? 'Hide' : 'Debug'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StockPage = ({ theme }) => {
    const [subPage, setSubPage] = useState(null);
    if (subPage === 'wood') return <WoodStockChecker theme={theme} onBack={() => setSubPage(null)} />;
    if (subPage === 'roller') return <RollerStockChecker theme={theme} onBack={() => setSubPage(null)} />;
    if (subPage === 'aluminum') return <AluminumStockChecker theme={theme} onBack={() => setSubPage(null)} />;
    if (subPage === 'pvc') return <PVCStockChecker theme={theme} onBack={() => setSubPage(null)} />;
    return (
        <div className="pt-24 px-5 pb-40 fade-in h-full flex flex-col">
            <h2 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>เช็คสต็อกสินค้า</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSubPage('wood')} className={`bg-white p-6 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all flex flex-col items-center gap-3 group`}><div className={`p-4 rounded-full ${theme.bgSoft} ${theme.primary}`}><Icons.Blinds size={32} /></div><span className={`font-bold ${theme.textMain}`}>มู่ลี่ไม้</span></button>
                <button onClick={() => setSubPage('roller')} className={`bg-white p-6 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all flex flex-col items-center gap-3 group`}><div className={`p-4 rounded-full ${theme.bgSoft} ${theme.primary}`}><Icons.Roller size={32} /></div><span className={`font-bold ${theme.textMain}`}>ม่านม้วน</span></button>
                <button onClick={() => setSubPage('aluminum')} className={`bg-white p-6 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all flex flex-col items-center gap-3 group`}><div className={`p-4 rounded-full ${theme.bgSoft} ${theme.primary}`}><Icons.Blinds size={32} /></div><span className={`font-bold ${theme.textMain}`}>มู่ลี่อลูมิเนียม</span></button>
                <button onClick={() => setSubPage('pvc')} className={`bg-white p-6 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all flex flex-col items-center gap-3 group`}><div className={`p-4 rounded-full ${theme.bgSoft} ${theme.primary}`}><Icons.Fold size={32} /></div><span className={`font-bold ${theme.textMain}`}>ฉาก PVC</span></button>
            </div>
        </div>
    );
};
