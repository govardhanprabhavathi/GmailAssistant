'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<{message: string, count: number} | null>(null);
  const [unsubscribedSenders, setUnsubscribedSenders] = useState<Set<string>>(new Set());
  const [isSystemActive, setIsSystemActive] = useState(false);

  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  useEffect(() => {
    // The cron job runs exactly at 12:00 AM (0 hours)
    // We will show the active signal from 12:00 AM to 12:05 AM to simulate the cron window.
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() >= 0 && now.getMinutes() <= 5) {
        setIsSystemActive(true);
      } else {
        setIsSystemActive(false);
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emails');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    setCleaning(true);
    setResult(null);
    try {
      const res = await fetch('/api/clean', { method: 'POST' });
      const data = await res.json();
      setResult({ message: data.message, count: data.trashedCount });
      if (data.trashedCount > 0) {
        fetchEmails(); // Refresh list after cleaning
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCleaning(false);
    }
  };

  const handleUnsubscribe = async (senderEmail: string, unsubscribeHeader: string) => {
    if (!unsubscribeHeader) {
      alert("This sender doesn't support automated unsubscribe (no header).");
      return;
    }
    
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribeHeader })
      });
      const data = await res.json();
      if (data.success) {
        setUnsubscribedSenders(prev => new Set(prev).add(senderEmail));
      } else if (data.fallbackUrl) {
        window.open(data.fallbackUrl, '_blank');
        setUnsubscribedSenders(prev => new Set(prev).add(senderEmail));
      } else {
        alert(data.error || "Failed to unsubscribe.");
      }
    } catch (e) {
      alert("Failed to send unsubscribe request.");
    }
  };

  const uniqueSenders = Array.from(new Set(emails.map(e => e.from.email)))
    .map(email => emails.find(e => e.from.email === email))
    .filter(Boolean)
    .slice(0, 10); // Show top 10 recent senders

  if (status === "loading") {
    return <main className={styles.container}><div className={styles.orbSecondary} /><p>Loading...</p></main>;
  }

  if (!session) {
    return (
      <main className={styles.container}>
        <div className={styles.orbSecondary} />
        <div className={styles.dashboard} style={{ display: 'flex', justifyContent: 'center' }}>
          <section className={`${styles.glassCard} ${styles.triggerCard}`}>
            <h1>Welcome to Fishbowl</h1>
            <p className={styles.subtitle} style={{ marginTop: '1rem', color: '#cbd5e1', marginBottom: '2rem' }}>
              Intelligently clean your Gmail inbox using AI.
            </p>
            <button className={styles.triggerBtn} onClick={() => signIn('google')}>
              Sign in with Google
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.orbSecondary} />
      
      <div className={styles.dashboard}>
        {isSystemActive && (
          <div className={styles.activeSignal}>
            <span className={styles.pulseDot} />
            System is currently running the automated midnight cleanup
          </div>
        )}

        <section className={styles.glassCard}>
          <div className={styles.header}>
            <div>
              <h1>Welcome back, {session.user?.name?.split(' ')[0]}</h1>
              <p className={styles.subtitle}>Your inbox is looking a bit cluttered today.</p>
            </div>
            {session.user?.image ? (
              <img src={session.user.image} alt="User Avatar" className={styles.avatar} style={{ width: '48px', height: '48px', cursor: 'pointer' }} onClick={() => signOut()} />
            ) : (
              <div className={styles.avatar} style={{ width: '48px', height: '48px', cursor: 'pointer' }} onClick={() => signOut()}>
                {session.user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{loading ? '...' : emails.length}</span>
              <span className={styles.statLabel}>Recent Emails</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{result?.count !== undefined ? result.count : '-'}</span>
              <span className={styles.statLabel}>Junk Trashed</span>
            </div>
          </div>
        </section>

        <section className={`${styles.glassCard} ${styles.triggerCard}`}>
          <h2>Ready to clean?</h2>
          <p className={styles.subtitle} style={{ marginTop: '1rem', color: '#cbd5e1' }}>
            Run the AI agent to classify and trash promotional emails securely.
          </p>
          <button className={styles.triggerBtn} onClick={handleClean} disabled={cleaning}>
            {cleaning ? 'Cleaning...' : 'Process The Mails'}
          </button>
          {result && <p style={{ marginTop: '1rem', color: '#4ade80' }}>{result.message}</p>}
        </section>

        <section className={styles.glassCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.header} style={{ marginBottom: '1.5rem' }}>
            <h2>Active Senders</h2>
            <button className={styles.unsubscribeBtn} style={{ background: 'transparent', border: 'none' }}>
              View All
            </button>
          </div>

          <div className={styles.senderList}>
            {loading ? <p>Loading senders...</p> : uniqueSenders.length === 0 ? <p>No recent senders found.</p> : null}
            {uniqueSenders.map((sender, idx) => (
              <div key={idx} className={styles.senderItem}>
                <div className={styles.senderInfo}>
                  <div className={styles.avatar}>{sender.from?.name?.charAt(0) || sender.from?.email?.charAt(0) || '?'}</div>
                  <div>
                    <div className={styles.senderName}>{sender.from?.name}</div>
                    <div className={styles.senderEmail}>{sender.from?.email}</div>
                  </div>
                </div>
                {unsubscribedSenders.has(sender.from?.email) ? (
                  <button className={styles.unsubscribeBtn} style={{ background: '#4ade80', borderColor: '#4ade80', color: '#000', pointerEvents: 'none' }}>
                    Unsubscribed ✓
                  </button>
                ) : (
                  <button className={styles.unsubscribeBtn} onClick={() => handleUnsubscribe(sender.from?.email, sender.unsubscribeLink)}>
                    Unsubscribe
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
