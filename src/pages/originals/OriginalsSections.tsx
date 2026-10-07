import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/smooth'
import { Reveal, SplitReveal } from '@/components/Reveal'
import { MonoLabel, Marquee } from '@/components/ui'
import { Steps } from '@/components/Simple'
import { MagneticButton } from '@/components/MagneticButton'
import Img from '@/components/Img'
import { media } from '@/data/media'

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
        </Reveal>
        <p className="display om-text">
          We make our own <em className="serif om-em om-em--a">films.</em> And we make room for <em className="serif om-em om-em--b">new filmmakers.</em>
        </p>
        <div className="om-split">
          <figure className="om-fig">
            <Img src={media('originalsClapper', 'sm')} alt="Hands hold a clapperboard in front of a cinema camera on a blue-lit set" className="om-fig-img" parallax={6} position="50% 50%" />
            <figcaption className="mono">
              <span>Slate 01</span>
              <span>In development</span>
            </figcaption>
          </figure>
        <Reveal className="om-cols" childSelector=".om-col" stagger={0.12}>
          <p className="om-col">
            Originals is NMYT’s in-house slate of short films. It keeps the studio’s eye sharp between commercial jobs, the same crews, the same kit, no brief but the story.
          </p>
          <p className="om-col">
            Every film puts new directors, writers, cinematographers and editors on a real set. The ones who fit stay on, on paid commercial productions, growing with the studio.
          </p>
        </Reveal>
        </div>
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
    body: 'We back the production, crew, kit, locations and post, with NMYT producers beside you. Your film, your call.',
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
    body: 'Paid work on our commercial productions, brand films, ads and content. A portfolio that grows as the studio does.',
    tags: ['Paid', 'Commercial sets', 'Portfolio'],
    c: 'var(--acid)',
  },
]

export function Program() {
  return (
    <Steps
      eyebrow="The program"
      title="From pitch to paid."
      lede="Four steps for filmmakers early in their careers, from a first idea to a finished film and a place on our sets."
      items={STEPS.map(({ title, body, tags }) => ({ title, body, tags }))}
      accent="var(--ivory)"
    >
      <div className="mt-12">
        <MagneticButton to="/contact?type=filmmaker" variant="ghost">
          Pitch your film
        </MagneticButton>
      </div>
    </Steps>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — The slate: films in development                                */
/* ------------------------------------------------------------------ */
export function FilmSlate() {
  return (
    <section className="ofs section">
      <div className="wrap ofs-soon">
        <Reveal className="eyebrow ofs-eyebrow">In development</Reveal>
        <Reveal y={24}>
          <p className="ofs-line">
            <span className="ofs-steam" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            Cooking some content, <span className="ofs-line-b">shall be served soon.</span>
          </p>
        </Reveal>
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
            <MagneticButton to="/contact?type=filmmaker" variant="light">
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
