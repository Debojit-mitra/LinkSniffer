# 🎯 LinkSniffer

LinkSniffer is a modern, high-performance web application designed to bypass ad-cluttered websites and extract direct, high-quality download links for your favorite movies and series. 

With a beautiful interface powered by Next.js and a robust headless scraping engine built in Python, LinkSniffer eleganty navigates the web so you don't have to.

![LinkSniffer UI](https://raw.githubusercontent.com/iconify/icon-sets/master/svg/mdi/radar.svg)

---

## ✨ Features

- **Multi-Source Scraping**: Currently supports extracting direct links from sources like Vglist (Hollywood/Bollywood) and MoviesNation.
- **Smart Link Resolution**: Automatically navigates through multiple redirects and wait-pages to retrieve the final direct download URLs.
- **Intelligent Caching**: Utilizes Redux Toolkit to cache search results, movie details, and resolved links. Navigating backward/forward is instantaneous without re-triggering expensive backend scrapes.
- **Premium UI/UX**: Built with Tailwind CSS and Framer Motion, featuring a sleek, dark-themed emerald/teal glassmorphic aesthetic with fluid micro-animations.
- **Production Ready**: The backend utilizes the `waitress` WSGI server for reliable production-grade deployment.

---

## 🛠️ Technology Stack

**Frontend (Client):**
- **Framework**: Next.js (Pages Router)
- **Styling**: Tailwind CSS, clsx, tailwind-merge
- **State Management**: Redux Toolkit (`react-redux`)
- **Animations**: Framer Motion
- **Icons**: Iconify API (`@iconify/react`)

**Backend (Server):**
- **Framework**: Python Flask
- **Scraping Engine**: Selenium WebDriver (Headless Chrome)
- **WSGI Server**: Waitress
- **CORS**: Flask-CORS

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- Google Chrome (required for Selenium headless scraping)

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python app.py
   ```
   *The server will start on `http://localhost:5000`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## ⚙️ Configuration

- **API Base URL**: The frontend communicates with the backend via the `API_BASE` constant. If you deploy the backend to a remote server, update the URL in:
  `client/src/constants.ts`
- **Server Debug Mode**: To run the Python server in Flask's development mode instead of Waitress (useful for auto-reloading during development), open `server/app.py` and set:
  ```python
  DEBUG = True
  ```

---

## ⚠️ Disclaimer

This tool is developed strictly for **personal educational purposes** to demonstrate web scraping, DOM manipulation, and full-stack application architecture. Please respect copyright laws and the terms of service of the websites you interact with. The developer assumes no responsibility for how this tool is used.
