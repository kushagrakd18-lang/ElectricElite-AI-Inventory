# Schema Specification (LocalStorage Implementation)

Since this is an MBA prototype, state persistence will mimic a true relational model using cleanly structural keys mapping inside the client browser's `localStorage`.

## 1. Store Key: `electric_elite_products`
An array of objects representing catalog items.
```json
[
  {
    "id": "SKU-LED-9W-001",
    "name": "9W Premium LED Bulb",
    "brand": "EliteGlow",
    "category": "LED Bulbs",
    "price": 12.99,
    "stock": 145,
    "barcode": "8901234567890",
    "image": "data:image/png;base64,...",
    "specs": {
      "Wattage": "9W",
      "Lumens": "900 lm",
      "Color Temperature": "6500K Cool White",
      "Base Type": "B22"
    }
  }
]