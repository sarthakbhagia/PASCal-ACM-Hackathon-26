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
    numPeople?: number
    budget?: number
    tripIdea?: string
  }
  startDate: string
  endDate: string
}

// Call Gemini API with model fallback
async function callGemini(prompt: string, apiKey: string, maxTokens = 4096): Promise<string> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"]

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Trying Gemini ${model} (attempt ${attempt + 1})`)
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2, // Lower temperature for more stable JSON
              maxOutputTokens: maxTokens,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  destination: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        places: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                              description: { type: "string" },
                              category: { type: "string" },
                              coordinates: { type: "array", items: { type: "number" } },
                              rating: { type: "number" },
                              duration: { type: "number" },
                              imageUrl: { type: "string" },
                              address: { type: "string" },
                              openingHours: { type: "string" },
                              price: { type: "string" },
                              startTime: { type: "string" },
                              endTime: { type: "string" },
                              travelTimeFromPrevious: { type: "number" },
                              notes: { type: "string" }
                            },
                            required: ["id", "name", "description", "category", "coordinates", "rating", "duration", "startTime", "endTime"]
                          }
                        },
                        totalDuration: { type: "number" },
                        totalDistance: { type: "number" }
                      },
                      required: ["date", "places", "totalDuration", "totalDistance"]
                    }
                  }
                },
                required: ["id", "destination", "startDate", "endDate", "days"]
              }
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (!text) {
            console.warn(`Gemini ${model} returned empty text`)
            break // try next model
          }
          console.log(`Gemini ${model} succeeded`)
          return text
        }

        const errBody = await res.text()
        console.warn(`Gemini ${model} error ${res.status}: ${errBody.slice(0, 200)}`)

        if (res.status === 429) {
          const waitMs = (attempt + 1) * 2000
          console.log(`Rate limited, waiting ${waitMs}ms`)
          await new Promise((r) => setTimeout(r, waitMs))
          continue
        }

        break // Non-retryable error, try next model
      } catch (err) {
        console.error(`Gemini ${model} fetch error:`, err)
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }
        break
      }
    }
  }

  throw new Error("All Gemini models failed")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { destination, places, preferences, startDate, endDate } =
      (await req.json()) as GenerateRequest

    console.log(`Generating itinerary for ${destination}: ${startDate} to ${endDate}, ${places.length} places`)

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase secrets." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let itinerary: any

    // Compute number of days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const numDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    try {
      const prompt = `Create a detailed day-by-day travel itinerary for ${destination} from ${startDate} to ${endDate} (${numDays} days total).

Travel Preferences:
- Pace: ${preferences.pace} (relaxed=2-3 places/day, moderate=3-4, intensive=4-5)
- Group size: ${preferences.numPeople || 1} people
- Total budget: $${preferences.budget || "N/A"}
- Trip vibe: ${preferences.tripIdea || "General travel"}
- Interests: ${preferences.interests.join(", ")}

PLACES THE USER SELECTED (Use these as the foundation):
${JSON.stringify(places.map((p: any) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  duration: p.duration,
  rating: p.rating,
  price: p.price,
  coordinates: p.coordinates,
  address: p.address,
})), null, 2)}

Rules:
1. You MUST generate exactly ${Math.min(numDays, 5)} days of itinerary (cap at 5 days maximum to prevent output cutoff).
2. Include the user's selected places as a core foundation.
3. CRUCIAL: Be free and creative! MIX IN additional unique suggestions, hidden gems, and popular tourist spots.
4. Pack each day with a schedule of exactly 3 to 4 specific, named activities/places. Do not exceed 4 places per day to keep output compact.
5. Group nearby places on the same day.
6. Start each day around 9:00 AM.
7. Add realistic travel time between places (in minutes).
8. Respect the pace preference.
9. CRITICAL: DO NOT use double quotes (") inside any generated string values to prevent JSON syntax errors. Use single quotes (') instead.
10. CRITICAL: Keep ALL text fields (descriptions, notes, etc.) EXTREMELY CONCISE (maximum 5-10 words). You must conserve tokens!

Return a JSON object with this exact structure:
{
  "id": "itin_${Date.now()}",
  "destination": "${destination}",
  "startDate": "${startDate}",
  "endDate": "${endDate}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "places": [
        {
          "id": "place_id",
          "name": "Place Name",
          "description": "Description",
          "category": "category",
          "coordinates": [lat, lon],
          "rating": 4.5,
          "duration": 90,
          "imageUrl": "url or empty string",
          "address": "Address",
          "openingHours": "Hours",
          "price": "Price",
          "startTime": "09:00",
          "endTime": "10:30",
          "travelTimeFromPrevious": 15,
          "notes": "Helpful tip"
        }
      ],
      "totalDuration": 480,
      "totalDistance": 12.5
    }
  ]
}`

      const rawText = await callGemini(prompt, GEMINI_KEY, 8192)
      
      // Parse JSON from response
      try {
        itinerary = JSON.parse(rawText)
      } catch {
        const jsonStart = rawText.indexOf("{")
        const jsonEnd = rawText.lastIndexOf("}")
        if (jsonStart !== -1 && jsonEnd !== -1) {
          itinerary = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1))
        } else {
          throw new Error("Could not parse Gemini response")
        }
      }

      console.log("Gemini itinerary generated successfully")
    } catch (e: any) {
      console.error("Gemini failed, using fallback:", e.message)

      // FALLBACK: Rule-based generation
      const days = []
      let placeIndex = 0
      const placesPerDay = Math.ceil(places.length / numDays) || 3

      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(start)
        currentDate.setDate(start.getDate() + i)

        const dayPlaces = []
        let currentHour = 9
        let currentMinute = 0
        let totalDayDuration = 0

        for (let j = 0; j < placesPerDay && placeIndex < places.length; j++) {
          const place = places[placeIndex]
          const travelTime = j === 0 ? 0 : 20

          currentMinute += travelTime
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60)
            currentMinute %= 60
          }

          const startTimeStr = String(currentHour).padStart(2, "0") + ":" + String(currentMinute).padStart(2, "0")

          currentMinute += (place.duration || 90)
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60)
            currentMinute %= 60
          }

          const endTimeStr = String(currentHour).padStart(2, "0") + ":" + String(currentMinute).padStart(2, "0")

          dayPlaces.push({
            ...place,
            startTime: startTimeStr,
            endTime: endTimeStr,
            travelTimeFromPrevious: travelTime > 0 ? travelTime : undefined,
            notes: "Auto-generated schedule — consider adjusting times to your preference!",
          })

          totalDayDuration += travelTime + (place.duration || 90)
          placeIndex++
        }

        days.push({
          date: currentDate.toISOString().split("T")[0],
          places: dayPlaces,
          totalDuration: totalDayDuration,
          totalDistance: Math.round(dayPlaces.length * 2.5 * 10) / 10,
        })
      }

      itinerary = {
        id: "itin_fallback_" + Date.now(),
        destination,
        startDate,
        endDate,
        days,
      }
    }

    // Ensure required fields
    itinerary.id = itinerary.id || "itin_" + Date.now()
    itinerary.destination = itinerary.destination || destination
    itinerary.startDate = itinerary.startDate || startDate
    itinerary.endDate = itinerary.endDate || endDate
    itinerary.createdAt = new Date().toISOString()

    // Validate days structure
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
