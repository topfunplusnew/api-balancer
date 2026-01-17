import styles from './page.module.css';

export default function Index() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>API 控制台</h1>
      <p className={styles.subtitle}>Next.js 前端 + Express API</p>
    </main>
  );
}
