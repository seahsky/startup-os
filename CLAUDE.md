# Project Guidelines: Startup-OS Invoicing Application

## Project Overview

This is a full-stack business-to-business invoicing and billing platform built as a Software-as-a-Service application. The system manages the complete lifecycle of sales quotations, invoices, credit notes, and debit notes, along with customer and product catalog management. It serves businesses that need professional quote-to-cash workflows with payment tracking, audit trails, and multi-company support.

The application handles document workflows from creation through payment completion, with automatic tax calculations, document numbering, status transitions, and historical data preservation for compliance purposes.

## Technology Stack

### Core Framework
The application uses Next.js version fourteen with the App Router architecture, leveraging React eighteen for the user interface. TypeScript is enabled in strict mode throughout the entire codebase for maximum type safety.

### API Layer
The backend uses tRPC for end-to-end type-safe APIs without code generation. This provides automatic TypeScript inference from server to client and eliminates the need for OpenAPI specifications or manual type synchronization.

### Database
PostgreSQL serves as the underlying storage engine, with FerretDB providing a MongoDB-compatible API layer on top. This combination delivers document database flexibility with relational database reliability. The MongoDB Node.js driver connects to FerretDB for all database operations.

### Authentication
Clerk handles all user authentication, session management, and user metadata storage. It provides OAuth integration, multi-factor authentication, and serves as the source of truth for user identity and company associations.

### Frontend Stack
Tailwind CSS provides utility-first styling. Radix UI primitives deliver accessible component foundations. React Hook Form manages form state with Zod schemas for validation. React Query handles server state caching and synchronization through tRPC integration.

### Document Generation
React PDF Renderer creates downloadable invoice and quotation documents. The library supports templating with full styling control.

## Architecture Principles

### Monolithic Full-Stack Architecture
The application follows a monolithic architecture with frontend and backend co-located in a single Next.js application. This simplifies deployment, reduces operational complexity, and leverages Next.js server-side rendering capabilities.

### Type Safety First
Every boundary between layers uses TypeScript for compile-time type checking. Input validation occurs at runtime through Zod schemas that automatically generate TypeScript types. The tRPC layer ensures type safety from database queries through API responses to React components.

### Layered Architecture
The system separates concerns into distinct layers: presentation components render UI, tRPC routers handle API endpoints, service classes implement business logic, collection helpers abstract database access, and the database stores data. Each layer depends only on the layer directly below it.

### Multi-Tenancy by Company
All data is strictly isolated by company identifier. Every database collection includes a company identifier field. All queries automatically filter by the current user's company. User-to-company associations are stored in Clerk user metadata and validated on every request.

### Document Snapshot Pattern
Customer information is captured and stored within transaction documents at creation time. This preserves historical accuracy even when customer records are updated later. Auditors can see exactly what information was present when an invoice was created.

### Service Layer for Business Logic
Complex business operations like tax calculations, document numbering, payment recording, and document conversions are encapsulated in stateless service classes. This keeps routers thin and focused on request handling while making business logic reusable and testable.

## Currency Handling

The application implements comprehensive, standards-compliant currency handling using dinero.js for precision and proper formatting for all supported currencies.

### Monetary Precision with dinero.js

All monetary calculations use dinero.js to eliminate floating-point precision errors. The Money type system provides type-safe wrappers around dinero.js operations.

**Core Principles:**
- Store amounts in cents (minor units) internally to avoid floating-point errors
- Always include currency information with monetary values
- Use immutable operations for all calculations
- Validate currency matching to prevent mixing USD with EUR

**Money Type Location:** `src/lib/types/money.ts`

**Key Functions:**
```typescript
// Creating Money objects
fromDecimal(19.99, 'USD') // Converts dollars to Money object
createMoney(1999, 'USD')  // Creates from cents directly

// Calculations
add(money1, money2)       // Addition (validates same currency)
subtract(money1, money2)  // Subtraction
multiply(money, 3)        // Multiplication
percentage(money, 0.0825) // Calculate percentage (8.25%)

// Conversion
toDecimal(money)          // Convert to decimal for display
getCents(money)           // Get cents for database storage
```

