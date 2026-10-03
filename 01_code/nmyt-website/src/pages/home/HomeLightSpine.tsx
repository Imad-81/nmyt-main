import { useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { HOME_SPINE_FRAG } from '@/gl/homeSpineShader'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { whenRevealed } from '@/components/Reveal'

export default function HomeLightSpine() {
  const root = useRef<HTMLDivElement>(null)
  const state = useRef({ intro: 0, heroScroll: 0, pageScroll: 0 })

  const uniforms = useMemo(
    () => ({
      uIntro: { value: 0 },
      uHeroScroll: { value: 0 },
      uPageScroll: { value: 0 },
    }),
    [],
  )

  // Intro reveal: Light writes in after the initial loader is dismissed
  useEffect(() => {
    const reduce = prefersReducedMotion()
    return whenRevealed(() => {
      gsap.to(state.current, {
        intro: 1,
        duration: reduce ? 2.2 : 3.2,
        ease: 'power2.inOut',
        delay: 0.1,
      })
    })
  }, [])

  // Sync scroll triggers
  useGSAP(
    () => {
      // 1. Hero scrub (0 to 1 across hero section)
      gsap.to(state.current, {
        heroScroll: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hh',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // 2. Global full-page scrub (0 to 1 from top of Home to bottom of Footer)
      gsap.to(state.current, {
        pageScroll: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.home-page',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    },
    { scope: root },
  )

  const onFrame = (f: ShaderFrame) => {
    const u = f.uniforms
    u.uIntro.value = state.current.intro
    u.uHeroScroll.value = state.current.heroScroll
    u.uPageScroll.value = state.current.pageScroll
  }

  return (
    <div
      ref={root}
      className="home-light-spine"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <ShaderCanvas
        fragment={HOME_SPINE_FRAG}
        uniforms={uniforms as unknown as Record<string, THREE.IUniform>}
        onFrame={onFrame}
        dpr={1.5}
        follow={0.04}
      />
    </div>
  )
}
