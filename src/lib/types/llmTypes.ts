//those are the types describing what structure the response from llm must have
export type FunctionStep = {
  type: 'function';
  name: string;
  params?: Record<string, any>;
  assign?: string;
  hasToShareDataWithLLM?: boolean;
};

export type ComponentStep = {
  type: 'component';
  name: string;
  props?: Record<string, any>;
  /** Explicit callback references - maps callback prop names to callback names from component config */
  callbacks?: Record<string, string>;
};
export type TextStep = {
  type: 'text';
  text: string;
};
export type InstructionStep = FunctionStep | ComponentStep | TextStep;

export type InstructionPlan = {
  type: 'sequence';
  steps: InstructionStep[];
};
