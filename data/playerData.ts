export const PLAYER_DATA = {
  name: 'NOBBY',
  job: 'システムエンジニア',
  level: 32,
  hp: { current: 178, max: 178 },
  mp: { current: 68, max: 68 },
  stats: {
    attack: 88,    // 問題解決力
    defense: 72,   // コードレビュー力
    agility: 81,   // 開発スピード
    wisdom: 90,    // 設計力
    charm: 76,     // コミュニケーション
  },
  certifications: [
    '応用情報技術者試験',
  ],
  bio: [
    'システムエンジニアとして',
    'バックエンド・フロントエンド・インフラなど',
    '幅広い経験を持つフルスタックエンジニア。'
  ],
};

export interface Skill {
  name: string;
  category: string;
  icon?: string;
}

const DI = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

export const SKILLS: Skill[] = [
  // Frontend
  { name: 'TypeScript',   category: 'フロントエンド', icon: `${DI}/typescript/typescript-original.svg` },
  { name: 'JavaScript',   category: 'フロントエンド', icon: `${DI}/javascript/javascript-original.svg` },
  { name: 'React',        category: 'フロントエンド', icon: `${DI}/react/react-original.svg` },
  { name: 'Next.js',      category: 'フロントエンド', icon: `${DI}/nextjs/nextjs-original.svg` },
  // Backend
  { name: 'Java',         category: 'バックエンド',   icon: `${DI}/java/java-original.svg` },
  { name: 'C#',           category: 'バックエンド',   icon: `${DI}/csharp/csharp-original.svg` },
  { name: 'Spring Boot',  category: 'バックエンド',   icon: `${DI}/spring/spring-original.svg` },
  { name: 'Node.js',      category: 'バックエンド',   icon: `${DI}/nodejs/nodejs-original.svg` },
  // DB
  { name: 'PostgreSQL',   category: 'データベース',   icon: `${DI}/postgresql/postgresql-original.svg` },
  { name: 'MySQL',        category: 'データベース',   icon: `${DI}/mysql/mysql-original.svg` },
  { name: 'Redis',        category: 'データベース',   icon: `${DI}/redis/redis-original.svg` },
  // Infrastructure
  { name: 'AWS',          category: 'インフラ',       icon: `${DI}/amazonwebservices/amazonwebservices-plain-wordmark.svg` },
  { name: 'Docker',       category: 'インフラ',       icon: `${DI}/docker/docker-original.svg` },
  // Other
  { name: 'Git',          category: 'その他',         icon: `${DI}/git/git-original.svg` },
  { name: 'GitHub',       category: 'その他',         icon: `${DI}/github/github-original.svg` },
];