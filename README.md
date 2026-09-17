# Class 11 PCM Study Notes (Decoy Chat App)

This is the frontend repository for a visually polished, premium-feeling "Class 11 PCM Study Notes" web application. Under the hood, it serves as a secure, hidden real-time chat interface.

## Tech Stack
- **React.js** (Vite)
- **Vanilla CSS** (Custom Design System)
- **Socket.io-client** (WebSockets)
- **Axios** (API requests)

## Features
- **The Decoy:** Displays a clean, Apple-style UI for organizing Physics, Chemistry, and Mathematics study notes. It comes pre-seeded with realistic study material to pass casual inspection.
- **Secret Trigger:** Typing specific credentials (`password - piyush` or `password - tannu`) in the notes interface instantly slides open the hidden admin chat panel.
- **Premium Chat UI:** 
  - Real-time messaging with typing indicators.
  - Read receipts (Sent, Delivered, Seen).
  - Voice Notes functionality.
  - Image/Media sharing with captions and a zoomable full-screen Lightbox.
  - Message interactions: Double-tap to react (❤️), hover/long-press to Edit, Unsend, or Copy.
- **Security & Privacy:** 
  - Messages permanently self-destruct 1 hour after being seen.
  - Auto-logout: Automatically hides the chat interface after 5 minutes of inactivity.
- **Responsive Design:** Fully optimized for mobile screens. The sidebar tucks away automatically to give a native mobile app feel.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PiyushASSUDANI123/realtime-chat_frontend.git
   cd realtime-chat_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file to point to your live backend (or it will default to the configured domain):
   ```env
   VITE_API_URL=https://chat.piyushassudani.in
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```
   The `vite.config.js` is already configured with `base: './'` to ensure it works correctly when hosted on standard static platforms like Vercel, Netlify, or cPanel.
