export const REPOSITORY = 'https://github.com/Aqsa48/earning_by_learning_resources';
export const PROJECTS = [
  {
    id:'csv-quality', title:'Make messy data explain itself.', shortTitle:'CSV quality checker',
    skill:'python', topic:'Python & data', difficulty:'beginner', minutes:45, color:'indigo', icon:'table',
    description:'Find missing cells and repeated rows before they become confusing results.',
    outcome:'A JSON quality report and a small Python tool you can run on your own CSV.',
    prerequisites:'A browser to try it. Basic Python and Python 3.10+ to build it locally.',
    download:'downloads/csv-report.py', downloadLabel:'Download Python script', sample:'downloads/csv-sample.csv',
    source:'projects/csv-quality-report',
    steps:[
      {id:'choose',title:'Choose a person and a problem',text:'Help someone who receives a small CSV and needs to know what to check before analysis. Write: “I am making a CSV report for ___ so they can ___.”',task:'Name one person or group who would use your report.'},
      {id:'plan',title:'Keep the first version small',text:'Count rows, missing cells and exact duplicate rows. Flag lines with the wrong number of cells. Leave automatic cleaning and large-file processing for another version.',task:'Write down the report fields and one thing you will leave out.'},
      {id:'build',title:'Run it, then read the code',text:'Try the synthetic sample in the browser checker. For a local version, download the Python script and sample into the same folder, then run:',code:'python csv-report.py csv-sample.csv\npython csv-report.py csv-sample.csv --output quality.json',task:'Run the sample and find the code that distinguishes a missing value from zero.'},
      {id:'test',title:'Check a result you can predict',text:'The sample has 4 data rows, 1 missing rain_mm cell, 1 exact duplicate row, and no malformed lines. A rainfall value of 0 is a real observation. Use the report checks below for the sample, then try the quoted-comma and malformed-row exercise. Predict its output before reading the worked solution.',task:'Compare actual and expected results, and record a test for one edge case.'},
      {id:'reflect',title:'Ask whether the report helps',text:'Show the report to someone. Can they explain what needs attention? Record what they found confusing and choose one improvement.',task:'Write what worked, what failed, and the next action you can start.'}
    ],
    extensions:['Support a configurable missing token such as NA.','Count unique values per column.','Explain one domain-specific rule, such as rainfall units.'],
    resources:['python-csv','python-argparse','python-tests']
  },
  {
    id:'weather-story',title:'Tell a small weather story.',shortTitle:'Weather-data visualization',
    skill:'data-viz',topic:'Data visualization',difficulty:'intermediate',minutes:90,color:'mint',icon:'chart',
    description:'Turn two weeks of synthetic observations into a chart and a careful explanation.',
    outcome:'A two-panel PNG chart and a short explanation that keeps missing readings visible.',
    prerequisites:'Basic Python and CSV knowledge. Python 3.10+ and Matplotlib for the local project.',
    download:'downloads/weather-plot.py',downloadLabel:'Download plotting script',sample:'downloads/weather-sample.csv',
    source:'projects/weather-data',
    steps:[
      {id:'choose',title:'Choose a question the data can answer',text:'Help a reader understand when rain was observed and how temperatures changed in this synthetic 14-day example. These are invented observations, not a climate record or forecast.',task:'Write one descriptive question. Avoid conclusions about long-term climate.'},
      {id:'plan',title:'Plan one readable figure',text:'Use daily rainfall bars and a temperature line, with dates and units. Mark missing observations instead of filling them with zero. State what the sample cannot tell you.',task:'Sketch the axes, labels, and a way to show missing observations.'},
      {id:'build',title:'Explore, then create your own figure',text:'Switch between rainfall and temperature in the browser. Download the script and data into one folder, install Matplotlib in a virtual environment, then run:',code:'python -m pip install "matplotlib>=3.8,<4"\npython weather-plot.py weather-sample.csv --output weather-chart.png',task:'Create weather-chart.png and check both panels and their units.'},
      {id:'test',title:'Verify the numbers behind the chart',text:'There are 14 dates. Rainfall has 12 observed values, 2 missing values, and a measured total of 17 mm. Zero rainfall days count as observed. Temperature has 13 observed readings and 1 missing reading. The measured rainfall total is not proof that the full-period total was 17 mm.',task:'Verify the observed counts and rainfall total without turning missing values into zero.'},
      {id:'reflect',title:'Write a claim with its limitation',text:'Write two sentences: one observation supported by the figure, and one limitation. Ask a reader to locate the missing observations without your help.',task:'Record their feedback and one change that would make the chart easier to read.'}
    ],
    extensions:['Add a cumulative rainfall chart that clearly flags incomplete coverage.','Validate observation units before plotting.','Use authorized public station data and document its provenance.'],
    resources:['python-csv','matplotlib','python-tests']
  },
  {
    id:'portfolio-page',title:'Give your finished work a home.',shortTitle:'Personal portfolio page',
    skill:'web',topic:'HTML & CSS',difficulty:'beginner',minutes:60,color:'peach',icon:'page',
    description:'Build a simple page that explains one project, what it does, and what you learned.',
    outcome:'An editable, standalone HTML portfolio page. Open it locally or publish it yourself.',
    prerequisites:'A browser and text editor. No package installation, account, or JavaScript is needed for the page.',
    download:'downloads/portfolio-starter.html',downloadLabel:'Download HTML starter',source:'projects/portfolio-page',
    steps:[
      {id:'choose',title:'Choose a reader and one piece of work',text:'Pick a real project you have tried, even a small one. Decide whether the reader is a classmate, collaborator, or potential user. Explain what it helps them do.',task:'Choose one finished example and identify its intended reader.'},
      {id:'plan',title:'Plan the content before styling',text:'Include your name, a short introduction, a project title, what you built, how you tested it, and a link if the project is public. Leave claims you cannot support out of the page.',task:'Write a short project description using your own experience.'},
      {id:'build',title:'Make a page you can open anywhere',text:'Use the builder to preview your text and download portfolio.html, or edit the starter in a text editor. Double-click the file to open it in your browser. Change the text and CSS, save, and refresh.',code:'<!-- Explain one actual result. -->\n<article>\n  <h2>My project</h2>\n  <p>What I built, how I tested it, and what I learned.</p>\n</article>',task:'Replace the example content and open your saved HTML file.'},
      {id:'test',title:'Read it as a visitor',text:'Check the page at a narrow window width. Can someone find the project, understand what you did, and follow the link? Use clear link text and check keyboard navigation.',task:'Ask someone to describe your project after reading the page, and test every link.'},
      {id:'reflect',title:'Share a useful account of the work',text:'Record what your reader understood and what needs more explanation. You can publish the page with GitHub Pages when you are ready. The builder downloads a file; it does not publish on your behalf.',task:'Choose one improvement and decide whether this version is ready to share.'}
    ],
    extensions:['Add a second project with a specific result and test evidence.','Improve contrast and keyboard focus styles.','Publish through GitHub Pages and document how to update it.'],
    resources:['html','css','github-pages']
  }
];