**Example Usage:**
```typescript
import { fromDecimal, add, multiply, toDecimal } from '@/lib/types/money';

const unitPrice = fromDecimal(19.99, 'USD');
const quantity = 3;
const subtotal = multiply(unitPrice, quantity); // $59.97 - precise!

const tax = multiply(subtotal, 0.0825); // Calculate 8.25% tax
const total = add(subtotal, tax); // Add tax to subtotal

const displayAmount = toDecimal(total); // Convert to 64.92 for display
```

### Supported Currencies

The application supports 40+ currencies with full metadata including symbols, decimal places, and formatting rules.

**Currency Constants Location:** `src/lib/constants/currencies.ts`

**Standard Two-Decimal Currencies:**
USD, EUR, GBP, CAD, AUD, SGD, MYR, CNY, INR, BRL, and most others

**Zero-Decimal Currencies (no fractional units):**
- JPY (Japanese Yen) - displays as ¥1,234 not ¥1,234.00
- KRW (South Korean Won) - displays as ₩1,234
- VND (Vietnamese Dong) - displays as ₫1,234
- IDR (Indonesian Rupiah) - displays as Rp1,234
- CLP (Chilean Peso) - displays as $1,234

**Three-Decimal Currencies (Middle Eastern):**
- BHD (Bahraini Dinar) - displays as BD 1.234
- KWD (Kuwaiti Dinar) - displays as KD 1.234
- OMR (Omani Rial) - displays as OMR 1.234
- JOD (Jordanian Dinar) - displays as JD 1.234
- TND (Tunisian Dinar) - displays as DT 1.234

All currency formatting automatically handles the correct number of decimal places based on currency type.

### Currency Display Standards

The application follows ISO 4217, Unicode CLDR, and WCAG accessibility standards for currency display.

**Display Modes:**

**Symbol Mode** (compact for tables):
```typescript
formatCurrencyWithSymbol(1234.56, 'USD') // "$1,234.56"
formatCurrencyWithSymbol(1234.56, 'EUR') // "€1,234.56"
formatCurrencyWithSymbol(1234, 'JPY')    // "¥1,234" (auto 0 decimals)
```

**Code Mode** (clear for forms and documents):
```typescript
formatCurrencyWithCode(1234.56, 'USD') // "USD 1,234.56"
formatCurrencyWithCode(1234.56, 'EUR') // "EUR 1,234.56"
formatCurrencyWithCode(1234, 'JPY')    // "JPY 1,234"
```

**Formatting Utilities Location:** `src/lib/utils/currency.ts`

### Currency Display Components

React components with built-in accessibility support.

**Component Location:** `src/components/shared/CurrencyDisplay.tsx`

**Available Components:**

**CurrencyDisplay** - Main component with full control:
```tsx
<CurrencyDisplay
  amount={1234.56}
  currency="USD"
  mode="symbol" // or "code"
  showAccessibility={true} // Adds aria-labels for screen readers
/>
```

**CurrencyTableCell** - Pre-styled for tables (symbol mode):
```tsx
<CurrencyTableCell amount={item.total} currency={invoice.currency} />
```

**CurrencyTotal** - Pre-styled for totals/summaries (code mode, emphasized):
```tsx
<CurrencyTotal amount={invoice.total} currency={invoice.currency} />
```

**CurrencyFormValue** - Pre-styled for forms (code mode, clear):
```tsx
<CurrencyFormValue amount={payment.amount} currency={invoice.currency} />
```

### Accessibility Features

All currency displays include screen reader support following WCAG guidelines:

```tsx
<CurrencyDisplay amount={1234.56} currency="USD" />
// Renders: $1,234.56
// Aria-label: "1,234 US dollars and 56 cents"
```

This ensures users with screen readers receive clear, spoken currency information.

### Currency in Calculations

All calculation utilities use dinero.js internally for precision.

**Calculation Utilities Location:** `src/lib/utils/calculations.ts`

**Key Functions:**
```typescript
// Line item calculation with currency
calculateLineItem(quantity, unitPrice, taxRate, currency)
// Returns: { subtotal, taxAmount, total } - all precise

// Document totals with currency
calculateDocumentTotals(items, currency)
// Returns: { subtotal, totalTax, total, taxBreakdown }

// Payment calculations
calculateAmountDue(total, amountPaid, currency)
// Returns: precise remaining balance
```

