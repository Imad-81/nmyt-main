import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/smooth'
import { Reveal, SplitReveal } from '@/components/Reveal'
import { MonoLabel, SectionHead, Marquee, Brackets } from '@/components/ui'
import { MagneticButton } from '@/components/MagneticButton'
import Img from '@/components/Img'
import { media, type MediaKey } from '@/data/media'

/* ------------------------------------------------------------------ */
/* 01 — Manifesto: words light up as you read                          */
/* ------------------------------------------------------------------ */
export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const text = root.current!.querySelector<HTMLElement>('.om-text')!
      const split = SplitText.create(text, { type: 'words', wordsClass: 'om-w' })
      if (prefersReducedMotion()) {
        gsap.fromTo(split.words, { opacity: 0.16 }, { opacity: 1, duration: 1, stagger: 0.03, scrollTrigger: { trigger: text, start: 'top 75%', once: true } })
      } else {
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: 0.6 } },
        )
      }
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="om section">
      <div className="wrap">
        <Reveal className="mb-12 flex items-center gap-4 md:mb-20">
          <MonoLabel index="01" color="var(--emerald)">
            Manifesto
          </MonoLabel>
          <div className="hairline flex-1" />
          <span className="mono" style={{ color: 'var(--fg-3)' }}>
            Scene 01
          </span>
        </Reveal>
        <p className="display om-text">
          We make our own <em className="serif om-em om-em--a">films.</em> And we make room for <em className="serif om-em om-em--b">new filmmakers.</em>
        </p>
        <Reveal className="om-cols" childSelector=".om-col" stagger={0.12}>
          <p className="om-col">
            Originals is NMYT’s in-house slate of short films. It keeps the studio’s eye sharp between commercial jobs — the same crews, the same kit, no brief but the story.
          </p>
          <p className="om-col">
            Every film puts new directors, writers, cinematographers and editors on a real set. The ones who fit stay on — on paid commercial productions, growing with the studio.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 02 — The Program: a film strip that runs sideways on desktop        */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    n: '01',
    title: 'Pitch',
    body: 'Send a treatment, a script or a rough idea. If it fits the slate, we sit down and shape it with you.',
    tags: ['Treatment', 'Script', 'Idea'],
    c: 'var(--royal)',
  },
  {
    n: '02',
    title: 'Make',
    body: 'We back the production — crew, kit, locations and post — with NMYT producers beside you. Your film, your call.',
    tags: ['Crew', 'Kit', 'Post'],
    c: 'var(--sky)',
  },
  {
    n: '03',
    title: 'Release',
    body: 'Graded, mixed and released under NMYT Originals, with your name on it and a cut for your reel.',
    tags: ['Release', 'Credit', 'Reel'],
    c: 'var(--emerald)',
  },
  {
    n: '04',
    title: 'Work with us',
    body: 'Paid work on our commercial productions — brand films, ads and content. A portfolio that grows as the studio does.',
    tags: ['Paid', 'Commercial sets', 'Portfolio'],
    c: 'var(--acid)',
  },
]

