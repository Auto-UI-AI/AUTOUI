# AutoUI Library - Code Design Proposal

## Executive Summary

After analyzing the `lib/` folder structure, I've identified several architectural issues that impact maintainability, testability, and scalability. This document proposes a **layered architecture** with clear separation of concerns, dependency injection, and improved abstractions.

---

## Current Issues Identified

### 1. **Unclear Separation of Concerns**
- `core/` mixes LLM communication, prompt building, and data parsing
- `runtime/` mixes validation, execution, and state management
- Business logic is scattered across multiple files

### 2. **Tight Coupling**
- `stepExecutor.ts` has too many responsibilities (function execution, component rendering, text handling, LLM analysis)
- Direct dependencies on React types in runtime code
- Hard to test due to mixed concerns

### 3. **Inconsistent Patterns**
- Some files export single functions, others export multiple
- Mixed async/await patterns
- Inconsistent error handling

### 4. **Poor Abstraction**
- Direct `fetch` calls in multiple places (no service layer)
- Context variables passed around manually
- No clear interfaces/contracts

### 5. **Testing Challenges**
- Hard to unit test due to tight coupling
- No clear interfaces/abstractions
- Mixed concerns make mocking difficult

---

## Proposed Architecture

### **Layered Architecture Pattern**

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, Hooks, Context)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Orchestration, Use Cases)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  (Business Logic, Entities, Services)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Infrastructure Layer            │
│  (LLM Client, HTTP, Storage)            │
└─────────────────────────────────────────┘
```

---

## Recommended Folder Structure

```
lib/
├── domain/                          # Core business logic
│   ├── entities/                    # Domain entities
│   │   ├── InstructionPlan.ts
│   │   ├── InstructionStep.ts
│   │   └── ExecutionContext.ts
│   ├── services/                    # Domain services
│   │   ├── PlanValidator.ts
│   │   ├── StepExecutor.ts
│   │   ├── ContextManager.ts
│   │   └── PropsResolver.ts
│   └── interfaces/                  # Domain contracts
│       ├── ILLMClient.ts
│       ├── IComponentResolver.ts
│       └── IUIRenderer.ts
│
├── infrastructure/                  # External dependencies
│   ├── llm/                         # LLM communication
│   │   ├── LLMClient.ts            # Main client
│   │   ├── LLMService.ts           # Service wrapper
│   │   ├── prompts/                 # Prompt builders
│   │   │   ├── IntentPromptBuilder.ts
│   │   │   └── DataAnalysisPromptBuilder.ts
│   │   └── parsers/                 # Response parsers
│   │       ├── SSEParser.ts
│   │       └── AnalysisParser.ts
│   └── storage/                     # Storage abstractions
│       └── LocalStorageAdapter.ts
│
├── application/                     # Use cases / orchestration
│   ├── use-cases/
│   │   ├── ExecuteInstructionPlan.ts
│   │   ├── ProcessUserMessage.ts
│   │   └── AnalyzeFunctionData.ts
│   └── orchestrators/
│       └── PlanExecutionOrchestrator.ts
│
├── presentation/                    # React-specific code
│   ├── components/                  # UI components (keep as-is)
│   ├── hooks/                      # React hooks
│   │   ├── useAutoUiChat.ts
│   │   └── usePlanExecution.ts
│   └── context/                     # React context
│
├── utils/                          # Pure utility functions
│   ├── normalization/
│   │   └── ContextNormalizer.ts
│   └── helpers/
│       ├── clsx.ts
│       └── debounce.ts
│
└── types/                          # Shared TypeScript types
    ├── config.ts
    └── llm.ts
```

---

## Key Design Principles

### 1. **Dependency Inversion Principle (DIP)**
- High-level modules should not depend on low-level modules
- Both should depend on abstractions (interfaces)

**Example:**
```typescript
// domain/interfaces/ILLMClient.ts
export interface ILLMClient {
  getInstructionPlan(
    userMessage: string,
    config: AutoUIConfig,
    context: string
  ): Promise<InstructionPlan>;
  
  analyzeData(
    data: unknown,
    config: AutoUIConfig,
    context: AnalysisContext
  ): Promise<AnalyzedData>;
}

// infrastructure/llm/LLMClient.ts
export class LLMClient implements ILLMClient {
  // Implementation
}

// application/use-cases/ProcessUserMessage.ts
export class ProcessUserMessage {
  constructor(private llmClient: ILLMClient) {}
  // Use interface, not concrete class
}
```

### 2. **Single Responsibility Principle (SRP)**
- Each class/function should have one reason to change

**Current Problem:**
- `stepExecutor.ts` handles function execution, component rendering, text handling, and LLM analysis

**Proposed Solution:**
```typescript
// domain/services/StepExecutor.ts - Only executes steps
export class StepExecutor {
  execute(step: InstructionStep, context: ExecutionContext): Promise<any> {
    // Pure execution logic
  }
}

