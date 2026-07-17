/**
 * Gemini Service simulating and executing the Google Gemini Flash API pipeline.
 * Extracts product specifications from an uploaded label image.
 */

const MOCK_EXTRACTIONS = [
  {
    sku: "SKU-SW-4CH-882",
    name: "Smart 4-Channel Touch Switch",
    brand: "ElectroLink",
    category: "Smart Switches",
    price: 1999.00,
    stock: 35,
    specs: {
      "Channels": "4",
      "Protocol": "Zigbee 3.0",
      "Input Voltage": "110-240V AC",
      "Color": "Glass White"
    }
  },
  {
    sku: "SKU-LED-RGB-24W",
    name: "Premium 24W RGB LED Panel",
    brand: "EliteGlow",
    category: "LED Bulbs",
    price: 1299.00,
    stock: 50,
    specs: {
      "Wattage": "24W",
      "Lumens": "2200 lm",
      "Color Support": "RGB + Warm White",
      "Connectivity": "Wi-Fi 2.4GHz"
    }
  },
  {
    sku: "SKU-REG-FAN-002",
    name: "BLDC Smart Fan Speed Regulator",
    brand: "AeroBreeze",
    category: "Smart Switches",
    price: 899.00,
    stock: 20,
    specs: {
      "Load Support": "Up to 100W BLDC",
      "Speed Settings": "5 Speed Capacitive",
      "Protocol": "Wi-Fi Smart Life",
      "Mount": "Standard 2-Module Box"
    }
  }
];

export function mockGeminiVision(imageBase64) {
  return new Promise((resolve) => {
    // Simulate a 2-second extraction delay
    setTimeout(() => {
      // Pick a random mock extraction to simulate different image inputs
      const randomIndex = Math.floor(Math.random() * MOCK_EXTRACTIONS.length);
      const data = MOCK_EXTRACTIONS[randomIndex];
      
      resolve({
        success: true,
        data: {
          ...data,
          // Add a dynamic SKU suffix to prevent collisions during repeated demos
          sku: `${data.sku.substring(0, data.sku.lastIndexOf('-') + 1)}${Math.floor(Math.random() * 900) + 100}`
        }
      });
    }, 2000);
  });
}

function parseDataUri(dataUri) {
  const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    return { mimeType: 'image/jpeg', data: dataUri };
  }
  return { mimeType: matches[1], data: matches[2] };
}

export async function analyzeProductImage(imageBase64) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('electric_elite_gemini_key');
  
  if (!apiKey) {
    return mockGeminiVision(imageBase64);
  }

  const { mimeType, data } = parseDataUri(imageBase64);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a precise inventory assistant. If the image is unclear or does not display a recognizable electronic product/label, you must return a fallback object with 'Unknown' values rather than guessing or hallucinating. Do not hallucinate product specifications.