export const RESOURCES = [
  {id:'python-csv',title:'Read and write CSV files',topic:'Python',url:'https://docs.python.org/3/library/csv.html',description:'Use when the file format, quoted fields, or row iteration blocks you.',prerequisite:'Basic Python loops and files.'},
  {id:'python-argparse',title:'Build a command-line tool',topic:'Python',url:'https://docs.python.org/3/library/argparse.html',description:'Add an input path, an output option, and useful help text.',prerequisite:'Python functions and scripts.'},
  {id:'python-tests',title:'Test an expected result',topic:'Python',url:'https://docs.python.org/3/library/unittest.html',description:'Turn a small input and known result into a repeatable check.',prerequisite:'Python functions and basic assertions.'},
  {id:'matplotlib',title:'Make a readable first plot',topic:'Data visualization',url:'https://matplotlib.org/stable/users/explain/quick_start.html',description:'Work with figures, axes, labels, and saved output.',prerequisite:'Basic Python and Matplotlib installed.'},
  {id:'html',title:'Structure a page with HTML',topic:'Web',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax',description:'Understand elements, attributes, headings, paragraphs, and links.',prerequisite:'A browser and text editor.'},
  {id:'css',title:'Style a page with CSS',topic:'Web',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started',description:'Connect a stylesheet and change spacing, color, and typography.',prerequisite:'Basic HTML.'},
  {id:'github-pages',title:'Publish with GitHub Pages',topic:'Sharing',url:'https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site',description:'Publish a static project and understand its repository settings.',prerequisite:'A GitHub account and repository to publish.'}
];
