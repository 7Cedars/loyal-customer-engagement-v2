import React, { ReactElement } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import useEmblaCarousel from 'embla-carousel-react'
import '../../embla.css'
import { Button } from './Button'

type PropType = {
  slides: React.JSX.Element[]
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section className="embla grow flex flex-col m-4">
      <div className="embla__viewport grow" ref={emblaRef}>
        <div className="embla__container">
          
          {slides.map((slide, i) => (
            <div className="embla__slide" key={i}>
              <div className='w-full h-full grid grid-cols-1 content-between'>
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className=" grid grid-cols-1 justify-items-center">
        {/* <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div> */}

        <div className="embla__dots grid grid-cols-1 justify-items-center">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
        <div className="w-full flex flex-row p-2"> 
          <div className='w-full grid grid-cols-2 gap-2'> 
            <Button onClick = {onPrevButtonClick} >
              Previous
            </Button>
            <Button onClick = {onNextButtonClick} >
              Next
            </Button>
          </div> 
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel

// taken from: https://codesandbox.io/s/wx5ypx?file=/src/js/index.tsx:273-298
