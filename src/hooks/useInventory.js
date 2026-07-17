import { useState, useEffect } from 'react';

const DEFAULT_MOCK_PRODUCTS = [
  // ─── LED Bulbs ───────────────────────────────────────────────────────────────
  {
    id: "SKU-LED-9W-001",
    name: "Philips Stellar Bright 9W LED Bulb",
    brand: "Philips",
    category: "LED Bulbs",
    price: 149.00,
    stock: 80,
    barcode: "8901234567890",
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Wattage": "9W",
      "Lumens": "950 lm",
      "Color Temperature": "6500K Cool Daylight",
      "Base Type": "B22",
      "Lifespan": "15,000 Hours"
    }
  },
  {
    id: "SKU-LED-12W-002",
    name: "Havells Adore 12W LED Downlight",
    brand: "Havells",
    category: "LED Bulbs",
    price: 299.00,
    stock: 60,
    barcode: "8901234567891",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Wattage": "12W",
      "Lumens": "1140 lm",
      "Color Temperature": "4000K Neutral White",
      "Base Type": "E27",
      "BEE Star Rating": "5 Star"
    }
  },
  {
    id: "SKU-LED-RGB-003",
    name: "Syska Smart 10W RGB Bulb (Wi-Fi)",
    brand: "Syska",
    category: "LED Bulbs",
    price: 799.00,
    stock: 8,
    barcode: "8901234567892",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Wattage": "10W",
      "Color Support": "16 Million Colors",
      "Connectivity": "Wi-Fi 2.4GHz",
      "Compatible": "Alexa, Google Assistant",
      "Base Type": "B22"
    }
  },
  {
    id: "SKU-LED-STRIP-004",
    name: "Wipro 5m Smart LED Strip Light",
    brand: "Wipro",
    category: "LED Strips",
    price: 1199.00,
    stock: 20,
    barcode: "8901234567893",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Length": "5 Metres",
      "LED Count": "300 LEDs",
      "Waterproof Rating": "IP65",
      "Input Voltage": "12V DC",
      "Control": "App + Remote"
    }
  },

  // ─── Smart Switches ───────────────────────────────────────────────────────────
  {
    id: "SKU-SW-3CH-005",
    name: "Anchor Roma 3-Gang Smart Wi-Fi Switch",
    brand: "Anchor by Panasonic",
    category: "Smart Switches",
    price: 2299.00,
    stock: 8,
    barcode: "8901234567894",
    image: "https://images.unsplash.com/photo-1617791160505-6f006e121980?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Channels": "3",
      "Connectivity": "Wi-Fi 2.4GHz",
      "Voice Control": "Alexa, Google Home",
      "Input Voltage": "90-264V AC",
      "Load Per Channel": "10A"
    }
  },
  {
    id: "SKU-SW-DIM-006",
    name: "Legrand Arteor Touch Dimmer",
    brand: "Legrand",
    category: "Smart Switches",
    price: 3450.00,
    stock: 5,
    barcode: "8901234567895",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Switch Type": "Capacitive Glass Touch",
      "Max Load": "400W LED / 600W Incandescent",
      "Protocol": "Zigbee 3.0",
      "Finish": "Glossy White",
      "Compatible": "KNX, SmartHome"
    }
  },

  // ─── Ceiling Fans ─────────────────────────────────────────────────────────────
  {
    id: "SKU-FAN-BLDC-007",
    name: "Orient Electric Aeroquiet 48″ BLDC Fan",
    brand: "Orient Electric",
    category: "Ceiling Fans",
    price: 4999.00,
    stock: 4,
    barcode: "8901234567896",
    image: "https://images.unsplash.com/photo-1523031215919-bdf60f8d9348?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Motor Type": "BLDC",
      "Power Consumption": "28W",
      "Sweep Size": "1200mm (48\")",
      "Speed Settings": "5 Speed + Reverse",
      "BEE Star Rating": "5 Star"
    }
  },
  {
    id: "SKU-FAN-USHA-008",
    name: "Usha Striker Galaxy 1200mm Ceiling Fan",
    brand: "Usha",
    category: "Ceiling Fans",
    price: 2499.00,
    stock: 6,
    barcode: "8901234567897",
    image: "https://images.unsplash.com/photo-1523031215919-bdf60f8d9348?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Motor Type": "Induction",
      "Power Consumption": "72W",
      "Sweep Size": "1200mm",
      "Air Delivery": "220 CMM",
      "Speed Settings": "3 Speed Regulator"
    }
  },

  // ─── Extension Boards & MCBs ─────────────────────────────────────────────────
  {
    id: "SKU-EXT-6W-009",
    name: "Havells Modena 6-Socket Surge Guard",
    brand: "Havells",
    category: "Extension Boards",
    price: 1299.00,
    stock: 30,
    barcode: "8901234567898",
    image: "https://images.unsplash.com/photo-1595531872166-70e608051286?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Sockets": "6 Universal + 2 USB-A + 1 USB-C",
      "Surge Protection": "2500 Joules",
      "Cable Length": "3 Metres",
      "Max Load": "3000W",
      "Indicator": "LED Power + Surge"
    }
  },
  {
    id: "SKU-MCB-32A-010",
    name: "Schneider Electric iC60N 32A MCB (C-Curve)",
    brand: "Schneider Electric",
    category: "MCBs & Circuit Breakers",
    price: 585.00,
    stock: 100,
    barcode: "8901234567899",
    image: "https://images.unsplash.com/photo-1595531872166-70e608051286?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Current Rating": "32A",
      "Poles": "1 Pole",
      "Breaking Capacity": "6kA",
      "Curve Type": "C",
      "Standard": "IS/IEC 60898-1"
    }
  },
  {
    id: "SKU-MCB-16A-011",
    name: "Legrand DX3 16A 2-Pole MCB",
    brand: "Legrand",
    category: "MCBs & Circuit Breakers",
    price: 780.00,
    stock: 65,
    barcode: "8901234567900",
    image: "https://images.unsplash.com/photo-1595531872166-70e608051286?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Current Rating": "16A",
      "Poles": "2 Pole",
      "Breaking Capacity": "10kA",
      "Curve Type": "B",
      "Mounting": "DIN Rail"
    }
  },

  // ─── Wiring & Cables ─────────────────────────────────────────────────────────
  {
    id: "SKU-WIR-6SQ-012",
    name: "Polycab FR PVC 6 sq.mm House Wire (90m)",
    brand: "Polycab",
    category: "Wires & Cables",
    price: 4750.00,
    stock: 8,
    barcode: "8901234567901",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Cross Section": "6 sq.mm",
      "Core": "Copper",
      "Insulation": "FR PVC",
      "Length": "90 Metres (1 Roll)",
      "Voltage Rating": "1100V"
    }
  },
  {
    id: "SKU-WIR-25SQ-013",
    name: "Finolex 2.5 sq.mm FRLS Wire (90m)",
    brand: "Finolex",
    category: "Wires & Cables",
    price: 2490.00,
    stock: 12,
    barcode: "8901234567902",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Cross Section": "2.5 sq.mm",
      "Core": "Copper",
      "Insulation": "FRLS PVC",
      "Length": "90 Metres",
      "Colour": "Red"
    }
  },

  // ─── Modular Switches & Sockets ───────────────────────────────────────────────
  {
    id: "SKU-MOD-5A-014",
    name: "Legrand Myrius 5A 3-Pin Socket",
    brand: "Legrand",
    category: "Modular Switches",
    price: 245.00,
    stock: 150,
    barcode: "8901234567903",
    image: "https://images.unsplash.com/photo-1617791160505-6f006e121980?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Ampere Rating": "5A",
      "Pins": "3-Pin (IS 1293)",
      "Finish": "White",
      "Mounting": "25mm Modular Box",
      "Material": "Polycarbonate"
    }
  },
  {
    id: "SKU-MOD-16A-015",
    name: "Anchor Roma 16A ISI Mark Socket",
    brand: "Anchor by Panasonic",
    category: "Modular Switches",
    price: 185.00,
    stock: 130,
    barcode: "8901234567904",
    image: "https://images.unsplash.com/photo-1617791160505-6f006e121980?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Ampere Rating": "16A",
      "Pins": "3-Pin with Shutters",
      "Standard": "IS 1293",
      "Finish": "Ivory White",
      "Mounting": "Flush / Surface"
    }
  },

  // ─── Voltage Stabilizers ─────────────────────────────────────────────────────
  {
    id: "SKU-STAB-V-AC-016",
    name: "V-Guard VEW 500 Voltage Stabilizer (AC)",
    brand: "V-Guard",
    category: "Voltage Stabilizers",
    price: 3999.00,
    stock: 4,
    barcode: "8901234567905",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Capacity": "500VA",
      "Input Range": "130V – 290V",
      "Output": "220V ± 1%",
      "For": "1.5 Ton AC",
      "Protection": "Over/Under Voltage Cut-off"
    }
  },
  {
    id: "SKU-STAB-SERV-017",
    name: "Servo Star 5KVA Servo Stabilizer",
    brand: "Servo Star",
    category: "Voltage Stabilizers",
    price: 11500.00,
    stock: 2,
    barcode: "8901234567906",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Capacity": "5KVA",
      "Input Range": "110V – 270V",
      "Output": "230V ± 1%",
      "Technology": "Servo Motor Controlled",
      "Correction Speed": "45V/sec"
    }
  },

  // ─── Power & Energy Meters ────────────────────────────────────────────────────
  {
    id: "SKU-ENRG-METER-018",
    name: "Secure Meters 3-Phase Digital Energy Meter",
    brand: "Secure Meters",
    category: "Energy Meters",
    price: 2850.00,
    stock: 6,
    barcode: "8901234567907",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Phase": "3-Phase 4-Wire",
      "Current Rating": "10-60A",
      "Display": "LCD (6+1 Digits)",
      "Communication": "RS-485 / Optical",
      "Accuracy Class": "Class 1 (IS 13779)"
    }
  },

  // ─── Solar & Inverter ────────────────────────────────────────────────────────
  {
    id: "SKU-INV-LUMI-019",
    name: "Luminous Zelio+ 1100 Pure Sine Inverter",
    brand: "Luminous",
    category: "Inverters & UPS",
    price: 7499.00,
    stock: 3,
    barcode: "8901234567908",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Capacity": "900VA / 756W",
      "Wave Type": "Pure Sine Wave",
      "Battery": "12V (External)",
      "Display": "LED Indicators",
      "Protection": "Short Circuit / Overload / Deep Discharge"
    }
  },
  {
    id: "SKU-SOL-PCU-020",
    name: "Microtek Solar PCU 1KVA MPPT Inverter",
    brand: "Microtek",
    category: "Inverters & UPS",
    price: 14999.00,
    stock: 2,
    barcode: "8901234567909",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&auto=format&fit=crop&q=60",
    specs: {
      "Capacity": "1KVA / 800W",
      "Solar Input": "12V/24V Auto",
      "Charge Controller": "MPPT 30A",
      "Battery": "12V/24V (External)",
      "LCD Display": "Yes (Voltage, SoC, Load)"
    }
  }
];

