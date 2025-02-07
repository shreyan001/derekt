'use client';
import { useEffect, useState } from "react";
import { initializeAgent } from '../server/graph'; // Import the initializeAgent function
import { HumanMessage } from "@langchain/core/messages";


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
  const [agent, setAgent] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatOutput, setChatOutput] = useState<string>('');

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

    // Initialize the agent
    const initAgent = async () => {
      const { agent, config } = await initializeAgent();
      setAgent(agent);
      setConfig(config);
    };

    if (document.readyState === 'complete') {
      initTelegramApp();
      initAgent();
    } else {
      window.addEventListener('load', () => {
        initTelegramApp();
        initAgent();
      });
      return () => window.removeEventListener('load', initTelegramApp);
    }
  }, []);

  const handleChatSubmit = async () => {
    if (!agent || !config || !chatInput) return;
    const stream = await agent.stream({ messages: [new HumanMessage(chatInput)] }, config);

    let output = '';
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        output += chunk.agent.messages[0].content + '\n';
      } else if ("tools" in chunk) {
        output += chunk.tools.messages[0].content + '\n';
      }
    }
    setChatOutput(output);
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
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message"
          className="border rounded-lg py-2 px-4"
        />
        <button
          onClick={handleChatSubmit}
          className="bg-[#2ea6ff] text-white rounded-lg py-2 px-4 hover:bg-[#2896e0]"
        >
          Send Message
        </button>
        <div className="mt-4 p-4 border rounded-lg">
          <p>{chatOutput}</p>
        </div>
      </div>
    </main>
  );
}
