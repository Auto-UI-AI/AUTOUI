//those are the types describing what structure the response from llm must have
export type FunctionStep = {
  type: "function";
  name: string;
  params?: Record<string, any>;
  assign?: string;
};

export type ComponentStep = {
  type: "component";
  name: string;
  props?: Record<string, any>;
};
export type TextStep = {
  type: "text";
  text: string;
};
export type InstructionStep = FunctionStep | ComponentStep | TextStep;

export type InstructionPlan = {
  type: "sequence";
  steps: InstructionStep[];
};