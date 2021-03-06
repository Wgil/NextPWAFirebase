import React from 'react'

export default ({ children, ...props }) => {
  return (
    <button className='Button' {...props}>
      {children}
      <style jsx>{`
        .Button {
          background: rgb(63,81,181);
          color: rgb(255,255,255);
          box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
          min-width: 64px;
          padding: 0 16px;
          display: inline-block;
          font-family: "Roboto","Helvetica","Arial",sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0;
          overflow: hidden;
          will-change: box-shadow;
          transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);
          outline: none;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          line-height: 36px;
          vertical-align: middle;
          position: relative;
          height: 36px;
          border: none;
          border-radius: 2px;
        }

        .Button:hover {
          background: rgb(47, 69, 193);
        }

        .Button:disabled {
          background: rgb(138, 146, 187)
        }
    `}</style>
    </button>
  )
}
