import Footer from '@/components/Footer'
import './work/work.css'

/** /work. Nothing to publish yet: the words, and a slow gyroscope turning behind them. */
export default function Work() {
  return (
    <>
      <section className="wip">
        <div className="wip-gyro" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>
        <h1 className="wip-title">Work in progress</h1>
      </section>
      <Footer />
    </>
  )
}
