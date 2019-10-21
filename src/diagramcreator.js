/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-undef */

import html2canvas from 'html2canvas';

export const crosswordImages = [
  "https://laxcrossword.com/wp-content/uploads/2016/08/LA-Times-Crossword-Solution-5-Sep-16.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/05/LA-Times-Crossword-Solution-13-Jun-18.png",
  "https://laxcrossword.com/wp-content/uploads/2014/09/05-Sep-14-LA-Times-Crossword-Solution.png",
  "http://latimescrossword.com/wp-content/uploads/2016/09/LA-Times-Crossword-Answers-Friday-September-2nd-2016.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/05/LA-Times-Crossword-Solution-12-Jun-18.png",
  "http://4.bp.blogspot.com/-9brNaZ6h42Y/U05x8ICE_II/AAAAAAAAAzE/VxWc0hkPwOo/s1600/16+Apr+14+New+York+Times+Crossword+Solution.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Mon-Aug-5-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Monday-September-2nd-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Wednesday-September-25th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Friday-September-20th-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/11/LA-Times-Sat-Jan-5-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Friday-September-6th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Saturday-September-28th-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Sat-Sep-7-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Monday-September-23rd-2019.png",
  "https://crosswordfiend.com/blog/wp-content/uploads/2019/09/Screenshot-2019-09-07-12.18.43.png",
  "https://1.bp.blogspot.com/--MCQCNnKkaE/XSQJ285X4oI/AAAAAAAAM2k/uy2VVJyeMSQlpAqhRsarWJLJRAcgTloZACLcBGAs/s1600/New%2BYork%2BTimes%252C%2BTuesday%252C%2BJuly%2B9%252C%2B2019%2BClues%2Band%2BAnswers.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Sat-Jun-22-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Thursday-September-5th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Monday-September-30th-2019.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2016/09/lat160907.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Mon-Jun-17-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/01/LA-Times-Sat-Mar-2-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Monday-September-16th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Saturday-September-14th-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Thu-Sep-13-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Thu-Sep-27-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Fri-Sep-7-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Fri-Sep-27-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Tuesday-September-17th-2019.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2016/09/la160909.png",
  "https://laxcrossword.com/wp-content/uploads/2019/03/LA-Times-Wed-Apr-17-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/03/LA-Times-Fri-Apr-5-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2017/07/La-Times-Tue-Sep-5-2017_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Sat-Sep-21-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/08/LA-Times-Crossword-Answers-Saturday-August-31st-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Sat-Aug-24-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Tuesday-September-3rd-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/03/LA-Times-Thu-Apr-5-2018_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Monday-September-9th-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Wed-Sep-18-2019_screenshot.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2016/08/la160805.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Thu-Jul-4-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Sat-Jun-15-2019_screenshot.png",
  "https://4.bp.blogspot.com/-QiQUm1HMz2g/WanQ5wB6vSI/AAAAAAAAH80/r-HgVdYxPKAdc3-tpol23ufiPgD11FhVgCLcBGAs/s1600/Screen%2BShot%2B2017-09-01%2Bat%2B4.27.29%2BPM.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Sat-Oct-5-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Wednesday-September-11th-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Wed-Sep-5-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/12/LA-Times-Wed-Jan-16-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Fri-May-24-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Wednesday-September-4th-2019.png",
  "https://3.bp.blogspot.com/-ZovUaQanOiA/XF_uhUEfHMI/AAAAAAAAAd4/oBlqx78O83MKJ_sWInUFvO7rsYz9gze0ACLcBGAs/s320/LA%2BTimes%2BCrossword%2B10%2BFeb%2B19%252C%2BSunday%2BPuzzle%2BAnswer.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Tue-Jun-18-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Thursday-September-26th-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Thu-Sep-19-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Mon-Aug-12-2019_screenshot.png",
  "https://nyxcrossword.com/wp-content/uploads/2019/09/NY-Times-Thursday-September-5-2019-_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Tuesday-September-12th-2017.png",
  "http://topmelon.me/wp-content/uploads/la-times-crossword-answers-saturday-july-47nd-47016-la-times-crossword-puzzle-today.png",
  "https://latimescrossword.com/wp-content/uploads/2016/09/LA-Times-Crossword-Answers-Tuesday-September-27th-2016.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Saturday-September-16th-2017.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Tue-Oct-1-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Saturday-September-9th-2017.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Friday-September-13th-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Sat-Sep-8-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Wed-May-8-2019_screenshot.png",
  "http://1.bp.blogspot.com/-4zGs3ofOoCM/UigkVjuwNLI/AAAAAAAAn7U/LbWfox--fps/s400/N+Y+Times+Crossword+by+Damon+Gulczynski+edited+by+Will+Shortz+Thursday+September+5+2013.jpg",
  "https://laxcrossword.com/wp-content/uploads/2019/01/LA-Times-Tue-Mar-5-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/03/LA-Times-Wed-May-1-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/10/LA-Times-Mon-Nov-5-2018_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Sunday-September-8th-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Fri-Jul-5-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Thursday-September-12th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Thursday-September-28th-2017.png",
  "https://laxcrossword.com/wp-content/uploads/2019/08/LA-Times-Sun-Sep-15-2019-_Its-a-Plus__screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Sunday-September-29th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Sunday-September-1st-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-May-5-2019-_Not__screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2016/09/LA-Times-Crossword-Answers-Sunday-September-18th-2016.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Sunday-September-10th-2017.png",
  "https://laxcrossword.com/wp-content/uploads/2019/03/LA-Times-Sun-Apr-7-2019-_Just-Desserts__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2014/05/16-May-14-LA-Times-Crossword-Solution.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/12/LA-Times-Sun-Jan-20-2019-_Pass__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Sun-May-19-2019-_Elimination__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/06/LA-Times-Sun-Jul-7-2019-_Deliberate-Lying__screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Thu-Sep-6-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/11/LA-Times-Sun-Jan-6-2019-_But-Is-It-Art___screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/03/LA-Times-Fri-Apr-12-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Wed-Aug-14-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/02/LA-Times-Sun-Mar-17-2019-_Going-Green__screenshot.png",
  "https://i2.wp.com/laxcrossword.com/wp-content/uploads/2016/06/LA-Times-Crossword-Solution-5-Jun-16-90.png?resize=567%2C567&ssl=1",
  "http://clipart-library.com/images/6cy5gzz9i.jpg",
  "http://www.onlinecrosswords.net/layout-2341.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Fri-Sep-21-2018_screenshot.png",
  "https://3nhum022zfe22c776n45fv1r-wpengine.netdna-ssl.com/wp-content/uploads/2015/03/product-fe7-Los-Angeles-Times-SundayCrossword-Puzzle-Joyce-Nichols-Lewis-and-Rich-Norris.png",
  "https://www.laxcrossword.com/wp-content/uploads/2019/01/LA-Times-Thu-Feb-21-2019_screenshot.png",
  "https://2.bp.blogspot.com/-1_1pCFa2XWo/UigkbPLGXfI/AAAAAAAAn7c/UjwUoI2dZ6M/s1600/New+York+Times+Crossword+by+Damon+Gulczynski+edited+by+Will+Shortz+Thursday+September+5+2013.jpg",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-26-May-18.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/06/LA-Times-Sat-Aug-4-2018_screenshot.png",
  "http://insightweb.me/wp-content/uploads/weighty-matters-saturday-stories-willpower-crosswords-and-la-times-crossword-printable.jpg",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Fri-May-31-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Friday-September-1st-2017.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Fri-May-10-2019_screenshot1.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/01/LA-Times-Fri-Feb-9-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Sat-Aug-17-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/07/LA-Times-Sun-Sep-2-2018-_Division-of-Labor__screenshot.png",
  "https://www.insight-report.com/wp-content/uploads/2018/10/national-post-cryptic-crossword-forum-saturday-march-14-14-perfume-label-word-crossword-630x380.jpg",
  "http://latimescrossword.com/wp-content/uploads/2013/09/answers_la_times_crossword_friday_september_20_2013-1.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/06/LA-Times-Sun-Aug-5-2018-_Anabrands__screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/05/LA-Times-Thu-Jul-5-2018_screenshot.png",
  "http://grandmasti.club/wp-content/uploads//2018/05/printable-sunday-crossword-march-9-crossword-puzzle-printable-la-times-crossword-august-2017.jpg",
  "https://www.laxcrossword.com/wp-content/uploads/2019/01/LA-Times-Sun-Feb-24-2019-_Prep-positioning__screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/12/LA-Times-Sat-Jan-26-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2018/09/LA-Times-Crossword-Answers-Tuesday-September-18th-2018.png",
  "https://4.bp.blogspot.com/-sSAoqM2jBwM/WbwhCxWmYgI/AAAAAAAAIBo/4fD8i1lJe4A-IDcm2TLcBV1_2wXzu34jwCLcBGAs/s1600/Screen%2BShot%2B2017-09-15%2Bat%2B1.48.26%2BPM.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Fri-Oct-5-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2017/11/LA-Times-Fri-Jan-5-2018_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2013/09/answers_la_times_crossword_tuesday_september_24_2013.png",
  "http://farm2.static.flickr.com/1424/1427113819_9c32299593_o.jpg",
  "http://latimescrossword.com/wp-content/uploads/2019/09/LA-Times-Crossword-Answers-Sunday-September-22nd-2019-270x100.png",
  "https://crosswordfiend.com/blog/wp-content/uploads/2018/09/Screenshot-2018-09-04-21.31.12.png",
  "https://prophecynation.com/wp-content/uploads/2019/04/la-times-crossword-8-apr-19-monday.png",
  "https://www.laxcrossword.com/wp-content/uploads/2017/09/LA-Times-Sun-Nov-5-2017-Gridiron-Glossary-_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/01/LA-Times-Crossword-Answers-Tuesday-January-1st-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Tue-Sep-4-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Fri-Aug-9-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Tuesday-September-19th-2017.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Sun-Sep-16-2018-_Marked-Down__screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/11/LA-Times-Wed-Dec-5-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/09/LA-Times-Wed-Oct-10-2018_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2013/09/answers_la_times_crossword_tuesday_september_18_2013.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/12/LA-Times-Thu-Jan-24-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2017/07/LA-Times-Sun-Sep-3-2017-First-Things-First-_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Sun-Sep-9-2018-_TV-Partners__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Tue-May-14-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Sat-May-25-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/05/LA-Times-Thu-Jun-13-2019_screenshot.png",
  "https://nyxcrossword.com/wp-content/uploads/2019/09/NY-Times-Sunday-September-15-2019-Get-Your-Mind-Out-Of-The-Gutter_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2016/08/LA-Times-Crossword-Solution-6-Sep-16.png",
  "https://laxcrossword.com/wp-content/uploads/2013/09/10-Sep-13-LA-Times-Crossword-Solution.png",
  "http://crosswordfiend.com/blog/wp-content/uploads/2017/06/Screen-Shot-2017-06-18-at-9.28.52-PM.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2014/08/Region-capture-5.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Sat-May-18-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/03/LA-Times-Sat-May-5-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2016/08/LA-Times-Crossword-Solution-17-Sep-16.png",
  "https://nyxcrossword.com/wp-content/uploads/2019/05/NY-Times-Sun-May-05-2019-PAPER-WORK_screenshot.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2013/02/mgwcc221.png",
  "https://i1.wp.com/www.laxcrossword.com/wp-content/uploads/2016/09/LA-Times-Crossword-Solution-9-Oct-16.png?resize=567%2C567&ssl=1",
  "http://latimescrossword.com/wp-content/uploads/2019/04/LA-Times-Crossword-Answers-Wednesday-April-24th-2019.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-20-May-18.png",
  "https://prophecynation.com/wp-content/uploads/2019/02/la-times-crossword-28-feb-19-thursday.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Sunday-September-17th-2017.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Sat-Sep-15-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/07/LA-Times-Tue-Aug-7-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Mon-May-13-2019_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2017/09/LA-Times-Crossword-Answers-Tuesday-September-26th-2017.png",
  "https://3.bp.blogspot.com/__a5YejFSPKw/TGdrVZb4_RI/AAAAAAAADDE/OablaXL7p2o/s1600/M.JPG",
  "https://laxcrossword.com/wp-content/uploads/2019/09/LA-Times-Fri-Oct-18-2019_screenshot.png",
  "https://merriam-webster.com/assets/mw/static/images/games/crosswords/la-times-daily-crossword/480x320@1x.jpg",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Fri-Aug-16-2019_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Sun-May-12-2019-_Youth-Group__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Sun-May-26-2019-_Abracadabra__screenshot.png",
  "https://nyxcrossword.com/wp-content/uploads/2016/07/NewYorkTimesCrosswordSolution5Jul16.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Mon-Sep-3-2018_screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2016/07/LA-Times-Crossword-Solution-1-Sep-16.png",
  "http://latimescrossword.com/wp-content/uploads/2013/09/answers_la_times_crossword_sunday_september_29_2013.png",
  "https://laxcrossword.com/wp-content/uploads/2015/09/LATimesCrosswordSolution12Sep15.png",
  "https://laxcrossword.com/wp-content/uploads/2019/07/LA-Times-Thu-Aug-22-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-3-Jun-18.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-9-May-18.png",
  "https://laxcrossword.com/wp-content/uploads/2017/01/LA-Times-Sun-Feb-5-2017-Sounds-About-Right-_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2016/11/LA-Times-Crossword-Answers-Sunday-November-13th-2016.png",
  "https://laxcrossword.com/wp-content/uploads/2019/04/LA-Times-Thu-May-16-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Wed-Sep-12-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/11/LA-Times-Sun-Dec-30-2018-_Calling-Forth__screenshot.png",
  "https://laxcrossword.com/wp-content/uploads/2012/10/05-Oct-12-Los-Angeles-Times-Crossword-Solution.jpg",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2016/03/lat160302.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2010/09/BG-09122010.PNG",
  "http://latimescrossword.com/wp-content/uploads/2018/12/LA-Times-Crossword-Answers-Thursday-December-27th-2018.png",
  "http://latimescrossword.com/wp-content/uploads/2019/10/LA-Times-Crossword-Answers-Sunday-October-6th-2019.png",
  "https://laxcrossword.com/wp-content/uploads/2016/08/LA-Times-Crossword-Solution-29-Sep-16.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-12-May-18.png",
  "http://www.crosswordfiend.com/blog/wp-content/uploads/2014/09/Region-capture-24.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/04/LA-Times-Crossword-Solution-28-May-18.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Tue-Sep-11-2018_screenshot.png",
  "http://latimescrossword.com/wp-content/uploads/2019/08/LA-Times-Crossword-Answers-Sunday-August-25th-2019.png",
  "http://latimescrossword.com/wp-content/uploads/2018/12/LA-Times-Crossword-Answers-Monday-December-30th-2018.png",
  "https://nyxcrossword.com/wp-content/uploads/2019/09/NY-Times-Wednesday-September-4-2019-_screenshot.png",
  "https://nyxcrossword.com/wp-content/uploads/2019/04/NY-Times-Fri-Apr-05-2019_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Fri-Sep-14-2018_screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/08/LA-Times-Sun-Sep-30-2018-_Power-Play__screenshot.png",
  "https://www.laxcrossword.com/wp-content/uploads/2018/07/LA-Times-Sun-Aug-26-2018-AmazeBalls__screenshot.png",
  "https://www.pngkey.com/png/detail/352-3524269_la-times-crossword-answers-16-aug-gawain-9.png",
  "https://laxcrossword.com/wp-content/uploads/2017/08/LA-Times-Sun-Sep-24-2017-Encapsulating-_screenshot.png",
  "https://www.orlandosentinel.com/resizer/k2L92cTNrHb6c4fux49PfEfdTaQ=/1200x0/top/www.trbimg.com/img-5a8efbcf/turbine/os-daily-la-times-crossword-game",
];

