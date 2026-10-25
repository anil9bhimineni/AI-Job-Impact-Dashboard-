# Implementation Backlog

Dependency ordered. Tasks marked foundation should be completed before feature work that depends on them.

## Phase 1: Foundation

1. Confirm product route name and whether the dashboard shares this Vite app or moves to a separate app.
2. Convert frontend source to TypeScript or add TypeScript support for new dashboard modules.
3. Add linting and formatting configuration.
4. Add Vitest test runner.
5. Add React Testing Library.
6. Add Playwright for E2E tests.
7. Add D3 dependency.
8. Add Zod or equivalent runtime validation library.
9. Create `src/jobs-dashboard/` module boundary.
10. Define shared occupation TypeScript types.
11. Define enum constants for sectors, metro categories, skill levels, education bands, and city tiers.
12. Add sample occupation fixture loader.
13. Add dashboard route shell.
14. Add data freshness banner component.
15. Add error boundary for dashboard route.

## Phase 2: Data Model And Backend

16. Add PostgreSQL Docker service.
17. Add database migration runner.
18. Create enum migrations.
19. Create `occupations` table.
20. Create `occupation_aliases` table.
21. Create `locations` table.
22. Create `employers` table.
23. Create `skills` table.
24. Create `occupation_skills` table.
25. Create `data_sources` table.
26. Create `raw_source_records` table.
27. Create `job_observations` table.
28. Create `score_versions` table.
29. Create `occupation_scores` table.
30. Create `salary_observations` table.
31. Create `occupation_location_shares` table.
32. Add indexes from `DATABASE.md`.
33. Create seed script for core locations.
34. Create seed script for sample occupations.
35. Add migration rollback documentation.

## Phase 3: API

36. Choose Express or Fastify and add backend scaffold.
37. Add backend TypeScript build.
38. Add environment configuration loader.
39. Add PostgreSQL connection pool.
40. Implement `/api/v1/health`.
41. Implement query validation for `/api/v1/occupations`.
42. Implement occupation list repository.
43. Implement `/api/v1/occupations`.
44. Implement occupation detail repository.
45. Implement `/api/v1/occupations/:id`.
46. Implement facet repository.
47. Implement `/api/v1/facets`.
48. Implement score version repository.
49. Implement `/api/v1/score-versions`.
50. Implement CSV export endpoint.
51. Add API error response middleware.
52. Add API integration tests.
53. Add API pagination tests.
54. Add API filter combination tests.

## Phase 4: Scoring Engine

55. Implement enum validation for scoring records.
56. Implement metro score to category mapping.
57. Implement city-tier share calculation.
58. Implement sector classifier using explicit hints and keyword fallbacks.
59. Implement skill-level classifier.
60. Implement education-band classifier.
61. Implement tech adoption scoring rules.
62. Implement remote work scoring rules.
63. Implement growth outlook scoring rules.
64. Implement rationale template generation.
65. Implement analyst override model.
66. Add scoring confidence field.
67. Add scoring unit tests for all sectors.
68. Add scoring tests for boundary values.
69. Add score version publishing command.
70. Add score-change audit report.

## Phase 5: Ingestion

71. Implement structured JSONL parser.
72. Implement CSV parser.
73. Implement source registration.
74. Implement raw record hashing.
75. Implement raw record storage.
76. Implement validation error quarantine.
77. Implement occupation alias matching.
78. Implement location normalization.
79. Implement employer normalization.
80. Implement skills normalization.
81. Implement job observation creation.
82. Implement salary observation creation.
83. Implement dry-run ingestion mode.
84. Implement ingestion status log.
85. Add sample ingestion command.
86. Add ingestion integration test.
87. Add malformed-file test.
88. Add duplicate-record test.

## Phase 6: Treemap Dashboard

89. Implement dashboard data fetch hook.
90. Implement URL state parser.
91. Implement URL state writer.
92. Implement filter bar layout.
93. Implement search filter.
94. Implement sector multi-select filter.
95. Implement metro category filter.
96. Implement skill-level filter.
97. Implement education-band filter.
98. Implement score range controls.
99. Implement state/tier filters.
100. Implement reset filters.
101. Implement copy-link control.
102. Implement D3 treemap layout adapter.
103. Implement treemap tile component.
104. Implement sector group labels.
105. Implement metro color scale.
106. Implement score legend.
107. Implement tile hover state.
108. Implement keyboard tile focus.
109. Implement tile click/tap selection.
110. Implement selected occupation drawer.
111. Implement mobile bottom sheet behavior.
112. Implement tooltip with concise evidence.
113. Implement treemap empty state.
114. Implement loading skeleton.
115. Implement stale data banner.

## Phase 7: Grid And Detail

116. Implement occupation grid.
117. Implement sortable score columns.
118. Implement accessible row selection.
119. Implement detail rationale sections.
120. Implement top locations list.
121. Implement skills list.
122. Implement salary summary block.
123. Implement source list.
124. Implement confidence indicator.
125. Implement CSV export from current filters.
126. Implement JSON export from current filters.

## Phase 8: Quality And Release

127. Add component tests for filters.
128. Add component tests for drawer.
129. Add treemap layout tests.
130. Add Playwright desktop journey.
131. Add Playwright mobile journey.
132. Add accessibility test pass.
133. Add visual regression screenshots.
134. Add performance smoke test with 1,000 records.
135. Add Dockerfile.
136. Add docker-compose local stack.
137. Add GitHub Actions CI.
138. Add deployment environment documentation.
139. Add production build health check.
140. Add release checklist.
141. Run full test suite.
142. Publish first sample score version.
143. Capture QA screenshots.
144. Prepare changelog entry.

