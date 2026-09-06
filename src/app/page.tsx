'use client';
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<'dashboard' | 'landing'>('dashboard');
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<{message: string, count: number} | null>(null);
  const [unsubscribedSenders, setUnsubscribedSenders] = useState<Set<string>>(new Set());
  const [isSystemActive, setIsSystemActive] = useState(false);

  useEffect(() => {
    if ((session as any)?.error === 'RefreshAccessTokenError') {
      signIn('google'); // Force sign in to obtain a new set of access and refresh tokens
    } else if (session) {
      fetchEmails();
    }
  }, [session]);

  useEffect(() => {
    // The cron job runs exactly at 9:00 PM (21 hours)
    // We will show the active signal from 9:00 PM to 9:05 PM to simulate the cron window.
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 21 && now.getMinutes() >= 0 && now.getMinutes() <= 5) {
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
      if (!res.ok) {
        throw new Error(data.error || 'Cleanup failed');
      }
      setResult({ message: data.message, count: data.trashedCount });
      if (data.trashedCount > 0) {
        fetchEmails(); // Refresh list after cleaning
      }
    } catch (e: any) {
      console.error(e);
      setResult({ message: e.message || 'Error cleaning emails', count: 0 });
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
    return (
      <main className={styles.container}>
        <div className={styles.orbSecondary} />
        <p style={{ color: '#a1a1aa', fontWeight: 500 }}>Loading FisherBowl...</p>
      </main>
    );
  }

  // If visitor is not signed in, show the comprehensive showcase landing page
  if (!session || view === 'landing') {
    return (
      <LandingPage
        session={session}
        onLaunchDashboard={() => setView('dashboard')}
        onSignIn={() => signIn('google')}
      />
    );
  }

  // Active Authenticated User Dashboard
  return (
    <main className={styles.container}>
      <div className={styles.orbSecondary} />
      
      <div className={styles.dashboard}>
        {/* Navigation bar inside dashboard */}
        <div className={styles.dashboardNav}>
          <span className={styles.dashBrand}>FisherBowl</span>
          <button
            onClick={() => setView('landing')}
            className={styles.showcaseLinkBtn}
          >
            ← View Showcase & Architecture
          </button>
        </div>

        {isSystemActive && (
          <div className={styles.activeSignal}>
            <span className={styles.pulseDot} />
            System is currently running the automated midnight cleanup
          </div>
        )}

        <section className={styles.glassCard}>
          <div className={styles.header}>
            <div className={styles.headerTextGroup}>
              <h1>Welcome back, {session.user?.name?.split(' ')[0]}</h1>
              <p className={styles.subtitle}>Your inbox is connected and active.</p>
            </div>
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="User Avatar"
                className={styles.avatar}
                onClick={() => signOut()}
                title="Click to Sign Out"
              />
            ) : (
              <div
                className={styles.avatar}
                onClick={() => signOut()}
                title="Click to Sign Out"
              >
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
          <p className={styles.subtitle} style={{ marginTop: '0.4rem', color: '#cbd5e1' }}>
            Run the AI agent to classify and trash promotional emails securely.
          </p>
          <button className={styles.triggerBtn} onClick={handleClean} disabled={cleaning}>
            {cleaning ? 'Cleaning Inbox...' : 'Process The Mails'}
          </button>
          {result && (
            <p style={{ marginTop: '0.75rem', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>
              {result.message}
            </p>
          )}
        </section>

        <section className={styles.glassCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.header} style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Active Senders</h2>
            <button className={styles.showcaseLinkBtn} style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}>
              View All
            </button>
          </div>

          <div className={styles.senderList}>
            {loading ? (
              <p style={{ color: '#71717a', fontSize: '0.875rem' }}>Loading senders...</p>
            ) : uniqueSenders.length === 0 ? (
              <p style={{ color: '#71717a', fontSize: '0.875rem' }}>No recent senders found.</p>
            ) : null}
            {uniqueSenders.map((sender, idx) => (
              <div key={idx} className={styles.senderItem}>
                <div className={styles.senderInfo}>
                  <div className={styles.avatar} style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                    {sender.from?.name?.charAt(0) || sender.from?.email?.charAt(0) || '?'}
                  </div>
                  <div className={styles.senderNameGroup}>
                    <div className={styles.senderName}>{sender.from?.name || 'Unknown Sender'}</div>
                    <div className={styles.senderEmail}>{sender.from?.email}</div>
                  </div>
                </div>
                {unsubscribedSenders.has(sender.from?.email) ? (
                  <button
                    className={styles.unsubscribeBtn}
                    style={{ background: 'rgba(74, 222, 128, 0.12)', borderColor: 'rgba(74, 222, 128, 0.3)', color: '#4ade80', pointerEvents: 'none' }}
                  >
                    Unsubscribed ✓
                  </button>
                ) : (
                  <button
                    className={styles.unsubscribeBtn}
                    onClick={() => handleUnsubscribe(sender.from?.email, sender.unsubscribeLink)}
                  >
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
