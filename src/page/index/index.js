
import 'css/index.css'
import Tab from './tabs.js'
import Page1 from './page-1.js'
import Page2 from './page-2.js'
import Page3 from './page-3.js'
import PageSong from './page-song.js'

Tab.controller.init(Tab.view,Tab.model)
Page1.controller.init(Page1.view,Page1.model)
Page2.controller.init(Page2.view,Page2.model)
Page3.controller.init(Page3.view,Page3.model)
PageSong.controller.init(PageSong.view,PageSong.model)