**Invoice Calculations Location:** `src/server/services/invoiceCalculations.ts`

Provides invoice-specific calculations including payment tracking, payment status determination, late fees, and partial payment allocation.

### Currency Best Practices

**Always Pass Currency:**
Every monetary value should be accompanied by its currency code. Never assume USD.

```tsx
// ❌ Bad - assumes USD
<span>{formatCurrency(amount)}</span>

// ✅ Good - explicit currency
<CurrencyDisplay amount={amount} currency={invoice.currency} />
```

**Use Correct Display Mode:**
- **Symbol mode** for tables and compact displays
- **Code mode** for forms, documents, and when clarity is critical
- **Always show currency** in mixed-currency lists (dashboard, reports)

**Store Currency with Documents:**
Every invoice, quotation, credit note, and debit note has a currency field. This enables multi-currency support and preserves historical accuracy.

**Validate Currency Matching:**
When performing calculations, dinero.js automatically validates that currencies match:
```typescript
const usd = fromDecimal(100, 'USD');
const eur = fromDecimal(100, 'EUR');
add(usd, eur); // ✅ Throws error - prevents mixing currencies
```

**Use Type-Safe Currency Codes:**
```typescript
import type { CurrencyCode } from '@/lib/types/currency';

const currency: CurrencyCode = 'USD'; // ✅ Type-safe
const currency = 'INVALID'; // ❌ TypeScript error
```

### Currency Type Definitions

**Types Location:** `src/lib/types/currency.ts`

```typescript
// Type-safe currency codes
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | ... // 40+ currencies

// Display modes
type CurrencyDisplayMode = 'symbol' | 'code';

// Formatted result with accessibility
interface FormattedCurrency {
  display: string;
  ariaLabel: string;
  currency: CurrencyCode;
  amount: number;
}
```

### Common Currency Patterns

**In tRPC Routers:**
```typescript
// Pass currency to calculation functions
const totals = calculateDocumentTotals(items, input.currency);
```

**In React Components:**
```tsx
// Always use CurrencyDisplay components
<CurrencyDisplay
  amount={invoice.total}
  currency={invoice.currency as CurrencyCode}
  mode="code"
/>
```

**In Database Storage:**
```typescript
// Store amounts as numbers (in decimal form)
// Store currency as ISO 4217 code
{
  total: 1234.56,
  currency: 'USD'
}
```

**In Forms:**
```typescript
// ItemsTable component accepts currency prop
<ItemsTable
  items={items}
  onChange={setItems}
  currency={selectedCurrency}
/>
```

### Testing Currency Handling

When testing currency features:

**Test Different Currency Types:**
- Standard currencies (USD, EUR, GBP)
- Zero-decimal currencies (JPY, KRW)
- Three-decimal currencies (BHD, KWD)

**Test Calculations:**
- Verify no floating-point errors
- Test that currency mismatches are caught
- Verify totals sum correctly

**Test Display:**
- Check symbol vs code modes
- Verify decimal places are correct
- Test accessibility labels with screen readers

**Test Edge Cases:**
- Zero amounts
- Negative amounts
- Very large amounts
- Mixed-currency lists

## Coding Standards

### DRY Principle (Don't Repeat Yourself)

**Extract Common Patterns**
When you notice similar code in multiple places, extract it into a shared utility, service class, or component. The codebase should have single sources of truth for common operations like currency formatting, date handling, and ObjectId conversions.

**Reuse Validation Schemas**
Common validation patterns like address structures, item arrays, and date ranges should be defined once and imported where needed. Composition of Zod schemas is preferred over duplication.

**Create Base Components**
UI patterns that appear in multiple places should become shared components. Examples include form fields, data tables, status badges, and action buttons.

**Service Classes for Shared Logic**
Business logic that applies across multiple entity types should live in service classes. Tax calculation logic should not be duplicated in invoice and credit note routers.

### KISS Principle (Keep It Simple, Stupid)

**Favor Simplicity Over Cleverness**
Write code that is easy to understand on first reading. Avoid complex abstractions, nested ternaries, and overly generic solutions. Explicit is better than implicit.

**One Purpose Per Function**
Each function should do one thing well. If a function requires multiple paragraphs of comments to explain, it should be broken into smaller functions with clear names.

