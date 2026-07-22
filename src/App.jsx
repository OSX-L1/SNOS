import React, { useState, useEffect } from 'react';
import { THEMES, DEFAULT_CONFIG, db, auth, appId } from './config.js';
import { Icons } from './components/Icons.jsx';
import { NavButton } from './components/UIComponents.jsx';
import { AdminModal, ProfileModal } from './components/Modals.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { StockPage } from './pages/StockPages.jsx';
import { CalculatorPage } from './pages/CalculatorPage.jsx';

export const App = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); 
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [items, setItems] = useState([]);
    const [aluminumPrices, setAluminumPrices] = useState(null);

    const currentTheme = THEMES[config.theme] || THEMES.default;
    
    useEffect(() => { document.body.style.backgroundColor = config.theme === 'apple' ? '#F5F5F7' : '#f8fafc'; }, [config.theme]);
    
    useEffect(() => {
        const manifest = {
            name: "SUNNY Blind System",
            short_name: "SUNNY Blinds",
            start_url: window.location.href,
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#ffffff",
            icons: [
                { src: "https://img2.pic.in.th/SUNNY-LOGO54c76f9eedf06c96.png", sizes: "192x192", type: "image/png" },
                { src: "https://img2.pic.in.th/SUNNY-LOGO54c76f9eedf06c96.png", sizes: "512x512", type: "image/png" }
            ]
        };
        const stringManifest = JSON.stringify(manifest);
        const blob = new Blob([stringManifest], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(blob);
        const linkTag = document.getElementById('manifest-placeholder');
        if(linkTag) linkTag.setAttribute('href', manifestURL);

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); 
            setDeferredPrompt(e);
            console.log("พร้อมติดตั้งแอปแล้ว");
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => { window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt); };
    }, []);
    
    const handleInstallApp = async () => { 
        if (deferredPrompt) { 
            deferredPrompt.prompt(); 
            const { outcome } = await deferredPrompt.userChoice; 
            if (outcome === 'accepted') { setDeferredPrompt(null); }
        } else { 
            alert('หากไม่มีหน้าต่างเด้งขึ้นมา:\n- Android: กดเมนูสามจุดมุมขวาบน > "ติดตั้งแอป" หรือ "เพิ่มลงในหน้าจอหลัก"\n- iOS: กดปุ่ม Share (แชร์) ด้านล่าง > เลือก "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)\n- PC: กดไอคอนติดตั้งที่ด้านขวาของแถบ URL'); 
        } 
    };

    const handleLogin = async () => { if (!auth) return alert("ระบบยังไม่พร้อมใช้งาน"); try { const provider = new window.firebase.auth.GoogleAuthProvider(); await auth.signInWithPopup(provider); } catch (error) { console.error(error); alert("เข้าสู่ระบบล้มเหลว: " + error.message); } };
    const handleLogout = async () => { if (window.confirm("ต้องการออกจากระบบ?")) { await auth.signOut(); setShowProfile(false); setItems([]); } };

    useEffect(() => {
        const loadLocal = () => { 
            const saved = localStorage.getItem('blindAppConfig'); 
            if (saved) {
                try { 
                    const parsed = JSON.parse(saved);
                    if (!parsed.customRails) parsed.customRails = DEFAULT_CONFIG.customRails;
                    if (!parsed.woodenTypes) { parsed.woodenTypes = [ { id: 'wood_basswood', label: 'BASSWOOD', price: parsed.basswoodPrice || 789 }, { id: 'wood_fauxwood', label: 'FAUX WOOD', price: parsed.fauxwoodPrice || 750 } ]; }
                    if (!parsed.pvcTypes) { parsed.pvcTypes = [ { id: 'pvc_85_solid', label: 'ใบ 8.5cm แบบทึบ', price: parsed.pvc85SolidPrice || 320 }, { id: 'pvc_85_japan', label: 'ใบ 8.5cm ญี่ปุ่น', price: parsed.pvc85JapanPrice || 699 }, { id: 'pvc_10_solid', label: 'ใบ 10cm แบบทึบ', price: parsed.pvc10SolidPrice || 290 }, { id: 'pvc_10_japan', label: 'ใบ 10cm ญี่ปุ่น', price: parsed.pvc10JapanPrice || 699 }, { id: 'pvc_euro_la', label: 'ใบ 12.3cm ยูโร LA', price: parsed.pvcEuroLAPrice || 730 }, { id: 'pvc_euro_lb', label: 'ใบ 12.3cm ยูโร LB', price: parsed.pvcEuroLBPrice || 730 }, { id: 'pvc_euro_zigzag', label: 'ใบ 12.3cm ยูโร สลับฟันปลา', price: parsed.pvcEuroZigzagPrice || 730 } ]; }
                    setConfig({ ...DEFAULT_CONFIG, ...parsed }); 
                } catch(e){} 
            } 
        };
        if (!auth || !db) { loadLocal(); return; }
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setIsFirebaseReady(true);
                const configRef = db.doc(`artifacts/${appId}/public/data/config/main`);
                configRef.onSnapshot((docSnap) => { 
                    if (docSnap.exists) {
                        const fetched = docSnap.data();
                        if (!fetched.customRails || fetched.customRails.length === 0) { fetched.customRails = DEFAULT_CONFIG.customRails; }
                        if (!fetched.woodenTypes) { fetched.woodenTypes = [ { id: 'wood_basswood', label: 'BASSWOOD', price: fetched.basswoodPrice || 789 }, { id: 'wood_fauxwood', label: 'FAUX WOOD', price: fetched.fauxwoodPrice || 750 } ]; }
                        if (!fetched.pvcTypes) { fetched.pvcTypes = [ { id: 'pvc_85_solid', label: 'ใบ 8.5cm แบบทึบ', price: fetched.pvc85SolidPrice || 320 }, { id: 'pvc_85_japan', label: 'ใบ 8.5cm ญี่ปุ่น', price: fetched.pvc85JapanPrice || 699 }, { id: 'pvc_10_solid', label: 'ใบ 10cm แบบทึบ', price: fetched.pvc10SolidPrice || 290 }, { id: 'pvc_10_japan', label: 'ใบ 10cm ญี่ปุ่น', price: fetched.pvc10JapanPrice || 699 }, { id: 'pvc_euro_la', label: 'ใบ 12.3cm ยูโร LA', price: fetched.pvcEuroLAPrice || 730 }, { id: 'pvc_euro_lb', label: 'ใบ 12.3cm ยูโร LB', price: fetched.pvcEuroLBPrice || 730 }, { id: 'pvc_euro_zigzag', label: 'ใบ 12.3cm ยูโร สลับฟันปลา', price: fetched.pvcEuroZigzagPrice || 730 } ]; }
                        setConfig({ ...DEFAULT_CONFIG, ...fetched }); 
                    } else { configRef.set(DEFAULT_CONFIG).catch(console.error); }
                }, () => loadLocal());
                const profileRef = db.doc(`artifacts/${appId}/users/${currentUser.uid}/profile/info`);
                profileRef.onSnapshot(doc => { setUserProfile(doc.exists ? doc.data() : null); });
                const aluminumRef = db.doc(`artifacts/${appId}/public/data/price_tables/aluminum`);
                aluminumRef.onSnapshot(doc => { if(doc.exists) setAluminumPrices(doc.data()); });
            } else { loadLocal(); setUserProfile(null); }
        });
        return () => unsubscribeAuth();
    }, []);

    const saveConfig = async (newConfig) => { setConfig(newConfig); if (db && user) { try { await db.doc(`artifacts/${appId}/public/data/config/main`).set(newConfig); } catch (e) { alert('บันทึกออนไลน์ไม่สำเร็จ บันทึกในเครื่องแทน'); localStorage.setItem('blindAppConfig', JSON.stringify(newConfig)); } } else { localStorage.setItem('blindAppConfig', JSON.stringify(newConfig)); alert('บันทึกในเครื่องเรียบร้อย (โหมดออฟไลน์)'); } };
    const saveAluminumTable = async (data) => { if (db && user) { try { await db.doc(`artifacts/${appId}/public/data/price_tables/aluminum`).set(data); alert('บันทึกตารางราคาเรียบร้อย'); } catch (e) { alert("บันทึกตารางราคาไม่สำเร็จ: " + e.message); } } else { alert("กรุณาเข้าสู่ระบบก่อนบันทึก"); } }
    const saveUserProfile = async (newProfile) => { if (db && user) { try { await db.doc(`artifacts/${appId}/users/${user.uid}/profile/info`).set(newProfile, { merge: true }); alert("บันทึกข้อมูลโปรไฟล์เรียบร้อย"); } catch (e) { alert("บันทึกโปรไฟล์ไม่สำเร็จ: " + e.message); } } };
    const loadQuotation = (savedItems) => { setItems(savedItems); setShowProfile(false); setActiveTab('calculator'); };

    return (
        <div className={`min-h-screen pb-24 ${currentTheme.textMain}`}>
            <div className={`max-w-md mx-auto min-h-screen relative ${currentTheme.bgApp} sm:shadow-2xl sm:my-4 sm:rounded-[40px] sm:min-h-[calc(100vh-2rem)] overflow-hidden border border-white/50 transition-colors duration-500`}>
                <div className={`h-16 w-full absolute top-0 z-30 flex justify-between items-center px-6 sticky ${config.theme === 'apple' ? 'glass' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}><div className="flex items-center gap-2">{activeTab !== 'home' && (<img src={config.logoUrl} alt="Logo" className="h-14 w-auto object-contain drop-shadow-sm fade-in" style={{filter: currentTheme.logoFilter}} onError={(e) => e.target.style.display = 'none'} />)}</div><div className="flex items-center gap-3">{user ? (<button className="flex items-center gap-2 focus:outline-none hover:scale-105 transition-transform" onClick={() => setShowProfile(true)}><img src={userProfile?.photoURL || user.photoURL} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" alt="User" /></button>) : (<button onClick={handleLogin} className={`flex items-center gap-2 text-sm font-bold bg-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 border ${currentTheme.border}`}><Icons.Google size={28} className="text-red-600" /> <span className={currentTheme.textMain}>เข้าสู่ระบบด้วย Gmail</span></button>)}</div></div>
                {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} config={config} onInstall={handleInstallApp} theme={currentTheme} />}
                {activeTab === 'stock' && <StockPage theme={currentTheme} />}
                {activeTab === 'calculator' && <CalculatorPage config={config} items={items} setItems={setItems} user={user} onLogin={handleLogin} userProfile={userProfile} theme={currentTheme} aluminumPrices={aluminumPrices} db={db} appId={appId} />}
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[380px] rounded-3xl p-2 flex justify-around items-center z-50 ${config.theme === 'apple' ? 'glass-panel' : 'bg-white/90 backdrop-blur-lg shadow-lg border border-gray-100'}`}><NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Icons.Home size={24} />} label="หน้าหลัก" theme={currentTheme} /><NavButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<Icons.Box size={24} />} label="สต็อก" theme={currentTheme} /><NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<Icons.Calculator size={24} />} label="คำนวณ" theme={currentTheme} /><NavButton active={showAdmin} onClick={() => setShowAdmin(true)} icon={<Icons.Settings size={24} />} label="ตั้งค่า" theme={currentTheme} /></div>
                {showAdmin && (<AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} isLoggedIn={isAdminLoggedIn} setLoggedIn={setIsAdminLoggedIn} config={config} onSave={saveConfig} theme={currentTheme} onSaveAluminum={saveAluminumTable} aluminumPrices={aluminumPrices} />)}
                {showProfile && user && (<ProfileModal user={user} userProfile={userProfile} onClose={() => setShowProfile(false)} onLogout={handleLogout} onLoad={loadQuotation} onSaveProfile={saveUserProfile} theme={currentTheme} />)}
            </div>
        </div>
    );
};
