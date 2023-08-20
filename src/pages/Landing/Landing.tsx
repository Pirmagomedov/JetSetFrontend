import React from 'react'
import Layout from 'src/hoc/Layout'
import Button from 'src/components/Button/Button'
import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from 'src/components/Icon/Icon'
import { Form, Formik } from 'formik'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import FormikField from 'src/components/FormikField/FormikField'
import FormikSelect from 'src/components/FormikSelect/FormikSelect'
import { useLandingForm } from 'src/generated/graphql'
import * as Yup from 'yup';
import ReactGA from 'react-ga4';
ReactGA.initialize('G-ZTLRWQKV1B');
import './Landing.scss'
import CookiesNotification from 'src/components/CookiesNotification/CookiesNotification'


interface IPoint {
  x: number
  y: number
}

const getAbsolutePosition = (node: any) => {
  var p: IPoint = { x: 0, y: 0 };
  if (node) {
    p.x = node.offsetLeft;
    p.y = node.offsetTop;
    while (node.offsetParent) {
      p.x = p.x + node.offsetParent.offsetLeft;
      p.y = p.y + node.offsetParent.offsetTop;
      if (node == document.getElementsByTagName("body")[0]) {
        break;
      }
      else {
        node = node.offsetParent;
      }
    }
  }

  return p;
}

const WaitlistSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(1, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  lastName: Yup.string()
    .min(1, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),

});

const WaitlistForm: React.FC = () => {
  const formikRef = useRef(null)
  const { choices } = useSelector((state: RootState) => state.choices)

  const [, sendForm] = useLandingForm()
  const [formSent, setFormSent] = useState<boolean>(false)

  const handleSubmit = () => {
    formikRef.current.handleSubmit()
  }

  const formSubmit = (values) => {
    sendForm({
      landingRequestInput: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        form: 'landingWaitlist',
        extra: JSON.stringify(values)
      }
    }).then(res => {
      setFormSent(true)
    })
  }

  return (
    <Formik
      validationSchema={WaitlistSchema}
      innerRef={formikRef}
      initialValues={{ firstName: "", lastName: "", email: "" }}
      onSubmit={formSubmit}
      enableReinitialize={true}
    >
      {({ errors, values }) =>
        <Form className='waitlist-form' id="waitlist-form">
          <FormikField required value={values?.firstName} name="firstName" label="First name" disabled={formSent} />
          <FormikField required value={values?.lastName} name="lastName" label="Last name" disabled={formSent} />
          <FormikSelect
            disabled={formSent}
            className="select"
            options={[
              { label: 'Aircraft owner', value: 'Aircraft owner' },
              { label: 'Buyer', value: 'Buyer' },
              { label: 'Broker', value: 'Broker' },
              { label: 'Industry specialist', value: 'Industry specialist' },
              { label: 'Other', value: 'Other' }
            ]}
            name="position"
            label="Who are you?"
          />
          <FormikSelect
            required
            disabled={formSent}
            className="select"
            options={choices?.countries}
            name="country"
            label="Country of residence"
          />

          <FormikField required value={values?.email} name="email" label="Email" disabled={formSent} />
          <FormikField value={values?.company} name="company" label="Company" disabled={formSent} />
          <br />
          <div>
            <span>By selecting ‘Join waitlist,’ you acknowledge and consent to the processing of your personal data in conformity with our <a href='https://wingform.com/assets/docs/Privacy_Policy_Wingform.pdf' target='_blank'>Privacy Policy</a>.'</span>
          </div>
          <br />
          {
            formSent ?
              <div className="waitlist-form__message">You successfully registered to join the waitlist</div>
              :
              <Button type="transparent" onClick={handleSubmit}>
                Join waitlist
                <span className="icon-cirlce">
                  <Icon name="i-play" />
                </span>
              </Button>
          }

        </Form>
      }
    </Formik>

  )
}



interface ICollapsible {
  title: string
  default?: boolean
  children: React.ReactNode
}

