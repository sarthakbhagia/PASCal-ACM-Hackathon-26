import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Call Gemini API with model fallback
async function callGemini(prompt: string, apiKey: string, maxTokens = 8192): Promise<string> {
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
              temperature: 0.5,
              maxOutputTokens: maxTokens,
              responseMimeType: "application/json",
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (!text) {
            console.warn(`Gemini ${model} returned empty text`)
            break
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

        break
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
    const { itinerary } = await req.json()

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase secrets." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let enhanced: any

    try {
      const prompt = `You are an expert travel planner reviewing a user's modified travel itinerary. The user may have rearranged, added, or removed places. Your job is to enhance and polish this itinerary to make it realistic and optimal.

Here is the current itinerary:
${JSON.stringify(itinerary, null, 2)}

Please review and enhance it by:
1. Fix unrealistic timings
2. Recalculate travel times between places
3. Optimize the daily schedule order
4. Add meal break suggestions in notes
5. Add practical tips in the notes field
6. Recalculate totalDuration and totalDistance for each day
7. Ensure logical chronological flow

Return ONLY a valid JSON object matching the input schema exactly. Keep all original fields (id, name, coordinates, etc.) unchanged — only modify timing, ordering, notes, and day-level statistics.`

      const rawText = await callGemini(prompt, GEMINI_KEY, 8192)
      
      try {
        enhanced = JSON.parse(rawText)
      } catch {
        const jsonStart = rawText.indexOf("{")
        const jsonEnd = rawText.lastIndexOf("}")
        if (jsonStart !== -1 && jsonEnd !== -1) {
          enhanced = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1))
        } else {
          throw new Error("Could not parse Gemini response")
        }
      }

      console.log("Itinerary enhanced successfully via Gemini")
    } catch (e: any) {
      console.error("Gemini enhance failed, using fallback:", e.message)

      // FALLBACK: Just add enhanced notes
      enhanced = JSON.parse(JSON.stringify(itinerary)) // Deep copy

      if (enhanced.days && Array.isArray(enhanced.days)) {
        enhanced.days.forEach((day: any) => {
          if (day.places && Array.isArray(day.places)) {
            day.places.forEach((place: any) => {
              if (!place.notes || place.notes.includes("Fallback") || place.notes.includes("Auto-generated")) {
                place.notes = "✨ Tip: Try visiting during off-peak hours to avoid crowds."
              }
            })
          }
        })
      }
    }

    // Preserve critical fields from original
    enhanced.id = itinerary.id
    enhanced.destination = itinerary.destination
    enhanced.startDate = itinerary.startDate
    enhanced.endDate = itinerary.endDate
    enhanced.createdAt = itinerary.createdAt

    // Validate days structure
    if (enhanced.days && Array.isArray(enhanced.days)) {
      enhanced.days = enhanced.days.map((day: any) => ({
        ...day,
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

    return new Response(JSON.stringify({ itinerary: enhanced }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in enhance-itinerary:", error)
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
