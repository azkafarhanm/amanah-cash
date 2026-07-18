# Graph Report - .  (2026-07-17)

## Corpus Check
- Corpus is ~20,000 words - fits in a single context window. You may not need a graph.

## Summary
- 47 nodes · 52 edges · 14 communities (4 shown, 10 thin omitted)
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Financial Data Integrity
- Project Documentation Governance
- Transaction History Authority
- Requirements Traceability
- Simple MVP Architecture
- Mobile-First Interface
- Safe Transaction Retry
- User Experience Flows
- Domain-Layer Architecture
- Delivery Completion Process
- Implementation Constraints
- Trust by Design
- Progressive Web App
- Whole-Rupiah Amounts

## God Nodes (most connected - your core abstractions)
1. `Functional Requirements` - 10 edges
2. `Domain Model` - 6 edges
3. `System Architecture` - 6 edges
4. `Amanah Cash AI Context` - 5 edges
5. `Amanah Cash` - 5 edges
6. `Product Principles` - 4 edges
7. `Business Rules` - 4 edges
8. `Derived Balance` - 4 edges
9. `Engineering Rules` - 4 edges
10. `Transaction` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Amanah Cash AI Context` --references--> `Business Rules`  [EXTRACTED]
  AI_CONTEXT.md → docs/03-business-rules.md
- `Amanah Cash` --references--> `Functional Requirements`  [EXTRACTED]
  README.md → docs/01-functional-requirements.md
- `Transaction History as Financial Source of Truth` --conceptually_related_to--> `Single Source of Truth`  [INFERRED]
  README.md → docs/00-product-principles.md
- `Sequential MVP Milestones` --implements--> `Functional Requirements`  [INFERRED]
  docs/09-development-roadmap.md → docs/01-functional-requirements.md
- `Amanah Cash AI Context` --references--> `Product Principles`  [EXTRACTED]
  AI_CONTEXT.md → docs/00-product-principles.md

## Hyperedges (group relationships)
- **Financial Source of Truth** — docs_00_product_principles_single_source_of_truth, docs_03_business_rules_append_only_transactions, docs_04_domain_model_derived_balance, docs_07_database_design_transactions_table, docs_10_engineering_rules_financial_integrity [INFERRED 0.95]
- **Student Financial Consistency Boundary** — docs_04_domain_model_student_aggregate, docs_03_business_rules_atomic_withdrawal, docs_07_database_design_per_student_serialization, docs_08_system_architecture_layered_architecture [INFERRED 0.95]
- **Approved Documentation Delivery Chain** — docs_01_functional_requirements_functional_requirements, docs_03_business_rules_business_rules, docs_04_domain_model_domain_model, docs_08_system_architecture_system_architecture, docs_09_development_roadmap_development_roadmap, docs_11_development_workflow_requirement_traceability [INFERRED 0.85]

## Communities (14 total, 10 thin omitted)

### Community 0 - "Financial Data Integrity"
Cohesion: 0.20
Nodes (10): Balance, Student, Transaction, Financial Correctness, Append-Only Transactions, Atomic Withdrawal, Per-Student Financial Write Serialization, Students Table (+2 more)

### Community 1 - "Project Documentation Governance"
Cohesion: 0.43
Nodes (8): Amanah Cash AI Context, Amanah Cash Changelog, Product Principles, System Architecture, Development Roadmap, Engineering Rules, Development Workflow, Amanah Cash

### Community 2 - "Transaction History Authority"
Cohesion: 0.29
Nodes (7): Single Source of Truth, Derived Balance, Immutable Transaction Entity, Student Aggregate, Progressive Transaction History, Stable Cursor History Retrieval, Transaction History as Financial Source of Truth

### Community 3 - "Requirements Traceability"
Cohesion: 0.53
Nodes (6): Functional Requirements, Non-Functional Requirements, Business Rules, Domain Model, Database Design, Requirement Traceability Chain

## Knowledge Gaps
- **13 isolated node(s):** `Amanah Cash Changelog`, `Student`, `Progressive Web App`, `Retry Safety`, `RupiahAmount` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Functional Requirements` connect `Requirements Traceability` to `Project Documentation Governance`, `Mobile-First Interface`, `Delivery Completion Process`, `User Experience Flows`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `Derived Balance` connect `Transaction History Authority` to `Financial Data Integrity`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `Amanah Cash Changelog`, `Student`, `Progressive Web App` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._