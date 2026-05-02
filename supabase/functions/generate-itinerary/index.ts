import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface GenerateRequest {
  destination: string
  places: any[]
  preferences: {
    pace: string
    interests: string[]
    accommodationType: string
  }
  startDate: string
  endDate: string
}

// Gemini call with automatic retry and model fallback
async function callGemini(prompt: string, apiKey: string, maxTokens = 8192): Promise<string> {
  const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"]
  
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: maxTokens,
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
      }

      if (res.status === 429) {
        const waitMs = (attempt + 1) * 1000
        console.log(`Rate limited on ${model}, waiting ${waitMs}ms`)
        await new Promise((r) => setTimeout(r, waitMs))
        continue
      }

      break
    }
  }

  throw new Error("QUOTA_EXHAUSTED")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { destination, places, preferences, startDate, endDate } =
      (await req.json()) as GenerateRequest

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!

    let itinerary: any
    
    try {
      const prompt = `You are an expert travel planner. Create an optimized day-by-day itinerary for a trip to "${destination}".

Trip details:
- Start date: ${startDate}
- End date: ${endDate}
- Travel pace: ${preferences.pace} (relaxed = 2-3 places/day, moderate = 3-4, intensive = 4-5)

Selected places to include:
${JSON.stringify(places.map((p) => ({
  id: p.id, name: p.name, category: p.category, duration: p.duration, rating: p.rating
})), null, 2)}

Create an optimized itinerary following these rules:
1. Group nearby places together on the same day
2. Start each day at a reasonable hour (9 AM)
3. Add travel time estimates between places (in minutes)
4. Distribute places as evenly as possible across the days

Return ONLY a valid JSON object matching this exact schema:
{
  "id": "unique_id",
  "destination": "${destination}",
  "startDate": "${startDate}",
  "endDate": "${endDate}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "places": [
        {
          "id": "place_id_from_input",
          "name": "Place Name",
          "description": "description",
          "category": "category",
          "coordinates": [lat, lon],
          "rating": 4.5,
          "duration": 90,
          "imageUrl": "image_url",
          "address": "address",
          "openingHours": "hours",
          "price": "price",
          "startTime": "09:00",
          "endTime": "10:30",
          "travelTimeFromPrevious": 15,
          "notes": "Optional tip or note for this stop"
        }
      ],
      "totalDuration": 480,
      "totalDistance": 12.5
    }
  ]
}

- Include ALL selected places in the itinerary
- Each place must keep its original fields from the input`

      const rawText = await callGemini(prompt, GEMINI_KEY, 8192)
      const cleanJson = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim()
      itinerary = JSON.parse(cleanJson)
      
    } catch (e: any) {
      console.log("Gemini failed or quota exceeded, using fallback generation strategy.");
      
      // FALLBACK: Rule-based generation
      const start = new Date(startDate)
      const end = new Date(endDate)
      const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      
      const days = []
      let placeIndex = 0
      const placesPerDay = Math.ceil(places.length / numDays)
      
      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(start)
        currentDate.setDate(start.getDate() + i)
        
        const dayPlaces = []
        let currentHour = 9
        let currentMinute = 0
        let totalDayDuration = 0
        
        for (let j = 0; j < placesPerDay && placeIndex < places.length; j++) {
          const place = places[placeIndex]
          const travelTime = j === 0 ? 0 : 20 // 20 mins travel time between places
          
          currentMinute += travelTime
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60)
            currentMinute %= 60
          }
          
          const startTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
          
          currentMinute += place.duration
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60)
            currentMinute %= 60
          }
          
          const endTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
          
          dayPlaces.push({
            ...place,
            startTime: startTimeStr,
            endTime: endTimeStr,
            travelTimeFromPrevious: travelTime > 0 ? travelTime : undefined,
            notes: "Fallback generation: Add a meal break near here!"
          })
          
          totalDayDuration += travelTime + place.duration
          placeIndex++
        }
        
        days.push({
          date: currentDate.toISOString().split('T')[0],
          places: dayPlaces,
          totalDuration: totalDayDuration,
          totalDistance: Math.round((dayPlaces.length * 2.5) * 10) / 10 // Mock distance
        })
      }
      
      itinerary = {
        id: `itin_fallback_${Date.now()}`,
        destination,
        startDate,
        endDate,
        days: days
      }
    }

    // Ensure the itinerary has required fields
    itinerary.id = itinerary.id || `itin_${Date.now()}`
    itinerary.destination = itinerary.destination || destination
    itinerary.startDate = itinerary.startDate || startDate
    itinerary.endDate = itinerary.endDate || endDate
    itinerary.createdAt = new Date().toISOString()

    // Validate days
    if (itinerary.days && Array.isArray(itinerary.days)) {
      itinerary.days = itinerary.days.map((day: any, i: number) => ({
        ...day,
        date: day.date || startDate,
        places: (day.places || []).map((p: any) => ({
          ...p,
          coordinates: Array.isArray(p.coordinates)
            ? [Number(p.coordinates[0]), Number(p.coordinates[1])]
            : [0, 0],
          rating: Number(p.rating) || 4.0,
          duration: Number(p.duration) || 60,
        })),
        totalDuration: Number(day.totalDuration) || 0,
        totalDistance: Number(day.totalDistance) || 0,
      }))
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in generate-itinerary:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
