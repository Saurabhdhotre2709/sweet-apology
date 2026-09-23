import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Heart, Music2, Pause, RotateCcw } from 'lucide-react'
import { story } from './story.js'
import './sound.css'

const transitions = { duration: 0.32, ease: [0.22, 1, 0.36, 1] }

function App() {
  const [screen, setScreen] = useState('intro')
  const [noCount, setNoCount] = useState(0)
  const [apologyIndex, setApologyIndex] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const audioRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const response = story.noResponses[Math.min(noCount, story.noResponses.length - 1)]
  const moment = story.apology[apologyIndex]
  const advance = () => apologyIndex < story.apology.length - 1 ? setApologyIndex(apologyIndex + 1) : setScreen('final')
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => {
      setMusicOn(true)
      setAutoplayBlocked(false)
    }).catch(() => {
      setMusicOn(false)
      setAutoplayBlocked(true)
    })
  }, [])

  const startMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => {
        setMusicOn(true)
        setAutoplayBlocked(false)
      }).catch(() => {
        setMusicOn(false)
        setAutoplayBlocked(true)
      })
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) startMusic()
    else {
      audio.pause()
      setMusicOn(false)
    }
  }

  const view = (key, children) => <motion.section key={key} className="story-card" initial={reduceMotion ? false : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: .99 }} transition={transitions}>{children}</motion.section>
  const mark = (face, extra = false) => <motion.div key={`${face}-${noCount}-${apologyIndex}`} className={`mark ${extra ? 'mark-small' : ''}`} initial={reduceMotion ? false : { scale: .75, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={transitions} aria-hidden="true">{face}</motion.div>
  const primary = (label, action) => <button className="button button-primary" onClick={action}>{label}<span aria-hidden="true">↗</span></button>

  return <main className="page-shell">
    <audio ref={audioRef} src={`${import.meta.env.BASE_URL}sanson-ki-mala-instrumental.mp3`} loop preload="none" onPause={() => setMusicOn(false)} onPlay={() => setMusicOn(true)} />
    <div className="topline"><span className="brand-dot"><Heart size={12} fill="currentColor" /></span><span>a little note for {story.name}</span><button className={`sound-toggle ${musicOn ? 'is-playing' : ''}`} aria-label={musicOn ? 'Pause background music' : 'Play background music'} aria-pressed={musicOn} onClick={toggleMusic}>{musicOn ? <Pause size={13} fill="currentColor" /> : <Music2 size={14} />}<span>{musicOn ? 'Music on' : autoplayBlocked ? 'Tap for music' : 'Music off'}</span></button><button className="restart" aria-label="Start over" onClick={() => { setScreen('intro'); setNoCount(0); setApologyIndex(0); setAccepted(false) }}><RotateCcw size={15} /></button></div>
    <div className="stage-wrap"><AnimatePresence mode="wait">
      {screen === 'intro' && view('intro', <>
        <div className="stamp">MADE WITH CARE <span>✳</span></div>{mark('🌷')}
        <p className="eyebrow">{story.intro.eyebrow}</p><h1>{story.intro.title}</h1><p className="body-copy preserve">{story.intro.subtitle}</p>
        {primary(<>{story.intro.button}<Heart size={15} fill="currentColor" /></>, () => { startMusic(); setScreen('question') })}
        <p className="tiny-note">no rush, okay?</p>
      </>)}
      {screen === 'question' && view('question', <>
        {mark(noCount ? response.face : '💭')}<p className="eyebrow">{noCount ? `A fair answer · ${noCount + 1}` : story.question.eyebrow}</p>
        <h1 key={`q-${noCount}`} className="question-title">{noCount ? response.message : story.question.title}</h1>
        <p className="body-copy">{noCount ? response.note : story.question.subtitle}</p>
        <div className="button-stack"><button className="button button-primary yes-button" style={{ '--yes-scale': 1 + Math.min(noCount, 5) * .025 }} onClick={() => { setScreen('apology'); setApologyIndex(0) }}>{story.question.yes}<span>♡</span></button><button className="button button-quiet" onClick={() => setNoCount(noCount + 1)}>{story.question.no}</button></div>
        <p className="tiny-note">{noCount >= 4 ? 'No pressure. It’s your choice.' : 'You can change your mind anytime.'}</p>
      </>)}
      {screen === 'apology' && view(`apology-${apologyIndex}`, <>
        {mark(moment.face)}<p className="eyebrow">A little more honestly · {apologyIndex + 1} of {story.apology.length}</p><h1>{moment.title}</h1><p className="body-copy">{moment.body}</p>
        <div className="progress-dots" aria-label={`Part ${apologyIndex + 1} of ${story.apology.length}`}>{story.apology.map((_, i) => <span key={i} className={i <= apologyIndex ? 'active' : ''} />)}</div>
        {primary(apologyIndex === story.apology.length - 1 ? 'Read one last note' : 'Next', advance)}
      </>)}
      {screen === 'final' && view('final', <>
        {mark(accepted ? '💐' : '🧡')}<p className="eyebrow">{story.final.eyebrow}</p><h1>{accepted ? story.final.thanks : story.final.title}</h1><p className="body-copy">{accepted ? 'That means a lot. I’ll do my best to make it up to you.' : story.final.subtitle}</p>
        {!accepted ? primary(<>{story.final.button}<Heart size={15} fill="currentColor" /></>, () => setAccepted(true)) : <div className="soft-sparkle" aria-hidden="true">✳　♡　✳</div>}
      </>)}
    </AnimatePresence></div>
    <footer className="footer"><span>made for one person, with a little courage</span><span>♡</span></footer>
    {accepted && <div className="confetti" aria-hidden="true">{['♡','✳','·','♡','✧','·','♡','✳','♡','·','✧','♡'].map((x,i)=><i key={i} style={{'--i':i}}>{x}</i>)}</div>}
  </main>
}

export default App
