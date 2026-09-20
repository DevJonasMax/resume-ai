import { KanbanProvider, type KanbanProviderProps } from "./KanbanContext.js";

export interface KanbanRootProps extends KanbanProviderProps {
  className?: string;
}

export function KanbanRoot({
  children,
  className = "",
  ...providerProps
}: KanbanRootProps) {
  return (
    <KanbanProvider {...providerProps}>
      <div className={`flex flex-col gap-6 w-full ${className}`}>{children}</div>
    </KanbanProvider>
  );
}
