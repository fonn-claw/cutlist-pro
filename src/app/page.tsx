import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MainArea } from '@/components/layout/MainArea';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar />
        <MainArea />
      </div>
    </div>
  );
}
