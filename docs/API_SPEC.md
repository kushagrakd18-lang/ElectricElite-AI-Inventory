# AI API Specification

## Gemini Service (Mock & Live)
*   **Endpoint:** Google Gemini API (Flash 3.0 model).
*   **Payload structure:**
    *   `prompt`: String (System role: "Expert E-commerce Copywriter").
    *   `data`: JSON object containing product specs.
*   **Output:** JSON schema including keys: `seoTitle`, `description`, `bullets`, `amazonListing`, `instagramCaption`.
*   **Error Handling:** If API fails, return a fallback object with a "Demo Mode" flag.