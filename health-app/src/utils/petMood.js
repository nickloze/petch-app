// Maps engagement events to a pet GIF state + a framer-motion variant.
import idle          from '../assets/animation/character-idle.gif'
import idleClicked   from '../assets/animation/character-idle-clicked.gif'
import idleAnswer    from '../assets/animation/character-idle-answer.gif'
import answerCorrect from '../assets/animation/character-answer-correct.gif'
import answerWrong   from '../assets/animation/character-answer-wrong.gif'

export const GIFS = {
  idle, idleClicked, idleAnswer, answerCorrect, answerWrong,
}

// framer-motion variant names per event type
export const REACTION_VARIANTS = {
  idle:    { y: [0, -2, 0],                 transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  send:    { y: [0, -6, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.45, ease: 'easeOut' } },
  correct: { scale: [1, 1.12, 1], y: [0, -10, 0],  transition: { duration: 0.55, ease: 'easeOut' } },
  wrong:   { rotate: [0, -6, 6, -3, 0],    transition: { duration: 0.55, ease: 'easeOut' } },
  commit:  { scale: [1, 1.18, 1], y: [0, -14, 0],  transition: { duration: 0.8, ease: 'easeOut' } },
  click:   { scale: [1, 0.92, 1],          transition: { duration: 0.2, ease: 'easeOut' } },
}

export function gifForEvent(event) {
  switch (event) {
    case 'correct': return GIFS.answerCorrect
    case 'wrong':   return GIFS.answerWrong
    case 'commit':  return GIFS.answerCorrect
    case 'click':   return GIFS.idleClicked
    case 'send':    return GIFS.idleAnswer
    default:        return GIFS.idle
  }
}