export function Program() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const track = q('.op-track')[0] as HTMLElement
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        if (prefersReducedMotion()) {
          root.current!.classList.add('op--static')
          return () => root.current?.classList.remove('op--static')
        }
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: { trigger: q('.op-pin')[0], start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        })
        gsap.fromTo(q('.op-progress i'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: q('.op-pin')[0], start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } })
        q('.op-card').forEach((card) => {
          gsap.fromTo(
            card.querySelector('.op-num'),
            { xPercent: 40 },
            { xPercent: -40, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
          )
          gsap.fromTo(
            card.querySelector('.op-streak'),
            { scaleX: 0.15, opacity: 0.2 },
            { scaleX: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'center 55%', scrub: true } },
          )
        })
      })
      mm.add('(max-width: 1023px)', () => {
        q('.op-card').forEach((card) => {
          gsap.fromTo(card, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="op">
      <div className="op-pin">
        <div className="wrap op-head">
          <MonoLabel index="02" color="var(--emerald)">
            The program
          </MonoLabel>
          <div className="hairline flex-1" />
          <div className="op-progress" aria-hidden>
            <i />
          </div>
        </div>
        <div className="op-track">
          <div className="op-intro">
            <SplitReveal as="h2" className="display op-title" type="chars" stagger={0.025}>
              From pitch
              <br />
              to <em className="serif op-em">paid.</em>
            </SplitReveal>
            <Reveal className="lede op-lede" delay={0.2}>
              Four steps for filmmakers early in their careers — from a first idea to a finished film and a place on our sets.
            </Reveal>
          </div>
          {STEPS.map((s) => (
            <article key={s.n} className="op-card" style={{ ['--c' as string]: s.c }}>
              <div className="op-card-top mono">
                <span>Reel {s.n}</span>
                <span>{s.n} / 04</span>
              </div>
              <div className="op-vis" aria-hidden>
                <span className="op-streak" />
                <span className="op-num serif">{s.n}</span>
                <Brackets color="rgba(255,255,255,.28)" size={12} inset={12} />
              </div>
              <h3 className="display op-card-title">{s.title}</h3>
              <p className="op-card-body">{s.body}</p>
              <div className="op-tags">
                {s.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
          <div className="op-end">
            <span className="mono">End of reel</span>
            <MagneticButton to="/contact?type=filmmaker" variant="ghost">
              Pitch your film
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — The slate: films in development                                */
/* ------------------------------------------------------------------ */
const FILMS: { code: string; img: MediaKey; kind: string; pos?: string }[] = [
  { code: '01', img: 'originalsDirector', kind: 'Short film' },
  { code: '02', img: 'originalsMonitor', kind: 'Short film' },
  { code: '03', img: 'heroFilmset', kind: 'Short film', pos: 'center 40%' },
]

export function FilmSlate() {
  return (
    <section className="ofs section">
      <div className="wrap">
        <SectionHead
          index="03"
          label="The slate"
          accent="var(--emerald)"
          title={
            <>
              In <em className="serif ofs-em">development</em>
            </>
          }
          lede="The first NMYT Originals are being written and prepped now. Titles, crews and dates are announced on release."
          aside={
            <span className="mono hidden md:inline" style={{ color: 'var(--fg-3)' }}>
              03 titles
            </span>
          }
        />
        <div className="ofs-grid">
          {FILMS.map((f, i) => (
            <Reveal key={f.code} className={`ofs-cell ofs-cell--${i + 1}`} y={60}>
              <article className="ofs-card" data-cursor="Soon">
                <div className="ofs-media">
                  <Img src={media(f.img)} alt="" className="ofs-img" parallax={10} position={f.pos} tint="#04123F" tintOpacity={0.3} />
                </div>
                <div className="ofs-shade" />
                <div className="ofs-top">
                  <span className="pill ofs-pill ofs-pill--live">
                    <i /> In development
                  </span>
                  <span className="pill ofs-pill">ORIG / {f.code}</span>
                </div>
                <div className="ofs-bot">
                  <div className="mono ofs-kind">
                    {f.kind} · Working title
                  </div>
                  <h3 className="display ofs-title">
                    Untitled <em className="serif">No. {f.code}</em>
                  </h3>
                  <div className="ofs-redact" role="img" aria-label="Logline under wraps">
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 04 — Call for filmmakers                                            */
/* ------------------------------------------------------------------ */
export function CallForFilmmakers() {
  return (
    <section className="oc section">
      <div className="oc-glow" aria-hidden />
      <div className="oc-lines" aria-hidden />
      <div className="wrap relative">
        <Reveal className="mb-12 flex items-center gap-4 md:mb-16">
          <MonoLabel index="04" color="var(--emerald)">
            Call for filmmakers
          </MonoLabel>
          <div className="hairline flex-1" />
          <span className="oc-open mono">
            <i /> Open
          </span>
        </Reveal>
        <SplitReveal as="h2" className="display oc-title" type="chars" stagger={0.022}>
          Got a film <br />
          in <em className="serif oc-em">you?</em>
        </SplitReveal>
        <div className="oc-grid">
          <Reveal className="oc-col" childSelector="li" stagger={0.08}>
            <div className="mono oc-h">Who it’s for</div>
            <ul>
              <li>Directors, writers, cinematographers and editors early in their careers.</li>
              <li>People with a short they can’t stop thinking about.</li>
              <li>Anyone who wants to learn on real sets, with a real crew.</li>
            </ul>
          </Reveal>
          <Reveal className="oc-col" childSelector="li" stagger={0.08} delay={0.1}>
            <div className="mono oc-h">What you get</div>
            <ul>
              <li>Your film, produced and released.</li>
              <li>A portfolio piece with your name on it.</li>
              <li>Paid work on NMYT commercial productions.</li>
            </ul>
          </Reveal>
          <Reveal className="oc-cta" delay={0.2}>
            <p className="lede">Tell us about you and the film. A few lines is enough to start.</p>
            <MagneticButton to="/contact?type=filmmaker" variant="acid">
              Pitch your film
            </MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function ReelMarquee() {
  const items = ['Pitch', 'Make', 'Release', 'Work with us']
  return (
    <div className="omq" aria-hidden>
      <Marquee speed={46}>
        {items.map((t) => (
          <span key={t} className="omq-item">
            <span className="display omq-word">{t}</span>
            <span className="omq-frame" />
          </span>
        ))}
      </Marquee>
    </div>
  )
}
