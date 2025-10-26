import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change }) => {
  const isPositive = !change.startsWith('-');
  
  return (
    <Card className="hover:shadow-[0_0_20px_var(--accent-glow)] transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="p-3 rounded-lg bg-[var(--accent)]/10">
          {icon}
        </div>
        <div className={`flex items-center ${isPositive ? 'text-[var(--accent)]' : 'text-red-400'}`}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span className="text-sm ml-1 font-semibold">{change}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          {title}
        </CardTitle>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;