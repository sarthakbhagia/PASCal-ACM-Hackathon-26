(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/components/travel/travel-map.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TravelMap",
    ()=>TravelMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/Polyline.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// Fix for default markers
const createNumberedIcon = (number)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        className: 'custom-marker',
        html: `<div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs border-2 border-white shadow-lg">${number}</div>`,
        iconSize: [
            24,
            24
        ],
        iconAnchor: [
            12,
            12
        ]
    });
};
function MapUpdater({ center, places }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapUpdater.useEffect": ()=>{
            if (places.length > 0) {
                const bounds = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].latLngBounds(places.map({
                    "MapUpdater.useEffect.bounds": (p)=>p.coordinates
                }["MapUpdater.useEffect.bounds"]));
                map.fitBounds(bounds, {
                    padding: [
                        50,
                        50
                    ]
                });
            } else {
                map.setView(center, 12);
            }
        }
    }["MapUpdater.useEffect"], [
        center,
        places,
        map
    ]);
    return null;
}
_s(MapUpdater, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapUpdater;
function TravelMap({ places, center = [
    35.6762,
    139.6503
], interactive = true, onPlaceClick }) {
    _s1();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [detailedRoute, setDetailedRoute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TravelMap.useEffect": ()=>{
            setMounted(true);
        }
    }["TravelMap.useEffect"], []);
    // Fetch actual routing data from OSRM (Open Source Routing Machine)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TravelMap.useEffect": ()=>{
            async function fetchRoute() {
                if (places.length < 2) {
                    setDetailedRoute([]);
                    return;
                }
                // OSRM expects: lon,lat;lon,lat
                const coordinatesString = places.map({
                    "TravelMap.useEffect.fetchRoute.coordinatesString": (p)=>`${p.coordinates[1]},${p.coordinates[0]}`
                }["TravelMap.useEffect.fetchRoute.coordinatesString"]).join(';');
                try {
                    const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.routes && data.routes.length > 0) {
                            // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
                            const routePoints = data.routes[0].geometry.coordinates.map({
                                "TravelMap.useEffect.fetchRoute.routePoints": (coord)=>[
                                        coord[1],
                                        coord[0]
                                    ]
                            }["TravelMap.useEffect.fetchRoute.routePoints"]);
                            setDetailedRoute(routePoints);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch OSRM route:', error);
                }
                setDetailedRoute([]);
            }
            fetchRoute();
        }
    }["TravelMap.useEffect"], [
        places
    ]);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-[400px] bg-card rounded-xl flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse text-muted-foreground",
                children: "Loading map..."
            }, void 0, false, {
                fileName: "[project]/frontend/components/travel/travel-map.tsx",
                lineNumber: 98,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/travel/travel-map.tsx",
            lineNumber: 97,
            columnNumber: 7
        }, this);
    }
    const routeCoordinates = places.map((p)=>p.coordinates);
    const pathToRender = detailedRoute.length > 0 ? detailedRoute : routeCoordinates;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
        center: center,
        zoom: 12,
        className: "w-full h-full min-h-[400px] rounded-xl z-0",
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            }, void 0, false, {
                fileName: "[project]/frontend/components/travel/travel-map.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapUpdater, {
                center: center,
                places: places
            }, void 0, false, {
                fileName: "[project]/frontend/components/travel/travel-map.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            pathToRender.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                positions: pathToRender,
                pathOptions: {
                    color: '#e87d3e',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: detailedRoute.length > 0 ? undefined : '10, 10',
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            }, void 0, false, {
                fileName: "[project]/frontend/components/travel/travel-map.tsx",
                lineNumber: 125,
                columnNumber: 9
            }, this),
            places.map((place, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: place.coordinates,
                    icon: createNumberedIcon(index + 1),
                    eventHandlers: {
                        click: ()=>onPlaceClick?.(place)
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 min-w-[180px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-bold text-foreground",
                                    children: place.name
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/travel/travel-map.tsx",
                                    lineNumber: 150,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-muted-foreground mt-1",
                                    children: place.address
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/travel/travel-map.tsx",
                                    lineNumber: 151,
                                    columnNumber: 15
                                }, this),
                                'startTime' in place && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-primary mt-2",
                                    children: [
                                        place.startTime,
                                        " - ",
                                        place.endTime
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/components/travel/travel-map.tsx",
                                    lineNumber: 153,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/components/travel/travel-map.tsx",
                            lineNumber: 149,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/travel/travel-map.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this)
                }, place.id, false, {
                    fileName: "[project]/frontend/components/travel/travel-map.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/travel/travel-map.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_s1(TravelMap, "9/r3q8bBpKljnNZCm6Et9E3+Szc=");
_c1 = TravelMap;
var _c, _c1;
__turbopack_context__.k.register(_c, "MapUpdater");
__turbopack_context__.k.register(_c1, "TravelMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/travel/travel-map.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/components/travel/travel-map.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=frontend_components_travel_travel-map_tsx_0wcej7g._.js.map