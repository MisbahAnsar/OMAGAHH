import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface GameItem {
  id: number;
  game: string;
  time: string;
  amount: string;
  player: string;
  isWin: boolean;
}

const games: GameItem[] = [
  { id: 1, game: 'Coin Flip #1234', time: '2 minutes ago', amount: '+0.5 SOL', player: '@player1', isWin: true },
  { id: 2, game: 'Dice Roll #5678', time: '5 minutes ago', amount: '-0.3 SOL', player: '@player2', isWin: false },
  { id: 3, game: 'Coin Flip #9012', time: '8 minutes ago', amount: '+0.8 SOL', player: '@player3', isWin: true },
];

const RecentGames = () => (
  <Card className="hover:shadow-[0_0_20px_var(--accent-glow)] transition-all">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[var(--accent)]" />
            Recent Games
          </CardTitle>
          <CardDescription className="mt-1">Latest casino activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-[var(--accent)]">
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {games.map((game) => (
          <div key={game.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${game.isWin ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {game.isWin ? (
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{game.game}</p>
                <p className="text-xs text-[var(--text-secondary)]">{game.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${game.isWin ? 'text-green-400' : 'text-red-400'}`}>
                {game.amount}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{game.player}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RecentGames;