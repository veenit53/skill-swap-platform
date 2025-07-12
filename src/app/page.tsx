import { Header } from '@/components/header';
import { SkillSwapDashboard } from '@/components/skill-swap-dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <SkillSwapDashboard />
    </main>
  );
}
