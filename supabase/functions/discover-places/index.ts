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
  pace: string
  accommodationType: string
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { destination, coordinates, interests, pace } =
      (await req.json()) as DiscoverRequest

    const LOCATIONIQ_KEY = Deno.env.get("LOCATIONIQ_API_KEY")!
    const TAVILY_KEY = Deno.env.get("TAVILY_API_KEY")!

    // Step 1: Use LocationIQ to find actual Points of Interest (POIs) for each interest
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

    const poiTasks = interests.map(async (interest) => {
      const tag = categoryMap[interest] || interest
      const query = `${tag} in ${destination}`
      const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`

      try {
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          return data.map((item: any) => ({
            name: item.display_name?.split(",")[0] || "Unknown Spot",
            fullName: item.display_name,
            lat: item.lat,
            lon: item.lon,
            category: interest,
            place_id: item.place_id,
            address: item.display_name?.split(",").slice(0, 3).join(",") || destination,
          }))
        }
        return []
      } catch {
        return []
      }
    })

    const poiResults = (await Promise.all(poiTasks)).flat()
    
    // Deduplicate POIs
    const seen = new Set()
    const uniquePOIs = poiResults.filter(poi => {
      if (seen.has(poi.name)) return false
      seen.add(poi.name)
      return true
    })

    // Step 2: Enrich the TOP POIs with Tavily descriptions and images
    const enrichmentTasks = uniquePOIs.slice(0, 15).map(async (poi) => {
      const query = `${poi.name} ${destination} tourist information Highlights and Description`
      
      try {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query: query,
            search_depth: "basic",
            include_images: true,
            max_results: 1
          }),
        })

        let description = `A popular ${poi.category} in ${destination}. Highly recommended for visitors looking for an authentic experience.`
        let imageUrl = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80"

        if (res.ok) {
          const data = await res.json()
          if (data.results && data.results.length > 0) {
            description = data.results[0].content
          }
          if (data.images && data.images.length > 0) {
            imageUrl = data.images[0]
          }
        }

        return {
          id: `place_${poi.place_id}_${Date.now()}`,
          name: poi.name,
          description: description,
          category: poi.category,
          coordinates: [Number(poi.lat), Number(poi.lon)],
          rating: Number((Math.random() * (5.0 - 4.3) + 4.3).toFixed(1)),
          duration: poi.category === 'restaurant' ? 60 : 120,
          imageUrl: imageUrl,
          address: poi.address,
          openingHours: "Open Daily",
          price: "Varies",
        }
      } catch {
        return null
      }
    })

    const enrichedPlaces = await Promise.all(enrichmentTasks)
    const validPlaces = enrichedPlaces.filter(p => p !== null)

    return new Response(JSON.stringify({ 
      places: validPlaces 
    }), {
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