**Avoid Premature Optimization**
Write clear, correct code first. Optimize only when performance problems are measured and confirmed. Simple solutions are easier to optimize later than complex ones.

**Minimal Dependencies**
Only add new dependencies when absolutely necessary. Evaluate whether functionality can be achieved with existing tools or simple utility functions before installing additional packages.

**Straightforward Data Flow**
Data should flow in obvious directions. Avoid circular dependencies, complex callback chains, and magical implicit behavior. Prefer explicit prop passing over context when possible.

## Testing Requirements

### Mandatory Testing Before Handoff

**CRITICAL RULE: All changes MUST be tested before being submitted or handed off to users.**

Never deliver changes without verifying they work correctly. Untested changes are unacceptable and can break the production application. Testing is not optional—it is a required part of every code change.

### Required Testing Steps

Every code change must pass these verification steps before being considered complete:

**1. Type Check** (Required for ALL changes)
```bash
npm run type-check
```
- Must pass with zero TypeScript errors
- Verifies type safety across the entire codebase
- Catches type incompatibilities before runtime

**2. Build Verification** (Required for ALL changes)
```bash
npm run build
```
- Must complete successfully without errors
- Verifies the application can be deployed to production
- Catches import errors, missing dependencies, and SSR issues
- All pages must render without errors during static generation

**3. Development Server Test** (Required for UI/Component changes)
```bash
npm run dev
```
- Start the development server
- Navigate to affected pages/features
- Verify the changes work as expected visually
- Test user interactions (clicks, form submissions, navigation)
- Check browser console for runtime errors
- Test on different screen sizes if UI changes affect layout

### Testing Requirements by Change Type

**TypeScript Type Changes:**
- ✅ Type check must pass
- ✅ Build must succeed
- ✅ Verify affected files compile without errors

**Component/UI Changes:**
- ✅ Type check must pass
- ✅ Build must succeed
- ✅ Development server visual verification
- ✅ Test user interactions
- ✅ Verify responsive behavior
- ✅ Check accessibility (keyboard navigation, screen reader labels)

**API/Backend Changes:**
- ✅ Type check must pass
- ✅ Build must succeed
- ✅ Test API endpoints manually or with API client
- ✅ Verify database operations
- ✅ Test error handling
- ✅ Verify authentication/authorization

**Configuration Changes:**
- ✅ Build must succeed
- ✅ Development server must start
- ✅ Verify configuration takes effect

**Bug Fixes:**
- ✅ All standard tests for change type
- ✅ **CRITICAL:** Reproduce the bug first
- ✅ Verify the bug is actually fixed
- ✅ Test edge cases related to the bug
- ✅ Ensure the fix doesn't introduce new issues

### Test Verification Checklist

Before marking any work as complete, verify:

- [ ] **TypeScript compiles:** `npm run type-check` passes with zero errors
- [ ] **Build succeeds:** `npm run build` completes without errors
- [ ] **No runtime errors:** Development server runs without console errors
- [ ] **Feature works:** Manually tested the changed functionality
- [ ] **No regressions:** Related features still work correctly
- [ ] **Documentation updated:** If behavior changed, docs are updated

### What "Tested" Means

A change is only considered "tested" when:

1. **All required commands pass** without errors or warnings
2. **Manual verification completed** for affected features
3. **Related functionality verified** to ensure no regressions
4. **Error cases tested** (invalid input, edge cases, etc.)
5. **Changes work in production-like environment** (build output, not just dev mode)

### Testing Anti-Patterns to Avoid

**❌ NEVER:**
- Submit changes without running the build
- Assume type checks pass without running them
- Skip manual testing because "it's a small change"
- Test only the happy path (always test error cases)
- Test only in development mode (always verify build succeeds)
- Hand off work with known errors or warnings

**✅ ALWAYS:**
- Run all required verification steps
- Test the actual user-facing behavior
- Verify the build succeeds before submitting
- Check for console errors during testing
- Test edge cases and error conditions
- Document any known limitations

### Testing During Development

**Test Early and Often:**
- Don't wait until the end to test
- Run type check frequently during development
- Test in the browser as you build features
- Catch errors early when they're easier to fix

