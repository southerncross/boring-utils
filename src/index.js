import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize-css'
import 'moment/locale/zh-cn'

import Heatmap from './features/Heatmap'
import BlockSuspend from './features/BlockSuspend'
import './index.styl'

ReactDOM.render(
  <BlockSuspend/>,
  document.getElementById('app'),
)