Analyze this electronics product image/label, extract details, and output ONLY a JSON object with this exact structure:
{
  "sku": "SKU-XXX-XXX-000" (generate a realistic SKU based on name/brand, or 'Unknown'),
  "name": "Product Name (or 'Unknown')",
  "brand": "Brand Name (or 'Unknown')",
  "category": "Category Name (e.g., LED Bulbs, Smart Switches, Ceiling Fans, Extension Boards, or 'Unknown')",
  "price": 0.00 (a reasonable estimated decimal number, or 0.00 if unknown),
  "stock": 0 (a reasonable estimated integer, or 0 if unknown),
  "specs": {
     "Key1": "Value1",
     "Key2": "Value2"
  }
}
Do NOT wrap the output in markdown block (like \`\`\`json ... \`\`\`), do NOT output any introductory or concluding text. Return raw JSON.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("No text content returned from Gemini API");
    }

    // Try parsing JSON
    const parsedData = JSON.parse(textContent.trim());
    return {
      success: true,
      data: parsedData,
      live: true
    };
  } catch (error) {
    console.error("Live Gemini Vision API call failed, falling back to mock:", error);
    const mockRes = await mockGeminiVision(imageBase64);
    return {
      ...mockRes,
      error: error.message,
      fallback: true
    };
  }
}

export function generateMockCopywriting(product) {
  const price = product.price || 999;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(price);

  const specsList = Object.entries(product.specs || {})
    .map(([k, v]) => `• ${k}: ${v}`)
    .join('\n');

  const name = product.name;
  const brand = product.brand;
  const category = product.category || 'Electronics';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          seoTitle: `Buy ${brand} ${name} Online at Best Price in India - ${category}`,
          description: `Experience cutting-edge technology with the all-new ${brand} ${name}. Specially designed for Indian households and modern smart home setups, this premium ${category.toLowerCase()} combines high-efficiency performance with long-lasting durability. Available at a special price of just ${formattedPrice}, it is the perfect upgrade for your home or office. Buy now and enjoy instant savings along with hassle-free warranty support across India.`,
          bullets: [
            `• PREMIUM QUALITY: Built by ${brand} using industry-grade components to withstand voltage fluctuations commonly experienced in Indian grids.`,
            `• ENERGY EFFICIENT: Certified high-efficiency design helps you save significantly on monthly electricity bills.`,
            `• SMART CONNECTIVITY: Seamlessly integrates with local Wi-Fi networks and smart voice assistants (Alexa, Google Assistant).`,
            `• EASY INSTALLATION: Fits standard Indian electrical boxes and modular panels with zero hassle.`,
            `• WARRANTY SUPPORT: Comes with a dedicated 1-Year brand warranty and easy customer support support across India.`
          ].join('\n'),
          instagramCaption: `Upgrade your lifestyle with the premium ${brand} ${name}! 💡⚡\n\nDesigned for modern Indian homes, this energy-efficient ${category.toLowerCase()} delivers top-notch performance without burning a hole in your pocket. Get yours today for only ${formattedPrice}!\n\n🛒 Tap the link in our bio to shop now!\n\n#${brand.replace(/\s+/g, '')} #ElectricElite #MakeInIndia #SmartHomeIndia #IndianElectronics #VocalForLocal #HomeImprovement #SmartLighting #TechIndia`
        }
      });
    }, 1500);
  });
}

export async function generateCopywriting(product, apiKey) {
  const resolvedKey =
    apiKey ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('electric_elite_gemini_key');

  if (!resolvedKey) {
    return generateMockCopywriting(product);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${resolvedKey}`;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(product.price);

  const prompt = `You are an expert e-commerce copywriter for the Indian retail market.
Generate compelling, high-converting product listings and marketing copy for this product:
Product Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Price: ${formattedPrice}
Specs: ${JSON.stringify(product.specs)}

Ensure that all currency values are represented in Indian Rupees (INR, ₹).
Tailor the language, tone, and cultural context to be appealing to Indian consumers on platforms like Amazon.in, Flipkart, and Instagram (e.g. mention smart energy savings, suitability for Indian homes/voltage, local support/warranty).

You MUST output ONLY a JSON object. Do NOT wrap it in markdown code blocks. Just return raw JSON matching this structure:
{
  "seoTitle": "SEO optimized product title for Indian marketplaces",
  "description": "Engaging, long-form product description appealing to Indian customers, including key benefits, warranty, and brand trust.",
  "bullets": "5 detailed Flipkart/Amazon style bullet points, each on a new line starting with a bullet character (•). Address power stability, durability, cost-savings, user convenience, and warranty.",
  "instagramCaption": "An engaging Instagram caption with bulleted benefits, calling to action, and relevant popular Indian e-commerce hashtags (e.g., #SmartHomeIndia, #VocalForLocal)."
}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const resJson = await response.json();
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("No text content returned from Gemini API");
    }

    const parsedData = JSON.parse(textContent.trim());
    return {
      success: true,
      data: parsedData,
      live: true
    };
  } catch (error) {
    console.error("Live Gemini Copywriting API call failed, falling back to mock:", error);
    const mockRes = await generateMockCopywriting(product);
    return {
      ...mockRes,
      error: error.message,
      fallback: true
    };
  }
}


