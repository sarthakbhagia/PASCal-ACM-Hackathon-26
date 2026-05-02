import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface DiscoverRequest {
  destination: string
  coordinates: [number, number]
  interests: string[]
  budget: string
  pace: string
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { destination, coordinates, interests, budget, pace } =
      (await req.json()) as DiscoverRequest

    const LOCATIONIQ_KEY = Deno.env.get("LOCATIONIQ_API_KEY")!
    const TAVILY_KEY = Deno.env.get("TAVILY_API_KEY")!

    // Step 1: Search for POIs using LocationIQ
    const categoryMap: Record<string, string> = {
      landmark: "tourism",
      restaurant: "restaurant",
      museum: "museum",
      park: "park",
      shopping: "mall",
      entertainment: "theatre",
      beach: "beach",
      nightlife: "bar",
    }

    const poiResults: any[] = []

    // Search for each interest category
    const searchPromises = interests.map(async (interest) => {
      const tag = categoryMap[interest] || interest
      const query = `${tag} in ${destination}`
      const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`

      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          return data.map((item: any) => ({
            ...item,
            searchCategory: interest,
          }))
        }
        return []
      } catch {
        return []
      }
    })

    const results = await Promise.all(searchPromises)
    for (const batch of results) {
      poiResults.push(...batch)
    }

    // Deduplicate by place_id
    const seen = new Set<string>()
    const uniquePOIs = poiResults.filter((poi) => {
      if (seen.has(poi.place_id)) return false
      seen.add(poi.place_id)
      return true
    })

    // Take top 10 unique POIs to stay within fast API limits
    const topPOIs = uniquePOIs.slice(0, 10)

    // Step 2: Fetch descriptions and images using Tavily Search API concurrently
    const tavilyPromises = topPOIs.map(async (p, i) => {
      const name = p.display_name?.split(",")[0] || "Unknown Place"
      const category = p.searchCategory || "landmark"
      
      const query = `${name} ${destination} tourist information description`
      
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query: query,
            search_depth: "basic",
            include_images: true,
            max_results: 1
          }),
        })

        let description = `A popular ${category} located in the heart of ${destination}. Highly recommended for visitors looking for an authentic experience.`
        let imageUrl = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80"
        
        // Default images based on category as fallback
        if (category === 'restaurant') imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"
        if (category === 'museum') imageUrl = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80"
        if (category === 'park') imageUrl = "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&q=80"

        if (res.ok) {
          const tavilyData = await res.json()
          if (tavilyData.results && tavilyData.results.length > 0) {
            description = tavilyData.results[0].content
          }
          if (tavilyData.images && tavilyData.images.length > 0) {
            imageUrl = tavilyData.images[0]
          }
        }

        return {
          id: `place_${p.place_id || i}_${Date.now()}`,
          name: name,
          description: description,
          category: category,
          coordinates: [Number(p.lat), Number(p.lon)],
          rating: Number((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)), // Mock rating between 4.2 and 5.0
          duration: category === 'restaurant' ? 60 : 120,
          imageUrl: imageUrl,
          address: p.display_name?.split(",").slice(0, 3).join(",") || destination,
          openingHours: "9:00 AM - 6:00 PM",
          price: "Varies",
        }
      } catch (err) {
        // Fallback if Tavily fails for this specific item
        return {
          id: `place_${p.place_id || i}_${Date.now()}`,
          name: name,
          description: `A popular ${category} located in the heart of ${destination}. Highly recommended for visitors looking for an authentic experience.`,
          category: category,
          coordinates: [Number(p.lat), Number(p.lon)],
          rating: Number((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
          duration: category === 'restaurant' ? 60 : 120,
          imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80",
          address: p.display_name?.split(",").slice(0, 3).join(",") || destination,
          openingHours: "9:00 AM - 6:00 PM",
          price: "Varies",
        }
      }
    })

    const validPlaces = await Promise.all(tavilyPromises)

    return new Response(JSON.stringify({ places: validPlaces }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in discover-places:", error)
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
