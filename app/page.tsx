'use client';
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    }
  }
}

export default function Home() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    const initTelegramApp = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webapp = window.Telegram.WebApp;
        webapp.ready();
        setTg(webapp);
        
        if (webapp.initDataUnsafe?.user) {
          setUserInfo(webapp.initDataUnsafe.user);
        }

        webapp.MainButton.setParams({
          text: 'SEND DATA',
          color: '#2ea6ff',
        });

        webapp.setHeaderColor('#2ea6ff');
        webapp.expand();
      }
    };

    // Add event listener for when Telegram script is loaded
    if (document.readyState === 'complete') {
      initTelegramApp();
    } else {
      window.addEventListener('load', initTelegramApp);
      return () => window.removeEventListener('load', initTelegramApp);
    }
  }, []);

  const handleSendData = () => {
    if (!tg) return;
    tg.sendData(JSON.stringify({
      action: 'test_action',
      data: 'Test data from web app'
    }));
  };

  const handleShowAlert = () => {
    if (!tg) return;
    tg.showAlert('This is a test alert from Web App!');
  };

  const handleClose = () => {
    if (!tg) return;
    tg.close();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold mb-6">Telegram WebApp Demo</h1>
      
      {userInfo && (
        <div className="mb-4 text-center">
          <p>Welcome, {userInfo.first_name}!</p>
          <p className="text-sm text-gray-500">ID: {userInfo.id}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleSendData}
          className="bg-[#2ea6ff] text-white rounded-lg py-2 px-4 hover:bg-[#2896e0]"
        >
          Send Data to Bot
        </button>

        <button
          onClick={handleShowAlert}
          className="bg-[#2ea6ff] text-white rounded-lg py-2 px-4 hover:bg-[#2896e0]"
        >
          Show Alert
        </button>

        <button
          onClick={handleClose}
          className="bg-[#2ea6ff] text-white rounded-lg py-2 px-4 hover:bg-[#2896e0]"
        >
          Close WebApp
        </button>
      </div>
    </main>
  );
}
