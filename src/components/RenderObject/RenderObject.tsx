import React, { useEffect, useState } from 'react'
import './RenderObject.scss'

interface IRenderObject {
  object: any
}

const renderSubObject = (object: any) => {
  if (typeof object === 'object' && object !== null) {
    const keys = Object.keys(object)
    if (keys.length > 0) {
      return (
        <div className="ro__shift">
          {keys.map(key => <div className="ro__kv"><div className="ro__key">{key}</div><div className="ro__value">{renderSubObject(object[key])}</div></div>)}
        </div>
      )
    } else {
      return (<span>{JSON.stringify(object)}</span>)
    }
  } 
  return (<span className={null == object ? 'isNull' : typeof object}>{
    null == object 
      ? 'null' 
      : typeof object === 'boolean' 
        ? object 
          ? 'true' 
          : 'false'
        : object
  }</span>)
}

const RenderObject: React.FC<IRenderObject> = (props) => {
  const { object } = props
  return <div className="ro">{renderSubObject(object)}</div>
}

export default RenderObject