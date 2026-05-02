# PASC Hackathon '26 - AI Travel Planner

This project is an AI-powered travel planner that helps users discover specific places to visit and automatically generates highly detailed, day-by-day itineraries based on their preferences. 

The application uses **Next.js** for the frontend and **Supabase Edge Functions** (powered by Gemini and Tavily) for the backend.

## Project Structure
- `/frontend`: Contains the Next.js web application.
- `/supabase/functions`: Contains the backend Edge Functions (`discover-places`, `generate-itinerary`, `enhance-itinerary`).

---

## 🚀 Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18+)
- npm or yarn
- Supabase CLI (`npx supabase`)

### 2. Frontend Environment Variables
Navigate to the `frontend` directory and create a `.env.local` file:
```bash
cd frontend
touch .env.local
```

Add the following API keys to your `.env.local` file:
```env
# Supabase Project Credentials (found in Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LocationIQ for Geocoding
NEXT_PUBLIC_LOCATIONIQ_API_KEY=your_locationiq_api_key
```

### 3. Configuring Supabase Secrets (Backend)
The AI features rely on Supabase Edge Functions. You must configure the required API keys as secrets in your Supabase project.

Open your terminal and run the following commands (replace the placeholder values with your actual keys):

```bash
# Add Tavily API Key for web searching
npx supabase secrets set TAVILY_API_KEY="your_tavily_api_key"

# Add Gemini API Key for LLM generation
npx supabase secrets set GEMINI_API_KEY="your_gemini_api_key"
```

*Alternatively, you can add these secrets manually through the Supabase Dashboard: **Project Settings -> Edge Functions -> Secrets**.*

### 4. Deploying Edge Functions
Once the secrets are set, you need to deploy the Edge Functions to your Supabase project. Make sure you are logged into the Supabase CLI (`npx supabase login`) and have linked your project (`npx supabase link --project-ref your_project_ref`).

Deploy the functions by running:
```bash
npx supabase functions deploy discover-places --no-verify-jwt
npx supabase functions deploy generate-itinerary --no-verify-jwt
npx supabase functions deploy enhance-itinerary --no-verify-jwt
```

### 5. Running the Application
Once the backend is deployed and frontend environment variables are set, you can start the development server.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Built With
- **Next.js** - React Framework
- **Supabase** - Edge Functions & Database
- **Gemini 2.5 Flash** - AI Generation Model
- **Tavily** - Live Web Search API
- **LocationIQ** - Geocoding
- **Tailwind CSS** - Styling
- **React-Leaflet** - Interactive Maps