export default function useInventory() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('electric_elite_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse products from local storage", e);
      }
    }
    // Pre-populate mock products
    localStorage.setItem('electric_elite_products', JSON.stringify(DEFAULT_MOCK_PRODUCTS));
    return DEFAULT_MOCK_PRODUCTS;
  });

  // Keep localStorage in sync when products state changes
  useEffect(() => {
    localStorage.setItem('electric_elite_products', JSON.stringify(products));
  }, [products]);

  // Metric calculation functions
  const getInventoryStats = () => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce((acc, product) => acc + (product.price * product.stock), 0);
    
    // Low stock threshold: less than 15 items
    const lowStockAlerts = products.filter(product => product.stock < 15).length;

    return {
      totalProducts,
      totalStockValue,
      lowStockAlerts
    };
  };

  // CRUD Skeletons & Implementations
  const addProduct = (product) => {
    setProducts(prev => {
      // Avoid duplicate SKU
      if (prev.some(p => p.id === product.id)) {
        throw new Error(`Product with SKU ${product.id} already exists.`);
      }
      return [product, ...prev];
    });
  };

  const updateProduct = (sku, updatedData) => {
    setProducts(prev => prev.map(p => p.id === sku ? { ...p, ...updatedData } : p));
  };

  const deleteProduct = (sku) => {
    setProducts(prev => prev.filter(p => p.id !== sku));
  };

  const resetInventory = () => {
    setProducts(DEFAULT_MOCK_PRODUCTS);
  };

  // Bulk-add products from CSV import (skips duplicate SKUs, returns { added, skipped })
  const addBulkProducts = (newProducts) => {
    let added = 0;
    let skipped = 0;
    setProducts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const toAdd = [];
      newProducts.forEach(p => {
        if (existingIds.has(p.id)) {
          skipped++;
        } else {
          toAdd.push(p);
          added++;
        }
      });
      return [...toAdd, ...prev];
    });
    return { added, skipped };
  };

  // Replace entire inventory with imported data
  const importProducts = (newProducts) => {
    setProducts(newProducts);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetInventory,
    addBulkProducts,
    importProducts,
    getInventoryStats
  };
}
