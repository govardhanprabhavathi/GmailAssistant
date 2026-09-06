'use client';
import React, { useState } from 'react';
import styles from '../app/landing.module.css';

interface LandingPageProps {
  session?: any;
  onLaunchDashboard?: () => void;
  onSignIn: () => void;
}

export function LandingPage({ session, onLaunchDashboard, onSignIn }: LandingPageProps) {
  // Access Request Form State
  const [formData, setFormData] = useState({ name: '', email: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Interactive Live Pipeline Simulator State
  const [simulatedEmails, setSimulatedEmails] = useState([
    {
      id: 1,
      sender: 'Internshala Daily Alerts',
      domain: 'digest@internshala.com',
      subject: '5 Python Internships matching your profile',
      status: 'incoming',
      category: 'JUNK',
      tag: 'TRASHED',
      tagType: 'tagGray',
    },
    {
      id: 2,
      sender: 'GDG Community Bangalore',
      domain: 'gdg-bangalore@google.com',
      subject: 'Confirmed: DevFest 2026 Attendee Pass & QR',
      status: 'incoming',
      category: 'IMPORTANT',
      tag: 'AI_PROCESSED',
      tagType: 'tagBlue',
    },
    {
      id: 3,
      sender: 'HackSphere Devfolio',
      domain: 'notifications@devfolio.co',
      subject: 'Application Update: Registration Not Accepted',
      status: 'incoming',
      category: 'QUEUE',
      tag: 'Queue (24h)',
      tagType: 'tagRed',
    },
    {
      id: 4,
      sender: 'Swiggy Midnight Offers',
      domain: 'offers@swiggy.in',
      subject: 'Flat 50% OFF on your dinner order tonight',
      status: 'incoming',
      category: 'JUNK',
      tag: 'TRASHED',
      tagType: 'tagGray',
    },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulatedEmails((prev) =>
        prev.map((e) => ({ ...e, status: 'classified' }))
      );
      setIsSimulating(false);
    }, 750);
  };

  const handleResetSim = () => {
    setSimulatedEmails((prev) =>
      prev.map((e) => ({ ...e, status: 'incoming' }))
    );
  };

  const handleSubmitAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitSuccess(data.message || 'Access request received!');
      setFormData({ name: '', email: '', note: '' });
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.landingContainer}>
      <div className={styles.ambientGlowTop} />

      {/* Seamless Minimalist Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <a href="#" className={styles.logoGroup}>
            <span className={styles.logoText}>FisherBowl</span>
          </a>

          <nav className={styles.navLinks}>
            <a href="#pipeline" className={styles.navLink}>
              Pipeline
            </a>
            <a href="#architecture" className={styles.navLink}>
              Architecture
            </a>
            <a href="#capabilities" className={styles.navLink}>
              Capabilities
            </a>
            <a href="#request-access" className={styles.navLink}>
              Whitelist Access
            </a>
          </nav>

          <div className={styles.navActions}>
            {session ? (
              <button
                onClick={onLaunchDashboard}
                className={styles.dashboardBtn}
              >
                Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className={styles.secondaryBtn}
                >
                  Sign In
                </button>
                <a href="#request-access" className={styles.primaryBtn}>
                  Request Access
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.taglinePill}>
          <span>Autonomous Gmail Intelligence Engine</span>
        </div>

        <h1 className={styles.heroTitle}>
          Reclaim Your Inbox with Deep AI Intelligence.
        </h1>

        <p className={styles.heroSubtitle}>
          FisherBowl autonomously digests, classifies, labels, and trashes promotional
          clutter 24/7 using <strong>Google Gemini 2.5 Flash</strong> and nightly background
          schedulers. Zero manual sorting required.
        </p>

        <div className={styles.heroCtas}>
          {session ? (
            <button
              onClick={onLaunchDashboard}
              className={styles.largePrimaryBtn}
            >
              Launch Dashboard
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className={styles.largePrimaryBtn}
            >
              Sign In with Google
            </button>
          )}
          <a href="#request-access" className={styles.largeSecondaryBtn}>
            Request Whitelist Access
          </a>
        </div>

        {/* Real-time Stats Grid */}
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>99.4%</div>
            <div className={styles.statDesc}>Classification Accuracy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>&lt; 1.2s</div>
            <div className={styles.statDesc}>Batch Speed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24h Queue</div>
            <div className={styles.statDesc}>Safe Rejection Hold</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>9:00 PM</div>
            <div className={styles.statDesc}>Autonomous Sweep</div>
          </div>
        </div>
      </section>

      {/* macOS Style Interactive Pipeline Visualizer */}
      <section id="pipeline" className={styles.appWindow}>
        <div className={styles.windowTitlebar}>
          <div className={styles.windowControls}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <span className={styles.windowTitle}>FisherBowl Engine Simulator — Gemini 2.5 Flash</span>
          <div style={{ width: '40px' }} />
        </div>

        <div className={styles.windowContent}>
          <div className={styles.pipelineGrid}>
            {/* Input Feed */}
            <div className={styles.mockEmailList}>
              <div className={styles.feedHeader}>
                <span>Incoming Stream</span>
                <span>Unlabeled Inbox</span>
              </div>
              {simulatedEmails.map((item) => (
                <div key={item.id} className={styles.mockEmailCard}>
                  <div className={styles.emailMeta}>
                    <span className={styles.emailSender}>{item.sender}</span>
                    <span className={styles.emailSubject}>{item.subject}</span>
                  </div>
                  <span className={styles.rawTag}>Raw</span>
                </div>
              ))}
            </div>

            {/* AI Center Hub */}
            <div className={styles.aiEngineHub}>
              <span className={styles.geminiSparkle}>⚡</span>
              <span className={styles.engineText}>Gemini 2.5 Flash</span>
              <span className={styles.engineSub}>Deep Reasoning Node</span>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className={styles.simBtn}
              >
                {isSimulating ? 'Processing...' : 'Simulate Engine'}
              </button>
              <button onClick={handleResetSim} className={styles.resetBtn}>
                Reset Stream
              </button>
            </div>

            {/* Classified Outcomes */}
            <div className={styles.mockEmailList}>
              <div className={styles.feedHeader}>
                <span>Autonomous Outcomes</span>
                <span>Dispatch Routing</span>
              </div>
              {simulatedEmails.map((item) => {
                const isClassified = item.status === 'classified';
                return (
                  <div
                    key={item.id}
                    className={`${styles.mockEmailCard} ${
                      isClassified
                        ? item.category === 'IMPORTANT'
                          ? styles.bucketImportant
                          : item.category === 'QUEUE'
                          ? styles.bucketQueue
                          : styles.bucketJunk
                        : ''
                    }`}
                  >
                    <div className={styles.emailMeta}>
                      <span className={styles.emailSender}>{item.sender}</span>
                      <span className={styles.emailSubject}>{item.subject}</span>
                    </div>
                    {isClassified ? (
                      <span className={`${styles.badgeTag} ${styles[item.tagType]}`}>
                        {item.tag}
                      </span>
                    ) : (
                      <span className={styles.rawTag}>Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Workflow Section */}
      <section id="architecture" className={styles.sectionBlock}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBadge}>End-to-End Pipeline</span>
          <h2 className={styles.sectionTitle}>Engineered for Zero-Friction Reliability</h2>
          <p className={styles.sectionSubtitle}>
            A 4-stage automated pipeline combining Google OAuth 2.0, DeepMind AI models, and serverless cron workers.
          </p>
        </div>

        <div className={styles.timelineGrid}>
          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Chunked Ingestion</h3>
              <p className={styles.stepDesc}>
                Connects via OAuth 2.0 with automatic token rotation. Ingests unlabeled messages in chunks of 10 to eliminate network socket drops.
              </p>
            </div>
            <span className={styles.protocolBadge}>Gmail API v1</span>
          </div>

          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Context Reasoning</h3>
              <p className={styles.stepDesc}>
                Gemini 2.5 Flash analyzes sender headers, subjects, and snippets against strict rules to differentiate marketing blasts from actual correspondence.
              </p>
            </div>
            <span className={styles.protocolBadge}>Gemini 2.5 Flash</span>
          </div>

          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>03</div>
              <h3 className={styles.stepTitle}>Multi-Action Dispatch</h3>
              <p className={styles.stepDesc}>
                Batch trashes junk in a single call, tags important emails with Google-approved safe blue hex labels, and routes rejections into a red Queue.
              </p>
            </div>
            <span className={styles.protocolBadge}>Batch Modify API</span>
          </div>

          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>04</div>
              <h3 className={styles.stepTitle}>Nightly 9 PM Sweeps</h3>
              <p className={styles.stepDesc}>
                Vercel Cron triggers the autonomous cleaner every night. Expired 24-hour Queue emails are permanently moved to trash while you sleep.
              </p>
            </div>
            <span className={styles.protocolBadge}>Vercel Serverless Cron</span>
          </div>
        </div>
      </section>

      {/* Capabilities Bento Grid */}
      <section id="capabilities" className={styles.sectionBlock}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBadge}>System Capabilities</span>
          <h2 className={styles.sectionTitle}>Everything an Intelligent Assistant Should Be</h2>
          <p className={styles.sectionSubtitle}>
            Engineered with deep personalization and production safety guardrails.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          <div className={`${styles.glassPanel} ${styles.bentoLarge}`}>
            <div className={styles.bentoIconBadge}>🧠</div>
            <h3 className={styles.bentoTitle}>Deep Context Rules Engine</h3>
            <p className={styles.bentoDesc}>
              Unlike naive keyword regex filters, FisherBowl understands nuances. It aggressively purges automated job digests, marketing broadcasts, and social feeds while strictly guarding 1-to-1 recruiter chats, Rotary District agendas, and cloud infrastructure alerts.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <div className={styles.bentoIconBadge}>⏳</div>
            <h3 className={styles.bentoTitle}>24-Hour Queue Hold</h3>
            <p className={styles.bentoDesc}>
              Event registration rejections are tagged with a red Queue label, kept for 24 hours so you can review them, and automatically purged the next night.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <div className={styles.bentoIconBadge}>🏷️</div>
            <h3 className={styles.bentoTitle}>Hex-Safe Label Engine</h3>
            <p className={styles.bentoDesc}>
              Uses Google-approved color palettes (<code style={{ color: '#93c5fd' }}>#1c4587</code> blue, <code style={{ color: '#f87171' }}>#cc3a21</code> red, <code style={{ color: '#fbbf24' }}>#a46a21</code> orange) to dynamically generate native Gmail tags without API rejections.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <div className={styles.bentoIconBadge}>🛑</div>
            <h3 className={styles.bentoTitle}>1-Click Unsubscribe</h3>
            <p className={styles.bentoDesc}>
              Parses hidden <code style={{ color: '#a1a1aa' }}>List-Unsubscribe</code> headers and automatically dispatches standard <code style={{ color: '#a1a1aa' }}>mailto</code> opt-out messages directly through your Gmail account.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <div className={styles.bentoIconBadge}>🛡️</div>
            <h3 className={styles.bentoTitle}>Multi-Tenant Isolation</h3>
            <p className={styles.bentoDesc}>
              Any approved friend or colleague who logs in cleans strictly their own inbox using isolated, auto-rotating session tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Access Request Form Section */}
      <section id="request-access" className={styles.sectionBlock}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Request Whitelist Access</h2>
          <p className={styles.formSubtitle}>
            FisherBowl is currently in private beta. Submit your details below, and Govardhan will grant your Google account access to start cleaning your inbox.
          </p>

          {submitSuccess ? (
            <div className={styles.successCard}>
              <div className={styles.successHeading}>Request Received</div>
              <p className={styles.successText}>{submitSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAccess} className={styles.formFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Gmail Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Why would you like to use FisherBowl? (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us a bit about your inbox volume or organization..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className={styles.inputField}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {submitError && <div className={styles.errorCard}>{submitError}</div>}

              <button
                type="submit"
                disabled={submitting}
                className={styles.submitBtn}
              >
                {submitting ? 'Submitting Request...' : 'Submit Access Request →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>FisherBowl — AI Gmail Assistant</div>
        <p className={styles.footerText}>
          Built with Next.js, Google Gemini 2.5 Flash, and Google Cloud APIs. Designed & Maintained by{' '}
          <strong style={{ color: '#e4e4e7' }}>Govardhan Yasani</strong>.
        </p>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/govardhanprabhavathi/GmailAssistant"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
          <a href="#pipeline">Live Simulator</a>
          <a href="#request-access">Request Beta Access</a>
        </div>
      </footer>
    </div>
  );
}
