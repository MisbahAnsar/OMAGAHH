import { TrendingUp, Trophy, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface TokenItem {
  rank: number;
  name: string;
  volume: string;
  change: string;
}

const tokens: TokenItem[] = [
  { rank: 1, name: 'BONK', volume: '123,456 SOL', change: '+12.5%' },
  { rank: 2, name: 'WEN', volume: '98,765 SOL', change: '+8.3%' },
  { rank: 3, name: 'MYRO', volume: '45,678 SOL', change: '+5.7%' },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Award className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-orange-400" />;
    default:
      return <span className="text-xl font-bold text-[var(--text-secondary)]">#{rank}</span>;
  }
};

const TopTokens = () => (
  <Card className="hover:shadow-[0_0_20px_var(--accent-glow)] transition-all">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[var(--accent)]" />
            Top Casino Tokens
          </CardTitle>
          <CardDescription className="mt-1">Most popular tokens by volume</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-[var(--accent)]">
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {tokens.map((token) => (
          <div key={token.rank} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-[var(--secondary)]/10">
                {getRankIcon(token.rank)}
              </div>
              <div>
                <div className="font-bold text-base">{token.name}</div>
                <div className="flex items-center text-xs text-[var(--accent)] mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="font-semibold">{token.change}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm">{token.volume}</span>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Volume</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default TopTokens;