import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { MagneticButton } from '@/components/MagneticButton'
import { SITE, TECH_SERVICES, CREATIVE_SERVICES } from '@/data/site'

type StudioKey = 'tech' | 'creative' | 'both' | 'filmmaker'

const STUDIOS: { k: StudioKey; label: string; sub: string; color: string }[] = [
  { k: 'tech', label: 'Tech Studio', sub: 'Sites, pages, systems', color: 'var(--sky)' },
  { k: 'creative', label: 'Creative Studio', sub: 'Films, shoots, content', color: 'var(--acid)' },
  { k: 'both', label: 'Both', sub: 'One story, both mediums', color: 'var(--royal)' },
  { k: 'filmmaker', label: 'I’m a filmmaker', sub: 'NMYT Originals', color: 'var(--emerald)' },
]

const FILMMAKER_OPTS = ['Pitch a short film', 'Crew on commercial shoots', 'Just saying hello']

// TODO(NMYT): confirm currency / ranges before launch.
const BUDGETS = ['Under $2k', '$2k to $5k', '$5k to $15k', '$15k +', 'Not sure yet']
const STAGES = ['Just an idea', 'Treatment', 'Script', 'Ready to shoot']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function parseType(t: string | null): StudioKey | null {
  switch ((t || '').toLowerCase()) {
    case 'tech':
      return 'tech'
    case 'creative':
      return 'creative'
    case 'both':
    case 'hybrid':
      return 'both'
    case 'filmmaker':
    case 'originals':
      return 'filmmaker'
    default:
      return null
  }
}

type Errors = Partial<Record<'studio' | 'name' | 'email' | 'message', string>>