export default class DiagramCreator {
	constructor() {
		this.canvas = null;
  }

  async getBoardMatrix(boardEl) {
    return new Promise((resolve) => {
      html2canvas(boardEl).then((canvas) => {
      document.getElementById('micro-board-image').src = canvas.toDataURL();
      requestAnimationFrame(() => {
        const inputArray = this.imageTo2Bit('micro-board-image');
        resolve(inputArray);
      });
    });
  });
  }

  imageTo2Bit(imageId) {
    const canvas = document.createElement("canvas");
    const img = document.getElementById(imageId);

    const ctx = canvas.getContext('2d');
    ctx.width = img.width;
    ctx.height = img.height;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
    console.log('size is', img.width, img.height);
    // console.log('imgsata', imageData)
    const result = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const luma = 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
      console.log('imageData[i + 1]', imageData[i] + imageData[i + 1] + imageData[i + 2]);
      // if (luma > 200) {
      if (imageData[i] + imageData[i + 1] + imageData[i + 2] > 360) {
        // if (imageData[i] > 0) {
        result.push('0');
      } else {
        result.push('1');
      }
    }
    console.log('resyult', result);
    let array = this.listToMatrix(result, img.width).map(a => [a.join('')]);
    array = array.concat.apply([], array);
    console.log(array.join('\n'));
    return result.map(digit => parseInt(digit, 10));
  }

  listToMatrix(list, elementsPerSubArray) {
    const matrix = [];
    let i;
    let k;
    for (i = 0, k = -1; i < list.length; i += 1) {
      if (i % elementsPerSubArray === 0) {
        k += 1;
        matrix[k] = [];
      }
      matrix[k].push(list[i]);
    }
    return matrix;
  }

  analyzeImage(imageId) {
    return this.ImageTo2Bit(imageId);
  }

	// analyzeImage(imageId) {
  //   const c = document.getElementById("board-canvas");
	// 	const ctx = c.getContext("2d");
  //  const img = document.getElementById(imageId);
	// 	ctx.drawImage(img, 0, 0, c.width, c.height);
  //   const imgData = ctx.getImageData(0, 0, c.width, c.height);

  //   const newGrid = [];

  //   console.warn('imgData.data.length', imgData.data.length)

	// 	for (let i = 0; i < imgData.data.length; i += 4) {
  //     if (i % 64 === 0) {
  //       const rgba = {
  //         r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2], a: imgData.data[i + 3]
  //       };
  //       if (rgba.r < 150) {
  //         newGrid.push('*');
  //       } else {
  //         newGrid.push(0);
  //       }
  //     }
  //   }
  //   console.log('got grid')
  //   console.info(newGrid)
  //   return newGrid;
  // }
}
