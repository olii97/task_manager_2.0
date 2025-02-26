
import { JournalEntryForm } from "@/components/JournalEntryForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Daily Journal</h1>
          <p className="text-muted-foreground mt-2">
            Record your daily reflections and track your wellness journey
          </p>
        </div>
        <JournalEntryForm />
      </main>
    </div>
  );
};

export default Index;
