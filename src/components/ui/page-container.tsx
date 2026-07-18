import type { ContainerProps } from "./container";
import { Container } from "./container";

export type PageContainerProps = Omit<ContainerProps, "size">;

export function PageContainer(props: PageContainerProps) {
  return <Container size="landing" {...props} />;
}
