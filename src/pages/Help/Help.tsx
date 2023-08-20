import React, { useState, useEffect } from 'react'
import Layout from 'src/hoc/Layout'
import { useHistory, useParams, NavLink, useLocation } from 'react-router-dom'
import axios from 'axios'
import './Help.scss'


type HelpContent = {
  page: string
  title: string
  loading: boolean
  navigation: any[]
  stuff: any[]
}

type HelpRoot = {
  slug: string
  title: string
}

const helpApiUrl = 'https://hlp.wingform.com/index.php/wp-json/wp/v2/posts?' //terms-of-aircraft-sales-transactions

//categories=2&_fields=title,slug


const Help: React.FC = React.memo(props => {
  const { page, section } = useParams<{ page: string, section: string }>()
  const location = useLocation()
  const [isHelp, setIsHelp] = useState<boolean>(!!location.pathname.match(/^\/help.*/))
  const rootCategory = isHelp ? 2 : 9
  const rootPath = isHelp ? 'help' : 'info'
  const [content, setContent] = useState<HelpContent>({ page, title: '', loading: true, navigation: [], stuff: [] })
  const [headings, setHeadings] = useState<HelpRoot[]>([])

  useEffect(() => {
    setIsHelp(!!location.pathname.match(/^\/help.*/))
  }, [location.pathname])

  useEffect(() => {
    const url = page ? `${helpApiUrl}slug=${page}` : `${helpApiUrl}${page}`

    const load = async () => {
      setContent({ page, loading: true, title: content.title, navigation: content.navigation, stuff: content.stuff })

      const loaded = await axios.get(url)
      if (loaded?.data?.[0]?.content?.rendered) {
        const html = loaded.data[0].content.rendered;

        const title = loaded.data[0].title.rendered

        const navigation = []
        const content = []
        let contentBox = { content: [] }
        const paragraphs = html.match(/<(h2|h3|p|ol|ul|figure)[^>]*>.*?<\/(h2|h3|p|ol|ul|figure)>/gs)
        console.log('PARAGRAPHS===', html, paragraphs)
        if (paragraphs) {
          let index = 0
          paragraphs.forEach(p => {
            const tag = p.replace(/^<(h2|h3|p|ol|ul|figure)[^>]*>.*$/gs, '$1')
            const markup = p.replace(/^<(h2|h3|p|ol|ul|figure)[^>]*>(.*)<[^>]*>$/gs, '$2').trim()
            console.log('PARAGRAPH', tag, markup)
            switch (tag) {
              case 'h2':
                index++
                //h2++
                if (contentBox.content.length && navigation.length) {
                  content.push(contentBox)
                  contentBox = { content: [] }
                }
                navigation.push({ markup, level: 2, index /*h2: h2*/ })
                contentBox.content.push(`<h2 id="${index}">${markup}</h2>`)
                break;
              case 'h3':
                index++
                //h3++
                if (contentBox.content.length && navigation.length) {
                  content.push(contentBox)
                  contentBox = { content: [] }
                }
                navigation.push({ markup, level: 3, index /*h2: h2, h3: h3*/ })
                contentBox.content.push(`<h3 id="${index}">${markup}</h3>`)
                break;
              default:
                contentBox.content.push(`<${tag}>${markup}</${tag}>`)
            }
          })
          content.push(contentBox)
        } else {
          content.push({
            content: [html]
          })

        }


        setContent({ page, title, loading: false, navigation, stuff: content })
      }
    }

    const loadHeading = async () => {
      const loaded = await axios.get(`${helpApiUrl}categories=${rootCategory}&_fields=title,slug`)
      if (loaded?.data) {
        const newHeadings: HelpRoot[] = []
        loaded.data.forEach(h => {
          newHeadings.push({
            slug: h.slug,
            title: h?.title?.rendered
          })
        })
        setHeadings(newHeadings)
      }
    }

    if (page) {
      load()
    } else {
      loadHeading()
    }
  }, [page, isHelp])

  const activeSection = section && !isNaN(Number(section)) ? (Number(section) - 1) : 0

  const getPrevLink = () => {
    let prev = activeSection
    while (prev > 0) {
      if (content?.stuff?.[prev - 1]?.content?.length > 1) {
        return (
          <NavLink
            className="btn btn-secondary btn-a"
            to={`/${rootPath}/${page}/${prev}`}
          > Previous
          </NavLink>
        )
      }
      prev--
    }
    return null
  }

  const getNextLink = () => {
    let next = activeSection + 1
    while (next + 1 < content?.stuff?.length) {
      if (content?.stuff?.[next]?.content?.length > 1) {
        return (
          <NavLink
            className="btn btn-secondary btn-a"
            to={`/${rootPath}/${page}/${next + 1}`}
          > Next
          </NavLink>
        )
      } else {
        next++
      }
    }
    return null
  }

  console.log('pathname', window.location.pathname)

  return (
    <Layout>
      <div className="help-container">
        {
          page
            ?
            <>
              <div className="help-back">
                {
                  window.location.pathname !== "/help/wf-videos" &&
                  <NavLink className="btn btn-blue btn-a" to={`/${rootPath}`}>Back</NavLink>
                }
              </div>
              <h1 className="help-title">{content.title}</h1>

              <div className="help">
                <div className="help__navigation">
                  {
                    !content.loading &&
                    content.navigation.map((n, i) => {
                      if (content?.stuff?.[n.index - 1]?.content?.length == 1) {
                        return <div
                          className={`n-${n.level}`}
                          key={`${page}${i}`}
                          dangerouslySetInnerHTML={{ __html: n.markup.replace(/<[^>]*>/g, '') }}
                        />
                      } else {
                        return <NavLink
                          to={`/${rootPath}/${page}/${n.index}`}
                          key={`${page}${i}`}
                          className={`n-${n.level}`}
                          dangerouslySetInnerHTML={{ __html: n.markup.replace(/<[^>]*>/g, '') }}
                        />
                      }

                    }
                    )
                  }
                </div>
                <div className="help__content">
                  {content?.stuff?.[activeSection]?.content?.length &&
                    <div className="section"
                      dangerouslySetInnerHTML={{ __html: content.stuff[activeSection].content.join(' ') }}>
                    </div>
                  }
                  <div className="help-footer">
                    <div className="help-footer__link">
                      {getPrevLink()}
                    </div>
                    <div className="help-footer__link">
                      {getNextLink()}
                    </div>
                  </div>
                </div>
              </div>
            </>
            :
            <>
              <h1 className="help-title">{isHelp ? 'Help' : 'Information'}</h1>
              <div className="help-heading">
                {
                  headings.map(h =>
                    <NavLink key={h.slug} to={`/${rootPath}/${h.slug}`}>{h.title}</NavLink>
                  )
                }
              </div>
            </>
        }
      </div>
    </Layout>
  )
})

export default Help