**Iterative Testing:**
1. Make a small change
2. Run type check to verify types
3. Test in browser to verify behavior
4. Fix any issues immediately
5. Repeat until feature is complete
6. Run full build verification before handoff

### Emergency Fixes Exception

Even for urgent production fixes:
- **Minimum required:** Type check + Build must pass
- Test the specific issue being fixed
- Verify the fix works before deploying
- Never skip testing, even under time pressure

**Remember:** A working but slow fix is better than a fast but broken fix.

## File Organization

### Directory Structure
The source directory contains three main subdirectories: app for Next.js routing and pages, server for backend code, and components for React components. The lib directory holds shared utilities, types, and client-side libraries.

### Route Organization
Routes are organized using Next.js App Router conventions. Route groups use parentheses for organization without affecting URLs. The auth route group contains sign-in and sign-up pages. The dashboard route group contains all protected application routes.

### Component Organization
UI components are organized by purpose. The ui directory contains base components like buttons and inputs. Feature-specific components live in directories named after their feature domain. Shared components used across features live in a shared directory.

### Server Code Organization
Backend code is organized by concern. The routers directory contains tRPC route definitions. The services directory contains business logic classes. The db directory contains database connection and collection helpers.

### Naming Conventions
React components use PascalCase. Utility files and services use camelCase. Type definition files use singular nouns. Schema files include the schema suffix. Route files follow Next.js conventions with page, layout, and route reserved names.

### File Collocation
Keep related files close together. Component-specific styles, tests, and utilities should live alongside the component. Feature directories should contain everything needed for that feature.

## Development Patterns

### tRPC Router Pattern
Every entity has a corresponding tRPC router that exports procedures for list, get by identifier, create, update, and delete operations. List procedures accept pagination and filtering parameters. Mutation procedures return the created or updated entity. Delete procedures return success indicators.

### Protected Procedures
All authenticated endpoints use the protectedProcedure builder which automatically injects user identifier and company identifier into the context. Procedures should immediately validate that these values exist and throw appropriate errors if missing.

### Input Validation
Every procedure defines an input schema using Zod. The schema validates data types, required fields, string lengths, number ranges, and business rules. Validation errors are automatically formatted and returned to the client.

### Service Class Pattern
Services are implemented as classes with async methods. Each service is instantiated once and exported as a singleton. Services are stateless and depend only on database collections and other services passed to methods or accessed through imports.

### Collection Helper Pattern
Database collections are accessed through helper functions that return typed collection references. This provides a single place to manage collection names and ensure consistent typing across the application.

### React Hook Pattern
Data fetching uses tRPC React Query hooks. Mutations use the mutation hook with onSuccess callbacks to invalidate affected queries. Loading and error states are handled consistently using the same pattern across all components.

### Form Pattern
Forms use React Hook Form with Zod resolvers. Form fields are controlled components. Submission handlers receive validated data. Error messages are displayed inline next to fields. Forms disable submit buttons during submission.

## Data Flow

### Read Flow
Client components call tRPC query hooks which trigger requests to tRPC routers. Routers validate input and call service methods if needed. Services or routers query database collections. Results are returned through the tRPC layer and cached by React Query.

### Write Flow
Form submission triggers tRPC mutation hooks which send requests to tRPC routers. Routers validate input through Zod schemas. Service methods implement business logic and perform calculations. Database operations persist changes. Success callbacks invalidate related queries causing automatic UI updates.

### Document Creation Flow
Document creation involves multiple steps coordinated by the router: validate input data, fetch related entities like customer and company, generate unique document numbers, enrich line items with tax calculations, calculate document totals, create customer snapshots, build complete document objects, insert into database, and return created documents.

### Authentication Flow
Middleware intercepts all requests and validates Clerk sessions. Protected routes require authentication and redirect to sign-in if missing. User identifier and metadata are attached to requests. tRPC context extracts user and company identifiers making them available to all procedures.

## API Conventions

### Endpoint Naming
Procedure names use simple verbs: list for collections, getById for single entities, create for new entities, update for modifications, and delete for removals. Avoid redundant prefixes like "get" for queries since tRPC already distinguishes queries from mutations.

### Query Procedures
Use the query procedure type for all read operations. Queries should be idempotent and have no side effects. They are automatically cached by React Query.

