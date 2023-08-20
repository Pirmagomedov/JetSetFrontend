import React, { useEffect, useState } from 'react'
import Layout from 'src/hoc/Layout'
import { useParams } from 'react-router-dom'
import { useQuery } from 'urql'

const getRawDocumentQuery = `query getRawDocument($docType: String) {
  getRawDocument(docType: $docType) {
    runtimeError {
      exception
      message
      __typename
    }
    text 
    __typename
  }
}`

const DocTemplatePage: React.FC = props => {
  const { docType } = useParams<{ docType: string }>()
  const [ docText, reloadDocText ] = useQuery({query: getRawDocumentQuery, variables: {'docType': docType}})
  const [text, setText] = useState<string>('')

  useEffect(() => {
    //console.log('docText', docText?.data?.getRawDocument?.text)
    if (docText?.data?.getRawDocument?.text) {
      let textValue = docText?.data?.getRawDocument?.text
      textValue = textValue.replace(/\{[^\}]*\}/g,'')
      setText(textValue)
    }
  }, [docText])

  return (

    <Layout>
      <div className="deal-process container">
        <div className="text" dangerouslySetInnerHTML={{__html: text}} />
      </div>
    </Layout>
  )
}

export default DocTemplatePage
