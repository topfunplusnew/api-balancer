'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { getHealthStatus, getSupabaseUsers, getApiKey } from '../lib/api';

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState('');
  const [apiKeyUsername, setApiKeyUsername] = useState('');
  const [apiKeyPassword, setApiKeyPassword] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [supabaseToken, setSupabaseToken] = useState('');
  const [supabaseUsers, setSupabaseUsers] = useState([]);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const health = await getHealthStatus();
        setHealthStatus(health);
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

  useEffect(() => {
    return () =>
      toastTimerRef.current ? clearTimeout(toastTimerRef.current) : undefined;
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 1600);
  };

  const handleApiDocClick = () => {
    window.open('http://localhost:25052/api-docs', '_blank');
  };

  const handleComingSoon = () => {
    showToast('功能开发中');
  };

  const handleMenuClick = (id) => {
    const isSupabase = id === 'supabase';
    const isApiKey = id === 'fetch-api-key';
    const isApiDocs = id === 'api-docs';

    isSupabase || isApiKey ? setActiveMenu(id) : setActiveMenu('');
    !isSupabase && !isApiKey
      ? isApiDocs
        ? handleApiDocClick()
        : handleComingSoon()
      : undefined;
  };

  const handleSupabaseFetch = () => {
    const trimmedToken = supabaseToken.trim();
    setSupabaseLoading(true);
    setSupabaseError('');

    return !trimmedToken
      ? (setSupabaseLoading(false),
        setSupabaseError('请输入 API Key'),
        setSupabaseUsers([]),
        undefined)
      : getSupabaseUsers(trimmedToken, { page: 1, perPage: 20 })
          .then((result) => {
            setSupabaseUsers(result?.data?.users || []);
          })
          .catch((err) => {
            console.error('Supabase users fetch error:', err);
            setSupabaseError('获取用户列表失败');
            setSupabaseUsers([]);
          })
          .finally(() => {
            setSupabaseLoading(false);
          });
  };

  const handleGetApiKey = () => {
    const trimmedUsername = apiKeyUsername.trim();
    const trimmedPassword = apiKeyPassword.trim();

    setApiKeyLoading(true);
    setApiKeyError('');

    return !trimmedUsername || !trimmedPassword
      ? (setApiKeyLoading(false),
        setApiKeyError('请输入用户名和密码'),
        setApiKeyValue(''),
        undefined)
      : getApiKey(trimmedUsername, trimmedPassword)
          .then((result) => {
            const accessKey = result?.data?.access_key || '';
            setApiKeyValue(accessKey);
            !accessKey ? setApiKeyError('获取失败，请检查账号') : undefined;
          })
          .catch((err) => {
            console.error('API key fetch error:', err);
            setApiKeyError('获取 API KEY 失败');
            setApiKeyValue('');
          })
          .finally(() => {
            setApiKeyLoading(false);
          });
  };

  const handleCopyApiKey = () => {
    const canCopy = apiKeyValue && navigator?.clipboard?.writeText;

    return canCopy
      ? navigator.clipboard
          .writeText(apiKeyValue)
          .then(() => showToast('已复制'))
          .catch(() => showToast('复制失败'))
      : showToast('无法复制');
  };

  const menuItems = [
    { id: 'api-keys', label: 'API 密钥' },
    { id: 'proxy', label: '代理配置' },
    { id: 'api-docs', label: 'API 文档' },
    { id: 'settings', label: '系统设置' },
    { id: 'fetch-api-key', label: '获取 API KEY' },
    { id: 'supabase', label: 'Supabase' },
  ];

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.statePanel}>
            <div className={styles.stateText}>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.statePanel}>
            <div className={styles.stateText}>Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className={`${styles.button} ${styles.primary}`}
              style={{ marginTop: '20px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = healthStatus?.success;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
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
            <nav className={styles.menuList}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.menuButton} ${activeMenu === item.id ? styles.menuActive : ''}`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          <section className={styles.content}>
            {activeMenu === 'supabase' ? (
              <div className={styles.supabasePanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>Supabase 用户管理</div>
                  <div className={styles.panelMeta}>
                    需要 API Key 鉴权（Bearer Token）
                  </div>
                </div>
                <div className={styles.panelControls}>
                  <input
                    className={styles.input}
                    value={supabaseToken}
                    onChange={(event) => setSupabaseToken(event.target.value)}
                    placeholder="输入 API Key"
                  />
                  <button
                    className={styles.actionButton}
                    onClick={handleSupabaseFetch}
                    disabled={supabaseLoading}
                  >
                    {supabaseLoading ? '加载中...' : '加载用户'}
                  </button>
                </div>
                {supabaseError ? (
                  <div className={styles.statePanel}>
                    <div className={styles.stateText}>{supabaseError}</div>
                  </div>
                ) : supabaseLoading ? (
                  <div className={styles.statePanel}>
                    <div className={styles.stateText}>加载中...</div>
                  </div>
                ) : (supabaseUsers || []).length ? (
                  <div className={styles.tableWrap}>
                    <div className={styles.tableMeta}>
                      共 {(supabaseUsers || []).length} 位用户
                    </div>
                    <div className={styles.table}>
                      <div className={styles.tableRow}>
                        <div className={styles.tableHead}>ID</div>
                        <div className={styles.tableHead}>Email</div>
                        <div className={styles.tableHead}>创建时间</div>
                        <div className={styles.tableHead}>最近登录</div>
                        <div className={styles.tableHead}>状态</div>
                        <div className={styles.tableHead}>角色</div>
                        <div className={styles.tableHead}>用户元数据</div>
                        <div className={styles.tableHead}>应用元数据</div>
                      </div>
                      {(supabaseUsers || []).map((user) => (
                        <div key={user?.id} className={styles.tableRow}>
                          <div className={styles.tableCell}>{user?.id}</div>
                          <div className={styles.tableCell}>
                            {user?.email || '-'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.created_at || '-'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.last_sign_in_at || '-'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.email_confirmed_at ? '已激活' : '未激活'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.role || '-'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.user_metadata
                              ? JSON.stringify(user?.user_metadata)
                              : '-'}
                          </div>
                          <div className={styles.tableCell}>
                            {user?.app_metadata
                              ? JSON.stringify(user?.app_metadata)
                              : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.statePanel}>
                    <div className={styles.stateText}>暂无用户数据</div>
                  </div>
                )}
              </div>
            ) : activeMenu === 'fetch-api-key' ? (
              <div className={styles.supabasePanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitle}>获取 API KEY</div>
                  <div className={styles.panelMeta}>
                    通过账号密码获取 Bearer Token
                  </div>
                </div>
                <div className={styles.panelControls}>
                  <input
                    className={styles.input}
                    value={apiKeyUsername}
                    onChange={(event) => setApiKeyUsername(event.target.value)}
                    placeholder="用户名"
                  />
                  <input
                    className={styles.input}
                    type="password"
                    value={apiKeyPassword}
                    onChange={(event) => setApiKeyPassword(event.target.value)}
                    placeholder="密码"
                  />
                  <button
                    className={styles.actionButton}
                    onClick={handleGetApiKey}
                    disabled={apiKeyLoading}
                  >
                    {apiKeyLoading ? '获取中...' : '获取'}
                  </button>
                </div>
                {apiKeyError ? (
                  <div className={styles.statePanel}>
                    <div className={styles.stateText}>{apiKeyError}</div>
                  </div>
                ) : apiKeyValue ? (
                  <div className={styles.resultPanel}>
                    <div className={styles.resultLabel}>API KEY</div>
                    <div className={styles.resultRow}>
                      <div className={styles.resultKey}>{apiKeyValue}</div>
                      <button
                        className={styles.copyButton}
                        onClick={handleCopyApiKey}
                      >
                        复制
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.statePanel}>
                    <div className={styles.stateText}>请输入账号信息</div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.statePanel}>
                <div className={styles.stateText}>请选择左侧菜单</div>
              </div>
            )}
          </section>
        </div>
        <div
          className={`${styles.toast} ${toastVisible ? styles.toastVisible : ''}`}
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      </div>
    </div>
  );
}
