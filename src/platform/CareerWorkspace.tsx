import { useEffect, useState } from 'react'
import { BellRing, BriefcaseBusiness, Building2, Download, ExternalLink, ShieldCheck } from 'lucide-react'
import { AccountMenu } from './AccountMenu'
import { listWatchlists } from './platformRepository'
import { usePlatformAuth } from './usePlatformAuth'

type Watchlist = Awaited<ReturnType<typeof listWatchlists>>[number]

export function CareerWorkspace() {
  const auth = usePlatformAuth()
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (auth.status !== 'signed_in') return
    let active = true
    setStatus('loading')
    listWatchlists()
      .then((nextWatchlists) => {
        if (!active) return
        setWatchlists(nextWatchlists)
        setStatus('idle')
      })
      .catch((error) => {
        if (!active) return
        setMessage(error instanceof Error ? error.message : 'Workspace data could not be loaded.')
        setStatus('error')
      })
    return () => { active = false }
  }, [auth.status])

  const exportWatchlist = () => {
    const rows = [['Role', 'Sector', 'Risk alerts', 'Demand alerts', 'Salary alerts', 'Layoff alerts'], ...watchlists.map((item) => [
      item.occupation.title,
      item.occupation.sector,
      String(item.risk_alert),
      String(item.demand_alert),
      String(item.salary_alert),
      String(item.layoff_alert),
    ])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'career-watchlist.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (auth.status === 'loading') return <main className="workspace-page"><p role="status">Loading account…</p></main>
  if (auth.status !== 'signed_in') {
    return (
      <main className="workspace-page">
        <section className="workspace-hero">
          <span className="eyebrow">Optional account</span>
          <h1>Your private career workspace</h1>
          <p>Sign in to sync saved roles, comparisons, transition plans, and progress across devices.</p>
          <AccountMenu />
        </section>
        <section className="workspace-feature-grid">
          <article><BellRing /><h2>Role monitoring</h2><p>Keep important roles together and review their latest risk, demand, salary, and layoff-pressure signals.</p></article>
          <article><BriefcaseBusiness /><h2>Transition plans</h2><p>Keep role comparisons and skill steps together, with clear model assumptions.</p></article>
          <article><Building2 /><h2>Institution access</h2><p>Counsellor, placement-office, and employer workspaces are membership controlled.</p></article>
        </section>
      </main>
    )
  }

  return (
    <main className="workspace-page">
      <section className="workspace-hero compact">
        <span className="eyebrow">Career workspace</span>
        <h1>Your saved-role workspace</h1>
        <p>Personal records are owner-scoped in Supabase and protected by row-level security.</p>
      </section>

      <div className="workspace-grid">
        <section className="workspace-card">
          <header><div><span className="eyebrow">Saved roles</span><h2>{watchlists.length} roles watched</h2></div><button type="button" onClick={exportWatchlist} disabled={!watchlists.length}><Download size={16} /> CSV</button></header>
          {status === 'loading' ? <p role="status">Loading watchlist…</p> : watchlists.length ? (
            <div className="workspace-role-list">{watchlists.map((item) => (
              <a key={item.id} href={`/jobs/${item.occupation.slug}?country=India`}>
                <span><strong>{item.occupation.title}</strong><em>{item.occupation.sector}</em></span>
                <ExternalLink size={16} />
              </a>
            ))}</div>
          ) : <div className="workspace-empty"><ShieldCheck /><strong>No saved roles yet</strong><p>Open a role page and select “Save to account”.</p></div>}
        </section>

        <section className="workspace-card">
          <header><div><span className="eyebrow">Role monitoring</span><h2>Review updates manually</h2></div></header>
          <div className="workspace-empty"><BellRing /><strong>Email alerts are not enabled</strong><p>We removed weekly-alert signup until a verified email provider, change detector, scheduler, unsubscribe flow, and delivery monitoring are operational.</p></div>
          {status === 'error' && <p role="alert" className="workspace-error">{message}</p>}
        </section>
      </div>

      <section className="workspace-feature-grid">
        <article><BriefcaseBusiness /><h2>Personalized plans</h2><p>Role pages adapt the 12-week roadmap to the selected current and destination roles.</p><a href="/?country=India">Open transition planner</a></article>
        <article><Download /><h2>Reports</h2><p>Download watchlists as CSV and print individual role pages as PDF from the role report view.</p></article>
        <article><Building2 /><h2>Institutional tools</h2><p>Cohorts, placement reports, workforce planning, API clients, and white-label widgets are schema-ready. Membership is provisioned by an administrator.</p></article>
      </section>
    </main>
  )
}