### Mutation Procedures
Use the mutation procedure type for all write operations. Mutations should return the affected entity or entities. They should handle errors gracefully and use database transactions when modifying multiple collections.

### Pagination
List endpoints accept page and limit parameters. They return objects containing items array, total count, current page, limit, and total pages. This enables consistent pagination UI across all list views.

### Filtering
List endpoints accept optional filter parameters that correspond to searchable fields. Filters should support common operations like text search, date ranges, status matching, and reference lookups.

### Error Responses
Throw tRPC errors with appropriate error codes: UNAUTHORIZED for missing authentication, FORBIDDEN for insufficient permissions, NOT_FOUND for missing entities, BAD_REQUEST for validation failures, and INTERNAL_SERVER_ERROR for unexpected errors.

## Component Guidelines

### Component Composition
Build complex components from simple, focused components. Each component should have a single clear responsibility. Use composition over inheritance. Pass behavior through props rather than building complex inheritance hierarchies.

### Props Interface
Define explicit TypeScript interfaces for all component props. Avoid using any types. Use discriminated unions for variant props. Document complex props with JSDoc comments.

### Client vs Server Components
Use server components by default for better performance. Only mark components with "use client" directive when they need browser APIs, event handlers, state, or effects. Server components can fetch data directly.

### Loading States
Components that fetch data should show loading indicators while requests are pending. Use skeleton screens for better perceived performance. Show error states with retry options when requests fail.

### Empty States
Components that display lists should show helpful empty states when no data exists. Empty states should explain why the list is empty and provide actions to populate it.

### Accessibility
Components should be keyboard navigable. Use semantic HTML elements. Include ARIA labels for screen readers. Ensure sufficient color contrast. Support focus management in modals and dialogs.

## Validation Strategy

### Schema Definition
Define Zod schemas for each entity covering creation, update, and list operations. Creation schemas validate all required fields. Update schemas typically include an identifier plus optional fields. List schemas validate pagination and filter parameters.

### Schema Composition
Build complex schemas from smaller reusable schemas. Define common patterns like addresses and phone numbers once and compose them into entity schemas. Use Zod's pick, omit, and extend methods to derive related schemas.

### Type Inference
Export TypeScript types by inferring them from Zod schemas using the infer utility. This ensures validation rules and type definitions stay synchronized automatically.

### Validation Placement
Perform validation at API boundaries using tRPC input schemas. Avoid duplicating validation in components and services. Let validation errors bubble up to be handled at the UI layer.

### Custom Validation
Use Zod's refine and superRefine methods for complex business rules that span multiple fields. Keep validation logic close to schema definitions rather than spreading it through service layers.

## Business Logic

### Service Responsibilities
Services encapsulate domain logic that operates on multiple entities or requires complex calculations. Examples include tax calculations, document number generation, payment recording, and document conversions.

### Service Methods
Service methods should be pure functions when possible, depending only on their parameters. When side effects are necessary, methods should be explicit about what they modify. Prefer returning new objects over mutating parameters.

### Transaction Coordination
Complex operations that modify multiple collections should be wrapped in service methods. The service coordinates the sequence of operations and handles rollback if any step fails.

### Calculation Separation
Separate calculation logic from persistence logic. Calculation services should accept data and return enriched data without touching the database. Routers handle persisting calculated results.

### Status Transitions
Document status changes should be managed through service methods that validate transitions and enforce business rules. Not all status changes are valid, and services enforce these constraints.

## Authentication & Authorization

### Session Management
Clerk manages all session state. Never implement custom session handling. Trust Clerk's session validation in middleware and context creation.

### User Context
The tRPC context provides user identifier and company identifier for all protected procedures. These values are extracted from Clerk session data and user metadata. Procedures can assume these values exist when using protected procedure builder.

### Company Association
Users are associated with companies through Clerk public metadata. The metadata contains the company identifier which is used to filter all data access. Changing a user's company requires updating their Clerk metadata.

### Role-Based Access
User roles are defined in types but not yet enforced. When implementing role checks, read the role from Clerk metadata and validate in protected procedures before allowing operations.

### Metadata Management
User metadata should be updated through Clerk APIs. Never store user metadata directly in the application database. Keep application state and identity state separate.