// domain/services/FunctionStepHandler.ts - Handles function steps
export class FunctionStepHandler {
  async handle(step: FunctionStep, context: ExecutionContext): Promise<any> {
    // Function-specific logic
  }
}

// domain/services/ComponentStepHandler.ts - Handles component steps
export class ComponentStepHandler {
  async handle(step: ComponentStep, context: ExecutionContext): Promise<void> {
    // Component-specific logic
  }
}

// domain/services/TextStepHandler.ts - Handles text steps
export class TextStepHandler {
  async handle(step: TextStep, context: ExecutionContext): Promise<void> {
    // Text-specific logic
  }
}
```

### 3. **Strategy Pattern for Step Execution**
```typescript
// domain/services/StepHandler.ts
export interface IStepHandler {
  canHandle(step: InstructionStep): boolean;
  handle(step: InstructionStep, context: ExecutionContext): Promise<any>;
}

// domain/services/StepHandlerRegistry.ts
export class StepHandlerRegistry {
  private handlers: IStepHandler[] = [];
  
  register(handler: IStepHandler): void {
    this.handlers.push(handler);
  }
  
  getHandler(step: InstructionStep): IStepHandler {
    const handler = this.handlers.find(h => h.canHandle(step));
    if (!handler) throw new Error(`No handler for step type: ${step.type}`);
    return handler;
  }
}
```

### 4. **Service Layer for LLM Communication**
```typescript
// infrastructure/llm/LLMService.ts
export class LLMService {
  constructor(
    private client: ILLMClient,
    private config: AutoUIConfig
  ) {}
  
  async getInstructionPlan(
    userMessage: string,
    context: string
  ): Promise<InstructionPlan> {
    // Add retry logic, error handling, logging
    return this.client.getInstructionPlan(userMessage, this.config, context);
  }
  
  async analyzeData(
    data: unknown,
    context: AnalysisContext
  ): Promise<AnalyzedData> {
    // Add retry logic, error handling, logging
    return this.client.analyzeData(data, this.config, context);
  }
}
```

### 5. **Context Management**
```typescript
// domain/entities/ExecutionContext.ts
export class ExecutionContext {
  private variables: Map<string, any> = new Map();
  
  set(key: string, value: any): void {
    this.variables.set(key, value);
  }
  
  get(key: string): any {
    return this.variables.get(key);
  }
  
  has(key: string): boolean {
    return this.variables.has(key);
  }
  
