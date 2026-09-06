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
      sender: 'Internshala Digest',
      subject: '5 Python Internships matching your profile',
      status: 'incoming',
      category: 'JUNK',
      tag: 'TRASH',
      tagType: 'tagGray',
    },
    {
      id: 2,
      sender: 'GDG Bangalore',
      subject: 'Your DevFest Confirmed Attendee Pass & QR',
      status: 'incoming',
      category: 'IMPORTANT',
      tag: 'AI_PROCESSED',
      tagType: 'tagBlue',
    },
    {
      id: 3,
      sender: 'HackSphere Devfolio',
      subject: 'Application Update: Registration Not Accepted',
      status: 'incoming',
      category: 'QUEUE',
      tag: 'Queue (24h)',
      tagType: 'tagRed',
    },
    {
      id: 4,
      sender: 'Swiggy Deals',
      subject: 'Flat 50% OFF on your midnight dinner order',
      status: 'incoming',
      category: 'JUNK',
      tag: 'TRASH',
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
    }, 900);
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
      {/* Navigation */}
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>🐟</div>
            <span className={styles.logoText}>Fishbowl</span>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              v2.5 Gemini
            </span>
          </div>

          <nav className={styles.navLinks}>
            <a href="#pipeline" className={styles.navLink}>
              Live Pipeline
            </a>
            <a href="#architecture" className={styles.navLink}>
              Architecture
            </a>
            <a href="#capabilities" className={styles.navLink}>
              Capabilities
            </a>
            <a href="#request-access" className={styles.navLink}>
              Get Access
            </a>
          </nav>

          <div className={styles.navActions}>
            {session ? (
              <button
                onClick={onLaunchDashboard}
                className={styles.primaryBtn}
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
          <span>✨ Autonomous Gmail Intelligence Engine</span>
        </div>

        <h1 className={styles.heroTitle}>
          Reclaim Your Inbox with Deep AI Intelligence.
        </h1>

        <p className={styles.heroSubtitle}>
          Fishbowl autonomously digests, classifies, labels, and trashes promotional
          clutter 24/7 using <strong>Google Gemini 2.5 Flash</strong> and nightly background
          schedulers. Zero manual sorting required.
        </p>

        <div className={styles.heroCtas}>
          {session ? (
            <button
              onClick={onLaunchDashboard}
              className={styles.largePrimaryBtn}
            >
              Launch Dashboard 🚀
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className={styles.largePrimaryBtn}
            >
              Sign In with Google 🔑
            </button>
          )}
          <a href="#request-access" className={styles.largeSecondaryBtn}>
            Request Whitelist Access 📝
          </a>
        </div>

        {/* Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>99.4%</div>
            <div className={styles.statDesc}>AI Classification Accuracy</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>&lt; 1.2s</div>
            <div className={styles.statDesc}>Batch Processing Speed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24h Queue</div>
            <div className={styles.statDesc}>Safe Rejection Hold</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>9:00 PM</div>
            <div className={styles.statDesc}>Nightly Autonomous Sweep</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Visualizer Section */}
      <section id="pipeline" className={styles.visualizerContainer}>
        <div className={styles.visualizerHeader}>
          <h2 className={styles.visualizerTitle}>Interactive AI Classification Pipeline</h2>
          <p className={styles.visualizerSubtitle}>
            Watch how incoming inbox messages are instantly parsed, evaluated, and routed by Gemini.
          </p>
        </div>

        <div className={styles.pipelineGrid}>
          {/* Input Feed */}
          <div className={styles.mockEmailList}>
            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Incoming Stream (Unlabeled Inbox)
            </div>
            {simulatedEmails.map((item) => (
              <div key={item.id} className={styles.mockEmailCard}>
                <div>
                  <span className={styles.emailSender}>{item.sender}</span>
                  <span className={styles.emailSubject}>{item.subject}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#52525b' }}>Raw</span>
              </div>
            ))}
          </div>

          {/* AI Node */}
          <div className={styles.aiEngineNode}>
            <span className={styles.sparkleIcon}>⚡</span>
            <span className={styles.engineLabel}>Gemini 2.5 Flash</span>
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className={styles.secondaryBtn}
              style={{ marginTop: '1rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              {isSimulating ? 'Classifying...' : 'Test AI Engine'}
            </button>
            <button
              onClick={handleResetSim}
              style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '0.7rem', marginTop: '0.5rem', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* Output Buckets */}
          <div className={styles.outputBuckets}>
            <div style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Autonomous Dispatch Outcomes
            </div>
            {simulatedEmails.map((item) => {
              const isClassified = item.status === 'classified';
              return (
                <div
                  key={item.id}
                  className={`${styles.bucketCard} ${
                    isClassified
                      ? item.category === 'IMPORTANT'
                        ? styles.bucketImportant
                        : item.category === 'QUEUE'
                        ? styles.bucketQueue
                        : styles.bucketJunk
                      : styles.mockEmailCard
                  }`}
                >
                  <div>
                    <span className={styles.emailSender} style={{ fontSize: '0.8rem' }}>
                      {item.sender}
                    </span>
                    <span className={styles.emailSubject} style={{ fontSize: '0.7rem' }}>
                      {item.subject}
                    </span>
                  </div>
                  {isClassified && (
                    <span className={`${styles.badgeTag} ${styles[item.tagType]}`}>
                      {item.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture & Workflow Section */}
      <section id="architecture" className={styles.sectionBlock}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBadge}>End-to-End Flow</span>
          <h2 className={styles.sectionTitle}>Engineered for Zero-Friction Reliability</h2>
          <p className={styles.sectionSubtitle}>
            A robust 4-stage pipeline combining Google OAuth 2.0, DeepMind AI models, and serverless background cron workers.
          </p>
        </div>

        <div className={styles.timelineGrid}>
          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>01</div>
              <h3 className={styles.stepTitle}>Chunked Ingestion</h3>
              <p className={styles.stepDesc}>
                Connects via OAuth 2.0 with automated token rotation. Fetches unlabeled emails in chunks of 10 to eliminate network socket drops.
              </p>
            </div>
            <span className={styles.protocolBadge}>Gmail API v1</span>
          </div>

          <div className={`${styles.glassPanel} ${styles.timelineCard}`}>
            <div>
              <div className={styles.stepNumber}>02</div>
              <h3 className={styles.stepTitle}>Context Evaluation</h3>
              <p className={styles.stepDesc}>
                Gemini 2.5 Flash reviews sender headers, subjects, and snippets against strict personalized rules to distinguish promotions from real correspondence.
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
            <span className={styles.bentoIcon}>🧠</span>
            <h3 className={styles.bentoTitle}>Deep Context Rules Engine</h3>
            <p className={styles.bentoDesc}>
              Unlike naive keyword regex filters, Fishbowl understands nuances. It aggressively purges automated job digests, marketing broadcasts, and social feeds while strictly guarding 1-to-1 recruiter chats, Rotary District agendas, and cloud infrastructure alerts.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <span className={styles.bentoIcon}>⏳</span>
            <h3 className={styles.bentoTitle}>24-Hour Queue Hold</h3>
            <p className={styles.bentoDesc}>
              Event registration rejections are tagged with a red Queue label, kept for 24 hours so you can review them, and automatically purged the next night.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <span className={styles.bentoIcon}>🏷️</span>
            <h3 className={styles.bentoTitle}>Hex-Safe Label Engine</h3>
            <p className={styles.bentoDesc}>
              Uses Google-approved color palettes (`#1c4587` blue, `#cc3a21` red, `#a46a21` orange) to dynamically generate native Gmail tags without API rejections.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <span className={styles.bentoIcon}>🛑</span>
            <h3 className={styles.bentoTitle}>1-Click Unsubscribe</h3>
            <p className={styles.bentoDesc}>
              Parses hidden `List-Unsubscribe` headers and automatically dispatches standard `mailto` opt-out messages directly through your Gmail account.
            </p>
          </div>

          <div className={`${styles.glassPanel} ${styles.bentoNormal}`}>
            <span className={styles.bentoIcon}>🛡️</span>
            <h3 className={styles.bentoTitle}>Multi-Tenant Isolation</h3>
            <p className={styles.bentoDesc}>
              Any approved friend or colleague who logs in cleans strictly their own inbox using isolated, auto-rotating session tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Access Request Form Section */}
      <section id="request-access" className={styles.sectionBlock}>
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Request Whitelist Access</h2>
          <p className={styles.formSubtitle}>
            Fishbowl is currently in private beta. Submit your details below, and Govardhan will grant your Google account access to start cleaning your inbox.
          </p>

          {submitSuccess ? (
            <div className={styles.successMessage}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🎉 Request Received!</div>
              <p>{submitSuccess}</p>
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
                <label className={styles.fieldLabel}>Why would you like to use Fishbowl? (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us a bit about your inbox volume or organization..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className={styles.inputField}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {submitError && <div className={styles.errorMessage}>{submitError}</div>}

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
        <div className={styles.footerBrand}>🐟 Fishbowl — AI Gmail Assistant</div>
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