## Database Patterns

### Collection Access
Access collections through typed helper functions that return MongoDB collection references. This centralizes collection naming and provides consistent typing.

### Multi-Tenancy Filtering
Every query must filter by company identifier. This is not optional. Forgetting to filter by company would expose data across company boundaries.

### ObjectId Handling
MongoDB uses ObjectId type for identifiers. Convert string identifiers to ObjectId instances before querying. Convert ObjectId instances to strings when returning data to clients.

### Index Strategy
Create indexes on fields used in queries. Every collection has an index on company identifier. Document number fields have compound indexes with company identifier for uniqueness within company. Date fields are indexed for sorting.

### Document Structure
Store denormalized data when it improves read performance. The customer snapshot pattern duplicates customer data into documents to preserve historical accuracy. This is intentional and correct.

### Atomic Operations
Use MongoDB's atomic operations like findOneAndUpdate and increment operators to prevent race conditions. Document number generation uses atomic increment to avoid duplicate numbers.

## Common Pitfalls to Avoid

### Forgetting Company Filtering
Always filter queries by company identifier. Missing this filter is a critical security issue that exposes data across companies.

### Inconsistent Error Handling
Use tRPC errors consistently throughout the server code. Avoid mixing Error and TRPCError. Always provide appropriate error codes and messages.

### ObjectId Type Confusion
Be careful with ObjectId conversions. Comparing ObjectIds requires using the equals method or converting both sides to strings. Direct equality checks will fail.

### Mutating Input Parameters
Never mutate input objects in service methods. Return new objects with changes applied. Mutation creates bugs that are hard to track down.

### Client State Duplication
Avoid duplicating server state in local component state. Let React Query manage server state. Use local state only for UI concerns like modal visibility and form input.

### Over-Fetching Data
Don't return entire documents when components only need specific fields. Consider adding field selection to large list queries.

### Validation in Multiple Places
Validate once at the API boundary. Don't duplicate validation in components and services. Trust that data reaching services has been validated.

### Ignoring Loading States
Always handle loading and error states in components that fetch data. Users need feedback that operations are in progress.

### Breaking Type Safety
Avoid using any types. Use unknown for truly unknown data and narrow with type guards. Maintain end-to-end type safety.

### Creating Circular Dependencies
Organize imports to avoid circular dependencies between modules. Services should not depend on routers. Routers can depend on services.

## Future Development

### Testing Strategy
Implement comprehensive test coverage starting with service layer unit tests for critical business logic like tax calculations and document numbering. Add integration tests for tRPC routers that validate the full request-response cycle. Implement end-to-end tests for critical user flows like creating invoices and recording payments.

### PDF Generation
Complete the PDF generation implementation using the installed React PDF Renderer library. Create document templates for quotations, invoices, credit notes, and debit notes that match professional invoicing standards. Implement download functionality and consider adding email attachment capability.

### Email Integration
Add email service integration to send documents directly to customers. Implement template-based email generation. Include PDF attachments. Track email delivery status and customer opens if using a service that provides tracking.

### Role-Based Access Control
Enforce the defined roles throughout the application. Admin users should have full access. Regular users should have standard access. Viewer users should have read-only access. Implement procedure-level permission checks.

### Audit Logging
Implement comprehensive audit logging to track who created, updated, or deleted records and when. Store audit logs in a separate collection. Include before and after values for updates. Make logs immutable and queryable for compliance purposes.

### Dashboard Analytics
Replace placeholder statistics with real calculated metrics. Show total revenue, outstanding balances, overdue invoices, and payment trends. Implement charts using the installed Recharts library. Cache expensive calculations.

### Data Export
Add functionality to export data to CSV and Excel formats. Allow exporting filtered lists and individual documents. Implement bulk export capabilities for accounting system integration.

### File Upload System
Implement file upload for company logos, product images, and document attachments. Use cloud storage services for scalability. Implement proper file validation and size limits.

### Advanced Features
Consider implementing recurring invoices for subscription businesses, multi-currency support with exchange rate handling, payment gateway integration for online payments, customer portal for viewing invoices, automated payment reminders, expense tracking, and reporting dashboard.

