import React from 'react'

function Hint(props) {
  const { className = '', tooltip } = props

  return (
    <span className={`${className} hint tooltip`} aria-label={tooltip}>
      <span className="icon-info"/>
    </span>
  );
}

export default {
  Hint,
}