  toObject(): Record<string, any> {
    return Object.fromEntries(this.variables);
  }
}
```

### 6. **Error Handling Strategy**
```typescript
// domain/errors/ExecutionError.ts
export class ExecutionError extends Error {
  constructor(
    message: string,
    public step: InstructionStep,
    public context: ExecutionContext
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

// domain/errors/ValidationError.ts
export class ValidationError extends Error {
  constructor(
    message: string,
    public plan: InstructionPlan
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// application/use-cases/ExecuteInstructionPlan.ts
export class ExecuteInstructionPlan {
  async execute(plan: InstructionPlan): Promise<ExecutionContext> {
    try {
      // Execution logic
    } catch (error) {
      if (error instanceof ValidationError) {
        // Handle validation errors
      } else if (error instanceof ExecutionError) {
        // Handle execution errors
      }
      throw error;
    }
  }
}
```

---

## Migration Strategy

### Phase 1: Extract Interfaces (Week 1)
1. Create `domain/interfaces/` with key contracts
2. Define `ILLMClient`, `IComponentResolver`, `IUIRenderer`
3. No breaking changes - interfaces only

### Phase 2: Refactor Infrastructure (Week 2)
1. Move LLM code to `infrastructure/llm/`
2. Implement interfaces in infrastructure layer
3. Create `LLMService` wrapper
4. Update imports gradually

### Phase 3: Extract Domain Services (Week 3)
1. Create `domain/services/` with step handlers
2. Implement Strategy pattern for step execution
3. Extract `ExecutionContext` entity
4. Move validation to `PlanValidator`

### Phase 4: Create Application Layer (Week 4)
1. Create use cases in `application/use-cases/`
2. Create orchestrators
3. Wire everything together with dependency injection

### Phase 5: Update Presentation Layer (Week 5)
1. Update hooks to use new application layer
2. Remove direct dependencies on infrastructure
3. Add proper error boundaries

---

## Benefits of This Approach

### ✅ **Testability**
- Clear interfaces enable easy mocking
- Each layer can be tested independently
- Pure functions in domain layer

### ✅ **Maintainability**
- Single Responsibility Principle
- Clear boundaries between layers
- Easy to locate and fix bugs

### ✅ **Scalability**
- Easy to add new step types
- Easy to swap LLM providers
- Easy to add new features

### ✅ **Reusability**
- Domain logic is framework-agnostic
- Can be used in non-React environments
- Services can be composed differently

### ✅ **Type Safety**
- Strong interfaces and contracts
- Better TypeScript inference
- Compile-time error detection

---

## Code Examples

### Example 1: Clean Step Execution
```typescript
// domain/services/StepExecutor.ts
export class StepExecutor {
  constructor(
    private handlerRegistry: StepHandlerRegistry,
    private context: ExecutionContext
  ) {}
  
  async execute(step: InstructionStep): Promise<any> {
    const handler = this.handlerRegistry.getHandler(step);
    return handler.handle(step, this.context);
  }
}
```

### Example 2: Use Case Orchestration
```typescript
// application/use-cases/ExecuteInstructionPlan.ts
export class ExecuteInstructionPlan {
  constructor(
    private planValidator: PlanValidator,
    private stepExecutor: StepExecutor,
    private llmService: LLMService,
    private uiRenderer: IUIRenderer
  ) {}
  
  async execute(
    plan: InstructionPlan,
    config: AutoUIConfig
  ): Promise<ExecutionContext> {
    // Validate
    this.planValidator.validate(plan);
    
    // Execute steps
    const context = new ExecutionContext();
    for (const step of plan.steps) {
      const result = await this.stepExecutor.execute(step);
      
      // Handle LLM analysis if needed
      if (this.needsAnalysis(step, result)) {
        const analyzed = await this.llmService.analyzeData(/* ... */);
        context.set(step.assign, analyzed.data);
      }
    }
    
    return context;
  }
}
```

### Example 3: Dependency Injection Setup
```typescript
// application/orchestrators/PlanExecutionOrchestrator.ts
export class PlanExecutionOrchestrator {
  private llmService: LLMService;
  private stepExecutor: StepExecutor;
  private useCase: ExecuteInstructionPlan;
  
  constructor(config: AutoUIConfig) {
    // Infrastructure
    const llmClient = new LLMClient(config);
    this.llmService = new LLMService(llmClient, config);
    
    // Domain services
    const handlerRegistry = new StepHandlerRegistry();
    handlerRegistry.register(new FunctionStepHandler(config));
    handlerRegistry.register(new ComponentStepHandler(/* ... */));
    handlerRegistry.register(new TextStepHandler(/* ... */));
    
    const context = new ExecutionContext();
    this.stepExecutor = new StepExecutor(handlerRegistry, context);
    
    // Application
    const validator = new PlanValidator(config);
    this.useCase = new ExecuteInstructionPlan(
      validator,
      this.stepExecutor,
      this.llmService,
      /* uiRenderer */
    );
  }
  
  async execute(plan: InstructionPlan): Promise<ExecutionContext> {
    return this.useCase.execute(plan, config);
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// domain/services/__tests__/StepExecutor.test.ts
describe('StepExecutor', () => {
  it('should execute function step', async () => {
    const mockHandler = {
      canHandle: jest.fn(() => true),
      handle: jest.fn(() => Promise.resolve('result'))
    };
    const registry = new StepHandlerRegistry();
    registry.register(mockHandler);
    
    const executor = new StepExecutor(registry, new ExecutionContext());
    const result = await executor.execute(mockStep);
    
    expect(mockHandler.handle).toHaveBeenCalled();
    expect(result).toBe('result');
  });
});
```

### Integration Tests
```typescript
// application/use-cases/__tests__/ExecuteInstructionPlan.integration.test.ts
describe('ExecuteInstructionPlan Integration', () => {
  it('should execute full plan', async () => {
    const mockLLM = createMockLLMClient();
    const useCase = createUseCase(mockLLM);
    
    const plan = createTestPlan();
    const context = await useCase.execute(plan);
    
    expect(context.get('items')).toBeDefined();
  });
});
```

---

## Next Steps

1. **Review this proposal** with the team
2. **Prioritize** which issues to address first
3. **Create a branch** for refactoring
4. **Start with Phase 1** (interfaces) - lowest risk
5. **Incremental migration** - don't break existing code
6. **Add tests** as you refactor

---

## Questions to Consider

1. Do you want to maintain backward compatibility during migration?
2. Are there any performance constraints we should consider?
3. Do you have existing tests we should preserve?
4. What's the timeline for this refactoring?
5. Are there any specific patterns you prefer (e.g., functional vs OOP)?

---

## Conclusion

This proposed architecture addresses the current issues by:
- **Separating concerns** into clear layers
- **Reducing coupling** through interfaces
- **Improving testability** with dependency injection
- **Enhancing maintainability** with single responsibility
- **Enabling scalability** through extensible patterns

The migration can be done incrementally without breaking existing functionality.