### Performance Optimization
Profile database queries and add indexes where needed. Implement server-side caching for frequently accessed data. Consider implementing field selection to reduce payload sizes. Add request rate limiting to prevent abuse.

### Security Hardening
Implement rate limiting on authentication endpoints. Add CSRF protection explicitly. Implement input sanitization beyond Zod validation. Add security headers. Regular security audits of dependencies. Implement secret rotation procedures.

### Code Improvements
Extract common CRUD patterns into generic factories to eliminate duplication. Standardize error handling throughout. Create reusable UI components for pagination, data tables, and filters. Improve accessibility with comprehensive ARIA labels and keyboard navigation.

## Development Workflow

### Local Development
Start PostgreSQL and FerretDB using the provided Docker Compose file. Run the development server which enables hot reload. Use the database seed script to populate initial data for testing. Set up environment variables in a local env file.

### Code Quality

**Testing is Mandatory:**
All changes must pass testing verification before being considered complete. This is not negotiable.

**Pre-Submission Checklist:**
Before submitting any changes, you must:

1. **Run Type Check:**
   ```bash
   npm run type-check
   ```
   - Must pass with zero errors
   - Fix all TypeScript issues before proceeding

2. **Run Build:**
   ```bash
   npm run build
   ```
   - Must complete successfully
   - All pages must render without errors
   - Fix all build issues before proceeding

3. **Test Functionality:**
   - Start development server: `npm run dev`
   - Manually test changed features
   - Verify related features still work
   - Check browser console for errors

4. **Code Style:**
   - Use the Next.js linter to catch common issues
   - Format code consistently
   - Follow established patterns

5. **Documentation:**
   - Write meaningful commit messages explaining why changes were made
   - Update documentation if behavior changed
   - Add comments for complex logic

**Never submit changes that:**
- Fail type checking
- Fail to build
- Have untested functionality
- Produce console errors
- Break existing features

### Feature Development

**Development Process with Testing:**

1. **Plan:** Understand requirements and plan implementation
2. **Implement:** Write code following established patterns
3. **Test Early:** Run type check frequently during development
4. **Test Often:** Verify changes in browser as you build
5. **Build Verify:** Run full build before considering work complete
6. **Manual Test:** Test all affected functionality thoroughly
7. **Regression Test:** Verify related features still work
8. **Document:** Update documentation if needed
9. **Submit:** Only after all tests pass

**Branch Strategy:**
- Create feature branches for new work
- Keep changes focused and atomic
- Test thoroughly before merging
- Update this documentation when introducing new patterns or architectural decisions

**Testing is NOT Optional:**
Every feature, bug fix, or change must be tested before being merged. Untested code will be rejected.

### Database Changes
When modifying schema structure, consider backward compatibility. Plan for data migration if changing existing document structures. Test migrations thoroughly with production-like data volumes.

### API Changes
Maintain backward compatibility when possible. Version breaking changes appropriately. Communicate API changes to frontend developers. Update TypeScript types which will cause compile errors highlighting affected code.

## Conclusion

This application follows established patterns consistently throughout the codebase. Future development should maintain these patterns for consistency and maintainability. When facing implementation decisions, favor simplicity, type safety, and clear separation of concerns. Extract common code to avoid duplication. Keep business logic in services. Validate at API boundaries. Filter by company identifier always.

**Most Importantly: Always Test Before Handoff**

Testing is the most critical step in the development workflow. Every change, no matter how small, must be verified before being submitted:

- ✅ Run `npm run type-check` - Must pass
- ✅ Run `npm run build` - Must succeed
- ✅ Manually test the feature - Must work correctly
- ✅ No console errors - Browser console must be clean
- ✅ No regressions - Related features must still work

**Untested changes are incomplete changes.** The build verification step catches issues early, prevents broken deployments, and ensures code quality. Make testing a habit, not an afterthought.

The architecture supports scaling to larger teams and larger codebases. The type safety catches errors at compile time. The service layer enables testing without HTTP requests. The monolithic structure keeps deployment simple while the layered organization allows future extraction of services if needed.

Refer to this document when making architectural decisions, implementing new features, or refactoring existing code. Update this document when establishing new patterns or making significant architectural changes. Share this document with new team members as the authoritative guide to how this codebase works.