import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import useInventory from '../hooks/useInventory';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi there! I am EliteChat, your ElectricElite inventory assistant. How can I help you today? Ask me about product availability, prices, or store recommendations!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { products } = useInventory();

  // Scroll to bottom whenever messages change or chatbot opens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const botResponseText = await getBotResponse(inputText);

    const botMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'bot',
      text: botResponseText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Main intelligence selector: Live Gemini vs Local Intelligent Fallback
  const getBotResponse = async (query) => {
    const apiKey = localStorage.getItem('electric_elite_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      try {
        return await callGeminiChat(query, apiKey);
      } catch (err) {
        console.error("Gemini chatbot call failed, falling back to local:", err);
        return getLocalResponse(query);
      }
    } else {
      // Simulate typing latency for natural feel
      await new Promise((r) => setTimeout(r, 1000));
      return getLocalResponse(query);
    }
  };

  // Live Gemini API client
  const callGeminiChat = async (query, apiKey) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Clean products list to send as context to keep prompt size small
    const productContext = products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      stock: p.stock,
      specs: p.specs
    }));

    const systemPrompt = `You are "EliteChat", an intelligent virtual store assistant for the "ElectricElite AI Inventory" web dashboard. 
Your goal is to answer queries friendly, professionally, and concisely using the store's current live inventory.
Here is the live inventory:
${JSON.stringify(productContext, null, 2)}

Strict Guidelines:
1. Keep responses clear and under 3-4 sentences when possible. Use bullet points for lists.
2. If a customer asks about a specific product/category that is in the inventory, provide its details (price, stock, specs).
3. If they ask about something NOT in the inventory (for example, "neon lights" or "neon strip"), explicitly state that we do not have it in stock. Then, recommend the closest alternative available in the catalog (e.g. Wipro 5m Smart LED Strip Light or Syska Smart 10W RGB Bulb).
4. Always represent prices in Indian Rupees (INR, ₹).
5. Always be polite, helpful, and concise.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `User Query: ${query}` }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini status ${response.status}`);
    }

    const resJson = await response.json();
    const reply = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "I'm sorry, I couldn't process that response. Can you try again?";
  };

  // Local Rule-Based NLP matcher for Demo Mode
  const getLocalResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    // 1. Neon lights query check
    if (lowerQuery.includes('neon') || lowerQuery.includes('neon light') || lowerQuery.includes('neon lights')) {
      const wiproStrip = products.find(p => p.id === 'SKU-LED-STRIP-004');
      const syskaBulb = products.find(p => p.id === 'SKU-LED-RGB-003');

      let response = "We do not have custom neon lights or signs in our current inventory. 💡\n\nHowever, we have excellent alternative lighting components that can achieve similar neon/RGB vibes:\n";
      
      if (wiproStrip) {
        response += `• **${wiproStrip.name}** (Price: ${formatCurrency(wiproStrip.price)} | Stock: ${wiproStrip.stock} units) - Flexible for custom accent and glow lighting!\n`;
      }
      if (syskaBulb) {
        response += `• **${syskaBulb.name}** (Price: ${formatCurrency(syskaBulb.price)} | Stock: ${syskaBulb.stock} units) - Supports 16 million colors via Wi-Fi!\n`;
      }
      response += "\nWould you like me to guide you to the LED/Lighting catalog section?";
      return response;
    }

    // 2. Greetings
    if (lowerQuery.match(/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/)) {
      return "Hello! I am your ElectricElite assistant. I can check product prices, verify stock levels, list categories, or suggest options for you. What are you looking for today?";
    }

    // 3. Search for categories
    if (lowerQuery.includes('category') || lowerQuery.includes('categories') || lowerQuery.includes('what do you sell') || lowerQuery.includes('what products')) {
      const categories = [...new Set(products.map(p => p.category))];
      return `We carry products in the following categories:\n${categories.map(c => `• ${c}`).join('\n')}\n\nAsk me about any category to see available items!`;
    }

    // 4. Checking specific categories (Lighting, Switches, Fans, Stabilizers)
    const categoryKeywords = {
      'led': 'LED Bulbs',
      'light': 'LED Bulbs',
      'lighting': 'LED Bulbs',
      'switch': 'Smart Switches',
      'switches': 'Smart Switches',
      'fan': 'Ceiling Fans',
      'fans': 'Ceiling Fans',
      'stabilizer': 'Voltage Stabilizers',
      'stabilizers': 'Voltage Stabilizers',
      'mcb': 'MCBs & Circuit Breakers',
      'breaker': 'MCBs & Circuit Breakers',
      'wire': 'Wires & Cables',
      'wires': 'Wires & Cables',
      'cable': 'Wires & Cables',
      'cables': 'Wires & Cables'
    };

    for (const [key, categoryName] of Object.entries(categoryKeywords)) {
      if (lowerQuery.includes(key)) {
        const matches = products.filter(p => p.category.toLowerCase().includes(key) || p.name.toLowerCase().includes(key));
        if (matches.length > 0) {
          return `Here are the items matching "${key}" in our catalog:\n` +
            matches.slice(0, 4).map(p => `• **${p.name}** (${p.brand}) - Price: ${formatCurrency(p.price)} (Stock: ${p.stock} units)`).join('\n') +
            (matches.length > 4 ? `\n...and ${matches.length - 4} more items. Use the inventory tab to view all!` : '');
        }
      }
    }

    // 5. Look for matching product names directly
    const matchingProducts = products.filter(p => 
      lowerQuery.includes(p.name.toLowerCase()) || 
      lowerQuery.includes(p.brand.toLowerCase()) ||
      lowerQuery.includes(p.id.toLowerCase())
    );

    if (matchingProducts.length > 0) {
      const p = matchingProducts[0];
      return `Here details for **${p.name}**:\n• Brand: ${p.brand}\n• Category: ${p.category}\n• Price: ${formatCurrency(p.price)}\n• Stock status: ${p.stock > 0 ? `${p.stock} units available` : 'Out of stock'}\n• Specs: ${Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
    }

    // 6. Generic Fallback
    return "I'm not sure if we have that exact item. Try searching for general terms like 'switches', 'LED bulbs', 'wires', or ask if a specific item is in stock (e.g. 'Orient fan').\n\n*(Note: You can enter a Google Gemini API Key in the Settings page to activate advanced conversational AI!)*";
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-bg text-white shadow-xl hover:shadow-brand-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 group active:scale-95 border-none cursor-pointer"
        title="Open inventory chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white dark:border-bg-primary"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-45 sm:w-[380px] h-[500px] flex flex-col glass-modal border border-border-primary/80 shadow-2xl overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="gradient-bg px-4 py-3 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 p-0 leading-tight">EliteChat</h3>
                <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all border-none bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-bg-primary/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Bot Icon */}
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-brand-500" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-bg-card border border-border-primary/60 text-text-primary rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-brand-500" />
                </div>
                <div className="bg-bg-card border border-border-primary/60 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce duration-300"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce duration-300 [animation-delay:0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500/50 animate-bounce duration-300 [animation-delay:0.3s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Footer */}
          <div className="px-4 py-1.5 bg-bg-secondary/40 border-t border-border-primary/40 flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => { setInputText("Are neon lights available?"); }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-card border border-border-primary text-text-secondary hover:border-brand-500 hover:text-brand-500 transition-all cursor-pointer"
            >
              Neon lights?
            </button>
            <button
              onClick={() => { setInputText("What smart switches do you sell?"); }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-card border border-border-primary text-text-secondary hover:border-brand-500 hover:text-brand-500 transition-all cursor-pointer"
            >
              Smart Switches
            </button>
            <button
              onClick={() => { setInputText("Do you have MCBs in stock?"); }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-card border border-border-primary text-text-secondary hover:border-brand-500 hover:text-brand-500 transition-all cursor-pointer"
            >
              MCB Check
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-bg-secondary border-t border-border-primary/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask anything about catalog..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 min-w-0 bg-bg-primary border border-border-primary/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-text-primary"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 gradient-bg hover:opacity-90 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-brand-500/10 cursor-pointer border-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