const Collapsible: React.FC<ICollapsible> = (props) => {
  const def = props.default || false;
  // const { title, children, default = true} = props;
  const [collapsed, setCollapsed] = useState<boolean>(def)

  return (
    <div className='collapsible'>
      <div className="collapsible__title" onClick={() => {
        setCollapsed(!collapsed)
      }}
      >
        <span>{props.title}</span>
        <Icon name="i-landing-triangle" className={`plus-is__${collapsed ? 'non-rotated' : 'rotated'}`} />
      </div>
      <div className={`collapsible__content collapsible__content__${collapsed ? 'open' : 'closed'}`}>
        {props.children}
      </div>
    </div>
  )
}


interface ISlideTitle {
  children: string
  animated?: boolean
  fadable?: boolean
  currentSlide?: number
}

const SlideTitle: React.FC<ISlideTitle> = (props) => {
  const travelTime = 50
  const travelDelay = 500
  const tarvelOutScreenDelta = 200
  const { children, animated = true, currentSlide, fadable } = props
  const titleRef = useRef()
  const charRef = useRef([])
  const pepelazRef = useRef<HTMLDivElement>()
  const length = children.length

  const loaders = useSelector((state: RootState) => state.loader)

  const [offsetHeader, setOffsetHeader] = useState<IPoint>()
  const [flyPath, setFlyPath] = useState<IPoint>()
  const [offsetX, setOffsetX] = useState<number>(-1000)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  const animationRef = useRef<any>({
    from: 0,
    to: 0,
    current: 0,
    //time: 0,
    start: 0,
    callback: null,
  })

  const animate = time => {
    //if (animationRef.current.time != null) {
    if (animationRef.current.start == 0) {
      animationRef.current.start = time
    } else {
      const deltaTime = time - animationRef.current.start
      //console.log('deltaTime', deltaTime)
      if (deltaTime > travelDelay) {
        const newPosition = animationRef.current.from + (windowWidth + 50/*animationRef.current.to*/ - animationRef.current.from) * (deltaTime - travelDelay) / (travelTime * windowWidth / 30)

        let cnt = 0
        charRef.current.forEach((span, i) => {
          if (+span.offsetLeft < +newPosition) {
            charRef.current[i].className = "passed"
            //cnt++
            if (i == length - 1 && pepelazRef?.current?.className && fadable) {
              pepelazRef.current.className = "fademe pplz"
            }
          }
        })
        //console.log('PassedChars', cnt)
        //console.log('animation', deltaTime, animationRef.current, newPosition)
        animationRef.current.current = newPosition
        setOffsetX(a => newPosition)
      }
    }
    //}
    if (animationRef.current.current < windowWidth + 50 /*animationRef.current.to*/) {
      animationRef.current.callback = requestAnimationFrame(animate)
    } else {
      animationRef.current.current = windowWidth + 50 //animationRef.current.to
    }
  }

  useEffect(() => {
    if (offsetHeader && flyPath && loaders.profileLoader == false && loaders.commonLoader == false) {
      //console.log('Animate X', -offsetHeader.x, flyPath.x)

      animationRef.current.from = -offsetHeader.x
      animationRef.current.to = flyPath.x
      animationRef.current.current = -offsetHeader.x
      pepelazRef.current.className = "pplz"

      setOffsetX(a => -offsetHeader.x)
      //animationRef.current.start = new Date()
      animationRef.current.callback = requestAnimationFrame(animate)
    }
    return () => cancelAnimationFrame(animationRef.current.callback)
  }, [flyPath, offsetHeader, loaders])



  useEffect(() => {
    if (charRef.current.length == length) {
      const firstChar = charRef.current[0]
      const lastChar = charRef.current[length - 1]
      if (firstChar && lastChar) {
        const firstCharOffset = getAbsolutePosition(firstChar)
        const lastCharOffset = getAbsolutePosition(lastChar)

        //console.log('lastCharOffset', lastCharOffset)

        setFlyPath({
          x: lastCharOffset.x + lastChar.clientWidth + 50 - firstCharOffset.x,
          y: lastCharOffset.y
        })
        setOffsetHeader({
          x: firstCharOffset.x + tarvelOutScreenDelta,
          y: firstCharOffset.y
        })
        charRef.current.forEach(char => char.className = '')
      }

    }

    animationRef.current = {
      from: 0,
      to: 0,
      current: 0,
      //time: 0,
      start: 0,
      callback: null
    }

  }, [currentSlide])


  useEffect(() => {

    const onResize = () => {
      setWindowWidth(w => window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /*useEffect(() => {
    if (flyPath?.x > 100) {
      //pepelazRef
    }
  }, [flyPath])*/

  return (
    <h1 className={animated ? "airplaned" : "just-title"} ref={titleRef}>
      {
        windowWidth >= 1100 ?
          children.split('').map((char, index) => <span key={index} ref={el => { if (char !== ' ') charRef.current[index] = el }}>{char}</span>)
          :
          children
      }
      <div ref={pepelazRef} style={{ left: `${offsetX}px` }} className="pplz">
        <img src="/assets/images/landing.webp" alt="Wingform plane" />
      </div>
    </h1>
  )
}


interface ISlide {
  title: string
  markup: React.ReactNode

}

interface ILandingSlider {
  slides: (callback: any, currentSlide: number) => ISlide[]
  //slides: () => ISlide[]
  onPlayVideo: () => void
}

const LandingSlider: React.FC<ILandingSlider> = (props) => {
  const { onPlayVideo } = props
  const slideScroll = 20
  const scrollDelay = 500

  const [intro, setIntro] = useState<boolean>(true)

  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [slideLock, setSlideLock] = useState<boolean>(false)
  const currentSlideRef = useRef({
    currentSlide: currentSlide,
    lock: slideLock,
    timer: null,
    wheelDelta: 0
  })

  const touchRef = useRef({
    touch: false,
    startY: null,
    lastDelta: 0
  })

  const updateCurrentSlide = (current: number, lock: boolean = true) => {
    setCurrentSlide(current)
    currentSlideRef.current.currentSlide = current
    if (currentSlideRef.current.timer) clearTimeout(currentSlideRef.current.timer)
    if (lock) {
      setSlideLock(true)
      currentSlideRef.current.lock = true
      currentSlideRef.current.timer = setTimeout(() => {
        setSlideLock(false)
        currentSlideRef.current.lock = false
      }, scrollDelay)
    }
  }



  const slideAction = (v) => {
    if (v == 'watch') {
      onPlayVideo()
      ///const video = document.querySelector('.blackwindow');
      // video.style.display = 'flex';
    }
    if (v === 'join') {
      window.location.hash = '#waitlist-form'
      updateCurrentSlide(slidesCount - 1, false)
    }
    if (v === 'start') {
      window.location.href = 'https://stg.wingform.com'
    }
  }

  const changeSlide = (e) => {
    if (e.wheelDelta) {
      if (
        (e.wheelDelta < 0 && e.wheelDelta <= currentSlideRef.current.wheelDelta) ||
        (e.wheelDelta > 0 && e.wheelDelta >= currentSlideRef.current.wheelDelta)) {
        handleSlideChange(e.wheelDelta < 0)
      }
      currentSlideRef.current.wheelDelta = e.wheelDelta
    }
    if (e.keyCode && (e.keyCode == 38 || e.keyCode == 40)) {
      handleSlideChange(e.keyCode == 40, false)
    }
  }

  const touchStart = (e) => {
    touchRef.current.touch = true
    touchRef.current.startY = e.targetTouches[0].clientY
  }

  const touchMove = (e) => {
    if (touchRef.current.touch) {
      const delta = e.targetTouches[0].clientY - touchRef.current.startY
      //console.log('delta', delta)
      if (delta > slideScroll || delta < -slideScroll && Math.abs(delta) >= Math.abs(touchRef.current.lastDelta)) {
        touchRef.current.touch = false
        handleSlideChange(!(delta > slideScroll), false)
      }
      touchRef.current.lastDelta = delta
    }
  }

  const touchEnd = (e) => {
    touchRef.current.touch = false
  }

  const handleSlideChange = (forward: boolean, lock: boolean = true) => {
    if (!currentSlideRef.current.lock) {
      //console.log('handleSlideChange', forward, new Date().getTime())
      if (forward) {
        updateCurrentSlide(Math.min(currentSlideRef.current.currentSlide + 1, slidesCount - 1), lock)
      } else {
        updateCurrentSlide(Math.max(currentSlideRef.current.currentSlide - 1, 0), lock)
      }
    }
  }

  const slides = props.slides(slideAction, currentSlide)
  const slidesCount = window?.location?.host === 'wingform.com' ? slides.length : slides.length - 1;

  useEffect(() => {
    const dlyr = setInterval(() => {
      currentSlideRef.current.wheelDelta = currentSlideRef.current.wheelDelta - 2
      touchRef.current.lastDelta = touchRef.current.lastDelta - 2
    }, 100)
    window.addEventListener('wheel', changeSlide)
    window.addEventListener('keydown', changeSlide)
    window.addEventListener('touchstart', touchStart)
    window.addEventListener('touchmove', touchMove)
    window.addEventListener('touchend', touchEnd)

    return () => {
      clearInterval(dlyr)
      window.removeEventListener('wheel', changeSlide)
      window.removeEventListener('keydown', changeSlide)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', touchEnd)
    }
  }, [])


  useEffect(() => {
    if (intro && currentSlide == 0) {
      setIntro(false)
    }
  }, [currentSlide])


  return (
    <>
      <div
        className="slider-container"
      >
        {slides.map((slide, index) =>
          <div
            key={index}
            className={`slider__slide slider__slide--${index} ${index == currentSlide ? "slider__slide--current" : ""}`}
          >
            {slide.markup}
          </div>
        )}
      </div>

      <div
        className="sidebar" /*ref={sideBarRef}*/
      >
        <nav className="sidebar__menu">
          <ul className="sidebar__list">
          {slides.map((slide, index) => {
              if (window?.location?.host !== 'wingform.com' && slide.title === 'Join waitlist') {
                return
              }
              return (
                <li key={index} onClick={() => updateCurrentSlide(index, false)} className={`sidebar__item sidebar__item--${index} ${index == currentSlide ? "sidebar__item--current" : ""}`}>
                  <span>{slide.title}</span>
                </li>
              )
            }
            )}
          </ul>
        </nav>
      </div>
    </>
  )
}


interface ISlideFooter {
  callback: (name: string) => void
}


const SlideFooter: React.FC<ISlideFooter> = (props) => {
  const { callback } = props
  return (
    <div className="slider-container__footer">
      {
        window?.location?.host === 'wingform.com'
          // ||
          // window?.location?.host === 'localhost:9000'
          ?
          <Button type="transparent" onClick={() => callback('join')}>
            Join waitlist
            <span className="icon-cirlce">
              <Icon name="i-arrow" />
            </span>
          </Button>
          :
          <Button type="transparent" onClick={() => callback('start')}>
            Get Started
            <span className="icon-cirlce">
              <Icon name="i-arrow" />
            </span>
          </Button>
      }

      <Button type="transparent" onClick={() => callback('watch')}>

        Watch video
        <span className="icon-cirlce">
          <Icon name="i-play" />
        </span>

      </Button>
    </div>
  )
}

interface IVideo {
  isPlaying: boolean,
  onClose: () => void
}

const Video: React.FC<IVideo> = (props) => {
  const { isPlaying, onClose } = props
  const closeButtonRef = useRef(null);

  function handleClick() {
    // alert('Button clicked');
  }

  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.addEventListener('click', handleClick);
    }

    // Clean up the event listener when the component is unmounted
    return () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.removeEventListener('click', handleClick);
      }
    };


  }, [isPlaying]);

  if (!isPlaying) return null


  return (
    <div className={`blackwindow ${isPlaying ? 'isPlaying' : 'paused'}`}>
      <div className="blackwindow__container">
        <div className="blackwindow__close" onClick={onClose} ref={closeButtonRef}>
          <Icon className="blackwindow__icon-close" name="i-close" />
        </div>
        <video src="../../assets/video/join-video.mp4" controls poster="../../assets/video/join-video-preview.png">
        </video>
      </div>
    </div>
  )
}

