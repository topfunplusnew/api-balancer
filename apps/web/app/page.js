'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getHealthStatus, getApiStats } from '../lib/api';

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 并行请求健康状态和统计数据
        const [health, stats] = await Promise.all([
          getHealthStatus(),
          getApiStats(),
        ]);

        setHealthStatus(health);
        setApiStats(stats);
      } catch (err) {
        setError('Failed to fetch data from API');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 每30秒刷新一次数据
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApiDocClick = () => {
    window.open('http://localhost:5000/api-docs', '_blank');
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div
            style={{ textAlign: 'center', padding: '100px 0', color: 'white' }}
          >
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div
            style={{ textAlign: 'center', padding: '100px 0', color: 'white' }}
          >
            <div>Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className={styles.primary}
              style={{ marginTop: '20px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = apiStats?.data || {};
  const isOnline = healthStatus?.success;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>API Dashboard</h1>
          <p className={styles.subtitle}>
            <span
              className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}
            ></span>
            {isOnline
              ? healthStatus?.message || '系统运行正常'
              : 'API 服务异常'}
          </p>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTitle}>API 调用次数</div>
            <div className={styles.statValue}>
              {stats.totalCalls?.toLocaleString() || '0'}
            </div>
            <div className={`${styles.statChange} ${styles.positive}`}>
              ↑ {stats.dailyChange?.calls || 0}% 较昨日
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statTitle}>活跃 API Keys</div>
            <div className={styles.statValue}>{stats.activeKeys || '0'}</div>
            <div className={`${styles.statChange} ${styles.positive}`}>
              ↑ {stats.dailyChange?.keys || 0} 新增本周
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statTitle}>代理请求</div>
            <div className={styles.statValue}>
              {stats.proxyRequests?.toLocaleString() || '0'}
            </div>
            <div className={`${styles.statChange} ${styles.negative}`}>
              ↓ {Math.abs(stats.dailyChange?.proxyRequests || 0)}% 较昨日
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statTitle}>平均响应时间</div>
            <div className={styles.statValue}>
              {stats.avgResponseTime || '0'}ms
            </div>
            <div className={`${styles.statChange} ${styles.positive}`}>
              ↑ {Math.abs(stats.dailyChange?.responseTime || 0)}% 性能提升
            </div>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>🔑 API 密钥管理</h3>
            <p className={styles.actionDescription}>
              创建、查看和管理 API 密钥，控制访问权限和使用限制。
            </p>
            <button className={`${styles.button} ${styles.primary}`}>
              管理密钥
            </button>
          </div>

          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>🚀 代理配置</h3>
            <p className={styles.actionDescription}>
              配置第三方 API 代理服务，设置转发规则和认证方式。
            </p>
            <button className={`${styles.button} ${styles.secondary}`}>
              配置代理
            </button>
          </div>

          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>📊 API 文档</h3>
            <p className={styles.actionDescription}>
              查看完整的 API 文档和交互式接口测试工具。
            </p>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleApiDocClick}
            >
              查看文档
            </button>
          </div>

          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>⚙️ 系统设置</h3>
            <p className={styles.actionDescription}>
              配置系统参数、日志级别和缓存策略等高级选项。
            </p>
            <button className={`${styles.button} ${styles.secondary}`}>
              系统设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
