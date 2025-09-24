# Code Style and Conventions

## Code Quality Framework
- **Primary Tool**: Biome 1.9.4 with "ultracite" preset
- **Configuration**: Extends ultracite configuration in biome.json
- **Philosophy**: Consistent, modern JavaScript/TypeScript formatting

## TypeScript Configuration
- **Strict Mode**: Enabled with strict null checks
- **Module System**: NodeNext with ESM (type: "module")
- **Target**: ES2022 with modern browser support
- **Compiler Options**:
  - Declaration files enabled
  - Isolated modules
  - Force consistent casing
  - Skip lib check for performance

## Naming Conventions
- **Packages**: `@repo/*` namespace for workspace packages
- **Components**: PascalCase for React components
- **Files**: kebab-case for file names, PascalCase for component files
- **Variables**: camelCase for JavaScript/TypeScript
- **Constants**: UPPER_SNAKE_CASE for true constants

## Project Structure Patterns
- **Monorepo Layout**: Clear separation between apps and packages
- **Package Organization**: Feature-based packages (auth, seo, design-system)
- **Component Architecture**: Radix UI primitives with custom wrapper components
- **API Layer**: Dedicated strapi-client package for API interactions

## Import Patterns
- **Workspace Imports**: Use `@repo/*` for internal packages
- **Relative Imports**: Minimal use, prefer absolute workspace imports
- **External Dependencies**: Standard npm package imports

## Code Organization
- **Single Responsibility**: Each package has clear, focused purpose
- **Dependency Direction**: Apps depend on packages, packages can depend on other packages
- **Type Safety**: Strict TypeScript throughout with proper type exports
- **Error Handling**: Zod for runtime validation, TypeScript for compile-time safety

## Ignored Patterns
- **Design System**: UI components excluded from linting (generated/external)
- **Generated Files**: Strapi types and build outputs ignored
- **Configuration**: Some config files excluded from formatting