const Landing: React.FC = () => {
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false)
  const handlePlay = () => {
    setVideoPlaying(true)
  }

  useEffect(() => {
    window.chatbaseConfig = {
      chatbotId: "white-paper-jetset-3-0--docx-ntzdcxtlp",
    }
    const script = document.createElement('script')
    script.src = "https://www.chatbase.co/embed.min.js"
    script.id = "white-paper-jetset-3-0--docx-ntzdcxtlp"
    script.defer = true

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, [])

  return (
    <Layout landing={true} >
      <div className="container landing-grid" >
        <CookiesNotification />
        <LandingSlider
          onPlayVideo={handlePlay}
          slides={(callback, currentSlide): ISlide[] =>
            [
              {
                title: '',
                markup: (
                  <div className="greeting">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} fadable >Aircraft trading. Reinvented</SlideTitle>
                    </div>
                    <div className="slider-content">
                      <p className="landing-text">The ultimate platform for aircraft sales transactions</p>
                    </div>
                    <SlideFooter callback={callback} />
                    <div className="label-container">
                      <span className="blockchain-icon">
                        powered by
                        <span>Blockchain</span>
                      </span>
                    </div>
                  </div>
                )
              },
              {
                title: 'Features & Benefits',
                markup: (
                  <div className="grid-4clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Key features and benefits</SlideTitle>
                    </div>
                    <div className="collapsible__container">
                      <Collapsible title="Privacy" default={true}>
                        <p>Establish direct connections, exchange information, and negotiate solely with confirmed buyers and sellers, bypassing intermediaries and preventing data and contacts leaks.</p>
                      </Collapsible>
                      <Collapsible title="Transparency" default={true}>
                        <p>Ensure equitable pricing by directly discussing sale terms, while maintaining complete control over the transaction process and financial resources within a single platform.</p>
                      </Collapsible>
                      <Collapsible title="Efficiency" default={true}>
                        <p>Accelerate transactions and reduce costs by eliminating lengthy interactions with intermediaries, employing an efficient deal workflow, and using automatically generated documents that can be signed electronically.</p>
                      </Collapsible>
                      <Collapsible title="Security" default={true}>
                        <p>Engage with trustwothy participants, confirmed via KYC/KYB/AML integration. Utilize encrypted documents stored on the blockchain, and benefit from smart contracts as well as integrated payment and escrow solutions for secure fund transfers and transaction execution.</p>
                      </Collapsible>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Users',
                markup: (
                  <div className="grid-4clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Who needs us</SlideTitle>
                    </div>
                    <div className="collapsible__container">
                      <Collapsible title="Direct buyers and sellers" default={true}>
                        <p>Buyers and sellers can transact independently, ensuring data confidentiality, control over the process, and costs. Information about the seller and the asset is only shared with verified prospects, enhancing privacy and transaction security.</p>
                      </Collapsible>
                      <Collapsible title="Individual Brokers" default={true}>
                        <p>Efficiently handle client transactions with a comprehensive deal flow. Our platform eliminates third-party reliance, maximizing profit margins. Save time, focus on generating more opportunities, and close additional deals.</p>
                      </Collapsible>
                      <Collapsible title="Established dealers and brokers" default={true}>
                        <p>Use Wingform to streamline transactions, save time and costs. Manage your global sales team on one platform. Enhance your reputation with efficient, secure services, building trust and satisfaction in your business.</p>
                      </Collapsible>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Transactions',
                markup: (
                  <div className="p-plus-clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Streamlined transactions</SlideTitle>
                    </div>
                    <div className="slider-content">
                      <p className='hide-it'>By applying digital instruments, we are changing conventional approaches to initiating  and completing aircraft transactions</p>
                      <ul className="landing__list">
                        <li className="landing__item">Simplified algorithm of entering into a deal</li>
                        <li className="landing__item">Comprehensive step-by-step deal flow</li>
                        <li className="landing__item">Multiple roles of users</li>
                        <li className="landing__item">Online (re)negotiation of terms and conditions</li>
                        <li className="landing__item">All transactions in one dashboard</li>
                        <li className="landing__item">Automatically forecasted timelines</li>
                        <li className="landing__item">Recommendations on the parties’ next actions</li>
                        <li className="landing__item">Notifications on actions and timelines</li>
                        <li className="landing__item">Automatically drafted legal documents </li>
                        <li className="landing__item">Digital signatures</li>
                        <li className="landing__item">Online chats</li>
                      </ul>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Legal compliance',
                markup: (
                  <div className="p-plus-clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Legal compliance</SlideTitle>
                    </div>
                    <div className="slider-content">
                      <p>Wingform is dedicated to ensuring legal compliance in every aspect of private aircraft transactions.</p>
                      <div className="collapsible__container">
                        <Collapsible title="Compliance checks" default={true}>
                          <p>By integrating KYC/KYB/AML verification, Wingform verifies the eligibility of all participants and prevents money-laundering violations, ensuring that only trustworthy contractors engage in transactions.</p>
                          {/* <div className="right">
                            <img className="collapsible-top" src="/assets/images/svg/sumsub.svg" title="sumsub" alt="sumsub" />
                          </div> */}
                        </Collapsible>
                        <Collapsible title="Pre-drafted legal documents" default={true}>
                          <p>The platform automatically generates all necessary legal and transactional documents drafted by leading aviation lawyers.</p>

                        </Collapsible>
                        <Collapsible title="Digital signatures" default={true}>
                          <p>All documents are signed right on the platform with legally-binding eSignatures in accordance with eIDAS standards.</p>

                          {/* <div className="right">
                            <img className="collapsible-top" src="/assets/images/svg/signnow.svg" title="SignNow" alt="SignNow" />
                          </div> */}
                        </Collapsible>
                      </div>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Security',
                markup: (
                  <div className="grid-4clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Security</SlideTitle>
                    </div>
                    <div className="collapsible__container">
                      <Collapsible title="Authenticity" default={true}>
                        <p>In addition to compliance checks, the platform acquires, validates, and discloses information concerning the counterparty's credibility, authorization, and aircraft ownership rights, allowing relevant parties to confirm these details.</p>
                      </Collapsible>
                      <Collapsible title="Transactions" default={true}>
                        <p>Smart contracts applied on the platform automate deal execution and monitor the fulfillment of obligations, reducing the risk of fraud and enhancing the security of transactions.</p>
                      </Collapsible>
                      <Collapsible title="Data Protection" default={true}>
                        <p>Blockchain and cryptography technologies provide a secure and tamper-proof digital ledger for data and documents storage in distributed manner, ensuring data integrity and immutability.</p>
                      </Collapsible>
                      <Collapsible title="Assets" default={true}>
                        <p>Built-in assets management instruments and integration with reliable closing solutions providers protect your funds during transactions by securely holding and transferring assets between parties, mitigating the risk of financial loss.</p>
                        {/* <div className="right">
                            <img className="collapsible-top" src="/assets/images/svg/midchains.svg" title="MidChains" alt="MidChains" />
                          </div> */}
                      </Collapsible>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Technologies',
                markup: (
                  <div className="grid-4clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Technologies</SlideTitle>
                    </div>

                    <div className="collapsible__container">
                      <Collapsible title="Blockchain" default={true}>
                        <p>A decentralized, transparent, and tamper-proof digital ledger to ensure data privacy, immutability, and secure transactions. Each aircraft traded on the platform has its digital twin storing data and documents on the transaction</p>
                      </Collapsible>
                      <Collapsible title="Encryption" default={true}>
                        <p>All documents and data created and employed on the platform are encrypted, ensuring that access is granted solely to the parties participating in the transaction.</p>
                      </Collapsible>
                      <Collapsible title="Smart contracts" default={true}>
                        <p>Self-executing contracts with the terms and conditions of the agreement directly written into code, enabling automated monitoring and execution of deal covenants.</p>
                      </Collapsible>
                      <Collapsible title="E-signatures" default={true}>
                        <p>Used to facilitate secure and legally binding digital signing of documents, streamlining the transaction process and enhancing overall efficiency.</p>
                      </Collapsible>
                    </div>
                    <SlideFooter callback={callback} />
                  </div>
                )
              },
              {
                title: 'Join waitlist',
                markup: (
                  <div className="p-plus-clm">
                    <div className="slider-heading">
                      <SlideTitle currentSlide={currentSlide} >Join waitlist</SlideTitle>
                    </div>
                    <div className="slider-content">
                      <p className="bg-lines">Register here to be among the first to get access to the platform</p>
                      <div className="collapsible__container">
                        <WaitlistForm />
                      </div>
                    </div>
                  </div>
                )
              },
            ]} />
        <Video isPlaying={videoPlaying} onClose={() => { setVideoPlaying(false) }} />
      </div>
    </Layout >
  )
}


export default Landing;