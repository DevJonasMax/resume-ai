import { AgentMonitorIntervention } from "./AgentMonitorIntervention.js";
import { AgentMonitorRoot } from "./AgentMonitorRoot.js";
import { AgentMonitorTerminal } from "./AgentMonitorTerminal.js";

export const AgentMonitor = Object.assign(AgentMonitorRoot, {
  Root: AgentMonitorRoot,
  Terminal: AgentMonitorTerminal,
  Intervention: AgentMonitorIntervention,
});

export * from "./AgentMonitorContext.js";
