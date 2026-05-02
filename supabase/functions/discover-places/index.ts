import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface DiscoverRequest {
  destination: string
  coordinates?: [number, number]
  interests: string[]
  pace?: string
  accommodationType?: string
  tripIdea?: string
}

// Extract rough price from Tavily content
function extractPrice(content: string): string {
  const priceRegex = /(\$|€|£)\s*\d+(\.\d+)?|free|budget|expensive|low-cost|affordable/i
  const match = content.match(priceRegex)
  return match ? match[0] : 'Varies'
}

// Call Gemini to generate structured place data from Tavily search results
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  // Use gemini-2.5-flash (current stable), fall back to gemini-2.0-flash
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"]

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    try {
      console.log(`Trying Gemini model: ${model}`)
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          console.warn(`Gemini ${model} returned empty response`)
          continue
        }
        console.log(`Gemini ${model} succeeded`)
        return text
      }

      const errBody = await res.text()
      console.warn(`Gemini ${model} error ${res.status}: ${errBody.slice(0, 200)}`)

      // If rate limited, wait and retry same model
      if (res.status === 429) {
        console.log("Rate limited, waiting 2s...")
        await new Promise((r) => setTimeout(r, 2000))
        // Retry same model once
        const retryRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        })
        if (retryRes.ok) {
          const retryData = await retryRes.json()
          return retryData.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
        }
      }
      // Try next model
    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err)
    }
  }

  throw new Error("All Gemini models failed")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { destination, coordinates, interests, tripIdea } = body as DiscoverRequest
    
    console.log(`Discovering places for: ${destination}, interests: ${interests}`)

    const TAVILY_KEY = Deno.env.get("TAVILY_API_KEY")
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")

    if (!TAVILY_KEY) {
      return new Response(JSON.stringify({ error: "TAVILY_API_KEY is not configured in Supabase secrets." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase secrets. Gemini features require this key." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // --- Step 1: Search with Tavily ---
    // Use Authorization header (current Tavily API format)
    const searchQueries = [
      `best places to visit in ${destination} ${interests.join(" ")} travel guide`,
      `top attractions ${destination} hidden gems things to do ${tripIdea || ""}`,
      `${destination} ${interests.slice(0, 3).join(" ")} recommendations tourists`,
    ]

    console.log("Starting Tavily searches...")
    const tavilyResults = await Promise.all(
      searchQueries.map(async (query) => {
        try {
          const res = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${TAVILY_KEY}`,
            },
            body: JSON.stringify({
              query,
              search_depth: "basic",
              include_images: true,
              max_results: 8,
            }),
          })
          if (!res.ok) {
            const errText = await res.text()
            console.error(`Tavily error (${res.status}): ${errText.slice(0, 200)}`)
            return []
          }
          const data = await res.json()
          return (data.results || []).map((r: any) => ({
            title: r.title || "",
            content: r.content || "",
            url: r.url || "",
            image: r.images?.[0] || "",
          }))
        } catch (err) {
          console.error("Tavily fetch error:", err)
          return []
        }
      })
    )

    // Flatten and deduplicate by title
    const allResults = tavilyResults.flat()
    const seenTitles = new Set<string>()
    const uniqueResults = allResults.filter((r) => {
      const title = (r.title || "").trim().toLowerCase()
      if (!title || seenTitles.has(title)) return false
      seenTitles.add(title)
      return true
    })

    console.log(`Tavily returned ${allResults.length} total, ${uniqueResults.length} unique results`)

    if (uniqueResults.length === 0) {
      // Return empty if no search results
      return new Response(JSON.stringify({ places: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // --- Step 2: Send Tavily results to Gemini for structured place extraction ---
    const prompt = `You are a travel expert. Analyze these web search results about ${destination} and extract specific, real places to visit.

Search Results:
${JSON.stringify(uniqueResults.slice(0, 15).map(r => ({
  title: r.title,
  content: r.content?.slice(0, 400),
})), null, 2)}

User interests: ${interests.join(", ")}
${tripIdea ? `Trip idea: ${tripIdea}` : ""}

Extract 8-15 specific, real places from the search results. For each place, provide a pointwise card format:
- "name": The actual name of the place/attraction
- "description": A compelling 2-3 sentence description formatted as a pointwise card highlighting key features/facts
- "category": One of: landmark, restaurant, nature, culture, shopping, entertainment, nightlife, museum, temple, beach, park, cafe
- "estimatedPrice": A price string like "Free", "$10-20", "$$", etc.
- "estimatedDuration": Duration in minutes (number)

IMPORTANT: Only include specific named places, NOT generic article titles.

Return a JSON array:
[
  {"name": "Place Name", "description": "• Point 1\n• Point 2", "category": "landmark", "estimatedPrice": "Free", "estimatedDuration": 90},
  ...
]`

    let places: any[] = []

    try {
      const geminiResponse = await callGemini(prompt, GEMINI_KEY)
      
      // Parse the response - try to extract JSON array
      let parsed: any
      try {
        parsed = JSON.parse(geminiResponse)
      } catch {
        // Try to find JSON array in the response
        const arrStart = geminiResponse.indexOf("[")
        const arrEnd = geminiResponse.lastIndexOf("]")
        if (arrStart !== -1 && arrEnd !== -1) {
          parsed = JSON.parse(geminiResponse.substring(arrStart, arrEnd + 1))
        } else {
          throw new Error("Could not parse Gemini response as JSON")
        }
      }

      if (Array.isArray(parsed)) {
        places = parsed
      } else if (parsed?.places && Array.isArray(parsed.places)) {
        places = parsed.places
      }
      
      console.log(`Gemini extracted ${places.length} places`)
    } catch (err) {
      console.error("Gemini processing failed, using fallback:", err)
      
      // Fallback: create places directly from Tavily results
      places = uniqueResults.slice(0, 12).map((r) => ({
        name: (r.title || "Unknown Place").split(" - ")[0].split(" | ")[0].trim(),
        description: (r.content || "").slice(0, 180),
        category: interests[0] || "landmark",
        estimatedPrice: extractPrice(r.content || ""),
        estimatedDuration: 90,
      }))
    }

    // --- Step 3: Build final place objects with coordinates ---
    // Use destination coordinates as base, with small random offsets per place
    const baseCoords = coordinates || [0, 0]
    
    const finalPlaces = places.slice(0, 15).map((p: any, idx: number) => {
      // Add small random offset from base coordinates to spread places on map
      const latOffset = (Math.random() - 0.5) * 0.06
      const lonOffset = (Math.random() - 0.5) * 0.06
      
      // Match image from Tavily results if possible
      const matchingResult = uniqueResults.find(
        (r) => r.title?.toLowerCase().includes(p.name?.toLowerCase()?.split(" ")[0] || "___")
      )

      return {
        id: `place_${Date.now()}_${idx}`,
        name: p.name || `Place ${idx + 1}`,
        description: p.description || "A wonderful place to visit.",
        category: p.category || interests[0] || "landmark",
        coordinates: [
          baseCoords[0] + latOffset,
          baseCoords[1] + lonOffset,
        ],
        rating: Number((Math.random() * (4.9 - 4.2) + 4.2).toFixed(1)),
        duration: Number(p.estimatedDuration) || 90,
        imageUrl: matchingResult?.image || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80`,
        address: destination,
        openingHours: "Open Daily",
        price: p.estimatedPrice || extractPrice("") || "Varies",
      }
    })

    console.log(`Returning ${finalPlaces.length} final places`)

    return new Response(JSON.stringify({ 
      places: finalPlaces,
      debug: {
        geminiUsed: places === parsed || (parsed && places === parsed.places),
        geminiError: geminiErrorMessage || null
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in discover-places:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
