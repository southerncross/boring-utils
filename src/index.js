import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize-css'
import 'moment/locale/zh-cn'

import Heatmap from './features/Heatmap'
import './index.styl'

ReactDOM.render(
  <Heatmap/>,
  document.getElementById('app'),
)
