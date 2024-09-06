import DashWrapper from '@/components/dashboard/DashWrapper.jsx';

export default function Dashboard() {
  return (
    <DashWrapper>
      <div className="rounded-lg border bg-card p-4">Card 1</div>
      <div className="rounded-lg border bg-card p-4">Card 2</div>
      <div className="rounded-lg border bg-card p-4">Card 3</div>
      <div className="rounded-lg border bg-card p-4">Card 4</div>
    </DashWrapper>
  );
}
