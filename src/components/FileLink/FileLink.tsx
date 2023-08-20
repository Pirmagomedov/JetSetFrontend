import React from 'react'
import Button from 'src/components/Button/Button'
import PrivateLink from 'src/components/PrivateLink/PrivateLink'
import { 
  DealFile, 
  FileType 
} from 'src/generated/graphql'


const mimeTypes = ['.jpg', '.jpeg', '.png', '.gif']

const checkMimeType = (link: string): boolean => {
  //return mimeTypes.includes(link.match(/\.[0-9a-z]{1,4}$/i)?.[0])
  return false
}


interface IFileLink {
  filename?: string
  file?: DealFile | FileType 
  long?: boolean
  onView?: (file: any) => void
}


const FileLink: React.FC<IFileLink> = React.memo(props => {
  const {filename, long = false, file, onView} = props
  let filenameView = filename ? filename : file?.filename
  if (!long && filenameView.length > 30 ) {
    filenameView = filenameView.substring(0, 8) + '...' + filenameView.substring(filenameView.length - 16)
  }
  const usedKey = 'keySigned' in file ? file.keySigned ? file.keySigned : file.key : file.key
  
  if (!(usedKey && file?.bucket)) return null

  return (
    <div className="file-link">
      <PrivateLink icon fileKey={usedKey} fileBucket={file.bucket} fileName={file.filename}>{filenameView}</PrivateLink>
    </div>
  )
})


export default FileLink