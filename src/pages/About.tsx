import { Shield, Zap, MessageSquare, Coins, Code, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-20 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 
              className="bg-gradient-to-r from-white via-[var(--accent)] to-white bg-clip-text text-transparent"
              style={{
                fontFamily: '"Edu NSW ACT Foundation", cursive',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 500,
                lineHeight: '1.2',
              }}
            >
              About Solana Casino Platform
            </h1>
            <p 
              className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                lineHeight: '1.6',
              }}
            >
              A revolutionary platform that transforms any Solana token into a fully-featured casino ecosystem with provably fair games and seamless integration.
            </p>
            <div className="mt-8 rounded-xl overflow-hidden shadow-2xl border border-[var(--accent)]/30 max-w-2xl mx-auto">
              <img src="/gamess.png" alt="Solana Casino Games" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[var(--card)] rounded-2xl p-12 border border-[var(--border)]">
          <h2 
            className="mb-6 text-white"
            style={{
              fontFamily: '"Edu NSW ACT Foundation", cursive',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 500,
              lineHeight: '1.2',
            }}
          >
            Our Mission
          </h2>
          <p className="text-lg text-white mb-6">
            We're building the most engaging and transparent gaming platform on Solana. Our mission is to provide token creators with powerful tools to engage their communities through provably fair games, while offering players a seamless and enjoyable gaming experience.
          </p>
          <p className="text-lg text-white mb-6">
            We believe in the power of blockchain technology to revolutionize online gaming by providing transparency, fairness, and community ownership. Our platform is designed to be accessible to everyone, from experienced crypto users to newcomers.
          </p>
          <div className="mt-8 p-4 bg-[var(--accent)] bg-opacity-10 rounded-xl border border-[var(--accent)] border-opacity-20">
            <h3 
              className="mb-2 text-white"
              style={{
                fontFamily: '"Edu NSW ACT Foundation", cursive',
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '1.2',
              }}
            >
              Platform Fee
            </h3>
            <p className="text-white mb-2">
              A small 1% fee is applied to all transactions to support the platform's development and maintenance.
            </p>
            <div className="flex items-center space-x-2 text-white">
              <span className="font-medium">Recipient Address:</span>
              <code className="bg-[var(--background)] px-2 py-1 rounded text-sm">Ao7vjcT7aHoTTcD4mMUatJqxp1dTSgEa1uoZXNXww2BW</code>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 
          className="text-center mb-12 text-white"
          style={{
            fontFamily: '"Edu NSW ACT Foundation", cursive',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 500,
            lineHeight: '1.2',
          }}
        >
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Provably Fair"
            description="All games use SHA256-based algorithms to ensure transparent and verifiable outcomes"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Setup"
            description="Launch your casino in minutes with our intuitive dashboard and configuration tools"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Telegram Integration"
            description="Let users play directly in your community chat groups with our Telegram bot"
          />
          <FeatureCard
            icon={<Coins className="w-8 h-8" />}
            title="Token Compatible"
            description="Support for any SPL token with custom liquidity pools and treasury management"
          />
          <FeatureCard
            icon={<Code className="w-8 h-8" />}
            title="Open Source"
            description="Transparent codebase with regular updates and community contributions"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Community Focused"
            description="Built for token communities with features like leaderboards and rewards"
          />
        </div>
      </section>

      {/* Recent Updates */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[var(--accent)]/10 to-blue-500/10 rounded-2xl p-12 border border-[var(--border)]">
          <h2 
            className="mb-8 text-white"
            style={{
              fontFamily: '"Edu NSW ACT Foundation", cursive',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 500,
              lineHeight: '1.2',
            }}
          >
            Recent Platform Updates
          </h2>

          <div className="space-y-6">
            <UpdateCard
              version="v0"
              date="Oct 2025"
              title="Platform Genesis"
              description="The birth of a revolutionary Solana-based casino gaming platform with stunning 3D visuals, provably fair mechanics, and seamless blockchain integration."
              features={[
                "Launched Ultra Coin Flip with realistic 3D physics and particle effects",
                "Introduced Ultra Dice Roll with customizable odds and high multipliers",
                "Deployed smart contracts on Solana Devnet for secure, transparent gaming",
                "Established provably fair gaming system using blockchain verification",
                "Launched with instant payouts and zero transaction delays"
              ]}
            />
          </div>
        </div>
      </section>


    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)] hover:border-opacity-50 transition-colors">
    <div className="text-[var(--accent)] mb-4">
      {icon}
    </div>
    <h3 
      className="mb-2 text-white"
      style={{
        fontFamily: '"Edu NSW ACT Foundation", cursive',
        fontSize: '20px',
        fontWeight: 500,
        lineHeight: '1.2',
      }}
    >
      {title}
    </h3>
    <p 
      className="text-white"
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
      }}
    >
      {description}
    </p>
  </div>
);

// Update Card Component
const UpdateCard = ({ version, date, title, description, features }: { version: string; date: string; title: string; description: string; features: string[] }) => (
  <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
    <div className="flex flex-wrap items-center justify-between mb-4">
      <h3 
        className="text-white"
        style={{
          fontFamily: '"Edu NSW ACT Foundation", cursive',
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '1.2',
        }}
      >
        {title}
      </h3>
      <div className="flex items-center space-x-3">
        <span className="px-3 py-1 rounded-full text-sm bg-[var(--accent)] bg-opacity-20 text-white font-medium">
          {version}
        </span>
        <span className="text-sm text-white">{date}</span>
      </div>
    </div>
    <p 
      className="text-white mb-4"
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: '14px',
        lineHeight: '1.6',
      }}
    >
      {description}
    </p>
    <ul className="space-y-2 text-white">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-start">
          <Award className="w-4 h-4 text-[var(--accent)] mt-1 mr-2 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);



export default About;
