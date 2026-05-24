Deep Enterprise-Level React Architecture Review
Please perform a deep, strict, enterprise-level code review of the entire solution.
The review must cover all files, folders, modules, components, hooks, services, state management, utilities, tests, configs, and architecture decisions.
Focus heavily on:

- React architecture
- Frontend scalability
- SOLID principles
- GRASP principles
- Clean Architecture
- Domain separation
- Component communication
- State management patterns
- Performance
- Maintainability
- Open-source projectx standards
- Enterprise engineering practices
- Security
- Stability
- Type safety
- Reusability
- Extensibility
- Developer experience
  The review must be extremely strict and written from the perspective of:
- Senior Staff Engineer
- Frontend Architect
- Open-source maintainer
- FAANG-level reviewer
  Do NOT be polite or optimistic.Assume this codebase is intended for:
- large-scale production usage
- long-term maintenance
- high team scalability
- open-source contributions

⸻

Required Review Areas

1. Architecture Review
   Analyze:

- overall project architecture
- folder structure
- module boundaries
- separation of concerns
- dependency direction
- feature isolation
- domain organization
- shared code organization
- scalability bottlenecks
- coupling/cohesion
- anti-patterns
- architectural smells
- hidden technical debt
  Check whether architecture follows:
- Clean Architecture
- Feature-Sliced Design
- Hexagonal Architecture
- Atomic Design (if applicable)
- Modular design principles
  Identify:
- cyclic dependencies
- god components
- god hooks
- smart/dumb component violations
- hidden shared mutable state
- poor abstractions
- overengineering
- underengineering

⸻

2. React Best Practices Review
   Review all React code for:

- rendering performance
- memoization misuse
- unnecessary re-renders
- prop drilling
- state colocation problems
- hook anti-patterns
- incorrect useEffect usage
- stale closures
- dependency array issues
- improper context usage
- component responsibility violations
- excessive component size
- composition quality
- custom hook quality
- React concurrent rendering safety
- Suspense readiness
- Server Components compatibility (if applicable)
  Check:
- component API quality
- readability
- predictability
- composability
- testability

⸻

3. SOLID Principles Review
   Evaluate every important module/component against:

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle
  For each violation:
- explain why
- explain risks
- explain long-term impact
- propose a better architecture

⸻

4. GRASP Principles Review
   Analyze usage of:

- Information Expert
- Creator
- Controller
- Low Coupling
- High Cohesion
- Polymorphism
- Pure Fabrication
- Indirection
- Protected Variations
  Identify where responsibilities are incorrectly assigned.

⸻

5. State Management Review
   Analyze:

- local state design
- global state design
- server state management
- caching strategy
- normalization
- selector quality
- state ownership
- derived state issues
- async flow quality
- race conditions
- state synchronization issues
  Review usage of:
- Redux
- Zustand
- MobX
- Context
- React Query / TanStack Query
- SWR
- Apollo
- or any custom solution

⸻

6. Communication Between Components
   Review:

- parent-child communication
- event propagation
- callback patterns
- context boundaries
- dependency leaks
- implicit coupling
- shared state misuse
- inversion of control
- extensibility of APIs
  Identify fragile communication patterns.

⸻

7. TypeScript Review
   Review:

- type safety
- any usage
- unsafe casts
- generic quality
- inferred vs explicit typing
- domain model quality
- DTO separation
- discriminated unions
- runtime safety gaps
  Check whether types are:
- scalable
- maintainable
- expressive
- safe for refactoring

⸻

8. Performance Review
   Review:

- rendering efficiency
- bundle size risks
- lazy loading
- code splitting
- Suspense usage
- virtualization opportunities
- expensive computations
- memory leaks
- unnecessary effects
- reconciliation issues
- list rendering quality
- caching strategy
  Identify:
- hidden performance bottlenecks
- scaling risks

⸻

9. Testing Review
   Analyze:

- test architecture
- test quality
- mocking strategy
- test readability
- snapshot abuse
- integration coverage
- business logic coverage
- maintainability of tests
- flaky test risks
  Check:
- testing-library practices
- Jest/Vitest setup
- isolation quality
- deterministic behavior

⸻

10. Security & Stability Review
    Review:

- XSS risks
- unsafe HTML rendering
- token handling
- secrets exposure
- environment config handling
- runtime crash risks
- error boundaries
- resilience
- retry logic
- defensive programming
- validation quality

⸻

11. Open Source & Enterprise Standards
    Evaluate whether the project is production-grade:

- contribution friendliness
- documentation quality
- naming consistency
- discoverability
- onboarding quality
- maintainability
- CI/CD readiness
- linting quality
- formatting consistency
- dependency hygiene
- package structure
- public API stability
  Review overall engineering maturity.

⸻

Output Format Requirements
Generate a detailed .md report with:
Executive Summary

- overall quality assessment
- main architectural risks
- maintainability evaluation
- scalability evaluation
  Final Score
  Provide strict scores from 0–100 for:
- Architecture
- React Quality
- SOLID Compliance
- Maintainability
- Scalability
- Performance
- Type Safety
- Testing
- Security
- Open Source Readiness
  Also provide:
- Overall Final Score
- Estimated Engineering Level:
  _ Junior
  _ Middle
  _ Senior
  _ Staff \* Principal
  Detailed Findings
  For every issue include:
- severity:
  - Critical
  - High
  - Medium
  - Low
- affected files
- explanation
- risks
- long-term consequences
- exact improvement recommendation
  Architecture Improvement Plan
  Provide:
- refactoring priorities
- quick wins
- long-term improvements
- recommended architecture changes
- scaling recommendations
  Strictness Requirement
  Be extremely critical.Do not assume intentions.Judge only implementation quality.Highlight every possible weakness, risk, anti-pattern, shortcut, and architectural flaw.
  Assume the code will need to:
- scale to millions of users
- support large engineering teams
- survive years of maintenance
- be used as an open-source reference implementation.
