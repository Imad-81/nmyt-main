import { useLocation } from 'react-router-dom'
import { Reveal, SplitReveal } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'

const CSS = `
.nf{position:relative;min-height:100svh;display:flex;align-items:center;overflow:hidden;padding-block:calc(var(--nav-h) + 32px) 64px;
  background:radial-gradient(60% 50% at 50% 55%,rgba(22,56,255,.22),transparent 70%),var(--void)}
.nf::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px)}
.nf-scan{position:absolute;left:0;right:0;height:22vh;top:-22vh;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(22,180,255,.08) 70%,rgba(207,239,255,.18) 98%,transparent);
  animation:nf-scan 5.5s linear infinite}
@keyframes nf-scan{to{transform:translateY(calc(100svh + 22vh))}}
.nf-inner{position:relative;z-index:3;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center}
.nf-bars{display:flex;width:min(420px,78vw);height:6px;margin-bottom:28px;border-radius:2px;overflow:hidden}
.nf-bars i{flex:1}
.nf-kicker{color:var(--fg-3);display:flex;gap:10px;align-items:center}
.nf-kicker b{font-weight:450;color:#ff5a5a}
.nf-code{position:relative;margin:.08em 0 0;font-size:clamp(150px,34vw,560px);line-height:.8;color:var(--fg);
  animation:nf-jit 3.2s steps(1) infinite}
.nf-code::before,.nf-code::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen}
.nf-code::before{color:var(--royal);animation:nf-g1 2.6s steps(1) infinite}
.nf-code::after{color:var(--acid);animation:nf-g2 3.1s steps(1) infinite}
@keyframes nf-g1{
  0%,100%{clip-path:inset(0 0 100% 0);transform:none}
  8%{clip-path:inset(12% 0 64% 0);transform:translate(-.04em,0)}
  10%{clip-path:inset(58% 0 22% 0);transform:translate(.05em,0)}
  12%{clip-path:inset(0 0 100% 0)}
  54%{clip-path:inset(34% 0 44% 0);transform:translate(-.06em,0)}
  56%{clip-path:inset(0 0 100% 0)}}
@keyframes nf-g2{
  0%,100%{clip-path:inset(0 0 100% 0);transform:none}
  9%{clip-path:inset(70% 0 8% 0);transform:translate(.05em,0)}
  11%{clip-path:inset(22% 0 60% 0);transform:translate(-.03em,0)}
  13%{clip-path:inset(0 0 100% 0)}
  76%{clip-path:inset(46% 0 38% 0);transform:translate(.07em,0)}
  78%{clip-path:inset(0 0 100% 0)}}
@keyframes nf-jit{0%,100%{transform:none;opacity:1}9%{transform:translate(.012em,0) skewX(-4deg)}10%{transform:none;opacity:.85}11%{opacity:1}55%{transform:translate(-.01em,0)}56%{transform:none}}
.nf-title{margin:.5em 0 0;font-size:clamp(40px,6vw,104px)}
.nf-title em{color:var(--ice)}
.nf-p{margin:22px 0 34px;color:var(--fg-2);max-width:42ch}
.nf-p code{font-family:var(--font-mono);font-size:.85em;color:var(--fg);padding:2px 8px;border-radius:6px;background:rgba(255,255,255,.06);word-break:break-all}
@media (prefers-reduced-motion: reduce){.nf-scan,.nf-code,.nf-code::before,.nf-code::after{animation:none}}
`

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <section className="nf">
      <style>{CSS}</style>
      <div className="nf-scan" aria-hidden />
      <div className="wrap nf-inner">
        <Reveal trigger="intro" childSelector=".nf-f" stagger={0.1} className="flex flex-col items-center">
          <div className="nf-bars nf-f" aria-hidden>
            {['#f4f6fb', '#cfefff', '#16b4ff', '#00e08a', '#7cff3a', '#1638ff', '#0a1a8c', '#04123f'].map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </div>
          <div className="mono nf-kicker nf-f">
            <b>● ERR 404</b> <span>//</span> No carrier
          </div>
        </Reveal>
        <h1 className="display nf-code" data-text="404" aria-label="Error 404">
          404
        </h1>
        <SplitReveal as="p" className="display nf-title" type="chars" trigger="intro" delay={0.3} stagger={0.03}>
          Lost the <em className="serif">signal.</em>
        </SplitReveal>
        <Reveal trigger="intro" delay={0.6} className="flex flex-col items-center">
          <p className="nf-p">
            Nothing is broadcasting at <code>{pathname}</code>. It may have moved, or never existed.
          </p>
          <MagneticButton to="/">Back to home</MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
