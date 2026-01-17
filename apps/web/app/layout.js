import './global.css';

export const metadata = {
  title: 'API 控制台',
  description: 'Next.js 前端 + Express API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
