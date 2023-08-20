import { useEffect, useState } from 'react'

const ScrollToErrors = ({ errors, isSubmitting }) => {
    const [wasSubmitting, setWasSubmitting] = useState<boolean>(false)

    useEffect(() => {
        if (isSubmitting) {
            setWasSubmitting(true)
        }

        if (!isSubmitting && wasSubmitting) {
            scrollToError()
            setWasSubmitting(false)
        }
    }, [isSubmitting])

    const scrollToError = () => {
        const errorArray = Object.keys(errors)
        let positions: number[] = []

        errorArray.map((el) => {
            let selector = document.querySelector(`[data-name="${el}"]`)
            if (selector && selector.getBoundingClientRect().top !== 0) {
                positions.push(
                    selector.getBoundingClientRect().top + window.scrollY,
                )
            }
        })

        const scrollPosition = positions.length
            ? positions.sort((a, b) => (a > b ? 1 : -1))[0]
            : null

        if (scrollPosition) {
            const headerHeight = document
                .querySelector('.header')
                .getBoundingClientRect().height
            const offset = scrollPosition - headerHeight - 10

            window.scrollTo({
                top: offset,
                behavior: 'smooth',
            })
        }
    }

    return null
}

export default ScrollToErrors