export default function BriefForm() {
  const root = useRef<HTMLDivElement>(null)
  const uid = useId()
  const [params] = useSearchParams()
  const typeParam = params.get('type')
  const [studio, setStudio] = useState<StudioKey | null>(() => parseType(typeParam))
  const [services, setServices] = useState<string[]>([])
  const [budget, setBudget] = useState<string>('')
  const [fields, setFields] = useState({ name: '', email: '', company: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const [mailto, setMailto] = useState('')

  // follow ?type= changes while mounted (e.g. nav from footer links)
  useEffect(() => {
    const t = parseType(typeParam)
    if (t) setStudio(t)
  }, [typeParam])

  const isFilm = studio === 'filmmaker'
  const serviceOpts = useMemo(() => {
    if (studio === 'tech') return TECH_SERVICES.map((s) => s.title)
    if (studio === 'creative') return CREATIVE_SERVICES.map((s) => s.title)
    if (studio === 'both') return [...TECH_SERVICES, ...CREATIVE_SERVICES].map((s) => s.title)
    if (studio === 'filmmaker') return FILMMAKER_OPTS
    return []
  }, [studio])
  const budgetOpts = isFilm ? STAGES : BUDGETS

  // drop selections that no longer apply when the studio changes
  useEffect(() => {
    setServices((s) => s.filter((x) => serviceOpts.includes(x)))
    setBudget((b) => (budgetOpts.includes(b) ? b : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOpts])

  // stagger chips in whenever the option set changes
  useGSAP(
    () => {
      if (!studio) return
      gsap.fromTo('.bf-svc .bf-chip', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.03, ease: 'expo.out', clearProps: 'transform' })
    },
    { scope: root, dependencies: [studio] },
  )

  const done = {
    1: !!studio,
    2: services.length > 0,
    3: !!budget,
    4: !!fields.name.trim() && EMAIL_RE.test(fields.email.trim()),
  }
  const progress = Object.values(done).filter(Boolean).length

  const toggleService = (s: string) => setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
  const setField = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    setFields((f) => ({ ...f, [k]: v }))
    if (errors[k as keyof Errors]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = (): Errors => {
    const er: Errors = {}
    if (!studio) er.studio = 'Pick a studio so we know who should reply.'
    if (!fields.name.trim()) er.name = 'Tell us your name.'
    if (!fields.email.trim()) er.email = 'We need an email to reply to.'
    else if (!EMAIL_RE.test(fields.email.trim())) er.email = 'That email doesn’t look right.'
    if (!fields.message.trim()) er.message = isFilm ? 'A few lines about you and the film.' : 'A few lines about the project.'
    return er
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) {
      const first = root.current?.querySelector<HTMLElement>('[aria-invalid="true"], .bf-studio[data-invalid="true"] input')
      first?.focus()
      if (!prefersReducedMotion()) gsap.fromTo(root.current!.querySelector('.bf-submit'), { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      return
    }
    const st = STUDIOS.find((s) => s.k === studio)!
    const subject = isFilm ? `NMYT Originals / ${fields.name.trim()}` : `Project brief / ${st.label} / ${fields.name.trim()}${fields.company.trim() ? ` (${fields.company.trim()})` : ''}`
    const lines = [
      `Studio: ${st.label}`,
      `${isFilm ? 'Interested in' : 'Services'}: ${services.length ? services.join(', ') : '-'}`,
      `${isFilm ? 'Stage' : 'Budget'}: ${budget || '-'}`,
      '',
      `Name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      `${isFilm ? 'Portfolio' : 'Company'}: ${fields.company.trim() || '-'}`,
      '',
      isFilm ? 'About me and the film:' : 'About the project:',
      fields.message.trim(),
      '',
      'Sent from the brief builder on the NMYT website',
    ]
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`
    setMailto(href)
    window.location.href = href
    setSent(true)
  }

  const reset = () => {
    setSent(false)
    setServices([])
    setBudget('')
    setFields({ name: '', email: '', company: '', message: '' })
    setErrors({})
  }

  // success-state entrance
  useGSAP(
    () => {
      if (!sent) return
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline()
      tl.fromTo('.bf-done', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
      const ring = root.current!.querySelector<SVGCircleElement>('.bf-done-ring')
      const tick = root.current!.querySelector<SVGPathElement>('.bf-done-tick')
      if (ring && tick && !reduce) {
        const rl = ring.getTotalLength()
        const tlen = tick.getTotalLength()
        gsap.set(ring, { strokeDasharray: rl, strokeDashoffset: rl })
        gsap.set(tick, { strokeDasharray: tlen, strokeDashoffset: tlen })
        tl.to(ring, { strokeDashoffset: 0, duration: 1.1, ease: 'expo.inOut' }, 0.1).to(tick, { strokeDashoffset: 0, duration: 0.6, ease: 'expo.out' }, '-=0.35')
      }
      tl.fromTo('.bf-done-in > *', { autoAlpha: 0, y: reduce ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.3)
    },
    { scope: root, dependencies: [sent] },
  )

  const id = (s: string) => `${uid}-${s}`

  return (
    <div ref={root} className={`bf ${sent ? 'is-sent' : ''}`}>
      <div className="bf-glow" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="bf-panel">
        <div className="bf-head mono">
          <span>Project brief</span>
          <span className="bf-progress" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={n <= progress ? 'is-on' : ''} />
            ))}
          </span>
          <span className="bf-count">{progress} / 4</span>
        </div>

        {!sent ? (
          <form className="bf-form" onSubmit={submit} noValidate>
            {/* 01 studio */}
            <fieldset className="bf-step bf-studio" data-invalid={!!errors.studio} aria-describedby={errors.studio ? id('studio-err') : undefined}>
              <legend className="bf-legend mono">
                <span>01</span> Who’s this for?
              </legend>
              <div className="bf-studios">
                {STUDIOS.map((s) => (
                  <label key={s.k} className={`bf-card ${studio === s.k ? 'is-on' : ''}`} style={{ ['--c' as string]: s.color }}>
                    <input
                      type="radio"
                      name="studio"
                      value={s.k}
                      checked={studio === s.k}
                      onChange={() => {
                        setStudio(s.k)
                        setErrors((er) => ({ ...er, studio: undefined }))
                      }}
                    />
                    <i className="bf-card-dot" aria-hidden />
                    <span className="bf-card-label">{s.label}</span>
                    <span className="bf-card-sub mono">{s.sub}</span>
                  </label>
                ))}
              </div>
              {errors.studio && (
                <p className="bf-err" id={id('studio-err')} role="alert">
                  {errors.studio}
                </p>
              )}
            </fieldset>

            {/* 02 services */}
            <fieldset className="bf-step bf-svc">
              <legend className="bf-legend mono">
                <span>02</span> {isFilm ? 'What are you after?' : 'What do you need?'} <em>Pick any</em>
              </legend>
              {studio ? (
                <div className="bf-chips">
                  {serviceOpts.map((s) => (
                    <label key={s} className={`bf-chip ${services.includes(s) ? 'is-on' : ''}`}>
                      <input type="checkbox" checked={services.includes(s)} onChange={() => toggleService(s)} />
                      <span className="bf-chip-box" aria-hidden />
                      {s}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="bf-hint">Choose a studio first, the options follow.</p>
              )}
            </fieldset>

            {/* 03 budget / stage */}
            <fieldset className="bf-step">
              <legend className="bf-legend mono">
                <span>03</span> {isFilm ? 'Where’s the film at?' : 'Rough budget'}
              </legend>
              <div className="bf-chips">
                {budgetOpts.map((b) => (
                  <label key={b} className={`bf-chip bf-chip--radio ${budget === b ? 'is-on' : ''}`}>
                    <input type="radio" name="budget" value={b} checked={budget === b} onChange={() => setBudget(b)} />
                    {b}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 04 details */}
            <fieldset className="bf-step">
              <legend className="bf-legend mono">
                <span>04</span> About you
              </legend>
              <div className="bf-fields">
                <div className={`bf-field ${errors.name ? 'has-err' : ''}`}>
                  <input
                    id={id('name')}
                    className="bf-input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder=" "
                    value={fields.name}
                    onChange={setField('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? id('name-err') : undefined}
                    required
                  />
                  <label htmlFor={id('name')}>Your name</label>
                  {errors.name && (
                    <p className="bf-err" id={id('name-err')}>
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className={`bf-field ${errors.email ? 'has-err' : ''}`}>
                  <input
                    id={id('email')}
                    className="bf-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder=" "
                    value={fields.email}
                    onChange={setField('email')}
                    onBlur={() => {
                      const v = fields.email.trim()
                      if (v && !EMAIL_RE.test(v)) setErrors((er) => ({ ...er, email: 'That email doesn’t look right.' }))
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? id('email-err') : undefined}
                    required
                  />
                  <label htmlFor={id('email')}>Email</label>
                  {errors.email && (
                    <p className="bf-err" id={id('email-err')}>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="bf-field bf-field--wide">
                  <input id={id('company')} className="bf-input" type="text" name="company" autoComplete={isFilm ? 'url' : 'organization'} placeholder=" " value={fields.company} onChange={setField('company')} />
                  <label htmlFor={id('company')}>{isFilm ? 'Portfolio or reel link (optional)' : 'Company (optional)'}</label>
                </div>
                <div className={`bf-field bf-field--wide ${errors.message ? 'has-err' : ''}`}>
                  <textarea
                    id={id('message')}
                    className="bf-input bf-textarea"
                    name="message"
                    rows={4}
                    placeholder=" "
                    value={fields.message}
                    onChange={setField('message')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? id('message-err') : undefined}
                    required
                  />
                  <label htmlFor={id('message')}>{isFilm ? 'Tell us about you and the film' : 'Tell us about the project'}</label>
                  {errors.message && (
                    <p className="bf-err" id={id('message-err')}>
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            <div className="bf-foot">
              <p className="bf-note">Opens your mail app with the brief filled in. Nothing is stored on this site.</p>
              <MagneticButton type="submit" variant={isFilm ? 'acid' : studio === 'tech' ? 'sky' : 'light'} className="bf-submit">
                {isFilm ? 'Send pitch' : 'Send brief'}
              </MagneticButton>
            </div>
          </form>
        ) : (
          <div className="bf-done" role="status" aria-live="polite">
            <div className="bf-done-in">
              <svg className="bf-done-mark" viewBox="0 0 64 64" width="72" height="72" aria-hidden>
                <circle className="bf-done-ring" cx="32" cy="32" r="30" fill="none" stroke="url(#bfg)" strokeWidth="1.5" />
                <path className="bf-done-tick" d="M20 33l8 8 16-17" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="bfg" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#1638ff" />
                    <stop offset=".5" stopColor="#16b4ff" />
                    <stop offset="1" stopColor="#00e08a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="mono bf-done-k">Brief ready</div>
              <h3 className="display bf-done-title">
                Thanks, <em className="serif">{fields.name.trim().split(' ')[0] || 'friend'}.</em>
              </h3>
              <p className="bf-done-p">
                Your mail app should have opened with everything filled in, hit send there and it reaches us. If nothing opened, write to{' '}
                <a href={mailto || `mailto:${SITE.email}`} className="bf-link">
                  {SITE.email}
                </a>
                .
              </p>
              <div className="bf-done-actions">
                <MagneticButton href={mailto || `mailto:${SITE.email}`} variant="light" small>
                  Open email again
                </MagneticButton>
                <MagneticButton onClick={reset} variant="ghost" small arrow={false}>
                  Start a new brief
                </MagneticButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
