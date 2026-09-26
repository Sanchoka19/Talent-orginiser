import { AppShell } from '../../src/components/common/AppShell';
import { Providers } from '../providers';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
