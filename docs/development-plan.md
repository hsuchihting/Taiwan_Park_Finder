# Development Plan

## MVP Foundation

1. Build the Nuxt 3 app shell with Tailwind CSS and TypeScript strict mode.
2. Define park domain types before UI implementation.
3. Keep data access behind `ParkSearchProvider` so the UI does not know whether recommendations come from mock data, a REST API, or Twinkle Hub MCP.
4. Start with deterministic rule-based search to make ranking behavior easy to inspect.

## Twinkle Hub MCP Readiness

The future provider should implement the same interface used by `useParkSearch`:

```ts
export interface ParkSearchProvider {
  search(queryText: string): ParkRecommendation[]
}
```

When real integration begins, add a provider that:

- Fetches or queries Taipei park facilities through Twinkle Hub MCP.
- Normalizes external records into the `Park` type.
- Preserves feature confidence metadata.
- Reuses `parseParkSearchQuery` and `rankParks` where possible.

## Next Product Steps

- Add map provider integration and park marker interactions.
- Add district filters and route/transit facets.
- Add confidence provenance details for each badge.
- Add tests for parser and scoring edge cases.
